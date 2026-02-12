export interface SelectOption {
  id: string;
  title: string;
}

export interface QuestionStep {
  key: string;
  type: "question";
  screen: "LANDING" | "SINGLE_SELECT" | "MULTI_SELECT" | "TEXT_INPUT";
  outputKey: string;
  title: string;
  subtitle?: string;
  options?: SelectOption[];
  // LANDING specific
  headline?: string;
  badgeText?: string;
  // TEXT_INPUT specific
  outputKey2?: string;
  fieldLabel1?: string;
  fieldPlaceholder1?: string;
  fieldLabel2?: string;
  fieldPlaceholder2?: string;
  infoTitle?: string;
  infoDescription?: string;
  // Progress
  stepNumber: number;
  next: string;
}

export interface InsightStep {
  key: string;
  type: "insight";
  heading: string;
  body: string;
  tipTitle: string;
  tipDescription: string;
  next: string;
}

export interface LogicNode {
  key: string;
  type: "logic";
  conditions: Array<{
    check: (state: FlowState) => boolean;
    next: string;
  }>;
  defaultNext: string;
}

export type FlowNode = QuestionStep | InsightStep | LogicNode;

export type FlowState = Record<string, string | string[]>;

export interface ScreenResponse {
  screen: string;
  data: Record<string, unknown>;
}

export interface DecryptedBody {
  action: string;
  screen?: string;
  data?: Record<string, unknown>;
  flow_token?: string;
}
