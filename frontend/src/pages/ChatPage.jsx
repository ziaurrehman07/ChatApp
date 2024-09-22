import React, { useState, useEffect } from "react";
import axiosInstance from "../api/axiosInstance";
import { io } from "socket.io-client";

const ChatBox = ({ userId, receiverId }) => {
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const response = await axiosInstance.get(
          `/chat/messages/${receiverId}`
        );
        setMessages(response.data);
      } catch (error) {
        console.error("Error fetching messages", error);
      }
    };

    fetchMessages();

    const newSocket = io("http://localhost:8000");
    setSocket(newSocket);

    return () => newSocket.close();
  }, [receiverId]);

  useEffect(() => {
    if (socket) {
      socket.on("receiveMessage", (newMessage) => {
        // Only add messages received via socket if they're not from the current user
        if (newMessage.sender !== userId) {
          setMessages((prevMessages) => [...prevMessages, newMessage]);
        }
      });
    }
  }, [socket, userId]);

  const sendMessage = async () => {
    if (!message) return; // Prevent sending empty messages

    const newMessage = {
      sender: "66efe15dcf4a79e9e45b54b5",
      receiver: "rece66eff3d3bd506af07ddd2b3civerId",
      content: message,
    };

    // Append the new message to the current message list immediately
    setMessages((prevMessages) => [...prevMessages, newMessage]);

    try {
      await axiosInstance.post("/chat/send", newMessage);

      // Emit the new message to the server via the socket
      socket.emit("sendMessage", newMessage);
      setMessage(""); // Clear the input field after sending
    } catch (error) {
      console.error("Error sending message", error);
    }
  };

  return (
    <div className="flex flex-col h-full p-4 bg-gray-100">
      <div className="flex-grow overflow-y-auto mb-4">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`p-2 my-2 max-w-xs rounded-lg shadow-md ${
              msg.sender === userId
                ? "ml-auto bg-blue-500 text-white"
                : "mr-auto bg-gray-300 text-black"
            }`}
          >
            <p>{msg.content}</p>
          </div>
        ))}
      </div>

      <div className="flex items-center">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="flex-grow p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
          placeholder="Type a message..."
        />
        <button
          onClick={sendMessage}
          className="p-2 ml-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default ChatBox;
