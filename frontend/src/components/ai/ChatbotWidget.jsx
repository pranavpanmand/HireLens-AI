import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageSquare, X, Send, Loader2, Minimize2, Maximize2, Paperclip, FileText, ImageIcon, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useChatbot } from "@/hooks/useChatbot";
import { useAuth } from "@/contexts/AuthContext";
import DOMPurify from 'dompurify';
import { marked } from 'marked';

export function ChatbotWidget() {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const fileInputRef = useRef(null);
  const { messages, sendMessage, isLoading, error } = useChatbot();
  const messagesEndRef = useRef(null);

  // Auto-scroll to bottom
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isLoading]);

  const parseMessageContent = (content) => {
    if (!content) return { text: "", suggestions: [] };
    const parts = content.split("---SUGGESTIONS---");
    const mainText = parts[0].trim();
    let suggestions = [];
    if (parts[1]) {
      suggestions = parts[1]
        .split("\n")
        .map(line => line.replace(/^-\s*/, '').trim())
        .filter(Boolean);
    }
    return { text: mainText, suggestions };
  };

  const getActiveSuggestions = () => {
    const lastAssistantMsg = [...messages].reverse().find(m => m.role === 'assistant');
    if (lastAssistantMsg) {
      const { suggestions } = parseMessageContent(lastAssistantMsg.content);
      if (suggestions.length > 0) return suggestions.slice(0, 3);
    }
    return [
      "What jobs match me best?",
      "How can I improve my resume?",
      "Prep me for my next interview"
    ];
  };

  if (!user) return null; // Only show for logged in users

  const handleSubmit = async (e) => {
    e.preventDefault();
    if ((!inputValue.trim() && !selectedFile) || isLoading) return;
    
    const text = inputValue;
    const file = selectedFile;
    
    setInputValue("");
    setSelectedFile(null);
    
    let fileData = null;
    if (file) {
      const reader = new FileReader();
      const base64Promise = new Promise((resolve) => {
        reader.onload = () => resolve(reader.result.split(',')[1]);
      });
      reader.readAsDataURL(file);
      const base64 = await base64Promise;
      fileData = {
        name: file.name,
        type: file.type,
        base64
      };
    }

    await sendMessage(text, fileData);
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert("File size must be under 5MB");
        return;
      }
      setSelectedFile(file);
    }
  };

  const handleQuickReply = async (text) => {
    await sendMessage(text);
  };

  const createMarkup = (text) => {
    return { __html: DOMPurify.sanitize(marked(text)) };
  };

  return (
    <>
      {/* Floating Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsOpen(true)}
            className="fixed bottom-6 right-6 w-14 h-14 bg-primary text-primary-foreground rounded-full shadow-lg flex items-center justify-center z-50 hover:shadow-xl transition-shadow"
          >
            <MessageSquare className="w-6 h-6" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className={`fixed right-6 z-50 bg-background border border-border shadow-2xl rounded-2xl overflow-hidden flex flex-col transition-all duration-300 ease-in-out ${
              isMinimized ? 'bottom-6 w-80 h-16' : 'bottom-6 w-[350px] sm:w-[400px] h-[600px] max-h-[85vh]'
            }`}
          >
            {/* Header */}
            <div 
              className="h-16 bg-gradient-primary px-4 flex items-center justify-between cursor-pointer flex-shrink-0"
              onClick={() => setIsMinimized(!isMinimized)}
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                  <MessageSquare className="w-4 h-4 text-white" />
                </div>
                <span className="font-semibold text-white">AI Career Advisor</span>
              </div>
              <div className="flex items-center gap-1 text-white/80">
                <button 
                  onClick={(e) => { e.stopPropagation(); setIsMinimized(!isMinimized); }}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                >
                  {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
                </button>
                <button 
                  onClick={(e) => { e.stopPropagation(); setIsOpen(false); setIsMinimized(false); }}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Chat Content */}
            {!isMinimized && (
              <>
                <ScrollArea className="flex-1 p-4">
                  <div className="flex flex-col gap-4 pb-4">
                    {messages.map((msg, idx) => (
                      <div 
                        key={idx} 
                        className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
                      >
                        <div 
                          className={`max-w-[85%] rounded-2xl px-4 py-2 ${
                            msg.role === 'user' 
                              ? 'bg-primary text-primary-foreground rounded-tr-sm' 
                              : 'bg-muted text-foreground rounded-tl-sm'
                          }`}
                        >
                          {msg.role === 'user' ? (
                            <div>
                              {msg.attachment && (
                                <div className="flex items-center gap-2 mb-2 p-2 bg-primary-foreground/10 rounded-lg text-xs opacity-90">
                                  <Paperclip className="w-3 h-3" />
                                  <span className="truncate">{msg.attachment}</span>
                                </div>
                              )}
                              <p className="whitespace-pre-wrap text-sm">{msg.content}</p>
                            </div>
                          ) : (
                            <div 
                              className="prose prose-sm dark:prose-invert max-w-none text-sm [&>p]:mb-2 [&>p:last-child]:mb-0"
                              dangerouslySetInnerHTML={createMarkup(parseMessageContent(msg.content).text)}
                            />
                          )}
                        </div>
                      </div>
                    ))}
                    
                    {isLoading && (
                      <div className="flex items-start">
                        <div className="bg-muted text-foreground rounded-2xl rounded-tl-sm px-4 py-3 flex items-center gap-2">
                          <Loader2 className="w-4 h-4 animate-spin text-primary" />
                          <span className="text-sm">Thinking...</span>
                        </div>
                      </div>
                    )}
                    
                    {error && (
                      <div className="text-center">
                        <span className="text-xs text-destructive bg-destructive/10 px-2 py-1 rounded">
                          {error}
                        </span>
                      </div>
                    )}
                    <div ref={messagesEndRef} />
                  </div>
                </ScrollArea>

                {/* Input Area */}
                <div className="p-4 border-t border-border bg-background flex-shrink-0">
                  {!isLoading && (
                    <div className="flex flex-col gap-1 mb-3">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                        <Sparkles className="w-3 h-3 text-primary animate-pulse" /> Suggested Predictions
                      </span>
                      <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto">
                        {getActiveSuggestions().map((reply, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => handleQuickReply(reply)}
                            className="text-xs bg-primary/10 hover:bg-primary/20 text-primary px-2.5 py-1 rounded-full transition-all border border-primary/20 font-medium hover:scale-[1.02] active:scale-[0.98] text-left truncate max-w-full"
                          >
                            {reply}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  <form onSubmit={handleSubmit} className="flex flex-col gap-2">
                    {selectedFile && (
                      <div className="flex items-center justify-between p-2 bg-muted rounded-lg text-xs">
                        <div className="flex items-center gap-2 truncate">
                          {selectedFile.type.startsWith('image/') ? <ImageIcon className="w-4 h-4 text-primary" /> : <FileText className="w-4 h-4 text-primary" />}
                          <span className="truncate font-medium">{selectedFile.name}</span>
                        </div>
                        <button type="button" onClick={() => setSelectedFile(null)} className="text-muted-foreground hover:text-destructive">
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                    <div className="flex gap-2 items-center">
                      <input 
                        type="file" 
                        ref={fileInputRef} 
                        onChange={handleFileChange} 
                        className="hidden" 
                        accept="image/*,application/pdf"
                      />
                      <Button 
                        type="button" 
                        variant="ghost" 
                        size="icon" 
                        className="rounded-full shrink-0 text-muted-foreground hover:text-primary"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isLoading}
                      >
                        <Paperclip className="w-4 h-4" />
                      </Button>
                      <Input
                        placeholder="Ask me anything..."
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        className="rounded-full focus-visible:ring-primary h-10 flex-1"
                        disabled={isLoading}
                      />
                      <Button 
                        type="submit" 
                        size="icon" 
                        className="rounded-full h-10 w-10 shrink-0 bg-primary hover:bg-primary/90"
                        disabled={(!inputValue.trim() && !selectedFile) || isLoading}
                      >
                        <Send className="w-4 h-4" />
                      </Button>
                    </div>
                  </form>
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
