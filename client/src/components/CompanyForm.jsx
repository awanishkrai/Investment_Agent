import { useState } from "react";

const PLACEHOLDER_COMPANIES = [
  "Apple",
  "Tesla",
  "SpaceX",
  "Stripe",
  "NVIDIA",
  "MongoDB",
];

export default function CompanyForm({ onSubmit, isLoading }) {
  const [companyName, setCompanyName] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (companyName.trim() && !isLoading) {
      onSubmit(companyName.trim());
    }
  };

  const handleQuickPick = (name) => {
    if (!isLoading) {
      setCompanyName(name);
      onSubmit(name);
    }
  };

  return (
    <div className="company-form-wrapper">
      <div className="form-header">
        <div className="form-icon">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.35-4.35" />
          </svg>
        </div>
        <h2>Research a Company</h2>
        <p className="form-subtitle">
          Enter a company name and our AI agent will analyze fundamentals, risks, and deliver an investment verdict.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="company-form">
        <div className="input-group">
          <input
            type="text"
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            placeholder="e.g. Apple, Tesla, SpaceX..."
            disabled={isLoading}
            autoFocus
            className="company-input"
            id="company-name-input"
          />
          <button
            type="submit"
            disabled={!companyName.trim() || isLoading}
            className="submit-btn"
            id="submit-research-btn"
          >
            {isLoading ? (
              <span className="btn-loading">
                <span className="spinner" />
                Analyzing...
              </span>
            ) : (
              <span className="btn-content">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14" />
                  <path d="m12 5 7 7-7 7" />
                </svg>
                Analyze
              </span>
            )}
          </button>
        </div>
      </form>

      <div className="quick-picks">
        <span className="quick-picks-label">Try:</span>
        {PLACEHOLDER_COMPANIES.map((name) => (
          <button
            key={name}
            className="quick-pick-chip"
            onClick={() => handleQuickPick(name)}
            disabled={isLoading}
          >
            {name}
          </button>
        ))}
      </div>
    </div>
  );
}
