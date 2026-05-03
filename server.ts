import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";

// Note: In a real app, you'd use a service account key.
// Here we use credentials from the environment or just use the Firebase Admin SDK
// if it's already configured. AI Studio provides firebase-applet-config.json.
// However, the Admin SDK needs a service account.
// For the purpose of this demonstration, we'll use the Client SDK logic in the frontend
// OR mock the server-side persistence if Admin SDK isn't fully ready.
// Actually, I can use the standard Client SDK on the frontend for everything, 
// and just use the backend for the "Email Notification" logic.

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Routes
  app.post("/api/tickets/notify", (req, res) => {
    const { ticketId, name, flatNumber, email, type, description, date } = req.body;
    
    console.log("-----------------------------------------");
    console.log("SIMULATING EMAIL NOTIFICATION");
    console.log(`TO: moryachsltd@gmail.com`);
    console.log(`CC: ${email}`);
    console.log(`SUBJECT: New Request Raised – ${ticketId}`);
    console.log(`BODY:`);
    console.log(`Ticket ID: ${ticketId}`);
    console.log(`Member Name: ${name}`);
    console.log(`Flat Number: ${flatNumber}`);
    console.log(`Request Type: ${type}`);
    console.log(`Description: ${description}`);
    console.log(`Submitted Date: ${new Date().toLocaleDateString()}`);
    console.log("-----------------------------------------");

    res.json({ success: true, message: "Notification sent (simulated)" });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
