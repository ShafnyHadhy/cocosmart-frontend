import { useRef} from 'react'
import "./chatbot.css"

const ChatForm = ({ chatHistory, setChatHistory, generateBotResponse}) => {
    const inputRef = useRef();

  const handleFormSubmit = (e) => {
    e.preventDefault();
    const userMessage = inputRef.current.value.trim();
    if (!userMessage) return;
    inputRef.current.value = "";

    //update chat history with user's messages
    setChatHistory((history) => [...history, { role: "user", text: userMessage }]);

    //Add a "Thinking..." placeholder for the bot's response
    setTimeout(() => {
       setChatHistory((history) => [...history, { role: "model", text: "Thinking..." }]);
  
    //Call the function to generate the bot response
    generateBotResponse([...chatHistory, { role: "user", text: `Using the details provided above, please address this query: ${userMessage}` }]);
    }, 600);

  }

  return (
    <form action="#" className="chat-form" onSubmit={handleFormSubmit}>
        <input ref={inputRef} type="text" placeholder="Type a message..." 
        className="message-input" required />
        <button className="material-symbols-rounded">keyboard_arrow_up</button>
    </form>
  )
}

export default ChatForm
