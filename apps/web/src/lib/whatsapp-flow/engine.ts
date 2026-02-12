import type {
  DecryptedBody,
  FlowState,
  InsightStep,
  QuestionStep,
  ScreenResponse,
} from "./types";
import { FLOW_NODES } from "./steps";

const TOTAL_STEPS = 30;

function buildProgress(stepNumber: number): string {
  return `Pergunta ${stepNumber} de ~${TOTAL_STEPS}`;
}

/**
 * Resolve the next VISIBLE step from a given node key.
 * Logic nodes are evaluated and traversed until we reach a step/insight or END.
 */
function resolveNextStep(
  nodeKey: string,
  state: FlowState,
): string {
  let current = nodeKey;
  let iterations = 0;

  while (iterations < 50) {
    iterations++;

    if (current === "END") return "END";

    const node = FLOW_NODES[current];
    if (!node) return "END";

    if (node.type === "logic") {
      let matched = false;
      for (const cond of node.conditions) {
        if (cond.check(state)) {
          current = cond.next;
          matched = true;
          break;
        }
      }
      if (!matched) {
        current = node.defaultNext;
      }
      continue;
    }

    // It's a step or insight — this is the destination
    return current;
  }

  return "END";
}

/**
 * Build the screen response data for a given step.
 */
function buildScreenData(
  stepKey: string,
  state: FlowState,
  history: string[],
): ScreenResponse {
  const node = FLOW_NODES[stepKey];

  if (!node || stepKey === "END") {
    return {
      screen: "COMPLETE",
      data: {
        title: "Avaliação concluída!",
        body: "Obrigado por completar sua avaliação de sono. Em breve você receberá seu resultado personalizado.",
      },
    };
  }

  const stateStr = JSON.stringify(state);
  const historyStr = JSON.stringify(history);

  if (node.type === "insight") {
    const insight = node as InsightStep;
    return {
      screen: "INSIGHT",
      data: {
        heading: insight.heading,
        body: insight.body,
        tip_title: insight.tipTitle,
        tip_description: insight.tipDescription,
        _state: stateStr,
        _step: insight.key,
        _history: historyStr,
      },
    };
  }

  if (node.type === "question") {
    const step = node as QuestionStep;

    if (step.screen === "LANDING") {
      return {
        screen: "LANDING",
        data: {
          headline: step.headline ?? step.title,
          subtext: step.subtitle ?? "",
          badge_text: step.badgeText ?? "",
          question_label: step.title,
          options: step.options ?? [],
          _state: stateStr,
          _step: step.key,
          _history: historyStr,
        },
      };
    }

    if (step.screen === "TEXT_INPUT") {
      return {
        screen: "TEXT_INPUT",
        data: {
          title: step.title,
          description: step.subtitle ?? "",
          field_label_1: step.fieldLabel1 ?? "Campo 1",
          field_placeholder_1: step.fieldPlaceholder1 ?? "",
          field_label_2: step.fieldLabel2 ?? "Campo 2",
          field_placeholder_2: step.fieldPlaceholder2 ?? "",
          info_title: step.infoTitle ?? "",
          info_description: step.infoDescription ?? "",
          _state: stateStr,
          _step: step.key,
          _history: historyStr,
        },
      };
    }

    if (step.screen === "MULTI_SELECT") {
      return {
        screen: "MULTI_SELECT",
        data: {
          title: step.title,
          description: step.subtitle ?? "Selecione todas que se aplicam",
          progress: buildProgress(step.stepNumber),
          options: step.options ?? [],
          _state: stateStr,
          _step: step.key,
          _history: historyStr,
        },
      };
    }

    // SINGLE_SELECT (default)
    return {
      screen: "SINGLE_SELECT",
      data: {
        title: step.title,
        progress: buildProgress(step.stepNumber),
        options: step.options ?? [],
        _state: stateStr,
        _step: step.key,
        _history: historyStr,
      },
    };
  }

  // Should never reach here (logic nodes are resolved before)
  return {
    screen: "COMPLETE",
    data: {
      title: "Avaliação concluída!",
      body: "Obrigado por completar sua avaliação de sono.",
    },
  };
}

/**
 * Main handler for WhatsApp Flow requests.
 */
export function handleFlowRequest(body: DecryptedBody): ScreenResponse {
  const { action, data } = body;

  // Health check ping
  if (action === "ping") {
    return { screen: "", data: { status: "active" } };
  }

  // Error acknowledgement
  if (data?.error) {
    console.error("WhatsApp Flow error:", data);
    return { screen: "", data: { acknowledged: true } };
  }

  // INIT — first time opening the flow
  if (action === "INIT") {
    return buildScreenData("landing", {}, []);
  }

  // data_exchange — user submitted a screen
  if (action === "data_exchange") {
    return handleDataExchange(data ?? {});
  }

  // BACK — user pressed back button
  if (action === "BACK") {
    return handleBack(data ?? {});
  }

  // Fallback
  return buildScreenData("landing", {}, []);
}

function handleDataExchange(
  data: Record<string, unknown>,
): ScreenResponse {
  // Parse state and history from payload
  const state: FlowState = parseJson(data._state as string, {});
  const history: string[] = parseJson(data._history as string, []);
  const currentStep = data._step as string;

  // Get the current node to know how to extract the answer
  const currentNode = FLOW_NODES[currentStep];

  if (currentNode?.type === "question") {
    const step = currentNode as QuestionStep;

    if (step.screen === "TEXT_INPUT") {
      // Text input has two fields
      if (data.field_1) state[step.outputKey] = data.field_1 as string;
      if (data.field_2 && step.outputKey2)
        state[step.outputKey2] = data.field_2 as string;
    } else if (step.screen === "MULTI_SELECT") {
      // Multi-select returns an array
      const answer = data.answer;
      if (Array.isArray(answer)) {
        state[step.outputKey] = answer as string[];
      } else if (typeof answer === "string") {
        state[step.outputKey] = [answer];
      }
    } else {
      // Single select / Landing
      if (data.answer) state[step.outputKey] = data.answer as string;
    }
  }

  // Add current step to history
  history.push(currentStep);

  // Get the next step key
  const nextNodeKey = currentNode?.type === "question"
    ? (currentNode as QuestionStep).next
    : currentNode?.type === "insight"
      ? (currentNode as InsightStep).next
      : "END";

  // Resolve through logic nodes to find the actual next visible step
  const resolvedStep = resolveNextStep(nextNodeKey, state);

  return buildScreenData(resolvedStep, state, history);
}

function handleBack(data: Record<string, unknown>): ScreenResponse {
  const state: FlowState = parseJson(data._state as string, {});
  const history: string[] = parseJson(data._history as string, []);

  if (history.length === 0) {
    return buildScreenData("landing", {}, []);
  }

  // Pop the last step from history
  const previousStep = history.pop()!;

  return buildScreenData(previousStep, state, history);
}

function parseJson<T>(str: string | undefined, fallback: T): T {
  if (!str) return fallback;
  try {
    return JSON.parse(str) as T;
  } catch {
    return fallback;
  }
}
