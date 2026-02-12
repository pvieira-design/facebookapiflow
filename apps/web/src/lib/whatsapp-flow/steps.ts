import type { FlowNode, FlowState } from "./types";

function hasAny(
  value: string | string[] | undefined,
  targets: string[],
): boolean {
  if (!value) return false;
  const arr = Array.isArray(value) ? value : [value];
  return targets.some((t) => arr.includes(t));
}

export const FLOW_NODES: Record<string, FlowNode> = {
  // ╔══════════════════════════════════════════════════════╗
  // ║  SEÇÃO 1: LANDING + TEMPO PARA ADORMECER            ║
  // ╚══════════════════════════════════════════════════════╝

  landing: {
    key: "landing",
    type: "question",
    screen: "LANDING",
    outputKey: "tempo_adormecer",
    title: "Quanto tempo você geralmente leva para pegar no sono?",
    headline:
      "Descubra por que você não dorme bem em apenas 3 minutos.",
    subtitle:
      "Avaliação rápida e personalizada usada por médicos no mundo todo para entender o que está afetando o seu sono.",
    badgeText: "Baseado no PSQI — padrão internacional",
    options: [
      { id: "menos_15min", title: "Menos de 15 minutos" },
      { id: "15_30min", title: "Entre 15 e 30 minutos" },
      { id: "30_60min", title: "Entre 30 e 60 minutos" },
      { id: "mais_60min", title: "Mais de 60 minutos" },
    ],
    stepNumber: 1,
    next: "logic_tempo",
  },

  logic_tempo: {
    key: "logic_tempo",
    type: "logic",
    conditions: [
      {
        check: (s: FlowState) =>
          hasAny(s.tempo_adormecer, ["30_60min", "mais_60min"]),
        next: "insight_demora_dormir",
      },
    ],
    defaultNext: "qualidade_sono",
  },

  insight_demora_dormir: {
    key: "insight_demora_dormir",
    type: "insight",
    heading: "Entenda por que você demora para dormir",
    body: "Demorar mais de 30 minutos para pegar no sono é chamado de latência do sono prolongada. Isso pode ser causado por ansiedade, estresse, uso de telas antes de dormir ou desregulação do ritmo circadiano.\n\nO sistema endocanabinoide do seu corpo regula naturalmente o ciclo sono-vigília. Quando esse sistema está desregulado, o cérebro tem dificuldade de \"desligar\".",
    tipTitle: "O CBD ajuda seu cérebro a entrar no modo de descanso.",
    tipDescription:
      "Estudos mostram que o canabidiol (CBD) atua nos receptores CB1, facilitando a transição para o sono.",
    next: "qualidade_sono",
  },

  // ╔══════════════════════════════════════════════════════╗
  // ║  SEÇÃO 2: QUALIDADE + HORÁRIOS                      ║
  // ╚══════════════════════════════════════════════════════╝

  qualidade_sono: {
    key: "qualidade_sono",
    type: "question",
    screen: "SINGLE_SELECT",
    outputKey: "qualidade_sono",
    title: "Como você avalia a qualidade do seu sono no último mês?",
    options: [
      { id: "muito_boa", title: "Muito boa" },
      { id: "boa", title: "Boa" },
      { id: "media", title: "Média" },
      { id: "ruim", title: "Ruim" },
      { id: "muito_ruim", title: "Muito ruim" },
    ],
    stepNumber: 2,
    next: "hora_dormir",
  },

  hora_dormir: {
    key: "hora_dormir",
    type: "question",
    screen: "SINGLE_SELECT",
    outputKey: "hora_dormir",
    title: "Que horas você geralmente vai dormir?",
    options: [
      { id: "antes_22h", title: "Antes das 22h" },
      { id: "22h_00h", title: "Entre 22h e 00h" },
      { id: "00h_02h", title: "Entre 00h e 02h" },
      { id: "depois_02h", title: "Depois das 02h" },
    ],
    stepNumber: 3,
    next: "hora_acordar",
  },

  hora_acordar: {
    key: "hora_acordar",
    type: "question",
    screen: "SINGLE_SELECT",
    outputKey: "hora_acordar",
    title: "Que horas você geralmente acorda?",
    options: [
      { id: "antes_6h", title: "Antes das 6h" },
      { id: "6h_8h", title: "Entre 6h e 8h" },
      { id: "8h_10h", title: "Entre 8h e 10h" },
      { id: "depois_10h", title: "Depois das 10h" },
    ],
    stepNumber: 4,
    next: "captura_telefone",
  },

  // ╔══════════════════════════════════════════════════════╗
  // ║  SEÇÃO 3: CAPTURA DE DADOS + HORAS DE SONO          ║
  // ╚══════════════════════════════════════════════════════╝

  captura_telefone: {
    key: "captura_telefone",
    type: "question",
    screen: "TEXT_INPUT",
    outputKey: "name",
    outputKey2: "phone",
    title: "Estamos montando seu perfil de sono",
    subtitle:
      "Para enviar seu resultado com recomendações personalizadas, precisamos de algumas informações.",
    fieldLabel1: "Seu nome",
    fieldPlaceholder1: "Ex: Maria",
    fieldLabel2: "Telefone WhatsApp",
    fieldPlaceholder2: "(21) 99999-9999",
    infoTitle: "Falta pouco para o seu resultado",
    infoDescription:
      "Enviaremos suas recomendações personalizadas por WhatsApp ao final da avaliação.",
    stepNumber: 5,
    next: "horas_sono",
  },

  horas_sono: {
    key: "horas_sono",
    type: "question",
    screen: "SINGLE_SELECT",
    outputKey: "horas_sono",
    title: "Quantas horas de sono efetivo você tem por noite?",
    options: [
      { id: "mais_7h", title: "Mais de 7 horas" },
      { id: "6_7h", title: "Entre 6 e 7 horas" },
      { id: "5_6h", title: "Entre 5 e 6 horas" },
      { id: "menos_5h", title: "Menos de 5 horas" },
    ],
    stepNumber: 6,
    next: "logic_horas",
  },

  logic_horas: {
    key: "logic_horas",
    type: "logic",
    conditions: [
      {
        check: (s: FlowState) =>
          hasAny(s.horas_sono, ["5_6h", "menos_5h"]),
        next: "insight_menos_6h",
      },
    ],
    defaultNext: "idade",
  },

  insight_menos_6h: {
    key: "insight_menos_6h",
    type: "insight",
    heading: "Menos de 6 horas de sono afeta sua saúde",
    body: "Dormir menos de 6 horas por noite aumenta em 48% o risco de doenças cardiovasculares e compromete a imunidade, memória e metabolismo.\n\nDurante o sono profundo, seu corpo produz hormônio do crescimento e repara tecidos danificados. Sem tempo suficiente, esse processo fica incompleto.",
    tipTitle: "O sono é quando seu corpo se repara.",
    tipDescription:
      "A cannabis medicinal pode ajudar a aumentar o tempo total de sono e melhorar a qualidade das fases profundas.",
    next: "idade",
  },

  // ╔══════════════════════════════════════════════════════╗
  // ║  SEÇÃO 4: DADOS DEMOGRÁFICOS                        ║
  // ╚══════════════════════════════════════════════════════╝

  idade: {
    key: "idade",
    type: "question",
    screen: "SINGLE_SELECT",
    outputKey: "idade",
    title: "Selecione sua idade",
    options: [
      { id: "18_24", title: "18-24 anos" },
      { id: "25_34", title: "25-34 anos" },
      { id: "35_44", title: "35-44 anos" },
      { id: "45_54", title: "45-54 anos" },
      { id: "55_64", title: "55-64 anos" },
      { id: "65_mais", title: "65+ anos" },
    ],
    stepNumber: 7,
    next: "genero",
  },

  genero: {
    key: "genero",
    type: "question",
    screen: "SINGLE_SELECT",
    outputKey: "genero",
    title: "Qual seu gênero?",
    options: [
      { id: "feminino", title: "Feminino" },
      { id: "masculino", title: "Masculino" },
      { id: "prefiro_nao_dizer", title: "Prefiro não dizer" },
    ],
    stepNumber: 8,
    next: "logic_genero",
  },

  logic_genero: {
    key: "logic_genero",
    type: "logic",
    conditions: [
      {
        check: (s: FlowState) => s.genero === "feminino",
        next: "logic_idade_mulher",
      },
    ],
    defaultNext: "freq_nao_pegar_sono",
  },

  logic_idade_mulher: {
    key: "logic_idade_mulher",
    type: "logic",
    conditions: [
      {
        check: (s: FlowState) => s.idade === "18_24",
        next: "gravidez",
      },
    ],
    defaultNext: "menopausa",
  },

  menopausa: {
    key: "menopausa",
    type: "question",
    screen: "SINGLE_SELECT",
    outputKey: "menopausa",
    title: "Em relação à menopausa, como você se identifica?",
    options: [
      { id: "nao", title: "Não" },
      { id: "perimenopausa", title: "Perimenopausa (irregular)" },
      { id: "menopausa_recente", title: "Menopausa recente (até 5 anos)" },
      { id: "menopausa_mais_5", title: "Menopausa há mais de 5 anos" },
    ],
    stepNumber: 9,
    next: "gravidez",
  },

  gravidez: {
    key: "gravidez",
    type: "question",
    screen: "SINGLE_SELECT",
    outputKey: "gravidez",
    title: "Você está grávida ou tentando engravidar?",
    options: [
      { id: "nao", title: "Não" },
      { id: "sim_gravida", title: "Sim, estou grávida" },
      { id: "sim_tentando", title: "Sim, estou tentando" },
    ],
    stepNumber: 10,
    next: "logic_gravidez",
  },

  logic_gravidez: {
    key: "logic_gravidez",
    type: "logic",
    conditions: [
      {
        check: (s: FlowState) =>
          hasAny(s.gravidez, ["sim_gravida", "sim_tentando"]),
        next: "freq_nao_pegar_sono",
      },
    ],
    defaultNext: "amamentacao",
  },

  amamentacao: {
    key: "amamentacao",
    type: "question",
    screen: "SINGLE_SELECT",
    outputKey: "amamentacao",
    title: "Você está amamentando?",
    options: [
      { id: "nao", title: "Não" },
      { id: "sim", title: "Sim" },
    ],
    stepNumber: 11,
    next: "freq_nao_pegar_sono",
  },

  // ╔══════════════════════════════════════════════════════╗
  // ║  SEÇÃO 5: PROBLEMAS DE SONO                         ║
  // ╚══════════════════════════════════════════════════════╝

  freq_nao_pegar_sono: {
    key: "freq_nao_pegar_sono",
    type: "question",
    screen: "SINGLE_SELECT",
    outputKey: "freq_nao_pegar_sono",
    title:
      "No último mês, quantas vezes você não conseguiu pegar no sono em 30 minutos?",
    options: [
      { id: "nenhuma", title: "Nenhuma vez" },
      { id: "menos_1x", title: "Menos de 1x por semana" },
      { id: "1_2x", title: "1-2x por semana" },
      { id: "3_mais", title: "3 ou mais vezes por semana" },
    ],
    stepNumber: 12,
    next: "acordar_meio_noite",
  },

  acordar_meio_noite: {
    key: "acordar_meio_noite",
    type: "question",
    screen: "SINGLE_SELECT",
    outputKey: "acordar_meio_noite",
    title: "Quando você acorda no meio da noite, o que acontece?",
    options: [
      { id: "volto_facil", title: "Volto a dormir facilmente" },
      { id: "demora_voltar", title: "Demoro para voltar a dormir" },
      { id: "nao_consigo", title: "Não consigo mais dormir" },
    ],
    stepNumber: 13,
    next: "logic_acordar",
  },

  logic_acordar: {
    key: "logic_acordar",
    type: "logic",
    conditions: [
      {
        check: (s: FlowState) =>
          hasAny(s.acordar_meio_noite, ["demora_voltar", "nao_consigo"]),
        next: "insight_acordar_noite",
      },
    ],
    defaultNext: "consistencia_sono",
  },

  insight_acordar_noite: {
    key: "insight_acordar_noite",
    type: "insight",
    heading: "Entenda por que você acorda à noite",
    body: "Acordar no meio da noite e não conseguir voltar a dormir é um dos sintomas mais frustrantes da insônia. Isso acontece porque o cérebro sai do sono profundo e entra em estado de alerta.\n\nO sistema endocanabinoide é responsável por manter a continuidade do sono. Quando desregulado, micro-despertares se tornam despertares completos.",
    tipTitle:
      "O THC e CBD em doses adequadas ajudam a manter o sono contínuo.",
    tipDescription:
      "Pacientes relatam redução significativa nos despertares noturnos após início do tratamento com cannabis medicinal.",
    next: "consistencia_sono",
  },

  consistencia_sono: {
    key: "consistencia_sono",
    type: "question",
    screen: "SINGLE_SELECT",
    outputKey: "consistencia_sono",
    title: "Como é a consistência do seu sono?",
    options: [
      { id: "muito_consistente", title: "Muito consistente" },
      { id: "relativamente", title: "Relativamente consistente" },
      { id: "variavel", title: "Variável" },
      { id: "muito_variavel", title: "Muito variável" },
      { id: "consistentemente_ruim", title: "Consistentemente ruim" },
    ],
    stepNumber: 14,
    next: "conhece_fases",
  },

  // ╔══════════════════════════════════════════════════════╗
  // ║  SEÇÃO 6: CONHECIMENTO + COMO SE SENTE              ║
  // ╚══════════════════════════════════════════════════════╝

  conhece_fases: {
    key: "conhece_fases",
    type: "question",
    screen: "SINGLE_SELECT",
    outputKey: "conhece_fases",
    title: "Você conhece as fases do sono?",
    options: [
      { id: "sim_conheco", title: "Sim, conheço as fases" },
      { id: "nao_conheco", title: "Não conheço as fases" },
    ],
    stepNumber: 15,
    next: "logic_fases",
  },

  logic_fases: {
    key: "logic_fases",
    type: "logic",
    conditions: [
      {
        check: (s: FlowState) => s.conhece_fases === "nao_conheco",
        next: "insight_fases_sono",
      },
    ],
    defaultNext: "como_sente_acordar",
  },

  insight_fases_sono: {
    key: "insight_fases_sono",
    type: "insight",
    heading: "Entenda as fases do sono",
    body: "O sono é dividido em ciclos de aproximadamente 90 minutos, cada um com fases distintas:\n\n• Fase 1-2: Sono leve — Transição para o sono profundo\n• Fase 3: Sono profundo — Recuperação física e fortalecimento imunológico\n• Fase REM: Sono dos sonhos — Consolidação da memória e processamento emocional\n\nInterrupções frequentes impedem que você complete esses ciclos.",
    tipTitle: "Cada fase é essencial para sua saúde.",
    tipDescription:
      "A cannabis medicinal atua no sistema endocanabinoide, regulando a transição entre as fases e melhorando a arquitetura do sono.",
    next: "como_sente_acordar",
  },

  como_sente_acordar: {
    key: "como_sente_acordar",
    type: "question",
    screen: "SINGLE_SELECT",
    outputKey: "como_sente_acordar",
    title: "Como você geralmente se sente ao acordar?",
    options: [
      { id: "descansado", title: "Descansado(a) e com energia" },
      { id: "ainda_cansado", title: "Ainda cansado(a)" },
      { id: "muito_cansado", title: "Muito cansado(a)" },
    ],
    stepNumber: 16,
    next: "logic_descansado",
  },

  logic_descansado: {
    key: "logic_descansado",
    type: "logic",
    conditions: [
      {
        check: (s: FlowState) => s.como_sente_acordar === "descansado",
        next: "dificuldade_concentracao",
      },
    ],
    defaultNext: "freq_remedio_dormir",
  },

  // ╔══════════════════════════════════════════════════════╗
  // ║  SEÇÃO 7: MEDICAMENTOS E MÉTODOS                    ║
  // ╚══════════════════════════════════════════════════════╝

  freq_remedio_dormir: {
    key: "freq_remedio_dormir",
    type: "question",
    screen: "SINGLE_SELECT",
    outputKey: "freq_remedio_dormir",
    title: "No último mês, com que frequência tomou remédio para dormir?",
    options: [
      { id: "nenhuma", title: "Nenhuma vez" },
      { id: "menos_1x", title: "Menos de 1x por semana" },
      { id: "1_2x", title: "1-2x por semana" },
      { id: "3_mais", title: "3 ou mais vezes por semana" },
    ],
    stepNumber: 17,
    next: "metodos_dormir",
  },

  metodos_dormir: {
    key: "metodos_dormir",
    type: "question",
    screen: "MULTI_SELECT",
    outputKey: "metodos_dormir",
    title: "Quais métodos você já usou para tentar dormir melhor?",
    subtitle: "Selecione todos que se aplicam",
    options: [
      { id: "melatonina", title: "Melatonina" },
      { id: "chas", title: "Chás e fitoterápicos" },
      { id: "zolpidem", title: "Zolpidem (Stilnox)" },
      { id: "clonazepam", title: "Clonazepam (Rivotril)" },
      { id: "alprazolam", title: "Alprazolam (Frontal)" },
      { id: "diazepam", title: "Diazepam (Valium)" },
      { id: "suplementos", title: "Suplementos" },
      { id: "habitos", title: "Mudanças de hábitos" },
      { id: "respiracao", title: "Exercícios de respiração" },
      { id: "meditacao", title: "Meditação" },
      { id: "apps_sono", title: "Aplicativos de sono" },
      { id: "outros_prescritos", title: "Outros medicamentos prescritos" },
      { id: "nada_especifico", title: "Nada específico" },
    ],
    stepNumber: 18,
    next: "logic_metodos_nada",
  },

  logic_metodos_nada: {
    key: "logic_metodos_nada",
    type: "logic",
    conditions: [
      {
        check: (s: FlowState) =>
          hasAny(s.metodos_dormir, ["nada_especifico"]),
        next: "tempo_problemas_sono",
      },
    ],
    defaultNext: "logic_metodos",
  },

  logic_metodos: {
    key: "logic_metodos",
    type: "logic",
    conditions: [
      {
        check: (s: FlowState) =>
          hasAny(s.metodos_dormir, [
            "zolpidem",
            "clonazepam",
            "alprazolam",
            "diazepam",
          ]),
        next: "insight_medicamentos",
      },
      {
        check: (s: FlowState) =>
          hasAny(s.metodos_dormir, ["melatonina"]),
        next: "insight_melatonina",
      },
    ],
    defaultNext: "tempo_uso_medicamento",
  },

  insight_melatonina: {
    key: "insight_melatonina",
    type: "insight",
    heading: "Sobre a melatonina e o sistema endocanabinoide",
    body: "A melatonina é um hormônio natural que sinaliza ao corpo que é hora de dormir. Porém, ela sozinha não resolve problemas mais profundos de sono.\n\nO sistema endocanabinoide trabalha em conjunto com a melatonina, regulando não apenas o início do sono, mas também sua manutenção e qualidade ao longo da noite.",
    tipTitle: "A cannabis medicinal e o sistema endocanabinoide",
    tipDescription:
      "Diferente da melatonina isolada, os canabinoides atuam em múltiplos receptores que regulam ansiedade, dor e inflamação — fatores que frequentemente prejudicam o sono.",
    next: "tempo_uso_medicamento",
  },

  insight_medicamentos: {
    key: "insight_medicamentos",
    type: "insight",
    heading: "Sobre seus medicamentos para sono",
    body: "Medicamentos como Zolpidem, Clonazepam e outros benzodiazepínicos podem ser eficazes a curto prazo, mas apresentam riscos significativos:\n\n• Dependência física e psicológica\n• Tolerância (necessidade de doses maiores)\n• Efeito rebote ao parar\n• Comprometimento da memória e cognição\n• Alteração da arquitetura natural do sono",
    tipTitle: "Temos uma boa notícia!",
    tipDescription:
      "A cannabis medicinal tem se mostrado uma alternativa promissora para reduzir ou substituir esses medicamentos, com perfil de segurança superior e menor risco de dependência.",
    next: "tempo_uso_medicamento",
  },

  tempo_uso_medicamento: {
    key: "tempo_uso_medicamento",
    type: "question",
    screen: "SINGLE_SELECT",
    outputKey: "tempo_uso_medicamento",
    title: "Há quanto tempo você usa medicamento para dormir?",
    options: [
      { id: "menos_1m", title: "Menos de 1 mês" },
      { id: "1_6m", title: "1 a 6 meses" },
      { id: "6m_2a", title: "6 meses a 2 anos" },
      { id: "mais_2a", title: "Mais de 2 anos" },
    ],
    stepNumber: 19,
    next: "tentativa_parar",
  },

  tentativa_parar: {
    key: "tentativa_parar",
    type: "question",
    screen: "SINGLE_SELECT",
    outputKey: "tentativa_parar",
    title: "Você já tentou parar o medicamento?",
    options: [
      { id: "nunca", title: "Nunca tentei" },
      { id: "tentei_nao_consegui", title: "Tentei e não consegui" },
      { id: "tentando_reduzir", title: "Estou tentando reduzir" },
    ],
    stepNumber: 20,
    next: "tempo_problemas_sono",
  },

  // ╔══════════════════════════════════════════════════════╗
  // ║  SEÇÃO 8: HISTÓRICO E CONDIÇÕES                     ║
  // ╚══════════════════════════════════════════════════════╝

  tempo_problemas_sono: {
    key: "tempo_problemas_sono",
    type: "question",
    screen: "SINGLE_SELECT",
    outputKey: "tempo_problemas_sono",
    title: "Há quanto tempo você tem problemas de sono?",
    options: [
      { id: "menos_1m", title: "Menos de 1 mês" },
      { id: "1_6m", title: "1 a 6 meses" },
      { id: "6m_2a", title: "6 meses a 2 anos" },
      { id: "mais_2a", title: "Mais de 2 anos" },
    ],
    stepNumber: 21,
    next: "historico_familiar",
  },

  historico_familiar: {
    key: "historico_familiar",
    type: "question",
    screen: "SINGLE_SELECT",
    outputKey: "historico_familiar",
    title: "Alguém na sua família tem ou teve problemas de sono?",
    options: [
      { id: "nao_que_saiba", title: "Não que eu saiba" },
      { id: "sim_pais", title: "Sim, pais" },
      { id: "sim_irmaos", title: "Sim, irmãos" },
      { id: "sim_avos", title: "Sim, avós" },
      { id: "sim_varios", title: "Sim, vários familiares" },
    ],
    stepNumber: 22,
    next: "condicoes_alem_sono",
  },

  condicoes_alem_sono: {
    key: "condicoes_alem_sono",
    type: "question",
    screen: "MULTI_SELECT",
    outputKey: "condicoes_alem_sono",
    title: "Você convive com alguma dessas condições além da insônia?",
    subtitle: "Selecione todas que se aplicam",
    options: [
      { id: "ansiedade", title: "Ansiedade" },
      { id: "dor_cronica", title: "Dor crônica" },
      { id: "depressao", title: "Depressão" },
      { id: "enxaqueca", title: "Enxaqueca" },
      { id: "estresse_intenso", title: "Estresse intenso" },
      { id: "tdah", title: "TDAH" },
      { id: "toc", title: "TOC" },
      { id: "tept", title: "TEPT" },
      { id: "sindrome_panico", title: "Síndrome do pânico" },
      { id: "nenhuma", title: "Nenhuma dessas" },
    ],
    stepNumber: 23,
    next: "logic_nenhuma_condicao",
  },

  logic_nenhuma_condicao: {
    key: "logic_nenhuma_condicao",
    type: "logic",
    conditions: [
      {
        check: (s: FlowState) =>
          hasAny(s.condicoes_alem_sono, ["nenhuma"]),
        next: "freq_atividade_fisica",
      },
    ],
    defaultNext: "logic_ansiedade",
  },

  logic_ansiedade: {
    key: "logic_ansiedade",
    type: "logic",
    conditions: [
      {
        check: (s: FlowState) =>
          hasAny(s.condicoes_alem_sono, ["ansiedade"]),
        next: "insight_ansiedade",
      },
    ],
    defaultNext: "freq_atividade_fisica",
  },

  insight_ansiedade: {
    key: "insight_ansiedade",
    type: "insight",
    heading: "Ansiedade e insônia: um ciclo vicioso",
    body: "A ansiedade e a insônia se alimentam mutuamente. A ansiedade dificulta o sono, e a falta de sono aumenta a ansiedade no dia seguinte.\n\nO sistema endocanabinoide regula tanto o humor quanto o sono. Quando desregulado, ambos são afetados simultaneamente.",
    tipTitle:
      "A cannabis medicinal trata as duas condições simultaneamente.",
    tipDescription:
      "O CBD tem efeito ansiolítico comprovado, enquanto a combinação CBD+THC em doses baixas promove relaxamento e sono de qualidade.",
    next: "freq_atividade_fisica",
  },

  // ╔══════════════════════════════════════════════════════╗
  // ║  SEÇÃO 9: ATIVIDADE FÍSICA                          ║
  // ╚══════════════════════════════════════════════════════╝

  freq_atividade_fisica: {
    key: "freq_atividade_fisica",
    type: "question",
    screen: "SINGLE_SELECT",
    outputKey: "freq_atividade_fisica",
    title: "Com que frequência você pratica atividade física?",
    options: [
      { id: "nao_pratico", title: "Não pratico" },
      { id: "1_2x", title: "1-2x por semana" },
      { id: "3_4x", title: "3-4x por semana" },
      { id: "5_mais", title: "5+ vezes por semana" },
    ],
    stepNumber: 24,
    next: "logic_atividade",
  },

  logic_atividade: {
    key: "logic_atividade",
    type: "logic",
    conditions: [
      {
        check: (s: FlowState) => s.freq_atividade_fisica === "nao_pratico",
        next: "insight_nao_pratica",
      },
    ],
    defaultNext: "horario_exercicio",
  },

  insight_nao_pratica: {
    key: "insight_nao_pratica",
    type: "insight",
    heading: "Exercício e qualidade do sono",
    body: "A atividade física regular é um dos fatores mais impactantes na qualidade do sono. Mesmo caminhadas leves de 20-30 minutos podem fazer diferença significativa.\n\nO exercício aumenta a produção de adenosina (substância que promove sonolência) e regula o ritmo circadiano.",
    tipTitle: "Comece devagar",
    tipDescription:
      "Caminhadas de 20 minutos pela manhã já ajudam. O importante é a consistência, não a intensidade.",
    next: "fontes_estresse",
  },

  horario_exercicio: {
    key: "horario_exercicio",
    type: "question",
    screen: "SINGLE_SELECT",
    outputKey: "horario_exercicio",
    title: "Em qual horário você geralmente se exercita?",
    options: [
      { id: "manha", title: "Manhã (até 12h)" },
      { id: "tarde", title: "Tarde (12h-18h)" },
      { id: "noite", title: "Noite (após 18h)" },
    ],
    stepNumber: 25,
    next: "logic_exercicio_noite",
  },

  logic_exercicio_noite: {
    key: "logic_exercicio_noite",
    type: "logic",
    conditions: [
      {
        check: (s: FlowState) => s.horario_exercicio === "noite",
        next: "insight_exercicio_tarde",
      },
    ],
    defaultNext: "fontes_estresse",
  },

  insight_exercicio_tarde: {
    key: "insight_exercicio_tarde",
    type: "insight",
    heading: "Exercício à noite pode atrapalhar o sono",
    body: "Exercícios intensos após as 18h aumentam a temperatura corporal, a frequência cardíaca e os níveis de cortisol — tudo que dificulta o início do sono.\n\nO ideal é finalizar atividades intensas pelo menos 3 horas antes de dormir.",
    tipTitle: "Se não for possível mudar o horário:",
    tipDescription:
      "Opte por atividades de baixa intensidade à noite (yoga, alongamento, caminhada leve) e use técnicas de relaxamento pós-treino.",
    next: "fontes_estresse",
  },

  // ╔══════════════════════════════════════════════════════╗
  // ║  SEÇÃO 10: ESTRESSE E SAÚDE MENTAL                  ║
  // ╚══════════════════════════════════════════════════════╝

  fontes_estresse: {
    key: "fontes_estresse",
    type: "question",
    screen: "MULTI_SELECT",
    outputKey: "fontes_estresse",
    title: "Quais são suas principais fontes de estresse?",
    subtitle: "Selecione todas que se aplicam",
    options: [
      { id: "trabalho", title: "Trabalho / Carreira" },
      { id: "financeiro", title: "Financeiro" },
      { id: "relacionamento", title: "Relacionamento amoroso" },
      { id: "familia", title: "Família" },
      { id: "saude_propria", title: "Saúde própria" },
      { id: "saude_familiar", title: "Saúde de familiar" },
      { id: "luto", title: "Luto recente" },
      { id: "mudanca", title: "Mudança de vida recente" },
      { id: "nenhuma", title: "Nenhuma fonte específica" },
    ],
    stepNumber: 26,
    next: "nivel_estresse",
  },

  nivel_estresse: {
    key: "nivel_estresse",
    type: "question",
    screen: "SINGLE_SELECT",
    outputKey: "nivel_estresse",
    title: "Qual o nível geral de estresse na sua vida atualmente?",
    options: [
      { id: "baixo", title: "Baixo / Tranquilo" },
      { id: "moderado", title: "Moderado / Normal" },
      { id: "elevado", title: "Elevado" },
      { id: "muito_elevado", title: "Muito elevado" },
      { id: "extremo", title: "Extremo / Insuportável" },
    ],
    stepNumber: 27,
    next: "logic_estresse",
  },

  logic_estresse: {
    key: "logic_estresse",
    type: "logic",
    conditions: [
      {
        check: (s: FlowState) => s.nivel_estresse === "baixo",
        next: "logic_qualidade_boa",
      },
    ],
    defaultNext: "freq_ansiedade",
  },

  logic_qualidade_boa: {
    key: "logic_qualidade_boa",
    type: "logic",
    conditions: [
      {
        check: (s: FlowState) => s.qualidade_sono === "muito_boa",
        next: "comportamento_sono",
      },
    ],
    defaultNext: "freq_tristeza",
  },

  freq_ansiedade: {
    key: "freq_ansiedade",
    type: "question",
    screen: "SINGLE_SELECT",
    outputKey: "freq_ansiedade",
    title: "Com que frequência você sente ansiedade?",
    options: [
      { id: "as_vezes", title: "Às vezes" },
      { id: "frequentemente", title: "Frequentemente" },
      { id: "maior_parte", title: "A maior parte do tempo" },
    ],
    stepNumber: 28,
    next: "freq_tristeza",
  },

  freq_tristeza: {
    key: "freq_tristeza",
    type: "question",
    screen: "SINGLE_SELECT",
    outputKey: "freq_tristeza",
    title: "Com que frequência você sente tristeza ou desânimo?",
    options: [
      { id: "nunca_raramente", title: "Nunca ou raramente" },
      { id: "as_vezes", title: "Às vezes" },
      { id: "frequentemente", title: "Frequentemente" },
      { id: "maior_parte", title: "A maior parte do tempo" },
    ],
    stepNumber: 29,
    next: "bruxismo",
  },

  // ╔══════════════════════════════════════════════════════╗
  // ║  SEÇÃO 11: SINTOMAS FÍSICOS                         ║
  // ╚══════════════════════════════════════════════════════╝

  bruxismo: {
    key: "bruxismo",
    type: "question",
    screen: "SINGLE_SELECT",
    outputKey: "bruxismo",
    title: "Você range ou aperta os dentes durante o sono (bruxismo)?",
    options: [
      { id: "nao", title: "Não" },
      { id: "nao_sei", title: "Não sei" },
      { id: "sim_as_vezes", title: "Sim, às vezes" },
      { id: "sim_frequentemente", title: "Sim, frequentemente" },
    ],
    stepNumber: 30,
    next: "transpiracao_noturna",
  },

  transpiracao_noturna: {
    key: "transpiracao_noturna",
    type: "question",
    screen: "SINGLE_SELECT",
    outputKey: "transpiracao_noturna",
    title: "Você transpira durante a noite?",
    options: [
      { id: "nao", title: "Não" },
      { id: "as_vezes", title: "Às vezes" },
      { id: "frequentemente", title: "Frequentemente" },
      { id: "sempre", title: "Sempre" },
    ],
    stepNumber: 31,
    next: "comportamento_sono",
  },

  comportamento_sono: {
    key: "comportamento_sono",
    type: "question",
    screen: "SINGLE_SELECT",
    outputKey: "comportamento_sono",
    title: "Você tem algum comportamento durante o sono?",
    options: [
      { id: "durmo_quieto", title: "Não, durmo quieto(a)" },
      { id: "falo_dormindo", title: "Às vezes falo dormindo" },
      { id: "agitado", title: "Me mexo muito / sou agitado(a)" },
      { id: "grito", title: "Já me disseram que grito" },
      { id: "cai_cama", title: "Já caí da cama" },
    ],
    stepNumber: 32,
    next: "sonolencia_dia",
  },

  // ╔══════════════════════════════════════════════════════╗
  // ║  SEÇÃO 12: IMPACTO DIURNO                           ║
  // ╚══════════════════════════════════════════════════════╝

  sonolencia_dia: {
    key: "sonolencia_dia",
    type: "question",
    screen: "SINGLE_SELECT",
    outputKey: "sonolencia_dia",
    title: "Quanta sonolência você sente durante o dia?",
    options: [
      { id: "nenhuma", title: "Nenhuma, me sinto alerta" },
      { id: "leve", title: "Leve sonolência" },
      { id: "moderada", title: "Sonolência moderada" },
      { id: "intensa", title: "Sonolência intensa" },
      { id: "extrema", title: "Sonolência extrema" },
    ],
    stepNumber: 33,
    next: "logic_sonolencia",
  },

  logic_sonolencia: {
    key: "logic_sonolencia",
    type: "logic",
    conditions: [
      {
        check: (s: FlowState) => s.sonolencia_dia === "nenhuma",
        next: "dificuldade_concentracao",
      },
    ],
    defaultNext: "momentos_sonolencia",
  },

  momentos_sonolencia: {
    key: "momentos_sonolencia",
    type: "question",
    screen: "SINGLE_SELECT",
    outputKey: "momentos_sonolencia",
    title: "Em quais momentos a sonolência é mais forte?",
    options: [
      { id: "apos_acordar", title: "Logo após acordar" },
      { id: "meio_manha", title: "Meio da manhã" },
      { id: "apos_almoco", title: "Após o almoço" },
      { id: "final_tarde", title: "Final da tarde" },
      { id: "dia_todo", title: "O dia todo" },
    ],
    stepNumber: 34,
    next: "dificuldade_concentracao",
  },

  dificuldade_concentracao: {
    key: "dificuldade_concentracao",
    type: "question",
    screen: "SINGLE_SELECT",
    outputKey: "dificuldade_concentracao",
    title:
      "Qual o nível de dificuldade de concentração que o sono ruim causa?",
    options: [
      { id: "nenhuma", title: "Nenhuma" },
      { id: "leve", title: "Leve" },
      { id: "moderada", title: "Moderada" },
      { id: "intensa", title: "Intensa" },
      { id: "muito_intensa", title: "Muito Intensa" },
    ],
    stepNumber: 35,
    next: "imc",
  },

  // ╔══════════════════════════════════════════════════════╗
  // ║  SEÇÃO 13: CORPO + OBJETIVOS                        ║
  // ╚══════════════════════════════════════════════════════╝

  imc: {
    key: "imc",
    type: "question",
    screen: "SINGLE_SELECT",
    outputKey: "imc",
    title: "Como você classifica seu peso?",
    options: [
      { id: "abaixo", title: "Abaixo do peso" },
      { id: "normal", title: "Peso normal" },
      { id: "sobrepeso_leve", title: "Sobrepeso leve" },
      { id: "sobrepeso_moderado", title: "Sobrepeso moderado" },
      { id: "obesidade", title: "Obesidade" },
      { id: "nao_sei", title: "Não sei" },
    ],
    stepNumber: 36,
    next: "objetivos_tratamento",
  },

  objetivos_tratamento: {
    key: "objetivos_tratamento",
    type: "question",
    screen: "MULTI_SELECT",
    outputKey: "objetivos_tratamento",
    title: "Quais são seus principais objetivos com o tratamento?",
    subtitle: "Selecione todos que se aplicam",
    options: [
      { id: "dormir_mais", title: "Conseguir dormir mais horas" },
      { id: "pegar_sono_rapido", title: "Pegar no sono mais rápido" },
      { id: "parar_acordar", title: "Parar de acordar durante a noite" },
      { id: "acordar_descansado", title: "Acordar mais descansado" },
      { id: "reduzir_medicamentos", title: "Reduzir outros medicamentos" },
      { id: "reduzir_ansiedade", title: "Reduzir ansiedade" },
      { id: "curioso", title: "Estou curioso(a) sobre o tratamento" },
    ],
    stepNumber: 37,
    next: "preocupacoes_cannabis",
  },

  preocupacoes_cannabis: {
    key: "preocupacoes_cannabis",
    type: "question",
    screen: "MULTI_SELECT",
    outputKey: "preocupacoes_cannabis",
    title: "Você tem alguma preocupação sobre cannabis medicinal?",
    subtitle: "Selecione todas que se aplicam",
    options: [
      { id: "nenhuma", title: "Nenhuma preocupação" },
      { id: "ficar_chapado", title: "Medo de ficar chapado(a)" },
      { id: "legalidade", title: "Preocupação com legalidade" },
      { id: "vicio", title: "Preocupação com vício" },
      { id: "outros_pensam", title: "O que os outros vão pensar" },
      { id: "custo", title: "Preocupação com custo" },
      { id: "nao_funcionar", title: "Não sei se vai funcionar" },
      { id: "efeitos_colaterais", title: "Efeitos colaterais" },
    ],
    stepNumber: 38,
    next: "END",
  },
};
