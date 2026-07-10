import mongoose from "mongoose";

const researchRunSchema = new mongoose.Schema({
  companyName: {
    type: String,
    required: true,
    index: true,
  },
  resolvedName: {
    type: String,
    default: null,
  },
  decision: {
    type: mongoose.Schema.Types.Mixed,
    default: null,
  },
  fundamentalsAnalysis: {
    type: String,
    default: "",
  },
  riskAnalysis: {
    type: String,
    default: "",
  },
  researchData: {
    type: mongoose.Schema.Types.Mixed,
    default: null,
  },
  companyProfile: {
    type: mongoose.Schema.Types.Mixed,
    default: null,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 86400, // auto-delete after 24h
  },
});

const ResearchRun = mongoose.model("ResearchRun", researchRunSchema);

export default ResearchRun;
