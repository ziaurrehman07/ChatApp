import { useEffect, useState, useRef } from "react";
import { IoArrowDownCircle } from "react-icons/io5";
import { FaPowerOff } from "react-icons/fa";
import io from "socket.io-client";

// Initialize socket connection
const socket = io("https://chatapp-server-fhbs.onrender.com");

const App = () => {
  const [username, setUsername] = useState(
    localStorage.getItem("username") || ""
  );
  const [chatactive, setChatActive] = useState(
    localStorage.getItem("chatactive") === "true"
  );
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [showScrollButton, setShowScrollButton] = useState(false);

  const messagesEndRef = useRef(null);
  const chatContainerRef = useRef(null);

  const validUsers = ["ziaur", "ayesha"];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Handle socket events for joining chat and receiving messages
  useEffect(() => {
    if (chatactive) {
      // Emit event to join chat
      socket.emit("join-chat");

      // Handler for loading initial messages
      const loadMessagesHandler = (loadedMessages) => {
        setMessages(loadedMessages);
      };

      // Handler for receiving new messages
      const receivedMessageHandler = (message) => {
        setMessages((prevMessages) => [...prevMessages, message]);
      };

      // Register event listeners
      socket.on("load-messages", loadMessagesHandler);
      socket.on("recieved-message", receivedMessageHandler);

      // Cleanup event listeners to prevent duplicates on re-render
      return () => {
        socket.off("load-messages", loadMessagesHandler);
        socket.off("recieved-message", receivedMessageHandler);
      };
    }
  }, [chatactive]);

  // Scroll to bottom when new messages are added
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Handle scroll to show or hide scroll-to-bottom button
  const handleScroll = () => {
    const container = chatContainerRef.current;
    if (container) {
      const { scrollTop, scrollHeight, clientHeight } = container;
      if (scrollHeight - scrollTop - clientHeight > 100) {
        setShowScrollButton(true);
      } else {
        setShowScrollButton(false);
      }
    }
  };

  // Handle sending messages
  const handleSubmit = (e) => {
    e.preventDefault();
    const messageData = {
      message: newMessage,
      user: username,
      time: `${new Date().getHours()}:${new Date().getMinutes()}`,
    };
    if (newMessage.trim()) {
      // Emit message to the server
      socket.emit("send-message", messageData);
      setNewMessage("");
    }
  };

  // Handle starting the chat
  const handleStartChat = () => {
    if (validUsers.includes(username)) {
      setChatActive(true);
      localStorage.setItem("username", username);
      localStorage.setItem("chatactive", "true");
    } else {
      alert("You are not authorized to access this chat.");
    }
  };

  // Handle logout and reset state
  const handleLogout = () => {
    setUsername("");
    setChatActive(false);
    localStorage.removeItem("username");
    localStorage.removeItem("chatactive");
  };
  useEffect(() => {
    const handleResize = () => {
      const vh = window.innerHeight * 0.01;
      document.documentElement.style.setProperty("--vh", `${vh}px`);
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);
  return (
    <div
      className="w-screen h-screen-dynamic bg-cover bg-center flex justify-center items-center"
      style={{ backgroundImage: `url('/path-to-your-illustration.jpg')` }} // Add your own image path
    >
      {chatactive ? (
        <div className="p-5 rounded-lg w-full md:w-[80vw] lg:w-[40vw] bg-white/70 backdrop-blur-sm shadow-lg relative">
          <h1 className="text-center font-bold text-xl text-blue-500 mb-4">
            Welcome, {username}
          </h1>
          <button
            onClick={handleLogout}
            className="absolute top-4 right-4 bg-red-600 hover:bg-red-700 transition-all text-white px-3 py-1 rounded-md flex items-center gap-2"
          >
            <FaPowerOff size={20} />
          </button>

          <div
            className="overflow-y-scroll h-[80vh] md:h-[60vh] lg:h-[70vh] bg-white shadow-inner p-4 rounded-lg"
            ref={chatContainerRef}
            onScroll={handleScroll}
          >
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex rounded-lg shadow-md p-2 my-4 w-fit ${
                  username === message.user
                    ? "ml-auto bg-green-100"
                    : "bg-gray-100"
                }`}
              >
                <div className="bg-green-400 flex items-center justify-center rounded-l-lg px-2">
                  <h3 className="font-bold text-lg text-white">
                    {message.user.charAt(0).toUpperCase()}
                  </h3>
                </div>
                <div className="px-3 py-1 bg-white rounded-r-lg">
                  <span className="text-sm font-semibold text-gray-700">
                    {message.user}
                  </span>
                  <p className="text-sm text-gray-600">
                    {message.message.length > 25
                      ? message.message.match(/.{1,25}/g).join("\n")
                      : message.message}
                  </p>
                  <span className="text-xs text-right block text-gray-500">
                    {message.time}
                  </span>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {showScrollButton && (
            <button
              onClick={scrollToBottom}
              className="fixed right-8 bottom-16 bg-blue-500 hover:bg-blue-600 transition-all text-white rounded-full p-2 shadow-lg flex items-center gap-2"
            >
              <IoArrowDownCircle size={24} />
              <span className="text-xs">Scroll Down</span>
            </button>
          )}

          <form onSubmit={handleSubmit} className="flex gap-2 mt-3">
            <input
              type="text"
              onChange={(e) => setNewMessage(e.target.value)}
              value={newMessage}
              placeholder="Type your message..."
              className="rounded-lg border-2 outline-none px-3 py-2 w-full bg-gray-100 focus:bg-white transition-all"
            />
            <button
              type="submit"
              className="px-4 py-2 bg-green-500 hover:bg-green-600 transition-all text-white font-bold rounded-lg"
              disabled={!newMessage.trim()}
            >
              Send
            </button>
          </form>
        </div>
      ) : (
        <div className="w-screen h-screen-dynamic flex justify-center items-center gap-3">
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="text-center px-4 py-3 border-2 rounded-lg focus:outline-none focus:border-blue-500 transition-all"
            placeholder="Enter username"
          />
          <button
            className="bg-green-500 hover:bg-green-600 transition-all text-white font-bold px-4 py-3 rounded-lg shadow-lg"
            type="submit"
            onClick={handleStartChat}
          >
            Start Chat
          </button>
        </div>
      )}
    </div>
  );
};

export default App;
