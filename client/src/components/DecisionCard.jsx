import { useState } from "react";

const DECISION_CONFIG = {
  Invest: {
    color: "var(--invest-green)",
    bg: "var(--invest-green-bg)",
    border: "var(--invest-green-border)",
    emoji: "🟢",
  },
  Pass: {
    color: "var(--pass-red)",
    bg: "var(--pass-red-bg)",
    border: "var(--pass-red-border)",
    emoji: "🔴",
  },
  Hold: {
    color: "var(--hold-amber)",
    bg: "var(--hold-amber-bg)",
    border: "var(--hold-amber-border)",
    emoji: "🟡",
  },
};

const CONFIDENCE_STYLES = {
  High: { color: "var(--invest-green)", width: "100%" },
  Medium: { color: "var(--hold-amber)", width: "66%" },
  Low: { color: "var(--pass-red)", width: "33%" },
};

export default function DecisionCard({ data, cached }) {
  const [expanded, setExpanded] = useState({
    bull: false,
    bear: false,
    verdict: false,
    fundamentals: false,
    risk: false,
    profile: false,
  });

  if (!data || !data.decision) return null;

  const { decision, companyProfile, fundamentalsAnalysis, riskAnalysis } = data;
  const config = DECISION_CONFIG[decision.decision] || DECISION_CONFIG.Hold;
  const confidence = CONFIDENCE_STYLES[decision.confidence] || CONFIDENCE_STYLES.Low;

  const toggle = (key) =>
    setExpanded((prev) => ({ ...prev, [key]: !prev[key] }));

  return (
    <div className="decision-card glass-card" style={{ "--decision-color": config.color, "--decision-bg": config.bg, "--decision-border": config.border }}>
      <div className="decision-header">
        <div className="decision-company">
          <h2>{companyProfile?.resolvedName || data.companyName}</h2>
          {companyProfile && (
            <div className="company-meta">
              {companyProfile.ticker && (
                <span className="meta-chip">{companyProfile.ticker} · {companyProfile.exchange}</span>
              )}
              <span className="meta-chip">{companyProfile.industry}</span>
              <span className="meta-chip">{companyProfile.country}</span>
              {!companyProfile.isPublic && (
                <span className="meta-chip meta-chip--private">Private</span>
              )}
            </div>
          )}
        </div>

        <div className="decision-badge-wrapper">
          <div className="decision-badge" style={{ background: config.bg, borderColor: config.border, color: config.color }}>
            <span className="decision-emoji">{config.emoji}</span>
            <span className="decision-text">{decision.decision}</span>
          </div>
          {cached && (
            <span className="cache-indicator" id="cache-indicator">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
              from cache
            </span>
          )}
        </div>
      </div>

      {/* confidence bar */}
      <div className="confidence-section">
        <div className="confidence-label">
          <span>Confidence</span>
          <span style={{ color: confidence.color }}>{decision.confidence}</span>
        </div>
        <div className="confidence-bar">
          <div className="confidence-fill" style={{ width: confidence.width, background: confidence.color }} />
        </div>
      </div>

      <div className="decision-sections">
        <ExpandableSection
          title="🐂 Bull Case"
          content={decision.bullCase}
          isOpen={expanded.bull}
          onToggle={() => toggle("bull")}
          accentColor="var(--invest-green)"
        />

        <ExpandableSection
          title="🐻 Bear Case"
          content={decision.bearCase}
          isOpen={expanded.bear}
          onToggle={() => toggle("bear")}
          accentColor="var(--pass-red)"
        />

        <ExpandableSection
          title="⚖️ Verdict"
          content={decision.verdict}
          isOpen={expanded.verdict}
          onToggle={() => toggle("verdict")}
          accentColor="var(--accent-blue)"
        />

        <ExpandableSection
          title="📈 Fundamentals Analysis"
          content={fundamentalsAnalysis}
          isOpen={expanded.fundamentals}
          onToggle={() => toggle("fundamentals")}
          accentColor="var(--accent-cyan)"
        />

        <ExpandableSection
          title="⚠️ Risk Analysis"
          content={riskAnalysis}
          isOpen={expanded.risk}
          onToggle={() => toggle("risk")}
          accentColor="var(--hold-amber)"
        />

        {companyProfile?.assumptionNote && (
          <ExpandableSection
            title="📝 Identification Notes"
            content={companyProfile.assumptionNote}
            isOpen={expanded.profile}
            onToggle={() => toggle("profile")}
            accentColor="var(--text-muted)"
          />
        )}
      </div>
    </div>
  );
}

function ExpandableSection({ title, content, isOpen, onToggle, accentColor }) {
  return (
    <div className={`expandable-section ${isOpen ? "expandable-section--open" : ""}`}>
      <button className="expandable-header" onClick={onToggle}>
        <span className="expandable-title" style={{ "--section-accent": accentColor }}>
          {title}
        </span>
        <svg
          className="expandable-chevron"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>
      {isOpen && (
        <div className="expandable-content">
          <p>{content}</p>
        </div>
      )}
    </div>
  );
}
