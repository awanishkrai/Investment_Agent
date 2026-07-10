import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import llm from "../services/llm.js";
import { searchNews, searchFinancials } from "../services/dataSources.js";

// strips markdown fences + parses JSON, returns fallback on failure
function safeParseJSON(text, fallback = null) {
  try {
    const cleaned = text
      .replace(/```json\s*/gi, "")
      .replace(/```\s*/g, "")
      .trim();
    return JSON.parse(cleaned);
  } catch (err) {
    console.error("JSON parse error:", err.message, "\nRaw text:", text);
    return fallback;
  }
}

// --- identifyCompany ---
// Resolves a potentially ambiguous company name into a structured profile.
// If the name is vague (e.g. "Apple"), the LLM picks the most well-known match.
export async function identifyCompany(state) {
  const { companyName } = state;

  const systemPrompt = `You are a company identification assistant. Given a company name, identify:
1. The most likely company being referred to (if ambiguous, pick the most well-known match and state your assumption)
2. Whether it is publicly traded or private
3. Its stock ticker and primary exchange (if public)
4. Its industry/sector
5. Its headquarters country

Respond ONLY in valid JSON, no markdown fences, no preamble:
{
  "resolvedName": string,
  "isPublic": boolean,
  "ticker": string or null,
  "exchange": string or null,
  "industry": string,
  "country": string,
  "assumptionNote": string
}`;

  try {
    const response = await llm.invoke([
      new SystemMessage(systemPrompt),
      new HumanMessage(`Company name: "${companyName}"`),
    ]);

    const parsed = safeParseJSON(response.content, {
      resolvedName: companyName,
      isPublic: false,
      ticker: null,
      exchange: null,
      industry: "Unknown",
      country: "Unknown",
      assumptionNote: "Could not identify company — proceeding with provided name.",
    });

    return { companyProfile: parsed };
  } catch (err) {
    console.error("identifyCompany error:", err.message);
    return {
      companyProfile: {
        resolvedName: companyName,
        isPublic: false,
        ticker: null,
        exchange: null,
        industry: "Unknown",
        country: "Unknown",
        assumptionNote: `Error identifying company: ${err.message}`,
      },
    };
  }
}

// --- researchCompany ---
// No LLM here — just fires off Tavily searches for news + financials in parallel.
export async function researchCompany(state) {
  const { companyProfile } = state;
  const name = companyProfile?.resolvedName || state.companyName;

  try {
    const [news, financials] = await Promise.all([
      searchNews(name),
      searchFinancials(name),
    ]);

    return { researchData: { financials, news } };
  } catch (err) {
    console.error("researchCompany error:", err.message);
    // don't crash the pipeline, just return empty data
    return {
      researchData: {
        financials: { sources: [] },
        news: [],
      },
    };
  }
}

// --- analyzeFundamentals ---
export async function analyzeFundamentals(state) {
  const { companyProfile, researchData } = state;
  const { resolvedName, industry, isPublic } = companyProfile || {};
  const financials = researchData?.financials || { sources: [] };

  const systemPrompt = `You are a financial analyst evaluating a company's fundamentals for an investment decision.
Analyze objectively — do not default to optimism. Flag weak or missing data explicitly.

Structure your response as:
1. Revenue & growth trend — 2-3 sentences
2. Profitability & margins — 2-3 sentences (or "insufficient data" if private/early-stage)
3. Valuation assessment — cheap, fair, or expensive vs. sector peers, and why
4. Overall fundamentals verdict — one of: Strong / Mixed / Weak / Insufficient data`;

  const userPrompt = `Company: ${resolvedName} (${industry}, ${isPublic ? "public" : "private"})
Financial data:
${JSON.stringify(financials, null, 2)}`;

  try {
    const response = await llm.invoke([
      new SystemMessage(systemPrompt),
      new HumanMessage(userPrompt),
    ]);
    return { fundamentalsAnalysis: response.content };
  } catch (err) {
    console.error("analyzeFundamentals error:", err.message);
    return {
      fundamentalsAnalysis:
        "Fundamentals analysis unavailable due to an error. Insufficient data to draw conclusions.",
    };
  }
}

// --- analyzeRisk ---
// TODO: would be nice to run this in parallel with analyzeFundamentals — they're independent
export async function analyzeRisk(state) {
  const { companyProfile, researchData } = state;
  const { resolvedName, industry } = companyProfile || {};
  const news = researchData?.news || [];

  const systemPrompt = `You are a risk analyst reviewing recent news and sentiment about a company.
Identify genuine red flags (lawsuits, leadership departures, regulatory action, declining demand, scandals). Do not manufacture concern where none exists, and do not ignore real ones.

Structure your response as:
1. Sentiment summary — 2-3 sentences
2. Key risks identified — bulleted, each with severity (Low/Medium/High)
3. Competitive/market risks — 2-3 sentences
4. Overall risk verdict — one of: Low / Moderate / High / Severe`;

  const userPrompt = `Company: ${resolvedName} (${industry})
Recent news/data:
${JSON.stringify(news, null, 2)}`;

  try {
    const response = await llm.invoke([
      new SystemMessage(systemPrompt),
      new HumanMessage(userPrompt),
    ]);
    return { riskAnalysis: response.content };
  } catch (err) {
    console.error("analyzeRisk error:", err.message);
    return {
      riskAnalysis: "Risk analysis unavailable due to an error. Cannot assess risk profile.",
    };
  }
}

// --- synthesizeDecision ---
// Takes the fundamentals + risk analyses and produces a final Invest/Pass/Hold call.
export async function synthesizeDecision(state) {
  const { companyProfile, fundamentalsAnalysis, riskAnalysis } = state;
  const { resolvedName } = companyProfile || {};

  const systemPrompt = `You are an investment committee member making a final call on whether to invest.
Synthesize the fundamentals and risk analyses given — do not re-derive raw data.
A strong-fundamentals company with severe risk should not automatically get "Invest". A weak-fundamentals company isn't automatically a "Pass" if risk is low and valuation is attractive. Say "Hold" when the picture is genuinely mixed.

Respond ONLY in valid JSON, no markdown fences:
{
  "decision": "Invest" | "Pass" | "Hold",
  "confidence": "Low" | "Medium" | "High",
  "bullCase": string,
  "bearCase": string,
  "verdict": string
}`;

  const userPrompt = `Company: ${resolvedName}
Fundamentals analysis: ${fundamentalsAnalysis}
Risk analysis: ${riskAnalysis}`;

  const fallbackDecision = {
    decision: "Hold",
    confidence: "Low",
    bullCase: "Unable to determine bull case due to analysis error.",
    bearCase: "Unable to determine bear case due to analysis error.",
    verdict: "Insufficient data to make a confident recommendation. Defaulting to Hold.",
  };

  try {
    const response = await llm.invoke([
      new SystemMessage(systemPrompt),
      new HumanMessage(userPrompt),
    ]);

    return { decision: safeParseJSON(response.content, fallbackDecision) };
  } catch (err) {
    console.error("synthesizeDecision error:", err.message);
    return {
      decision: {
        ...fallbackDecision,
        verdict: `Error during decision synthesis: ${err.message}. Defaulting to Hold.`,
      },
    };
  }
}
