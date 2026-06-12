import { useState } from 'react';
import '../styles/AIAssistant.css';

function AIAssistant() {
  const [messages, setMessages] = useState([
    { role: 'assistant', text: 'Hello! I\'m CyberShield Assistant. Ask me about security threats, best practices, or analysis results.' },
  ]);
  const [input, setInput] = useState('');

  const knowledgeBase = {
    'sql injection': 'SQL Injection attacks use malicious SQL queries to manipulate databases. Prevention: Use parameterized queries, input validation, ORM frameworks, and least privilege principles.',
    'phishing': 'Phishing attacks trick users into revealing credentials through deceptive emails/URLs. Defense: Enable MFA, email filtering, user training, and URL scanning.',
    'brute force': 'Brute force attacks guess passwords through repeated attempts. Protection: Implement account lockouts, rate limiting, strong passwords (min 12 chars), and MFA.',
    'xss': 'Cross-site scripting injects malicious scripts. Mitigation: Sanitize user input, use CSP headers, validate outputs, and use modern frameworks with auto-escaping.',
    'malware': 'Malware is malicious software. Defense: Use antivirus, keep systems updated, scan downloads, avoid suspicious links, maintain backups.',
    'ransomware': 'Ransomware encrypts files and demands payment. Protection: Regular backups, endpoint protection, network segmentation, and incident response plan.',
    'dos': 'DDoS attacks overwhelm systems. Defense: Use DDoS protection services, rate limiting, traffic filtering, and redundancy.',
  };

  const handleSend = () => {
    if (!input.trim()) return;

    const userMessage = { role: 'user', text: input };
    setMessages([...messages, userMessage]);

    let response = 'I don\'t have information about that. Try asking about: SQL Injection, Phishing, Brute Force, XSS, Malware, Ransomware, or DDoS.';

    const lowerInput = input.toLowerCase();
    for (const [key, value] of Object.entries(knowledgeBase)) {
      if (lowerInput.includes(key)) {
        response = value;
        break;
      }
    }

    setTimeout(() => {
      setMessages((prev) => [...prev, { role: 'assistant', text: response }]);
    }, 500);

    setInput('');
  };

  return (
    <div className="ai-assistant-container">
      <h1>🤖 AI Assistant</h1>
      <p className="subtitle">Ask about threats and security best practices</p>

      <div className="chat-container">
        <div className="chat-messages">
          {messages.map((msg, idx) => (
            <div key={idx} className={`message ${msg.role}`}>
              <div className="message-bubble">{msg.text}</div>
            </div>
          ))}
        </div>

        <form className="chat-input-form" onSubmit={(e) => { e.preventDefault(); handleSend(); }}>
          <input
            type="text"
            placeholder="Ask about threats, analysis, or security..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
          <button type="submit">Send</button>
        </form>
      </div>

      <div className="suggested-topics">
        <h3>Suggested Topics:</h3>
        <button onClick={() => setInput('How to prevent SQL Injection?')}>SQL Injection</button>
        <button onClick={() => setInput('How to detect phishing?')}>Phishing Detection</button>
        <button onClick={() => setInput('Brute force protection')}>Brute Force</button>
        <button onClick={() => setInput('What is malware?')}>Malware Info</button>
      </div>
    </div>
  );
}

export default AIAssistant;
