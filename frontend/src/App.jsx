import React, { useEffect, useRef, useState } from 'react';
import Login from './Login';
import Signup from './Signup';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import './App.css';

// --- CONFIGURATION ---
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";
const WS_URL = import.meta.env.VITE_WS_URL || "ws://localhost:3001";

// Icons with Mic, Plus, and Send added
const Icons = {
  Menu: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>,
  Plus: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>,
  Sun: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>,
  Moon: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>,
  User: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>,
  Trash: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>,
  Logout: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>,
  Brain: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 1.98-3A2.5 2.5 0 0 1 9.5 2Z"></path><path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-1.98-3A2.5 2.5 0 0 0 14.5 2Z"></path></svg>,
  Bot: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2a10 10 0 0 1 10 10c0 5.523-4.477 10-10 10S2 17.523 2 12 6.477 2 12 2m0 2a8 8 0 1 0 0 16 8 8 0 0 0 0-16"></path></svg>,
  Mic: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path><path d="M19 10v2a7 7 0 0 1-14 0v-2"></path><line x1="12" y1="19" x2="12" y2="23"></line><line x1="8" y1="23" x2="16" y2="23"></line></svg>,
  Send: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
};

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  // Default to Dark Mode
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [messages, setMessages] = useState([]); 
  const [input, setInput] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [isWakeWordActive, setIsWakeWordActive] = useState(false);
  const [isSpeechSupported, setIsSpeechSupported] = useState(true);
  const [sessionId, setSessionId] = useState(null); 
  const [chatSessions, setChatSessions] = useState([]);

  const ws = useRef(null);
  const chatEndRef = useRef(null);
  const recognitionRef = useRef(null);
  const synthRef = useRef(window.speechSynthesis);
  const shouldSpeakRef = useRef(false);
  
  const userEmailRef = useRef("");
  const wakeWordActiveRef = useRef(false);
  const sessionIdRef = useRef(null);

  useEffect(() => { userEmailRef.current = userEmail; }, [userEmail]);
  useEffect(() => { wakeWordActiveRef.current = isWakeWordActive; }, [isWakeWordActive]);
  useEffect(() => { sessionIdRef.current = sessionId; }, [sessionId]);

  const handleLogin = (email) => { 
    setUserEmail(email.toLowerCase().trim()); 
    setIsLoggedIn(true); 
    setIsRegistering(false); 
  };

  const handleLogout = () => { 
    if (window.confirm("Log out?")) { 
      setIsLoggedIn(false); 
      setUserEmail(""); 
      setMessages([]); 
      setSessionId(null); 
      setChatSessions([]); 
      setShowProfileMenu(false); 
      recognitionRef.current?.stop(); 
    } 
  };
  
  // THEME TOGGLE FUNCTION
  const toggleTheme = () => { 
      const newTheme = theme === 'light' ? 'dark' : 'light'; 
      setTheme(newTheme); 
      localStorage.setItem('theme', newTheme); 
  };

  // APPLY THEME TO DOCUMENT
  useEffect(() => { 
      document.documentElement.setAttribute('data-theme', theme); 
  }, [theme]);

  useEffect(() => { if (isLoggedIn && userEmail) fetchSessions(); }, [userEmail, isLoggedIn]);

  const fetchSessions = () => { 
    if(!userEmail) return; 
    fetch(`${API_URL}/api/sessions/${userEmail}`)
      .then(res => res.json())
      .then(data => setChatSessions(data))
      .catch(console.error); 
  };

  const loadSession = (id) => { 
    setSessionId(id); 
    fetch(`${API_URL}/api/chat/${id}`)
      .then(res => res.json())
      .then(msgs => setMessages(msgs))
      .catch(console.error); 
    setSidebarOpen(false); 
  };

  const deleteSession = (e, id) => { 
    e.stopPropagation(); 
    if (!window.confirm("Delete chat?")) return; 
    fetch(`${API_URL}/api/sessions/${id}`, { method: 'DELETE' })
      .then(() => { 
        setChatSessions(prev => prev.filter(s => s._id !== id)); 
        if (sessionId === id) startNewChat(); 
      }).catch(console.error); 
  };

  const startNewChat = () => { 
    setSessionId(null); 
    setMessages([]); 
    if (window.innerWidth <= 768) setSidebarOpen(false); 
  };

  const handleToggleSidebar = () => {
    if (window.innerWidth <= 668) {
      setSidebarOpen(false);
    } else {
      setIsCollapsed(!isCollapsed);
    }
  };

  useEffect(() => {
    if (!isLoggedIn) return;
    const socket = new WebSocket(WS_URL); 
    ws.current = socket;

    socket.onopen = () => setIsConnected(true);
    socket.onclose = () => setIsConnected(false);
    
    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'session_created') { 
        setSessionId(data.sessionId); 
        fetchSessions(); 
      }
      else if (data.type === 'assistant') {
        setMessages(prev => {
          const lastMsg = prev[prev.length - 1];
          if (lastMsg && lastMsg.role === 'assistant') return [...prev.slice(0, -1), { ...lastMsg, text: lastMsg.text + data.text }];
          else return [...prev, { role: 'assistant', text: data.text }];
        });
      } else if (data.type === 'stream_done') {
        setMessages(prev => { 
          const last = prev[prev.length - 1]; 
          if (last && shouldSpeakRef.current) speak(last.text); 
          return prev; 
        });
      }
    };

    return () => { if (socket.readyState === 1) socket.close(); };
  }, [isLoggedIn]);

  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) { setIsSpeechSupported(false); return; }
    
    const recognition = new SpeechRecognition();
    recognition.continuous = true; 
    recognition.interimResults = false; 
    recognition.lang = 'en-US';

    recognition.onstart = () => { 
      if (!wakeWordActiveRef.current) setIsRecording(true); 
    };

    recognition.onend = () => { 
      setIsRecording(false); 
      if (wakeWordActiveRef.current && !synthRef.current.speaking) { 
        setTimeout(() => { try { recognition.start(); } catch(e){} }, 250); 
      } 
    };

    recognition.onresult = (e) => {
      if (synthRef.current.speaking) return;
      const transcript = e.results[e.results.length - 1][0].transcript.toLowerCase().trim().replace(",", "");
      
      if (wakeWordActiveRef.current) {
          const triggers = ["hey friday", "friday", "hey gemini"];
          if (triggers.some(w => transcript.includes(w))) {
              const cmd = transcript.replace(/hey friday|friday|hey gemini/g, "").trim();
              if (cmd) { handleSend(cmd, true); } else { speak("I'm listening."); }
          }
      } else { 
          setInput(transcript); 
          handleSend(transcript, true); 
      }
    };
    recognitionRef.current = recognition;
  }, []);

  useEffect(() => {
    if(!recognitionRef.current || !isSpeechSupported) return;
    if (isWakeWordActive) { 
        try { recognitionRef.current.start(); } catch(e) {} 
    } else { 
        recognitionRef.current.stop(); 
        setIsRecording(false); 
    }
  }, [isWakeWordActive, isSpeechSupported]);

  const toggleWakeWord = () => { if(!isSpeechSupported) return alert("Speech not supported"); setIsWakeWordActive(p => !p); };
  const toggleMic = () => { if(!isSpeechSupported) return alert("Speech not supported"); isRecording ? recognitionRef.current?.stop() : recognitionRef.current?.start(); };

  const speak = (text) => {
    if (!synthRef.current) return;
    if (recognitionRef.current) { try { recognitionRef.current.stop(); } catch(e) {} }
    synthRef.current.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.onend = () => {
        setTimeout(() => {
            if (wakeWordActiveRef.current && recognitionRef.current) {
                try { recognitionRef.current.start(); } catch(e) {}
            }
        }, 300);
    };
    synthRef.current.speak(utterance);
  };

  const handleSend = (text = input, voice = false) => {
    if (!text.trim()) return;
    shouldSpeakRef.current = voice;
    setMessages(prev => [...prev, { role: 'user', text }]); 
    setInput("");
    const lowerText = text.toLowerCase();
    if (lowerText.includes("your name") || lowerText.includes("who are you")) {
       const botResponse = "I am Friday. What can I help you with?";
       setTimeout(() => {
           setMessages(prev => [...prev, { role: 'assistant', text: botResponse }]);
           if (voice) speak(botResponse);
       }, 400);
       return; 
    }
    if (userEmailRef.current && ws.current?.readyState === WebSocket.OPEN) {
        ws.current.send(JSON.stringify({ 
          text, 
          email: userEmailRef.current, 
          sessionId: sessionIdRef.current 
        }));
    }
  };

  if (!isLoggedIn) return isRegistering ? (
    <Signup onSignup={handleLogin} onSwitch={() => setIsRegistering(false)} />
  ) : (
    <Login onLogin={handleLogin} onSwitch={() => setIsRegistering(true)} />
  );

  return (
    <div className={`app-layout ${isCollapsed ? 'sidebar-minimized' : ''}`}>
      {/* SIDEBAR */}
      <aside className={`sidebar ${sidebarOpen ? 'open' : ''} ${isCollapsed ? 'collapsed' : ''}`}>
        <div className="sidebar-header">
            <button className="icon-btn mobile-menu-btn" onClick={handleToggleSidebar}>
              <Icons.Menu />
            </button> 
            {!isCollapsed && "Friday AI"}
        </div>
        
        <button className="new-chat-btn" onClick={startNewChat}>
          <Icons.Plus /> 
          {!isCollapsed && <span>New Chat</span>}
        </button>

        <div className="history-list">
          {!isCollapsed && <div className="history-title">History</div>}
          {chatSessions.length === 0 && !isCollapsed && <div className="empty-history">No chats yet</div>}
          
          {chatSessions.map((session) => (
            <div 
              key={session._id} 
              className={`history-item ${sessionId === session._id ? 'active' : ''}`} 
              onClick={() => loadSession(session._id)}
            >
              <Icons.Bot />
              {!isCollapsed && <span className="history-text">{session.title}</span>}
              {!isCollapsed && (
                <button className="delete-btn" onClick={(e) => deleteSession(e, session._id)}>
                  <Icons.Trash />
                </button>
              )}
            </div>
          ))}
        </div>

        <div className="sidebar-footer">
            <div className="history-item theme-toggle" onClick={toggleTheme}>
              {theme === 'light' ? <Icons.Moon /> : <Icons.Sun />} 
              {!isCollapsed && <span>{theme === 'light' ? "Dark Mode" : "Light Mode"}</span>}
            </div>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="main-content">
        <header className="top-nav">
          <div className="nav-left">
            <div className="model-selector">Friday <span className="dropdown-arrow"></span></div>
          </div>
          <div className="nav-right">
             <div className={`status-indicator ${isConnected ? 'online' : 'offline'}`} title={isConnected ? "Online" : "Offline"}></div>
             {isSpeechSupported && (
                 <button className={`icon-btn ${isWakeWordActive ? 'mic-active' : ''}`} onClick={toggleWakeWord} title="Wake Word Mode">
                     <Icons.Brain />
                 </button>
             )}
             <div className="profile-wrapper">
               <div className="profile-section" onClick={() => setShowProfileMenu(!showProfileMenu)}>
                  <div className="user-avatar">{userEmail[0]?.toUpperCase() || <Icons.User />}</div>
               </div>
               {showProfileMenu && (
                   <div className="profile-menu">
                       <div className="profile-name">{userEmail}</div><br></br>
                       <button className="menu-item" onClick={handleLogout}><Icons.Logout /> Log Out</button>
                   </div>
               )}
             </div>
          </div>
        </header>

        <div className="chat-container">
          {messages.length === 0 ? (
             <div className="welcome-message">
                <h1>Hello, {userEmail.split('@')[0]}</h1>
                <p>Try saying: "Hey Friday, tell me a joke"</p>
             </div>
          ) : (
            messages.map((m, i) => (
              <div key={i} className={`message ${m.role}`}>
                 {m.role === 'assistant' && <div className="bot-avatar"><Icons.Bot /></div>}
                 <div className="msg-bubble"><ReactMarkdown remarkPlugins={[remarkGfm]}>{m.text}</ReactMarkdown></div>
              </div>
            ))
          )}
          <div ref={chatEndRef} />
        </div>

        <div className="input-area">
          <div className="input-wrapper">
             {/* ADD ICON (Replaced Text) */}
             <button className="gemini-icon-btn">
                <Icons.Plus />
             </button>
             
             <input 
                className="gemini-input"
                placeholder="Ask Friday" 
                value={input} 
                onChange={(e) => setInput(e.target.value)} 
                onKeyDown={(e) => e.key === 'Enter' && handleSend(input, false)} 
                autoFocus
             />
             
             <div className="gemini-right-group">
                {input.trim() ? (
                   <button className="gemini-icon-btn" onClick={() => handleSend(input, false)}>
                      <Icons.Send />
                   </button>
                ) : (
                   <button className={`gemini-icon-btn ${isRecording ? 'mic-active' : ''}`} onClick={toggleMic} disabled={!isSpeechSupported}>
                      <Icons.Mic />
                   </button>
                )}
             </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;