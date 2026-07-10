import dotenv from "dotenv";

dotenv.config();

const TAVILY_API_KEY = process.env.TAVILY_API_KEY;
const TAVILY_URL = "https://api.tavily.com/search";

// low-level tavily search wrapper
async function tavilySearch(query, maxResults = 5) {
  if (!TAVILY_API_KEY) {
    console.warn("TAVILY_API_KEY not set — returning empty results");
    return [];
  }

  try {
    const response = await fetch(TAVILY_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        api_key: TAVILY_API_KEY,
        query,
        max_results: maxResults,
        search_depth: "advanced",
        include_answer: true, // gives us a pre-summarized answer alongside raw results
      }),
    });

    if (!response.ok) {
      console.error(`Tavily API error: ${response.status} ${response.statusText}`);
      return [];
    }

    const data = await response.json();
    return data.results || [];
  } catch (err) {
    console.error("Tavily search failed:", err.message);
    return [];
  }
}

// grab recent news articles about the company
export async function searchNews(companyName) {
  const results = await tavilySearch(
    `${companyName} latest news analysis 2024 2025`,
    5
  );

  return results.map((r) => ({
    title: r.title,
    url: r.url,
    content: r.content,
    score: r.score,
  }));
}

// grab financial data — revenue, margins, valuation etc.
// we just pass raw search results to the LLM and let it figure out the numbers
export async function searchFinancials(companyName) {
  const results = await tavilySearch(
    `${companyName} financial results revenue profit market cap valuation 2024 2025`,
    5
  );

  return {
    sources: results.map((r) => ({
      title: r.title,
      url: r.url,
      content: r.content,
      score: r.score,
    })),
  };
}
