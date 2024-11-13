"use client"
import React, { useEffect, useRef, useState } from 'react';
import * as Y from 'yjs';
import { WebsocketProvider } from 'y-websocket';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface ChatProps {
  ydoc: Y.Doc;
  provider: WebsocketProvider;
  userName: string;
}

const Chat: React.FC<ChatProps> = ({ ydoc, provider, userName }) => {
  const [messages, setMessages] = useState<{ user: string; message: string }[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [users, setUsers] = useState<{ name: string; color: string }[]>([]);

  useEffect(() => {
    const ymessages = ydoc.getArray<{ user: string; message: string }>('chat-messages');

    // Initialize messages state with current messages
    setMessages(ymessages.toArray());

    // Observer function
    const messageObserver = () => {
      setMessages(ymessages.toArray());
    };

    // Observe changes in chat messages
    ymessages.observe(messageObserver);

    // Handle user awareness
    const { awareness } = provider;
    const handleAwarenessChange = () => {
      const states = Array.from(awareness.getStates().values());
      const connectedUsers = states.map((state: any) => state.user);
      setUsers(connectedUsers);
    };

    awareness.on('change', handleAwarenessChange);

    return () => {
      // Unobserve messages
      ymessages.unobserve(messageObserver);
      // Remove awareness listener
      awareness.off('change', handleAwarenessChange);
    };
  }, [ydoc, provider]);

  const handleSendMessage = () => {
    if (newMessage.trim() !== '') {
      const ymessages = ydoc.getArray<{ user: string; message: string }>('chat-messages');
      ymessages.push([{ user: userName, message: newMessage }]);
      setNewMessage('');
    }
  };

  // Reference to the messages container
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Scroll to bottom whenever messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);
  return (
    <div className="flex flex-col h-full w-full rounded-lg">
      <div className="w-full h-full overflow-y-auto border p-2.5">
        {messages.map((msg, index) => (
          <div key={index} className="mb-2.5 last:mb-0">
            <strong>{msg.user}:</strong> {msg.message}
          </div>
        ))}
        {/* Dummy div to ensure auto-scroll to bottom */}
        <div ref={messagesEndRef} />
      </div>
      <div className="flex w-full">
        <Input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleSendMessage();
          }}
          placeholder="Type a message..."
        />
        <Button onClick={handleSendMessage} className="ml-2">
          Send
        </Button>
      </div>
    </div>
  );
};

export default Chat;