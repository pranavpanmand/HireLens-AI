import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  MessageSquare, X, Send, Loader2, Minimize2, Maximize2, 
  Menu, Search, FileText, Bell, RefreshCw, Volume2, VolumeX, Briefcase, Sparkles, Trash2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useChatbot } from "@/hooks/useChatbot";
import { useAuth } from "@/contexts/AuthContext";
import DOMPurify from 'dompurify';
import { marked } from 'marked';
import { ResumeUploader } from "@/components/resume/ResumeUploader";
import { jobsApi } from "@/services/jobsApi";
import { useToggleJobAlerts } from "@/hooks/useJobAlerts";

export function ChatbotWidget() {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const { messages, setMessages, addMessage, sendMessage, isLoading, setIsLoading, error } = useChatbot();
  const messagesEndRef = useRef(null);
  const toggleAlerts = useToggleJobAlerts();

  // State for guided search
  const [guidedSearchStep, setGuidedSearchStep] = useState(0); // 0=none, 1=role, 2=location
  const [guidedSearchData, setGuidedSearchData] = useState({ role: "", location: "" });

  // Auto-scroll to bottom
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isLoading, showMenu]);

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
    // Only show default suggestions if we are NOT in the middle of a guided search/menu flow
    if (guidedSearchStep > 0) return [];
    
    const lastAssistantMsg = [...messages].reverse().find(m => m.role === 'assistant');
    if (lastAssistantMsg && lastAssistantMsg.content) {
      const { suggestions } = parseMessageContent(lastAssistantMsg.content);
      if (suggestions.length > 0) return suggestions.slice(0, 3);
    }
    return [
      "What jobs match me best?",
      "How can I improve my resume?",
      "Prep me for my next interview"
    ];
  };

  if (!user) return null;

  const resetChat = () => {
    setMessages([{ role: 'assistant', content: 'Hi! How can I help with your job search today?' }]);
    setGuidedSearchStep(0);
    setShowMenu(false);
  };

  const handleAction = async (action) => {
    setShowMenu(false);
    
    if (action === 'question') {
      addMessage({ role: 'assistant', content: 'What career question do you have for me?' });
    } 
    else if (action === 'search') {
      addMessage({ role: 'user', content: 'Guided Job Search' });
      addMessage({ 
        role: 'assistant', 
        content: 'Great! What role are you looking for?',
        type: 'options',
        options: ['Software Engineer', 'Data Scientist', 'Product Manager', 'Designer']
      });
      setGuidedSearchStep(1);
    }
    else if (action === 'resume') {
      addMessage({ role: 'user', content: 'Upload Resume' });
      addMessage({ 
        role: 'assistant', 
        content: 'Please upload your resume as a Word, PDF or text file, up to 5 MB.',
        type: 'resume_upload'
      });
    }
    else if (action === 'alerts') {
      addMessage({ role: 'user', content: 'Set Job Alerts' });
      addMessage({ 
        role: 'assistant', 
        content: 'Would you like me to email you when high-match jobs are posted?',
        type: 'options',
        options: ['Enable Alerts', 'Cancel']
      });
    }
  };

  const handleOptionClick = async (option) => {
    addMessage({ role: 'user', content: option });

    // Guided Search Flow
    if (guidedSearchStep === 1) {
      setGuidedSearchData({ ...guidedSearchData, role: option });
      setGuidedSearchStep(2);
      addMessage({ 
        role: 'assistant', 
        content: 'Got it. Where are you looking?',
        type: 'options',
        options: ['Remote', 'New York', 'San Francisco', 'London']
      });
      return;
    }
    if (guidedSearchStep === 2) {
      const role = guidedSearchData.role;
      const location = option;
      setGuidedSearchStep(0);
      setIsLoading(true);
      addMessage({ role: 'assistant', content: `Searching for ${role} roles in ${location}...` });
      
      try {
        const res = await jobsApi.search({ search: role, location, limit: 3 });
        if (res.jobs && res.jobs.length > 0) {
          addMessage({
            role: 'assistant',
            content: `Here are the top roles I found for ${role}:`,
            type: 'job_results',
            jobs: res.jobs.slice(0, 3)
          });
        } else {
          addMessage({ role: 'assistant', content: 'I couldn\'t find any jobs matching those criteria right now.' });
        }
      } catch (e) {
        addMessage({ role: 'assistant', content: 'Sorry, I encountered an error searching for jobs.' });
      } finally {
        setIsLoading(false);
      }
      return;
    }

    // Alerts Flow
    if (option === 'Enable Alerts') {
      setIsLoading(true);
      try {
        await toggleAlerts.mutateAsync(true);
        addMessage({ role: 'assistant', content: 'Job alerts enabled! 🔔 I will notify you of great matches.' });
      } catch (e) {
        addMessage({ role: 'assistant', content: 'Failed to enable alerts.' });
      } finally {
        setIsLoading(false);
      }
      return;
    }
    if (option === 'Cancel') {
      addMessage({ role: 'assistant', content: 'Okay, no problem. Let me know if you need anything else.' });
      return;
    }

    // Default fallback to LLM for other options
    await sendMessage(option);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!inputValue.trim() || isLoading) return;
    const text = inputValue;
    setInputValue("");
    
    // If we are in the middle of a guided search but they typed instead of clicking
    if (guidedSearchStep === 1) {
      handleOptionClick(text);
      return;
    }
    if (guidedSearchStep === 2) {
      handleOptionClick(text);
      return;
    }

    await sendMessage(text);
  };

  const createMarkup = (text) => {
    return { __html: DOMPurify.sanitize(marked(text)) };
  };

  return (
    <>
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsOpen(true)}
            className="fixed bottom-4 sm:bottom-6 right-4 sm:right-6 w-14 h-14 bg-gradient-primary text-white rounded-full shadow-lg flex items-center justify-center z-50 hover:shadow-xl transition-shadow"
          >
            <MessageSquare className="w-6 h-6" />
          </motion.button>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className={`fixed right-4 sm:right-6 z-50 bg-background border border-border shadow-2xl rounded-2xl overflow-hidden flex flex-col transition-all duration-300 ease-in-out ${
              isMinimized 
                ? 'bottom-4 sm:bottom-6 w-[calc(100vw-32px)] sm:w-80 h-16' 
                : isExpanded 
                  ? 'bottom-4 sm:bottom-6 w-[calc(100vw-32px)] sm:w-[800px] h-[calc(100vh-32px)] sm:h-[800px] max-w-[90vw] max-h-[90vh]'
                  : 'bottom-4 sm:bottom-6 w-[calc(100vw-32px)] sm:w-[380px] h-[calc(100vh-32px)] sm:h-[650px] max-h-[90vh] sm:max-h-[85vh]'
            }`}
          >
            {/* Header */}
            <div 
              className="h-16 bg-card border-b border-border px-4 flex items-center justify-between cursor-pointer flex-shrink-0"
              onClick={() => setIsMinimized(!isMinimized)}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#00A99D] flex items-center justify-center">
                  <MessageSquare className="w-5 h-5 text-white" />
                </div>
                <span className="font-semibold text-card-foreground text-lg">HireLens Career Bot</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <button onClick={(e) => { e.stopPropagation(); resetChat(); }} className="p-1.5 hover:bg-muted hover:text-foreground rounded-lg">
                  <RefreshCw className="w-4 h-4" />
                </button>
                <button onClick={(e) => { e.stopPropagation(); setIsExpanded(!isExpanded); setIsMinimized(false); }} className="p-1.5 hover:bg-muted hover:text-foreground rounded-lg hidden sm:block">
                  {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                </button>
                <button onClick={(e) => { e.stopPropagation(); setIsMuted(!isMuted); }} className="p-1.5 hover:bg-muted hover:text-foreground rounded-lg">
                  {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                </button>
                <button onClick={(e) => { e.stopPropagation(); setIsOpen(false); setIsMinimized(false); }} className="p-1.5 hover:bg-muted hover:text-foreground rounded-lg">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Chat Content */}
            {!isMinimized && (
              <>
                <ScrollArea className="flex-1 p-4 bg-muted/20">
                  <div className="flex flex-col gap-4 pb-4">
                    
                    {/* Timestamp Divider */}
                    <div className="flex justify-center my-2">
                      <span className="text-xs text-muted-foreground">
                        Today {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>

                    {messages.map((msg, idx) => (
                      <div 
                        key={idx} 
                        className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
                      >
                        <div 
                          className={`max-w-[85%] rounded-2xl px-4 py-3 shadow-sm ${
                            msg.role === 'user' 
                              ? 'bg-gradient-to-r from-[#172554] to-[#00A99D] text-white rounded-tr-sm' 
                              : 'bg-card text-card-foreground rounded-tl-sm border border-border shadow-sm'
                          }`}
                        >
                          {msg.role === 'user' ? (
                            <p className="whitespace-pre-wrap text-sm">{msg.content}</p>
                          ) : (
                            <div className="text-sm">
                              {/* Standard text content */}
                              {msg.content && (
                                <div 
                                  className="prose prose-sm dark:prose-invert max-w-none [&>p]:mb-2 [&>p:last-child]:mb-0"
                                  dangerouslySetInnerHTML={createMarkup(parseMessageContent(msg.content).text)}
                                />
                              )}
                              
                              {/* Inline Resume Uploader */}
                              {msg.type === 'resume_upload' && (
                                <div className="mt-4 border border-[#00A99D]/20 rounded-xl bg-[#00A99D]/5 p-2 overflow-hidden">
                                  <ResumeUploader 
                                    onUploadSuccess={() => {
                                      addMessage({ role: 'assistant', content: 'Resume parsed and uploaded successfully! 🚀 I will use this to match you with jobs.' });
                                    }} 
                                  />
                                </div>
                              )}

                              {/* Inline Job Results */}
                              {msg.type === 'job_results' && msg.jobs && (
                                <div className="mt-3 flex flex-col gap-2">
                                  {msg.jobs.map(job => (
                                    <a key={job.id} href={`/jobs/${job.id}`} target="_blank" rel="noreferrer" className="block p-3 border border-border rounded-lg hover:border-primary bg-muted/50 transition-colors text-left">
                                      <div className="font-semibold text-foreground truncate">{job.title}</div>
                                      <div className="text-xs text-muted-foreground truncate">{job.company} • {job.location}</div>
                                    </a>
                                  ))}
                                </div>
                              )}
                            </div>
                          )}
                        </div>

                        {/* Options / Quick Replies below assistant bubble */}
                        {msg.type === 'options' && msg.options && idx === messages.length - 1 && (
                          <div className="flex flex-wrap gap-2 mt-2 ml-1">
                            {msg.options.map((opt, i) => (
                              <button
                                key={i}
                                onClick={() => handleOptionClick(opt)}
                                className="text-sm px-4 py-2 rounded-full border border-border bg-background hover:border-primary hover:text-primary transition-colors shadow-sm text-foreground"
                              >
                                {opt}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                    
                    {isLoading && (
                      <div className="flex items-start">
                        <div className="bg-card border border-border text-muted-foreground rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm flex items-center gap-2">
                          <Loader2 className="w-4 h-4 animate-spin text-[#00A99D]" />
                          <span className="text-sm">Typing...</span>
                        </div>
                      </div>
                    )}
                    
                    {error && (
                      <div className="text-center">
                        <span className="text-xs text-red-500 bg-red-50 px-2 py-1 rounded">
                          {error}
                        </span>
                      </div>
                    )}
                    <div ref={messagesEndRef} />
                  </div>
                </ScrollArea>

                {/* Input Area */}
                <div className="p-4 bg-card border-t border-border flex-shrink-0 relative z-30">
                  
                  {/* Quick Actions Menu (Popup) */}
                  <AnimatePresence>
                    {showMenu && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="absolute bottom-[calc(100%+8px)] left-4 bg-popover border-border text-popover-foreground shadow-lg rounded-xl overflow-hidden z-40 w-64"
                      >
                        <button onClick={() => handleAction('question')} className="w-full flex items-center gap-3 px-4 py-3 hover:bg-muted/50 text-left border-b">
                          <MessageSquare className="w-4 h-4 text-muted-foreground" />
                          <span className="text-sm text-foreground font-medium">Ask a Question</span>
                        </button>
                        <button onClick={() => handleAction('search')} className="w-full flex items-center gap-3 px-4 py-3 hover:bg-muted/50 text-left border-b">
                          <Search className="w-4 h-4 text-muted-foreground" />
                          <span className="text-sm text-foreground font-medium">Guided Job Search</span>
                        </button>
                        <button onClick={() => handleAction('resume')} className="w-full flex items-center gap-3 px-4 py-3 hover:bg-muted/50 text-left border-b">
                          <FileText className="w-4 h-4 text-muted-foreground" />
                          <span className="text-sm text-foreground font-medium">Upload Resume</span>
                        </button>
                        <button onClick={() => handleAction('alerts')} className="w-full flex items-center gap-3 px-4 py-3 hover:bg-muted/50 text-left border-b">
                          <Bell className="w-4 h-4 text-muted-foreground" />
                          <span className="text-sm text-foreground font-medium">Set Job Alerts</span>
                        </button>
                        <button onClick={() => { setShowMenu(false); resetChat(); }} className="w-full flex items-center gap-3 px-4 py-3 hover:bg-destructive/10 text-left text-destructive">
                          <Trash2 className="w-4 h-4 text-red-500" />
                          <span className="text-sm font-medium">Clear Conversation</span>
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                  {!isLoading && getActiveSuggestions().length > 0 && (
                    <div className="flex flex-col gap-1 mb-3">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                        <Sparkles className="w-3 h-3 text-[#00A99D] animate-pulse" /> Suggested
                      </span>
                      <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto">
                        {getActiveSuggestions().map((reply, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => handleOptionClick(reply)}
                            className="text-xs bg-[#00A99D]/5 hover:bg-[#00A99D]/10 text-[#00A99D] px-2.5 py-1 rounded-full transition-all border border-[#00A99D]/20 font-medium hover:scale-[1.02] active:scale-[0.98] text-left truncate max-w-full"
                          >
                            {reply}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  <form onSubmit={handleSubmit} className="flex gap-2 items-center bg-muted/50 border border-border rounded-full pr-1 pl-2 focus-within:border-[#00A99D] focus-within:ring-1 focus-within:ring-[#00A99D] transition-all">
                    <Button 
                      type="button" 
                      variant="ghost" 
                      size="icon" 
                      className={`rounded-full shrink-0 ${showMenu ? 'text-[#00A99D] bg-[#00A99D]/10' : 'text-muted-foreground hover:text-foreground'}`}
                      onClick={() => setShowMenu(!showMenu)}
                      disabled={isLoading}
                    >
                      {showMenu ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                    </Button>
                    <input
                      placeholder="Type your message..."
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      className="bg-transparent border-none focus:outline-none flex-1 text-sm h-12"
                      disabled={isLoading}
                    />
                    <Button 
                      type="submit" 
                      size="icon" 
                      className="rounded-full h-10 w-10 shrink-0 bg-[#00A99D] hover:bg-[#008f85] text-white shadow-sm"
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
