import React, { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import './LivestockAIChat.css';

const LivestockAIChat = () => {
  const [query, setQuery] = useState('');
  const [animalFilter, setAnimalFilter] = useState('');
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [animals] = useState(['cow', 'buffalo', 'dog', 'cat', 'goat', 'sheep', 'horse', 'poultry']);
  const [chatHistory, setChatHistory] = useState([]);
  const [currentChatId, setCurrentChatId] = useState(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const messagesEndRef = useRef(null);

  const API_BASE_URL = 'http://localhost:5000';

  useEffect(() => {
    loadChatHistory();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (messages.length > 0 && currentChatId) {
      const timeoutId = setTimeout(() => {
        saveChatHistory();
      }, 500);
      return () => clearTimeout(timeoutId);
    }
  }, [messages, currentChatId]);

  const loadChatHistory = () => {
    try {
      const stored = localStorage.getItem('livestockChatHistory');
      if (stored) {
        setChatHistory(JSON.parse(stored));
      }
    } catch (e) {
      console.error('Failed to load chat history:', e);
    }
  };

  const saveChatHistory = () => {
    try {
      const updatedHistory = chatHistory.filter(chat => chat.id !== currentChatId);
      const currentChat = {
        id: currentChatId,
        title: messages[0]?.content.substring(0, 50) || 'New Chat',
        messages: messages,
        timestamp: new Date().toISOString()
      };
      const newHistory = [currentChat, ...updatedHistory].slice(0, 20);
      setChatHistory(newHistory);
      localStorage.setItem('livestockChatHistory', JSON.stringify(newHistory));
    } catch (e) {
      console.error('Failed to save chat history:', e);
    }
  };

  const startNewChat = () => {
    setMessages([]);
    setCurrentChatId(Date.now().toString());
    setQuery('');
    setAnimalFilter('');
  };

  const loadChat = (chat) => {
    setMessages(chat.messages);
    setCurrentChatId(chat.id);
  };

  const deleteChat = (chatId, e) => {
    e.stopPropagation();
    const newHistory = chatHistory.filter(chat => chat.id !== chatId);
    setChatHistory(newHistory);
    localStorage.setItem('livestockChatHistory', JSON.stringify(newHistory));
    if (currentChatId === chatId) {
      startNewChat();
    }
  };

  const generateEmbedding = async (text) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/embed`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text })
      });

      if (!response.ok) {
        throw new Error('Failed to generate embedding');
      }

      const data = await response.json();
      return data.embedding;
    } catch (error) {
      console.error('Error generating embedding:', error);
      throw error;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!query.trim()) return;

    if (!currentChatId) {
      setCurrentChatId(Date.now().toString());
    }

    const userMessage = {
      role: 'user',
      content: query,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMessage]);
    setLoading(true);
    const currentQuery = query;
    setQuery('');

    try {
      const queryEmbedding = await generateEmbedding(currentQuery);

      const response = await fetch(`${API_BASE_URL}/api/search`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: currentQuery,
          queryEmbedding: queryEmbedding,
          animalFilter: animalFilter || null,
          topK: 5,
          minSimilarity: 0.2
        })
      });

      const data = await response.json();

      if (data.success) {
        const assistantMessage = {
          role: 'assistant',
          content: data.aiResponse,
          medicines: data.searchResults || [],
          medicinesFound: data.medicinesFound || 0,
          timestamp: new Date()
        };
        setMessages(prev => [...prev, assistantMessage]);
      } else {
        throw new Error(data.error || 'Unknown error occurred');
      }

    } catch (error) {
      console.error('Error:', error);
      
      const errorMessage = {
        role: 'error',
        content: `Error: ${error.message}\n\nPlease ensure:\n1. Your backend API is running at ${API_BASE_URL}\n2. The /api/embed endpoint is working\n3. The /api/search endpoint is configured correctly\n4. MongoDB Atlas Vector Search is set up`,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="livestock-chat-container">
      {/* Sidebar */}
      <div className={`sidebar ${sidebarCollapsed ? 'collapsed' : ''}`}>
        <div className="sidebar-header">
          <div className="sidebar-title">
            <span className="icon">💬</span>
            {!sidebarCollapsed && <h3>Chat History</h3>}
          </div>
          <button 
            className="collapse-btn"
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            aria-label="Toggle sidebar"
          >
            {sidebarCollapsed ? '→' : '←'}
          </button>
        </div>

        {!sidebarCollapsed && (
          <>
            <div className="new-chat-section">
              <button className="new-chat-btn" onClick={startNewChat}>
                <span className="icon">➕</span>
                New Chat
              </button>
            </div>

            <div className="chat-list">
              {chatHistory.map((chat) => (
                <div
                  key={chat.id}
                  className={`chat-item ${currentChatId === chat.id ? 'active' : ''}`}
                  onClick={() => loadChat(chat)}
                >
                  <div className="chat-item-content">
                    <div className="chat-title">{chat.title}</div>
                    <div className="chat-date">
                      {new Date(chat.timestamp).toLocaleDateString()}
                    </div>
                  </div>
                  <button
                    className="delete-btn"
                    onClick={(e) => deleteChat(chat.id, e)}
                    aria-label="Delete chat"
                  >
                    🗑️
                  </button>
                </div>
              ))}
              {chatHistory.length === 0 && (
                <div className="empty-history">
                  <span className="icon">💬</span>
                  <p>No chat history yet</p>
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* Main Chat Area */}
      <div className="main-chat-area">
        {/* Header */}
        <div className="chat-header">
          <h1>🏥 Livestock AI Medicine Finder</h1>
          <p>Ask about animal health issues and get medicine recommendations</p>
        </div>

        {/* Messages Area */}
        <div className="messages-container">
          {messages.length === 0 && (
            <div className="welcome-screen">
              <div className="welcome-icon">👋</div>
              <h2>Welcome to Livestock AI Assistant!</h2>
              <p>Ask me about livestock health issues. Examples:</p>
              <div className="example-cards">
                <div className="example-card">
                  <span className="example-icon">🌡️</span>
                  <p>"My cow has fever and is not eating"</p>
                </div>
                <div className="example-card">
                  <span className="example-icon">❤️</span>
                  <p>"Dog with vomiting and diarrhea"</p>
                </div>
                <div className="example-card">
                  <span className="example-icon">🩹</span>
                  <p>"Cat sneezing with watery eyes"</p>
                </div>
              </div>
            </div>
          )}

          {messages.map((message, index) => (
            <div key={index} className={`message-wrapper ${message.role}`}>
              <div className={`message-bubble ${message.role}`}>
                <div className="message-header">
                  <span className="message-role">
                    {message.role === 'user' ? '👤 You' : 
                     message.role === 'error' ? '⚠️ Error' : 
                     '🤖 AI Assistant'}
                  </span>
                  <span className="message-time">
                    {message.timestamp.toLocaleTimeString()}
                  </span>
                </div>
                
                <div className="message-content">
                  {message.role === 'assistant' ? (
                    <>
                      {message.medicinesFound > 0 && (
                        <div className="medicines-found">
                          <strong>💊 {message.medicinesFound} Medicine(s) Found:</strong>
                          <ul>
                            {message.medicines.slice(0, 3).map((med, i) => (
                              <li key={i}>
                                <strong>{med.medicine}</strong> ({med.animal}) - 
                                <span className="match-badge">
                                  {(med.score * 100).toFixed(1)}% Match
                                </span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      <ReactMarkdown>{message.content}</ReactMarkdown>
                    </>
                  ) : (
                    <div className="message-text">{message.content}</div>
                  )}
                </div>
              </div>
            </div>
          ))}

          {loading && (
            <div className="message-wrapper assistant">
              <div className="message-bubble assistant loading">
                <div className="loading-indicator">
                  <div className="spinner"></div>
                  <span>Analyzing your query and searching for medicines...</span>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="input-area">
          <div className="input-container">
            <select
              value={animalFilter}
              onChange={(e) => setAnimalFilter(e.target.value)}
              className="animal-select"
              disabled={loading}
            >
              <option value="">All Animals</option>
              {animals.map(animal => (
                <option key={animal} value={animal}>
                  {animal.charAt(0).toUpperCase() + animal.slice(1)}
                </option>
              ))}
            </select>

            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Describe the symptoms or ask a question..."
              disabled={loading}
              className="query-input"
              onKeyPress={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit(e);
                }
              }}
            />

            <button 
              type="button" 
              disabled={loading || !query.trim()}
              className="search-btn"
              onClick={handleSubmit}
            >
              {loading ? '⏳' : '🔍'} {loading ? 'Searching...' : 'Search'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LivestockAIChat;