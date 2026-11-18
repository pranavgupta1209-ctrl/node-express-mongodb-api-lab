import dotenv from "dotenv";
import mongoose from "mongoose";
import { fileURLToPath } from "node:url";
import connectDatabase from "./config/database.js";
import { User } from "./models/user.model.js";
import app from "./app.js";

// Resolve the root .env independently of the terminal's current directory.
dotenv.config({ path: fileURLToPath(new URL("../../.env", import.meta.url)), quiet: true });

async function startServer() {
  const port = Number(process.env.PORT || 8000);
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    console.error("Startup failed: PORT must be an integer between 1 and 65535.");
    process.exitCode = 1;
    return;
  }

  try {
    await connectDatabase();
    // Wait for unique email/username indexes before accepting registrations.
    await User.init();

    const server = app.listen(port, (error) => {
      // Express 5 invokes this callback for listener errors as well as success.
      if (error) return;
      console.log(`Server running at http://localhost:${port}`);
    });

    server.on("error", async (error) => {
      console.error(
        error.code === "EADDRINUSE"
          ? `Port ${port} is already in use. Stop the other server or change PORT in .env.`
          : "HTTP server could not start.",
      );
      await mongoose.disconnect();
      process.exitCode = 1;
    });

    const stopServer = () => {
      server.close(async () => {
        await mongoose.disconnect();
        console.log("Server stopped.");
      });
    };
    process.once("SIGINT", stopServer);
    process.once("SIGTERM", stopServer);
  } catch {
    console.error(
      "Startup failed. Check MONGODB_URI in the root .env, database credentials, your Atlas IP access list, and internet access. The HTTP server was not started.",
    );
    await mongoose.disconnect();
    process.exitCode = 1;
  }
}

startServer();
