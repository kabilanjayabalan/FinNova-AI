import React, { useState, useEffect, useRef } from 'react';
import { Send, Bot, User, Settings, AlertTriangle, Paperclip, X, Plus, MessageSquare, Trash2, Clock } from 'lucide-react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { sendMessage, getChatHistory, deleteChatHistory } from '../services/chatService';
import { formatDistanceToNow } from 'date-fns';
import toast from 'react-hot-toast';

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────
const AI_UNAVAILABLE_MSG =
  'AI service is currently unavailable. Please configure your API key in the Admin panel.';

function sanitizeAIResponse(text) {
  if (!text) return text;
  
  // Attempt to parse JSON string if the backend stored the full response object
  let t = String(text);
  try {
    const parsed = JSON.parse(t);
    if (parsed && typeof parsed.message === 'string') {
      t = parsed.message;
    } else if (parsed && typeof parsed.response === 'string') {
      t = parsed.response;
    }
  } catch (e) {
    // Not JSON, continue normally
  }

  if (
    t.includes('API_KEY_INVALID') ||
    t.includes('Please pass a valid API key') ||
    t.startsWith('400') ||
    t.includes('API key not valid') ||
    t.includes('AI features are currently unavailable')
  ) {
    return AI_UNAVAILABLE_MSG;
  }
  return t;
}

// ─────────────────────────────────────────────
// Sub-components
// ─────────────────────────────────────────────
const ChatMessage = ({ message, isBot, isError, imagePreview }) => (
  <div className={`flex gap-4 p-5 ${isBot ? 'bg-white shadow-sm border-t border-b border-gray-100' : ''}`}>
    <div
      className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 
        ${isBot
          ? isError ? 'bg-orange-100 text-orange-500' : 'bg-primary/10 text-primary'
          : 'bg-gradient-to-br from-blue-400 to-violet-500 text-white'}`}
    >
      {isBot ? (isError ? <AlertTriangle size={18} /> : <Bot size={18} />) : <User size={18} />}
    </div>
    <div className="flex-1 min-w-0">
      <div className="flex items-center gap-2 mb-1">
        <span className="font-semibold text-gray-800">{isBot ? 'FinNova AI' : 'You'}</span>
      </div>
      {imagePreview && (
        <img
          src={imagePreview}
          alt="Attached"
          className="mb-2 rounded-xl max-w-xs max-h-40 object-cover border border-gray-200"
        />
      )}
      <div className={`leading-relaxed whitespace-pre-wrap text-sm ${isError ? 'text-orange-700' : 'text-gray-700'}`}>
        {message}
        {isError && (
          <Link
            to="/profile"
            className="ml-2 inline-flex items-center gap-1 text-primary font-medium hover:underline"
          >
            <Settings size={13} /> Settings
          </Link>
        )}
      </div>
    </div>
  </div>
);

const TypingIndicator = () => (
  <div className="flex gap-4 p-5 bg-white shadow-sm border-t border-b border-gray-100">
    <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center text-primary flex-shrink-0">
      <Bot size={18} />
    </div>
    <div className="flex items-center gap-1.5 mt-2">
      {[0, 0.2, 0.4].map((delay, i) => (
        <span
          key={i}
          className="w-2 h-2 bg-primary/60 rounded-full animate-bounce"
          style={{ animationDelay: `${delay}s` }}
        />
      ))}
    </div>
  </div>
);

// ─────────────────────────────────────────────
// ChatPage
// ─────────────────────────────────────────────
const ChatPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [pendingImage, setPendingImage] = useState(null);
  
  // Sessions state
  const [sessions, setSessions] = useState([]);
  const [activeSessionId, setActiveSessionId] = useState(null);

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const imageRef = useRef(null);

  // Load sessions from localStorage
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('chat_sessions') || '[]');
      setSessions(saved);
      if (saved.length > 0 && !location.state?.initialMessage) {
        // Option: load latest session on mount, but let's just show an empty active session by default unless one is picked
      }
    } catch {
      setSessions([]);
    }
  }, []);

  // Auto-scroll
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, loading]);

  // Load backend history only on mount for context (to sync legacy)
  useEffect(() => {
    const loadHistory = async () => {
      try {
        const res = await getChatHistory();
        const raw = res.data?.data;
        const items = Array.isArray(raw)
          ? raw
          : Array.isArray(raw?.content) ? raw.content : [];

        if (items.length > 0 && messages.length === 0 && sessions.length === 0) {
          const rebuilt = [];
          for (const item of items) {
            if (item.query || item.message) {
              rebuilt.push({ text: item.query || item.message, isBot: false });
            }
            if (item.response || item.answer) {
              const responseText = sanitizeAIResponse(item.response || item.answer);
              rebuilt.push({
                text: responseText,
                isBot: true,
                isError: responseText === AI_UNAVAILABLE_MSG,
              });
            }
          }
          if (rebuilt.length > 0) {
            // Create a legacy session
            const newSession = {
              id: Date.now().toString(),
              title: rebuilt[0].text.substring(0, 30) + '...',
              timestamp: new Date().toISOString(),
              messages: rebuilt
            };
            const updated = [newSession];
            setSessions(updated);
            localStorage.setItem('chat_sessions', JSON.stringify(updated));
            setActiveSessionId(newSession.id);
            setMessages(rebuilt);
          }
        }
      } catch {
      } finally {
        setInitialLoading(false);
      }
    };
    loadHistory();
  }, []);

  // Handle initial message from navigation state
  useEffect(() => {
    if (!initialLoading && location.state?.initialMessage) {
      const msg = location.state.initialMessage;
      window.history.replaceState({}, '');
      startNewConversation();
      setInput(msg);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [initialLoading, location.state]);

  const saveCurrentSession = (currentMessages) => {
    if (currentMessages.length === 0) return;
    
    let currentId = activeSessionId;
    let isNew = false;
    
    if (!currentId) {
      currentId = Date.now().toString();
      setActiveSessionId(currentId);
      isNew = true;
    }

    setSessions(prev => {
      let updated = [...prev];
      if (isNew) {
        const title = currentMessages[0].text.substring(0, 30) + (currentMessages[0].text.length > 30 ? '...' : '');
        updated.unshift({
          id: currentId,
          title,
          timestamp: new Date().toISOString(),
          messages: currentMessages
        });
      } else {
        const idx = updated.findIndex(s => s.id === currentId);
        if (idx !== -1) {
          updated[idx].messages = currentMessages;
          updated[idx].timestamp = new Date().toISOString();
          // Move to top
          const [session] = updated.splice(idx, 1);
          updated.unshift(session);
        }
      }
      localStorage.setItem('chat_sessions', JSON.stringify(updated));
      return updated;
    });
  };

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be under 5MB');
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => {
      const base64 = ev.target.result.split(',')[1];
      setPendingImage({ base64, preview: ev.target.result, name: file.name });
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleSend = async (e) => {
    e?.preventDefault();
    const trimmed = input.trim();
    if (!trimmed || loading) return;

    const imageToSend = pendingImage;
    setInput('');
    setPendingImage(null);
    
    const newMessages = [...messages, {
      text: trimmed,
      isBot: false,
      imagePreview: imageToSend?.preview || null,
    }];
    setMessages(newMessages);
    saveCurrentSession(newMessages);
    setLoading(true);

    try {
      const requestBody = {
        message: trimmed,
        history: messages.map(m => ({ role: m.isBot ? 'assistant' : 'user', parts: [m.text] })),
        ...(imageToSend && { image: imageToSend.base64 }),
      };

      const res = await sendMessage(requestBody);
      if (res.data?.success) {
        const raw = res.data.data?.message || res.data.data?.response || '';
        const text = sanitizeAIResponse(raw);
        const finalMessages = [...newMessages, { text, isBot: true, isError: text === AI_UNAVAILABLE_MSG }];
        setMessages(finalMessages);
        saveCurrentSession(finalMessages);
      } else {
        const errText = sanitizeAIResponse(res.data?.message || 'Failed to get a response.');
        const finalMessages = [...newMessages, { text: errText, isBot: true, isError: true }];
        setMessages(finalMessages);
        saveCurrentSession(finalMessages);
      }
    } catch (err) {
      const status = err?.response?.status;
      const serverMsg = err?.response?.data?.message || err?.response?.data?.error || '';
      const text = sanitizeAIResponse(serverMsg) ||
        (status === 503
          ? 'The AI service is currently offline. Please start it and try again.'
          : 'Connection to AI service failed. Please check your network and try again.');
      const finalMessages = [...newMessages, { text, isBot: true, isError: true }];
      setMessages(finalMessages);
      saveCurrentSession(finalMessages);
    } finally {
      setLoading(false);
    }
  };

  const handleSuggestion = (suggestion) => {
    setInput(suggestion);
    inputRef.current?.focus();
  };

  const startNewConversation = () => {
    setActiveSessionId(null);
    setMessages([]);
    setInput('');
  };

  const loadSession = (id) => {
    const session = sessions.find(s => s.id === id);
    if (session) {
      setActiveSessionId(session.id);
      setMessages(session.messages);
    }
  };

  const deleteSession = (e, id) => {
    e.stopPropagation();
    const updated = sessions.filter(s => s.id !== id);
    setSessions(updated);
    localStorage.setItem('chat_sessions', JSON.stringify(updated));
    if (activeSessionId === id) {
      startNewConversation();
    }
  };

  const clearAllHistory = async () => {
    try {
      await deleteChatHistory();
    } catch {}
    setSessions([]);
    localStorage.setItem('chat_sessions', '[]');
    startNewConversation();
    toast.success('Chat history cleared');
  };

  if (initialLoading) {
    return (
      <div className="flex flex-col h-[calc(100vh-80px)] max-w-4xl mx-auto items-center justify-center">
        <div className="flex gap-1.5">
          {[0, 0.15, 0.3].map((delay, i) => (
            <span key={i} className="w-3 h-3 bg-primary rounded-full animate-bounce" style={{ animationDelay: `${delay}s` }} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-80px)] bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
      
      {/* ── Left Sidebar: History ─────────────────────── */}
      <div className="w-64 flex-shrink-0 border-r border-gray-100 bg-gray-50/50 flex flex-col">
        <div className="p-4 border-b border-gray-100">
          <button
            onClick={startNewConversation}
            className="w-full flex items-center justify-center gap-2 bg-primary text-white py-2.5 rounded-xl text-sm font-semibold hover:bg-blue-600 transition-colors"
          >
            <Plus size={16} /> New Chat
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-3 space-y-1 custom-scrollbar">
          <p className="text-xs font-semibold text-gray-400 px-2 py-1 mb-1">Recent Chats</p>
          {sessions.length === 0 ? (
            <p className="text-xs text-gray-500 px-2 italic">No history yet</p>
          ) : (
            sessions.map((session) => (
              <div
                key={session.id}
                onClick={() => loadSession(session.id)}
                className={`group relative flex flex-col p-2.5 rounded-xl cursor-pointer transition-colors ${
                  activeSessionId === session.id ? 'bg-blue-100/50 text-blue-900' : 'hover:bg-gray-100 text-gray-700'
                }`}
              >
                <div className="flex items-start gap-2">
                  <MessageSquare size={14} className={`mt-0.5 flex-shrink-0 ${activeSessionId === session.id ? 'text-primary' : 'text-gray-400'}`} />
                  <p className="text-sm font-medium truncate flex-1 leading-snug">{session.title}</p>
                </div>
                <div className="flex justify-between items-center mt-1.5 pl-6">
                  <span className="text-[10px] text-gray-400 flex items-center gap-1">
                    <Clock size={10} />
                    {(() => {
                      try { return formatDistanceToNow(new Date(session.timestamp), { addSuffix: true }); }
                      catch { return 'Recently'; }
                    })()}
                  </span>
                </div>
                <button
                  onClick={(e) => deleteSession(e, session.id)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-md opacity-0 group-hover:opacity-100 transition-all"
                  title="Delete chat"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))
          )}
        </div>
        {sessions.length > 0 && (
          <div className="p-3 border-t border-gray-100">
            <button
              onClick={clearAllHistory}
              className="w-full flex items-center justify-center gap-2 text-xs font-semibold text-red-500 py-2 hover:bg-red-50 rounded-lg transition-colors"
            >
              <Trash2 size={14} /> Clear All History
            </button>
          </div>
        )}
      </div>

      {/* ── Right Area: Chat Content ─────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0">
        <div className="flex-1 overflow-y-auto custom-scrollbar pt-6 pb-2">
          {messages.length === 0 ? (
            /* Welcome screen */
            <div className="h-full flex flex-col items-center justify-center text-center space-y-6 py-12 px-4">
              <div className="w-20 h-20 bg-primary/10 text-primary rounded-3xl flex items-center justify-center shadow-lg shadow-blue-500/10">
                <Bot size={40} />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">How can I help you invest today?</h2>
                <p className="text-gray-500 max-w-md mx-auto text-sm">
                  I can analyze stocks, review your portfolio risk, or explain financial concepts.
                </p>
              </div>
              <div className="flex flex-wrap justify-center gap-3">
                {['Analyze AAPL', 'Explain P/E Ratio', 'Market Outlook 2025'].map((suggestion) => (
                  <button
                    key={suggestion}
                    onClick={() => handleSuggestion(suggestion)}
                    className="px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:text-primary hover:border-primary hover:bg-blue-50 transition-all"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="max-w-3xl mx-auto w-full space-y-2">
              {messages.map((msg, idx) => (
                <ChatMessage
                  key={idx}
                  message={msg.text}
                  isBot={msg.isBot}
                  isError={msg.isError}
                  imagePreview={msg.imagePreview}
                />
              ))}
              {loading && <TypingIndicator />}
              <div ref={messagesEndRef} className="h-4" />
            </div>
          )}
        </div>

        {/* ── Input bar ────────────────────────── */}
        <div className="p-4 bg-white border-t border-gray-100">
          <div className="max-w-3xl mx-auto w-full">
            {pendingImage && (
              <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 border border-blue-100 rounded-t-xl mb-[-1px]">
                <img
                  src={pendingImage.preview}
                  alt="Selected"
                  className="w-10 h-10 rounded-lg object-cover"
                />
                <span className="text-xs text-blue-700 font-medium flex-1 truncate">
                  {pendingImage.name}
                </span>
                <button
                  onClick={() => setPendingImage(null)}
                  className="text-blue-400 hover:text-blue-600 transition-colors"
                >
                  <X size={14} />
                </button>
              </div>
            )}

            <form onSubmit={handleSend} className="relative flex items-center gap-1">
              <button
                type="button"
                onClick={() => imageRef.current?.click()}
                className="absolute left-3 top-1/2 -translate-y-1/2 p-1.5 text-gray-400 hover:text-blue-500 transition-colors z-10"
                title="Attach image"
              >
                <Paperclip size={18} />
              </button>
              <input
                ref={imageRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageSelect}
              />
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask anything about finance, stocks, or your portfolio…"
                className="flex-1 pl-12 pr-16 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary shadow-sm text-sm disabled:bg-gray-100"
                disabled={loading}
              />
              <button
                type="submit"
                disabled={loading || !input.trim()}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-primary text-white rounded-xl flex items-center justify-center disabled:opacity-40 hover:bg-blue-600 transition-colors shadow-sm"
              >
                <Send size={18} />
              </button>
            </form>
            <p className="text-[11px] text-gray-400 mt-2 text-center">
              FinNova AI can make mistakes. Consider verifying important information.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatPage;
