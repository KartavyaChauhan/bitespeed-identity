import express from "express";
import identityRoutes from "./routes/identity.routes";

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());

// Routes
app.use("/", identityRoutes);

// Error handling middleware for 404
app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
  console.log(`📝 Identity endpoint: POST http://localhost:${PORT}/identify`);
  console.log(`💚 Health check: GET http://localhost:${PORT}/health`);
});

export default app;
