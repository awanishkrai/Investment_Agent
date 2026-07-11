import { useState, useCallback } from "react";
import CompanyForm from "./components/CompanyForm";
import ProgressTracker from "./components/ProgressTracker";
import DecisionCard from "./components/DecisionCard";
import { startResearch } from "./api";
import "./App.css";

function App() {
  const [status, setStatus] = useState("idle"); // idle | loading | done | error
  const [completedNodes, setCompletedNodes] = useState([]);
  const [result, setResult] = useState(null);
  const [cached, setCached] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = useCallback(async (companyName) => {
    setStatus("loading");
    setCompletedNodes([]);
    setResult(null);
    setCached(false);
    setError(null);

    try {
      await startResearch(companyName, (event) => {
        switch (event.type) {
          case "progress":
            setCompletedNodes((prev) => [...prev, event.node]);
            break;
          case "done":
            setResult(event.data);
            setCached(event.cached || false);
            setStatus("done");
            break;
          case "error":
            setError(event.message);
            setStatus("error");
            break;
        }
      });

      // if stream ends without a "done" event, something went wrong
      setStatus((prev) => (prev === "loading" ? "error" : prev));
    } catch (err) {
      setError(err.message || "Failed to connect to the research server.");
      setStatus("error");
    }
  }, []);

  const handleReset = () => {
    setStatus("idle");
    setCompletedNodes([]);
    setResult(null);
    setCached(false);
    setError(null);
  };

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-content">
          <div className="logo">
            <div className="logo-icon">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="url(#logoGrad)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <defs>
                  <linearGradient id="logoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="var(--accent-blue)" />
                    <stop offset="100%" stopColor="var(--accent-purple)" />
                  </linearGradient>
                </defs>
                <path d="M12 2L2 7l10 5 10-5-10-5z" />
                <path d="M2 17l10 5 10-5" />
                <path d="M2 12l10 5 10-5" />
              </svg>
            </div>
            <div>
              <h1 className="logo-text">InvestAgent</h1>
              <span className="logo-tagline">AI-Powered Investment Research</span>
            </div>
          </div>
        </div>
      </header>

      <main className="app-main">
        <CompanyForm onSubmit={handleSubmit} isLoading={status === "loading"} />

        {status === "loading" && (
          <div className="section-animate">
            <ProgressTracker completedNodes={completedNodes} />
          </div>
        )}

        {status === "error" && (
          <div className="error-card glass-card section-animate">
            <div className="error-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--pass-red)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <line x1="15" y1="9" x2="9" y2="15" />
                <line x1="9" y1="9" x2="15" y2="15" />
              </svg>
            </div>
            <div className="error-content">
              <h3>Analysis Failed</h3>
              <p>{error || "An unexpected error occurred."}</p>
            </div>
            <button className="retry-btn" onClick={handleReset}>
              Try Again
            </button>
          </div>
        )}

        {status === "done" && result && (
          <div className="section-animate">
            <DecisionCard data={result} cached={cached} />
            <div className="reset-wrapper">
              <button className="reset-btn" onClick={handleReset}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="23 4 23 10 17 10" />
                  <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
                </svg>
                Research Another Company
              </button>
            </div>
          </div>
        )}
      </main>

      <footer className="app-footer">
        <p>
          Powered by LangGraph.js &middot; OpenAI &middot; Tavily
        </p>
      </footer>
    </div>
  );
}

export default App;
