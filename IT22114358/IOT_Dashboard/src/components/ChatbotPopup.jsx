import { useMemo, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import {
  FiMessageCircle,
  FiSend,
  FiX,
  FiUser,
  FiCpu,
  FiZap,
} from 'react-icons/fi';

const API_URL = import.meta.env.VITE_CHATBOT_API_URL || 'http://127.0.0.1:8010/chat';

function ChatbotPopup() {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([
    {
      id: 1,
      role: 'assistant',
      content:
        'Hi, I am your vehicle-bay safety assistant. Ask me about alerts, sensor readings, or safety procedures.',
    },
  ]);
  const nextIdRef = useRef(2);

  const activePage = location.pathname;
  const canSend = useMemo(() => input.trim().length > 0 && !isLoading, [input, isLoading]);

  const onSubmit = async (e) => {
    e.preventDefault();
    const question = input.trim();
    if (!question || isLoading) return;

    setInput('');
    setIsLoading(true);

    const userId = nextIdRef.current++;
    setMessages((prev) => [...prev, { id: userId, role: 'user', content: question }]);

    try {
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question, activePage }),
      });

      if (!res.ok) {
        throw new Error(`Request failed with status ${res.status}`);
      }

      const data = await res.json();
      const answer = data?.answer?.trim() || 'I could not find a response right now.';

      setMessages((prev) => [
        ...prev,
        { id: nextIdRef.current++, role: 'assistant', content: answer },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: nextIdRef.current++,
          role: 'assistant',
          content: 'Connection issue. Make sure the chatbot API is running on port 8010.',
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="chatbot-shell">
      {isOpen && (
        <section className="chatbot-panel" aria-label="Safety chatbot panel">
          <header className="chatbot-header">
            <div className="chatbot-title-wrap">
              <div className="chatbot-title-icon">
                <FiCpu />
              </div>
              <div>
                <p className="chatbot-title">Safety Assistant</p>
                <p className="chatbot-subtitle">Vehicle Bay Chatbot</p>
              </div>
            </div>
            <button
              type="button"
              className="chatbot-close"
              onClick={() => setIsOpen(false)}
              aria-label="Close chatbot"
            >
              <FiX />
            </button>
          </header>

          <div className="chatbot-messages">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`chat-row ${message.role === 'user' ? 'chat-row-user' : 'chat-row-assistant'}`}
              >
                {message.role === 'assistant' && (
                  <span className="chat-role-icon assistant">
                    <FiZap />
                  </span>
                )}

                <p className={`chat-bubble ${message.role === 'user' ? 'chat-bubble-user' : 'chat-bubble-assistant'}`}>
                  {message.content}
                </p>

                {message.role === 'user' && (
                  <span className="chat-role-icon user">
                    <FiUser />
                  </span>
                )}
              </div>
            ))}

            {isLoading && (
              <div className="chatbot-loading">
                <span className="typing-dot" />
                Assistant is typing...
              </div>
            )}
          </div>

          <form className="chatbot-input-row" onSubmit={onSubmit}>
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about repair-bay safety..."
              className="chatbot-input"
            />
            <button type="submit" className="chatbot-send" disabled={!canSend} aria-label="Send message">
              <FiSend />
            </button>
          </form>
        </section>
      )}

      <button
        type="button"
        className="chatbot-fab"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-label="Toggle chatbot"
      >
        <FiMessageCircle />
      </button>
    </div>
  );
}

export default ChatbotPopup;
