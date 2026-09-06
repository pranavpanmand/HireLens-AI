import { useState } from "react";
import { API_URL } from "@/services/api";

export const useChatbot = () => {
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Hi! How can I help with your job search today?' }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const sendMessage = async (messageText, fileData = null) => {
    if (!messageText.trim() && !fileData) return;

    const newMessage = { 
      role: 'user', 
      content: messageText,
      ...(fileData && { attachment: fileData.name || 'Attachment' })
    };
    const currentHistory = [...messages];
    
    // Add user message to UI immediately
    setMessages([...currentHistory, newMessage]);
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_URL}/ai/chat`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          message: messageText || "Analyze this file.",
          file: fileData ? {
            inlineData: {
              data: fileData.base64,
              mimeType: fileData.type
            }
          } : undefined,
          conversationHistory: currentHistory.slice(1).filter(m => !m.type).map(m => ({
            role: m.role === 'assistant' ? 'model' : 'user',
            content: m.content
          }))
        })
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || data.error || 'Failed to get response');
      }

      setMessages(prev => [...prev, { role: 'assistant', content: data.data.response }]);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const addMessage = (message) => {
    setMessages(prev => [...prev, message]);
  };

  return {
    messages,
    setMessages,
    addMessage,
    sendMessage,
    isLoading,
    setIsLoading,
    error
  };
};
