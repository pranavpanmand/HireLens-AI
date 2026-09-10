/**
 * DEPRECATED — kept only as a compatibility shim.
 *
 * The post-interview feedback prompt now lives in
 * `@/components/interview/InterviewFeedbackDialog`, which is the single source
 * of truth: it uses the shadcn Dialog (focus trap, Esc, scroll lock), goes
 * through the `useSaveInterviewFeedback` mutation, and its option lists are the
 * ones the backend validates against. This file's lists were stale — submitting
 * them would have been rejected server-side.
 *
 * Nothing imports this any more. It forwards to the real dialog so that any
 * missed import keeps working instead of quietly rendering a broken form.
 */
import InterviewFeedbackDialog from "@/components/interview/InterviewFeedbackDialog";

export function FeedbackModal({ isOpen, onClose, sessionId }) {
  if (import.meta.env.DEV) {
    console.warn(
      "FeedbackModal is deprecated — import InterviewFeedbackDialog from " +
        "@/components/interview/InterviewFeedbackDialog instead."
    );
  }
  return (
    <InterviewFeedbackDialog
      open={Boolean(isOpen)}
      onOpenChange={(next) => {
        if (!next) onClose?.();
      }}
      sessionId={sessionId}
    />
  );
}

export default FeedbackModal;
