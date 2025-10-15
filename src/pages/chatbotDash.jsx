import ChatbotIcon from "./chatbot/ChatbotIcon"; 
import ChatMessage from "./chatbot/ChatMessage";
import ChatForm from "./chatbot/ChatForm";
import "./chatbot/chatbot.css";
import { useCallback, useEffect, useRef, useState } from "react";
import { companyInfo } from "./companyInfo";

const ChatBotPage = () => {
  const [chatHistory, setChatHistory] = useState([{ hideInChat: true, role: "model", text: companyInfo }]);
  const [showChatbot, setShowChatbot] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const chatBodyRef = useRef();

  const speakText = useCallback((text) => {
    if (isMuted || !text || !('speechSynthesis' in window)) return;

    // Filter the text to include only letters, numbers, and essential punctuation for natural speech.
    // This regex removes most symbols and emojis.
    const filteredText = text.replace(/[^a-zA-Z0-9\s.,?!'":-]/g, '');

    // Cancel any ongoing speech before starting a new one
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(filteredText);
    window.speechSynthesis.speak(utterance);
  }, [isMuted]);

  const generateBotResponse = async (history) => {
    // Add a "typing" indicator for the bot
    setChatHistory(prev => [...prev, { role: "model", text: "Typing..." }]);

    try {
      const response = await fetch('http://localhost:5000/api/chat', { // Your new backend URL
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ history: history }), // Send the history
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Something went wrong!");
      
      const apiResponseText = data.response;
      
      // Replace "Typing..." with the actual response
      setChatHistory(prev => {
        const updatedHistory = [...prev];
        updatedHistory[updatedHistory.length - 1] = { role: "model", text: apiResponseText };
        return updatedHistory;
      });
      
      speakText(apiResponseText);
    } catch (error) {
      // Replace "Typing..." with an error message
      setChatHistory(prev => {
          const updatedHistory = [...prev];
          updatedHistory[updatedHistory.length - 1] = { role: "model", text: "Sorry, something went wrong.", isError: true };
          return updatedHistory;
      });
    }
  };

  useEffect(() => {
    chatBodyRef.current.scrollTo({ top: chatBodyRef.current.scrollHeight, behavior: "smooth" });
  }, [chatHistory]);

  useEffect(() => {
    if (showChatbot) {
      const initialGreeting = "Hey there! How can I help you today?";
      speakText(initialGreeting);
    } else {
      window.speechSynthesis.cancel(); // Stop speech when chatbot is closed
    }
  }, [showChatbot, speakText]);

  return (
    <div className={`chatbot-container ${showChatbot ? "show-chatbot" : ""}`}>
      <button onClick={() => setShowChatbot(prev => !prev)} id="chatbot-toggle">
        <span className="material-symbols-rounded">mode_comment</span>
        <span className="material-symbols-rounded">close</span>
      </button>

      <div className="chatbot-popup">
        {/* Chatbot Header */}
        <div className="chatbot-header">
          <div className="header-info">
            <ChatbotIcon />
            <h2 className="logo-text">Chatbot</h2>
          </div>
          <div className="header-buttons">
            <button onClick={() => setIsMuted(prev => !prev)} className="material-symbols-rounded">{isMuted ? 'volume_off' : 'volume_up'}</button>
            <button onClick={() => setShowChatbot(prev => !prev)} className="material-symbols-rounded">keyboard_arrow_down</button>
          </div>
        </div>

        {/* Chatbot Body */}
        <div ref={chatBodyRef} className="chat-body">
          <div className="message bot-message">
            <ChatbotIcon />
            <p className="message-text">
              Hey there ! 👋 <br /> How can I help you today?
            </p>
          </div>

          {chatHistory.map((chat, index) => (
            <ChatMessage key={index} chat={chat} />
          ))}
        </div>
        
        {/* Chatbot Footer */}
        <div className="chat-footer">
          <ChatForm chatHistory={chatHistory} setChatHistory={setChatHistory} generateBotResponse={generateBotResponse} />
        </div>
      </div>
    </div>
  );
};

export default ChatBotPage;
