import { useState, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { X, Send, Loader2, MessageSquare, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "react-toastify";
import { API_URL } from "@/services/api";

export function MessageCandidateModal({ applicationId, candidate, isOpen, onClose }) {
  const queryClient = useQueryClient();
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");

  const { data: messagesResponse, isLoading: loadingMessages } = useQuery({
    queryKey: ['application-messages', applicationId],
    queryFn: async () => {
      const res = await fetch(`${API_URL}/applications/${applicationId}/messages`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (!res.ok) throw new Error('Failed to fetch messages');
      return res.json();
    },
    enabled: !!applicationId && isOpen
  });

  const sendMessage = useMutation({
    mutationFn: async (messageData) => {
      const res = await fetch(`${API_URL}/applications/${applicationId}/message`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(messageData)
      });
      if (!res.ok) throw new Error('Failed to send message');
      return res.json();
    },
    onSuccess: () => {
      toast.success('Message sent to candidate');
      setSubject("");
      setBody("");
      queryClient.invalidateQueries(['application-messages', applicationId]);
    },
    onError: (err) => {
      toast.error(err.message || 'Failed to send message');
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!subject.trim() || !body.trim()) return;
    sendMessage.mutate({ subject, body });
  };

  if (!isOpen) return null;

  const messages = messagesResponse?.data || [];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-background/80 backdrop-blur-sm"
        />

        {/* Modal */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-2xl bg-card border border-border shadow-xl rounded-2xl flex flex-col overflow-hidden"
          style={{ maxHeight: '90vh' }}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-border bg-muted/20 shrink-0">
            <div>
              <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-primary" /> Contact {candidate?.fullName}
              </h2>
              <p className="text-sm text-muted-foreground mt-1">Send a direct email to the candidate regarding their application.</p>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full">
              <X className="w-5 h-5" />
            </Button>
          </div>

          <div className="flex-1 overflow-y-auto flex flex-col md:flex-row">
            {/* Compose Area */}
            <div className="flex-1 p-6 border-r border-border">
              <form onSubmit={handleSubmit} className="space-y-4 flex flex-col h-full">
                <div className="space-y-2">
                  <Label htmlFor="subject">Subject</Label>
                  <Input 
                    id="subject"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="Interview next steps"
                    required
                  />
                </div>
                <div className="space-y-2 flex-1 flex flex-col">
                  <Label htmlFor="body">Message Body</Label>
                  <Textarea 
                    id="body"
                    value={body}
                    onChange={(e) => setBody(e.target.value)}
                    placeholder="Hi there, we'd love to schedule..."
                    className="flex-1 min-h-[200px] resize-none"
                    required
                  />
                </div>
                <Button 
                  type="submit" 
                  disabled={sendMessage.isPending || !subject.trim() || !body.trim()} 
                  className="w-full gap-2"
                >
                  {sendMessage.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  Send via Email
                </Button>
              </form>
            </div>

            {/* History Area */}
            <div className="w-full md:w-64 bg-muted/10 p-6 flex flex-col shrink-0">
              <h3 className="font-semibold text-sm mb-4 flex items-center gap-2 text-foreground/80">
                <Clock className="w-4 h-4" /> Message History
              </h3>
              
              <div className="flex-1 overflow-y-auto space-y-4 pr-2">
                {loadingMessages ? (
                  <div className="flex justify-center p-4"><Loader2 className="w-5 h-5 animate-spin text-muted-foreground" /></div>
                ) : messages.length === 0 ? (
                  <p className="text-xs text-muted-foreground italic text-center mt-4">No previous messages sent.</p>
                ) : (
                  messages.map(msg => (
                    <div key={msg._id} className="bg-card border border-border p-3 rounded-lg shadow-sm text-sm">
                      <div className="font-medium truncate text-foreground mb-1" title={msg.subject}>{msg.subject}</div>
                      <div className="text-xs text-muted-foreground mb-2">{new Date(msg.sentAt).toLocaleString()}</div>
                      <p className="text-xs text-muted-foreground line-clamp-3">{msg.body}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
