import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Loader2, Star, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { fetchApi } from "@/services/api";

const GOALS = ["Build confidence", "Improve technical skills", "Practice communication", "Prepare for specific role"];
const IMPROVEMENTS = ["Question difficulty", "Recording experience", "Interview length", "Feedback accuracy"];

export function FeedbackModal({ isOpen, onClose, sessionId }) {
  const [rating, setRating] = useState("");
  const [selectedGoals, setSelectedGoals] = useState([]);
  const [selectedImprovements, setSelectedImprovements] = useState([]);
  const [comments, setComments] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const toggleSelection = (set, value) => {
    set(prev => prev.includes(value) ? prev.filter(v => v !== value) : [...prev, value]);
  };

  const handleSubmit = async () => {
    if (!rating) {
      toast.error("Please provide an overall rating");
      return;
    }

    try {
      setIsSubmitting(true);
      await fetchApi("/ai/mock-interview/feedback", {
        method: "POST",
        body: JSON.stringify({
          sessionId,
          rating,
          goals: selectedGoals,
          improvements: selectedImprovements,
          comments
        })
      });
      setSubmitted(true);
      setTimeout(() => {
        onClose();
        setSubmitted(false);
      }, 2000);
    } catch (error) {
      toast.error(error.message || "Failed to submit feedback");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-background w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden border border-border flex flex-col max-h-[90vh]"
        >
          <div className="p-4 border-b border-border flex justify-between items-center bg-muted/30">
            <h2 className="font-semibold text-lg">Help us improve</h2>
            <button onClick={onClose} className="p-1 rounded-md hover:bg-muted text-muted-foreground transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-6 overflow-y-auto">
            {submitted ? (
              <div className="flex flex-col items-center justify-center py-10 space-y-4">
                <CheckCircle2 className="w-16 h-16 text-green-500" />
                <h3 className="text-xl font-bold">Thank You!</h3>
                <p className="text-muted-foreground text-center">Your feedback helps us make Career Compass AI better for everyone.</p>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Rating */}
                <div>
                  <label className="text-sm font-semibold mb-2 block">How was your mock interview experience? *</label>
                  <div className="flex gap-2">
                    {["Difficult", "Okay", "Good", "Great"].map((r) => (
                      <button
                        key={r}
                        onClick={() => setRating(r)}
                        className={`flex-1 py-2 text-sm font-medium rounded-lg border transition-all ${
                          rating === r ? "border-primary bg-primary/10 text-primary" : "border-border hover:bg-muted"
                        }`}
                      >
                        {r}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Goals */}
                <div>
                  <label className="text-sm font-semibold mb-2 block">What were your goals for this session?</label>
                  <div className="flex flex-wrap gap-2">
                    {GOALS.map((goal) => (
                      <button
                        key={goal}
                        onClick={() => toggleSelection(setSelectedGoals, goal)}
                        className={`px-3 py-1.5 text-xs rounded-full border transition-all ${
                          selectedGoals.includes(goal) ? "border-primary bg-primary text-primary-foreground" : "border-border bg-background hover:bg-muted text-foreground"
                        }`}
                      >
                        {goal}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Improvements */}
                <div>
                  <label className="text-sm font-semibold mb-2 block">What could we improve?</label>
                  <div className="flex flex-wrap gap-2">
                    {IMPROVEMENTS.map((imp) => (
                      <button
                        key={imp}
                        onClick={() => toggleSelection(setSelectedImprovements, imp)}
                        className={`px-3 py-1.5 text-xs rounded-full border transition-all ${
                          selectedImprovements.includes(imp) ? "border-primary bg-primary text-primary-foreground" : "border-border bg-background hover:bg-muted text-foreground"
                        }`}
                      >
                        {imp}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Comments */}
                <div>
                  <label className="text-sm font-semibold mb-2 block">Additional Comments</label>
                  <Textarea
                    placeholder="Tell us more about your experience..."
                    value={comments}
                    onChange={(e) => setComments(e.target.value)}
                    rows={3}
                  />
                </div>
              </div>
            )}
          </div>

          {!submitted && (
            <div className="p-4 border-t border-border bg-muted/30 flex justify-end gap-3">
              <Button variant="ghost" onClick={onClose}>Skip</Button>
              <Button onClick={handleSubmit} disabled={isSubmitting || !rating}>
                {isSubmitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                Submit Feedback
              </Button>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
