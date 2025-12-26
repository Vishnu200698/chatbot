import express from "express";
import dotenv from "dotenv";
import { GoogleGenerativeAI } from "@google/generative-ai";
import cors from "cors";
import { WebSocketServer } from "ws";
import mongoose from "mongoose";

dotenv.config();

// Safety Checks
if (!process.env.GEMINI_API_KEY || !process.env.MONGO_URI) {
  console.error("❌ Error: Missing Keys in .env file");
  process.exit(1);
}

const app = express();
app.use(cors());
app.use(express.json());

// --- 1. DATABASE CONNECTION ---
mongoose.connect(process.env.MONGO_URI, { dbName: 'chat_db' })
  .then(() => console.log("✅ MongoDB Connected: Advanced User & Session Models Ready"))
  .catch(err => console.error("❌ MongoDB Error:", err));

// --- 2. ADVANCED MODELS ---

// Upgraded User Schema with 5+ fields
const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  fullName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String },
  password: { type: String, required: true }, 
  createdAt: { type: Date, default: Date.now }
});
const User = mongoose.model("User", UserSchema);

// Session Schema linked to User
const SessionSchema = new mongoose.Schema({
  email: { type: String, required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, 
  title: { type: String, default: "New Chat" },
  messages: [{
    role: String,
    text: String,
    timestamp: { type: Date, default: Date.now }
  }],
  createdAt: { type: Date, default: Date.now }
});
const Session = mongoose.model("Session", SessionSchema);

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// --- 3. AUTHENTICATION ROUTES ---

app.post("/api/auth/signup", async (req, res) => {
  try {
    const { username, fullName, email, phone, password } = req.body;
    const lowerEmail = email.toLowerCase().trim();
    
    // Check if user already exists by email OR username
    const existing = await User.findOne({ $or: [{ email: lowerEmail }, { username }] });
    if (existing) return res.status(400).json({ error: "Username or Email already exists" });

    const newUser = await User.create({ 
      username, 
      fullName, 
      email: lowerEmail, 
      phone, 
      password 
    });
    
    res.json({ success: true, email: newUser.email, username: newUser.username });
  } catch (err) {
    console.error("Signup Error:", err);
    res.status(500).json({ error: "Signup failed" });
  }
});

app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email: email.toLowerCase().trim(), password });
    if (!user) return res.status(401).json({ error: "Invalid credentials" });

    res.json({ 
        success: true, 
        email: user.email, 
        username: user.username, 
        fullName: user.fullName 
    });
  } catch (err) {
    res.status(500).json({ error: "Login failed" });
  }
});

// --- 4. ADMIN & HISTORY ROUTES ---

app.get("/api/my-secret-admin-view", async (req, res) => {
  try {
    const users = await User.find().select("-password").sort({ createdAt: -1 });
    const sessionCount = await Session.countDocuments();
    res.json({ totalUsers: users.length, totalSessions: sessionCount, users });
  } catch (err) {
    res.status(500).json({ error: "Admin view failed" });
  }
});

app.get("/api/sessions/:email", async (req, res) => {
  try {
    const email = req.params.email.toLowerCase().trim();
    const sessions = await Session.find({ email }).select("title _id createdAt").sort({ createdAt: -1 });
    res.json(sessions);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch sessions" });
  }
});

app.get("/api/chat/:id", async (req, res) => {
  try {
    const session = await Session.findById(req.params.id);
    res.json(session ? session.messages : []);
  } catch (error) { res.status(500).json({ error: "Failed to fetch chat" }); }
});

app.delete("/api/sessions/:id", async (req, res) => {
  try {
    await Session.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (error) { res.status(500).json({ error: "Failed to delete session" }); }
});

const PORT = 3000;
app.listen(PORT, () => console.log(`🚀 HTTP Server: http://localhost:${PORT}`));

// --- 5. WEBSOCKET SERVER ---
const wss = new WebSocketServer({ port: 3001 });

wss.on("connection", (ws) => {
  console.log("🟢 [DEBUG] Client connected to WebSocket");

  ws.on("message", async (msg) => {
    let data;
    try { data = JSON.parse(msg.toString()); } catch (e) { return; }
    
    const { text, email, sessionId } = data;
    if (!text || !email) return;

    let currentSessionId = sessionId;
    const lowerEmail = email.toLowerCase().trim();

    // A. Sync Session with Database
    if (!currentSessionId) {
       const user = await User.findOne({ email: lowerEmail });
       const newSession = await Session.create({
         userId: user ? user._id : null,
         email: lowerEmail,
         title: text.substring(0, 30) + "...", 
         messages: [{ role: 'user', text }]
       });
       currentSessionId = newSession._id.toString();
       ws.send(JSON.stringify({ type: "session_created", sessionId: currentSessionId }));
    } else {
       await Session.findByIdAndUpdate(currentSessionId, { $push: { messages: { role: 'user', text } } });
    }

    try {
      // THE FIX: Live Real-Time Date context
      const now = new Date();
      const dateString = now.toLocaleString('en-US', { 
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', 
        hour: '2-digit', minute: '2-digit' 
      });

      // UPGRADED MODEL: Matches your debug logs perfectly
      const model = genAI.getGenerativeModel({ 
        model: "gemini-3-flash-preview",
        systemInstruction: {
          parts: [{ text: `You are Friday, a helpful AI assistant. Today's real-world date and time is ${dateString}. Use this to answer temporal questions accurately.` }]
        }
      }); 

      console.log(`🤖 [DEBUG] Requesting Gemini 3. Context Date: ${dateString}`);

      const result = await model.generateContentStream(text);
      let fullBotResponse = "";

      for await (const chunk of result.stream) {
        const chunkText = chunk.text();
        if (chunkText) {
            fullBotResponse += chunkText;
            ws.send(JSON.stringify({ type: "assistant", text: chunkText }));
        }
      }
      
      await Session.findByIdAndUpdate(currentSessionId, { $push: { messages: { role: 'assistant', text: fullBotResponse } } });
      ws.send(JSON.stringify({ type: "stream_done" }));
      console.log("✅ [DEBUG] Bot finished responding.");

    } catch (err) {
      console.error("❌ [DEBUG] Gemini API Error:", err.message);
      ws.send(JSON.stringify({ type: "error", error: "AI Error: " + err.message }));
    }
  });

  ws.on("close", () => console.log("🔴 [DEBUG] Client disconnected"));
});

console.log("📡 WebSocket running on ws://localhost:3001");