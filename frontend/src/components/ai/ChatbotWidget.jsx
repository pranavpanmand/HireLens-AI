import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageSquare, X, Send, Loader2, Minimize2, Maximize2 } from "lucide-react";
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
  const { messages, sendMessage, isLoading, error } = useChatbot();
  const scrollRef = useRef(null);

  const quickReplies = [
    "What jobs match me best?",
    "How can I improve my resume?",
    "Prep me for my next interview"
  ];

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  if (!user) return null; // Only show for logged in users

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!inputValue.trim() || isLoading) return;
    
    const text = inputValue;
    setInputValue("");
    await sendMessage(text);
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
                <ScrollArea className="flex-1 p-4" ref={scrollRef}>
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
                            <p className="whitespace-pre-wrap text-sm">{msg.content}</p>
                          ) : (
                            <div 
                              className="prose prose-sm dark:prose-invert max-w-none text-sm [&>p]:mb-2 [&>p:last-child]:mb-0"
                              dangerouslySetInnerHTML={createMarkup(msg.content)}
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
                  </div>
                </ScrollArea>

                {/* Input Area */}
                <div className="p-4 border-t border-border bg-background flex-shrink-0">
                  {messages.length === 1 && (
                    <div className="flex flex-wrap gap-2 mb-3">
                      {quickReplies.map((reply, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleQuickReply(reply)}
                          className="text-xs bg-muted hover:bg-muted/80 text-foreground px-3 py-1.5 rounded-full transition-colors border border-border"
                        >
                          {reply}
                        </button>
                      ))}
                    </div>
                  )}
                  
                  <form onSubmit={handleSubmit} className="flex gap-2">
                    <Input
                      placeholder="Ask me anything..."
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      className="rounded-full focus-visible:ring-primary h-10"
                      disabled={isLoading}
                    />
                    <Button 
                      type="submit" 
                      size="icon" 
                      className="rounded-full h-10 w-10 shrink-0 bg-primary hover:bg-primary/90"
                      disabled={!inputValue.trim() || isLoading}
                    >
                      <Send className="w-4 h-4" />
                    </Button>
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
