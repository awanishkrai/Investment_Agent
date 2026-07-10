import { Annotation } from "@langchain/langgraph";

// State channels for the research pipeline.
// Each node writes to its own channel — LangGraph handles the wiring.
const ResearchState = Annotation.Root({
  // user input
  companyName: Annotation({
    reducer: (_, next) => next,
    default: () => "",
  }),

  // identifyCompany output
  companyProfile: Annotation({
    reducer: (_, next) => next,
    default: () => null,
  }),

  // researchCompany output — news + financial search results from Tavily
  researchData: Annotation({
    reducer: (_, next) => next,
    default: () => null,
  }),

  // analyzeFundamentals output (free-text from LLM)
  fundamentalsAnalysis: Annotation({
    reducer: (_, next) => next,
    default: () => "",
  }),

  // analyzeRisk output (free-text from LLM)
  riskAnalysis: Annotation({
    reducer: (_, next) => next,
    default: () => "",
  }),

  // final structured decision
  decision: Annotation({
    reducer: (_, next) => next,
    default: () => null,
  }),
});

export default ResearchState;
