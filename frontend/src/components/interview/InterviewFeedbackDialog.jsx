import { useState } from "react";
import { toast } from "react-toastify";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSaveInterviewFeedback } from "@/hooks/useMockInterview";

// These values are validated server-side too — keep the two lists in sync.
const RATINGS = ["Difficult", "Okay", "Good", "Great"];
const GOALS = [
  "Confidence",
  "Communication",
  "Technical skills",
  "Interview practice",
  "Something else",
];
const IMPROVEMENTS = [
  "Questions",
  "Recording",
  "Interview length",
  "Feedback report",
  "Technical issue",
];

const Chip = ({ selected, children, ...props }) => (
  <button
    type="button"
    aria-pressed={selected}
    className={cn(
      "px-3.5 py-2 rounded-full text-sm font-medium border transition-colors",
      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
      selected
        ? "bg-primary text-primary-foreground border-primary"
        : "bg-background text-foreground border-border hover:bg-muted"
    )}
    {...props}
  >
    {children}
  </button>
);

/**
 * Post-report feedback prompt (spec §28). Dismissible — feedback is never forced.
 */
export const InterviewFeedbackDialog = ({ open, onOpenChange, sessionId }) => {
  const [rating, setRating] = useState(null);
  const [goals, setGoals] = useState([]);
  const [improvements, setImprovements] = useState([]);
  const [comments, setComments] = useState("");

  const { mutate: saveFeedback, isPending } = useSaveInterviewFeedback();

  const toggle = (list, setList, value) =>
    setList(list.includes(value) ? list.filter((v) => v !== value) : [...list, value]);

  const handleSubmit = () => {
    if (!rating) {
      toast.error("Let us know how it felt first.");
      return;
    }
    saveFeedback(
      { sessionId, rating, goals, improvements, comments },
      {
        onSuccess: () => {
          toast.success("Thanks — this helps us improve your practice sessions.");
          onOpenChange(false);
        },
        onError: (error) =>
          toast.error(error?.message || "Could not save your feedback. Please try again."),
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>How did that interview feel?</DialogTitle>
          <DialogDescription>
            Optional, takes about 20 seconds, and shapes the questions you get next time.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 py-2">
          <fieldset>
            <legend className="text-sm font-semibold text-foreground mb-2">
              How did this feel?
            </legend>
            <div className="flex flex-wrap gap-2">
              {RATINGS.map((value) => (
                <Chip key={value} selected={rating === value} onClick={() => setRating(value)}>
                  {value}
                </Chip>
              ))}
            </div>
          </fieldset>

          <fieldset>
            <legend className="text-sm font-semibold text-foreground mb-2">
              What were you hoping to improve?
            </legend>
            <div className="flex flex-wrap gap-2">
              {GOALS.map((value) => (
                <Chip
                  key={value}
                  selected={goals.includes(value)}
                  onClick={() => toggle(goals, setGoals, value)}
                >
                  {value}
                </Chip>
              ))}
            </div>
          </fieldset>

          <fieldset>
            <legend className="text-sm font-semibold text-foreground mb-2">
              What should be better?
            </legend>
            <div className="flex flex-wrap gap-2">
              {IMPROVEMENTS.map((value) => (
                <Chip
                  key={value}
                  selected={improvements.includes(value)}
                  onClick={() => toggle(improvements, setImprovements, value)}
                >
                  {value}
                </Chip>
              ))}
            </div>
          </fieldset>

          <div>
            <label
              htmlFor="interview-feedback-comments"
              className="text-sm font-semibold text-foreground mb-2 block"
            >
              Anything else? <span className="font-normal text-muted-foreground">(optional)</span>
            </label>
            <Textarea
              id="interview-feedback-comments"
              rows={3}
              maxLength={2000}
              placeholder="Tell us what worked or what got in your way..."
              value={comments}
              onChange={(e) => setComments(e.target.value)}
            />
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-2">
          <Button variant="ghost" onClick={() => onOpenChange(false)} disabled={isPending}>
            Skip
          </Button>
          <Button onClick={handleSubmit} disabled={isPending || !rating}>
            {isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Send feedback
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default InterviewFeedbackDialog;
