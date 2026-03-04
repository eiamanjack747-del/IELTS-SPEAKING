import express from 'express';
import { createServer as createViteServer } from 'vite';
import { WebSocketServer, WebSocket } from 'ws';
import http from 'http';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Create HTTP server
  const server = http.createServer(app);

  // Middleware to parse JSON bodies
  app.use(express.json());

  // Create WebSocket server
  const wss = new WebSocketServer({ server });

  // Track active connections
  let activeUsers = 0;
  // Store current notices
  let notices = {
    welcome: "Welcome to the IELTS Speaking Practice App! Good luck with your preparation.",
    scrolling: "API Quota Exceeded? ১ মিনিট অপেক্ষা করুন (ফ্রি টায়ারে প্রতি মিনিটে লিমিট থাকে। ১ মিনিট পর আবার চেষ্টা করলে এটি ঠিক হয়ে যাবে।)"
  };

  wss.on('connection', (ws: WebSocket) => {
    activeUsers++;
    console.log(`User connected. Total users: ${activeUsers}`);

    // Broadcast updated count to all clients
    broadcastUserCount();

    ws.on('close', () => {
      activeUsers--;
      console.log(`User disconnected. Total users: ${activeUsers}`);
      broadcastUserCount();
    });
  });

  function broadcastUserCount() {
    const message = JSON.stringify({ type: 'USER_COUNT_UPDATE', count: activeUsers });
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    });
  }

  // API routes FIRST
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok' });
  });

  // Notice API
  app.get('/api/notice', (req, res) => {
    res.json(notices);
  });

  app.post('/api/notice', (req, res) => {
    const { welcome, scrolling, password } = req.body;
    if (password === 'admin123') { // Simple hardcoded password
      if (welcome !== undefined) notices.welcome = welcome;
      if (scrolling !== undefined) notices.scrolling = scrolling;
      res.json({ success: true, notices });
    } else {
      res.status(401).json({ success: false, message: 'Invalid password' });
    }
  });

  // Login API
  app.post('/api/login', (req, res) => {
    const { password } = req.body;
    if (password === 'admin123') {
      res.json({ success: true });
    } else {
      console.log(`Failed login attempt with password: ${password}`);
      res.status(401).json({ success: false, message: 'Invalid password' });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // Serve static files in production
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  server.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
