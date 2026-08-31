import { useState } from "react";

export const useChatbot = () => {
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Hi there! I am your AI Career Advisor. How can I help you today?' }
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
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
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
          // Exclude the initial greeting from the history sent to the model to save tokens and avoid confusion
          // and only keep the last few interactions if history gets too long.
          conversationHistory: currentHistory.slice(1).map(m => ({
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
      // Optional: remove the user message if it failed, or show error state
    } finally {
      setIsLoading(false);
    }
  };

  return {
    messages,
    sendMessage,
    isLoading,
    error
  };
};
