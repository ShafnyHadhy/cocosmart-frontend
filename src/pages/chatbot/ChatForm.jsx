import { useEffect, useRef, useState } from "react";

const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const recognition = SpeechRecognition ? new SpeechRecognition() : null;

if (recognition) {
  recognition.continuous = true;
  recognition.interimResults = true;
  recognition.lang = "en-US";
}

const ChatForm = ({ chatHistory, setChatHistory, generateBotResponse }) => {
  const [inputValue, setInputValue] = useState("");
  const [isListening, setIsListening] = useState(false);
  const inputRef = useRef();

  const handleSendMessage = (e) => {
    e.preventDefault();
    const text = inputValue.trim();
    if (!text) return;

    setChatHistory((prev) => [...prev, { role: "user", text }]);
    setInputValue("");

    // Call API
    generateBotResponse([...chatHistory, { role: "user", text }]);
  };

  const handleVoiceInput = () => {
    if (!recognition) {
      alert("Speech recognition is not supported in this browser.");
      return;
    }

    if (isListening) {
      recognition.stop();
    } else {
      recognition.start();
    }
  };

  useEffect(() => {
    if (!recognition) return;

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.onerror = (event) => {
      console.error("Speech recognition error:", event.error);
      setIsListening(false);
    };

    recognition.onresult = (event) => {
      let interimTranscript = "";
      let finalTranscript = "";

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        } else {
          interimTranscript += event.results[i][0].transcript;
        }
      }

      // Update the input field with the final transcript, or the interim one as a preview
      setInputValue(inputValue + finalTranscript + interimTranscript);
    };

    // Cleanup function to stop recognition when the component unmounts
    return () => {
      recognition.stop();
    };
  }, [inputValue]); // Rerun effect if inputValue changes to append new speech

  return (
    <form onSubmit={handleSendMessage} className="chat-form">
      <textarea
        ref={inputRef}
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        placeholder={isListening ? "Listening..." : "Enter a message..."}
        className="message-input"
        required
      ></textarea>
      <div className="form-buttons">
        <button
          type="button"
          onClick={handleVoiceInput}
          className={`material-symbols-rounded mic-btn ${isListening ? 'listening' : ''}`}
          title={isListening ? "Stop listening" : "Listen for voice"}
        >
          {isListening ? 'mic_off' : 'mic'}
        </button>
        <button type="submit" className="material-symbols-rounded send-btn">
          send
        </button>
      </div>
    </form>
  );
};

export default ChatForm;
