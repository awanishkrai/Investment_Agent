# InvestAgent

built this to automate some of my investment research. you give it a company name (e.g. "Apple" or "Stripe") and it figures out the exact entity, scrapes live news and financials via Tavily, and then runs a couple LLM prompts over it to give a final Invest/Pass/Hold verdict.

it streams the progress via SSE so the UI feels fast.

### tech stack
- frontend: React + Vite
- backend: Node / Express
- agent logic: LangGraph.js
- llm: gpt-4o-mini
- cache: MongoDB (caches the pipeline output for 24 hours to save API credits)

### how to run it

you'll need node 18+ and a mongo connection string.

1. clone the repo
2. setup the backend:
```bash
cd server
npm install
cp .env.example .env
```
add your `OPENAI_API_KEY`, `TAVILY_API_KEY`, and `MONGODB_URI` to the `.env` file. (if you don't add mongo it just skips caching).

3. setup frontend:
```bash
cd ../client
npm install
```

4. run both servers:
```bash
# terminal 1
cd server && npm run dev

# terminal 2 
cd client && npm run dev
```

then go to `http://localhost:5173`.

### notes
- I decided against using a vector DB / RAG setup because financial data goes stale way too fast. passing the raw search results directly into the prompt context works much better for this.
- right now it runs the fundamental analysis and risk analysis sequentially. would be nice to run them in parallel eventually to cut the wait time in half.
- tavily is actually pretty good at summarizing financial data without needing a heavy API like Alpha Vantage.

license is MIT, feel free to fork it.
