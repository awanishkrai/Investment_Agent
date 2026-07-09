import express from "express";
import ResearchRun from "../models/ResearchRun.js";
import app from "../graph/graph.js";

const router = express.Router();

const NODE_LABELS = {
  identifyCompany: "Identifying company",
  researchCompany: "Researching company",
  analyzeFundamentals: "Analyzing fundamentals",
  analyzeRisk: "Analyzing risk",
  synthesizeDecision: "Synthesizing decision",
};

/**
 * POST /api/research
 * Body: { companyName: string }
 *
 * Streams progress via SSE as the pipeline runs, then sends the final result.
 */
router.post("/", async (req, res) => {
  const { companyName } = req.body;

  if (!companyName || typeof companyName !== "string" || !companyName.trim()) {
    return res.status(400).json({ error: "companyName is required" });
  }

  const normalizedName = companyName.trim();

  // SSE setup
  res.writeHead(200, {
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache",
    Connection: "keep-alive",
    "X-Accel-Buffering": "no",
  });

  const sendSSE = (data) => {
    res.write(`data: ${JSON.stringify(data)}\n\n`);
  };

  try {
    // check if we already ran this company in the last 24h
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const cached = await ResearchRun.findOne({
      companyName: { $regex: new RegExp(`^${escapeRegex(normalizedName)}$`, "i") },
      createdAt: { $gte: twentyFourHoursAgo },
    }).sort({ createdAt: -1 });

    if (cached) {
      sendSSE({
        type: "done",
        cached: true,
        data: {
          companyName: cached.companyName,
          companyProfile: cached.companyProfile,
          researchData: cached.researchData,
          fundamentalsAnalysis: cached.fundamentalsAnalysis,
          riskAnalysis: cached.riskAnalysis,
          decision: cached.decision,
        },
      });
      return res.end();
    }

    // run the LangGraph pipeline, streaming node-by-node updates
    const streamResult = await app.stream(
      { companyName: normalizedName },
      { streamMode: "updates" }
    );

    let finalState = { companyName: normalizedName };

    for await (const event of streamResult) {
      for (const [nodeName, update] of Object.entries(event)) {
        finalState = { ...finalState, ...update };

        sendSSE({
          type: "progress",
          node: nodeName,
          label: NODE_LABELS[nodeName] || nodeName,
        });
      }
    }

    // persist to mongo (non-fatal if it fails)
    try {
      await ResearchRun.create({
        companyName: normalizedName,
        resolvedName: finalState.companyProfile?.resolvedName || normalizedName,
        companyProfile: finalState.companyProfile,
        decision: finalState.decision,
        fundamentalsAnalysis: finalState.fundamentalsAnalysis,
        riskAnalysis: finalState.riskAnalysis,
        researchData: finalState.researchData,
      });
    } catch (dbErr) {
      console.error("Failed to save to MongoDB:", dbErr.message);
    }

    // send the final result
    sendSSE({
      type: "done",
      cached: false,
      data: {
        companyName: normalizedName,
        companyProfile: finalState.companyProfile,
        researchData: finalState.researchData,
        fundamentalsAnalysis: finalState.fundamentalsAnalysis,
        riskAnalysis: finalState.riskAnalysis,
        decision: finalState.decision,
      },
    });

    res.end();
  } catch (err) {
    console.error("Research pipeline error:", err);
    sendSSE({
      type: "error",
      message: err.message || "An unexpected error occurred during research.",
    });
    res.end();
  }
});

function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export default router;
