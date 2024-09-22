// import React, { useState } from "react";
// import axiosInstance from "../api/axiosInstance";

// const ChatBox = () => {
//   const [messages, setMessages] = useState([]);
//   const [message, setMessage] = useState(""); // For input field

//   // Define the sendMessage function here or pass the state into the function
//   const sendMessage = async () => {
//     try {
//       const response = await axiosInstance.post("/chat/send", {
//         sender: "66efe15dcf4a79e9e45b54b5", // Hardcoded or dynamic userId
//         receiver: "66eff3d3bd506af07ddd2b3c", // Hardcoded or dynamic receiverId
//         content: message, // Message from the input field
//       });

//       console.log("Message sent:", response.data);

//       // Append the new message to the messages array
//       setMessages((prevMessages) => [...prevMessages, response.data]);

//       // Clear the message input field after sending
//       setMessage("");
//     } catch (error) {
//       console.error("Error sending message", error);
//     }
//   };

//   return (
//     <div>
//       <div className="messages-list">
//         {messages.map((msg, index) => (
//           <div key={index} className="message">
//             <p>{msg.content}</p>
//           </div>
//         ))}
//       </div>

//       <div className="message-input">
//         <input
//           type="text"
//           value={message}
//           onChange={(e) => setMessage(e.target.value)}
//           placeholder="Type a message"
//         />
//         <button onClick={sendMessage}>Send</button>
//       </div>
//     </div>
//   );
// };

// export default ChatBox;
import React, { useState, useEffect } from "react";
import axiosInstance from "../api/axiosInstance";
import { io } from "socket.io-client";

const ChatBox = () => {
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
  const [socket, setSocket] = useState(null);

  const userId = "66efe15dcf4a79e9e45b54b5"; // Example userId
  const receiverId = "66eff3d3bd506af07ddd2b3c"; // Example receiverId

  // Load previous messages when component mounts
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

    // Set up the socket connection
    const newSocket = io("http://localhost:8000"); // Make sure to adjust the server URL
    setSocket(newSocket);

    // Clean up the socket connection when component unmounts
    return () => newSocket.close();
  }, [receiverId]);

  // Listen for new messages from the socket
  useEffect(() => {
    if (socket) {
      socket.on("receiveMessage", (newMessage) => {
        setMessages((prevMessages) => [...prevMessages, newMessage]);
      });
    }
  }, [socket]);

  // Send a message
  const sendMessage = async () => {
    try {
      const response = await axiosInstance.post("/chat/send", {
        sender: userId,
        receiver: receiverId,
        content: message,
      });

      // Emit the new message to the server through the socket
      socket.emit("sendMessage", response.data);

      setMessages((prevMessages) => [...prevMessages, response.data]);
      setMessage(""); // Clear input field
    } catch (error) {
      console.error("Error sending message", error);
    }
  };

  return (
    <div className="flex flex-col h-screen p-4 bg-gray-100">
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
