const STAGES = [
  { key: "identifyCompany", label: "Identifying company", icon: "🔍" },
  { key: "researchCompany", label: "Researching data", icon: "📊" },
  { key: "analyzeFundamentals", label: "Analyzing fundamentals", icon: "📈" },
  { key: "analyzeRisk", label: "Analyzing risk", icon: "⚠️" },
  { key: "synthesizeDecision", label: "Synthesizing decision", icon: "🎯" },
];

export default function ProgressTracker({ completedNodes }) {
  const completedSet = new Set(completedNodes);
  const currentIndex = STAGES.findIndex((s) => !completedSet.has(s.key));

  return (
    <div className="progress-tracker glass-card">
      <h3 className="progress-title">Pipeline Progress</h3>
      <div className="progress-stages">
        {STAGES.map((stage, i) => {
          const isCompleted = completedSet.has(stage.key);
          const isActive = i === currentIndex;
          const isPending = i > currentIndex;

          let stageClass = "stage";
          if (isCompleted) stageClass += " stage--completed";
          else if (isActive) stageClass += " stage--active";
          else if (isPending) stageClass += " stage--pending";

          return (
            <div key={stage.key} className={stageClass}>
              <div className="stage-indicator">
                {isCompleted ? (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                ) : isActive ? (
                  <span className="stage-spinner" />
                ) : (
                  <span className="stage-dot" />
                )}
              </div>
              <div className="stage-content">
                <span className="stage-icon">{stage.icon}</span>
                <span className="stage-label">{stage.label}</span>
              </div>
              {i < STAGES.length - 1 && (
                <div className={`stage-connector ${isCompleted ? "stage-connector--filled" : ""}`} />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
