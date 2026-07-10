import { StateGraph, END } from "@langchain/langgraph";
import ResearchState from "./state.js";
import {
  identifyCompany,
  researchCompany,
  analyzeFundamentals,
  analyzeRisk,
  synthesizeDecision,
} from "./nodes.js";

// Build the 5-node research pipeline.
// Flow: identify → research → fundamentals → risk → decision → END
function buildGraph() {
  const graph = new StateGraph(ResearchState)
    .addNode("identifyCompany", identifyCompany)
    .addNode("researchCompany", researchCompany)
    .addNode("analyzeFundamentals", analyzeFundamentals)
    .addNode("analyzeRisk", analyzeRisk)
    .addNode("synthesizeDecision", synthesizeDecision)
    .addEdge("__start__", "identifyCompany")
    .addEdge("identifyCompany", "researchCompany")
    .addEdge("researchCompany", "analyzeFundamentals")
    .addEdge("analyzeFundamentals", "analyzeRisk")
    .addEdge("analyzeRisk", "synthesizeDecision")
    .addEdge("synthesizeDecision", END);

  return graph.compile();
}

const app = buildGraph();

export default app;
