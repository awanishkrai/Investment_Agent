import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import dotenv from "dotenv";
import researchRouter from "./routes/research.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());

// routes
app.use("/api/research", researchRouter);

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// catch-all error handler
app.use((err, req, res, _next) => {
  console.error("Unhandled error:", err);
  res.status(500).json({ error: "Internal server error" });
});

async function start() {
  const mongoUri = process.env.MONGODB_URI;

  if (mongoUri) {
    try {
      await mongoose.connect(mongoUri);
      console.log("Connected to MongoDB");
    } catch (err) {
      console.error("MongoDB connection failed:", err.message);
      console.warn("Server will run without caching.");
    }
  } else {
    console.warn("MONGODB_URI not set — caching disabled");
  }

  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

start();
