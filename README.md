# InvestAgent — AI Investment Research Pipeline

This repository contains my submission for the investment research agent assignment. It is a full-stack application that takes a company name and orchestrates a multi-step AI pipeline to generate a structured investment recommendation (Invest / Pass / Hold) based on live financial data and market sentiment.

## Architecture Overview

I decided to break the research process down into a deterministic, 5-stage pipeline using **LangGraph.js**. While a single LLM call might work for simple queries, separating the concerns into discrete nodes allows for better error handling, testing, and future extensibility.

1. **Entity Resolution**: Cleans the user's input and resolves it to a specific company (handling ambiguities and determining public/private status).
2. **Data Ingestion**: Fetches live news and financial data concurrently via the Tavily API.
3. **Fundamental Analysis**: Evaluates revenue, margins, and valuation based on the scraped financial data.
4. **Risk Analysis**: Evaluates market sentiment and flags potential risks (lawsuits, competition) from the news data.
5. **Decision Synthesis**: Consolidates the fundamental and risk analyses into a final verdict.

The backend is built with Node.js and Express, while the frontend is a React application built with Vite.

## Design Decisions & Trade-offs

I made a few key architectural choices to balance performance, cost, and complexity for this assignment:

- **Live Retrieval over Vector DB**: I opted to pass the live search results directly into the LLM context rather than implementing a RAG/Vector DB pipeline. In the financial domain, data staleness is a critical risk. This ensures the agent always reasons over today's data, though it trades off higher token usage per request.
- **Server-Sent Events (SSE)**: The pipeline streams progress updates to the frontend via SSE. I chose SSE over WebSockets because the data flow is strictly unidirectional (server pushing updates to the client), making SSE simpler to implement and debug while still providing a real-time UX.
- **Aggressive Caching Strategy**: LLM and search API calls are expensive. I implemented a MongoDB-backed caching layer with a 24-hour TTL index based on the normalized company name. Duplicate queries within the same day return instantly.
- **Graceful Degradation**: Every LLM JSON output is wrapped in a parsing fallback. If an API fails or the LLM hallucinates malformed JSON, the specific node degrades gracefully (returning "insufficient data") rather than crashing the entire pipeline.

## Running the Project Locally

### Prerequisites
- Node.js v18+
- A MongoDB instance (local or Atlas)
- API keys for OpenAI and Tavily Search

### 1. Setup Environment
Clone the repository and install dependencies for both the client and server:

```bash
cd agent
cd server && npm install
cd ../client && npm install
```

In the `server` directory, create a `.env` file based on the example:
```bash
cp .env.example .env
```
Fill in your `OPENAI_API_KEY`, `TAVILY_API_KEY`, and `MONGODB_URI`. If you omit the MongoDB URI, the application will still function but will bypass the caching layer.

### 2. Start the Application
The frontend and backend run on separate development servers. Open two terminal instances:

```bash
# Terminal 1: Start the backend API
cd server
npm run dev
```

```bash
# Terminal 2: Start the React frontend
cd client
npm run dev
```

Navigate to `http://localhost:5173` in your browser to test the application.

## Future Improvements

If I had more time to expand this project, I would focus on:
1. **Parallel Node Execution**: The `analyzeFundamentals` and `analyzeRisk` nodes are completely independent. I would update the LangGraph configuration to fan-out and run these concurrently, which would roughly halve the pipeline's total latency.
2. **Structured Financial APIs**: Currently, the application relies on Tavily search summaries for financial metrics. I would integrate a dedicated API (like Alpha Vantage or Polygon.io) for the fundamentals node to ensure the LLM has exact, structured numbers to reason over.
3. **Conversational Interface**: I would transition the SSE connection to a WebSocket, allowing the user to ask follow-up questions about the generated research report while maintaining the context of the initial analysis.
