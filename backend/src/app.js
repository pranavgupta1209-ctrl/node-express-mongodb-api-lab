import express from "express";
import userRouter from "./routes/user.route.js";
import postRouter from "./routes/post.route.js";
import errorHandler from "./middleware/error-handler.js";

const app = express();
app.disable("x-powered-by");
app.use(express.json({ limit: "100kb" }));

app.get("/", (req, res) => {
  res.status(200).json({ message: "Backend API is running." });
});
app.use("/api/v1/users", userRouter);
app.use("/api/v1/posts", postRouter);

app.use((req, res) => {
  res.status(404).json({ message: "Route not found. Check the HTTP method and URL." });
});
app.use(errorHandler);

export default app;
