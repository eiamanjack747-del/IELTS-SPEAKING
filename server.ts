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
  // Store current notice
  let currentNotice = "Welcome to the IELTS Speaking Practice App! Good luck with your preparation.";

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
    res.json({ notice: currentNotice });
  });

  app.post('/api/notice', (req, res) => {
    const { notice, password } = req.body;
    if (password === 'admin123') { // Simple hardcoded password
      currentNotice = notice;
      res.json({ success: true, notice: currentNotice });
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
