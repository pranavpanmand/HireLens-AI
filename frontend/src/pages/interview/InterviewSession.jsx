import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useParams, useNavigate, useLocation, Link } from "react-router-dom";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import {
  Loader2, Mic, MicOff, Square, Send, ArrowRight, Pencil, RotateCcw,
  CheckCircle2, XCircle, AlertCircle, Lightbulb, Volume2, PhoneOff, Keyboard,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";

import { AiAvatar } from "@/components/interview/AiAvatar";
import { InterviewTimer } from "@/components/interview/InterviewTimer";
import { WebcamView } from "@/components/interview/WebcamView";
import { useSpeech } from "@/hooks/useSpeech";
import {
  useInterviewReport, useSubmitAnswer, useFinishInterview,
} from "@/hooks/useMockInterview";

// The per-question sub-states. A small explicit machine keeps the avatar,
// microphone and buttons from contradicting each other.
const PHASE = {
  ASKING: "asking",       // AI is reading the question aloud
  ANSWERING: "answering", // mic (or textarea) is live
  REVIEW: "review",       // candidate edits the transcript before submit
  EVALUATING: "evaluating",
  FEEDBACK: "feedback",   // per-question score shown
};

const ScorePill = ({ label, value }) => (
  <div className="flex flex-col items-center px-2.5 py-1.5 rounded-lg bg-muted min-w-[64px]">
    <span className="text-sm font-bold text-foreground tabular-nums">{value}/10</span>
    <span className="text-[10px] text-muted-foreground uppercase tracking-wide">{label}</span>
  </div>
);

export default function InterviewSession() {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const locationState = useLocation().state;
  const mode = locationState?.mode || "conversational";
  const isConversational = mode === "conversational";

  const { data: session, isLoading, isError, error, refetch } = useInterviewReport(sessionId);
  const { mutateAsync: submitAnswer } = useSubmitAnswer();
  const { mutateAsync: finishInterview, isPending: isFinishing } = useFinishInterview();

  const speech = useSpeech();
  const {
    isListening, liveTranscript, transcript, micError, clearMicError,
    startListening, stopListening, resetTranscript, setTranscriptManually,
    isSpeaking, speak, cancelSpeech, supported,
  } = speech;

  const [currentIndex, setCurrentIndex] = useState(0);
  const [phase, setPhase] = useState(PHASE.ASKING);
  const [draftAnswer, setDraftAnswer] = useState("");
  const [feedback, setFeedback] = useState(null);
  const [elapsed, setElapsed] = useState(0);
  const [showEndConfirm, setShowEndConfirm] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const questions = session?.questions || [];
  const totalQuestions = questions.length;
  const currentQuestion = questions[currentIndex];
  const isLastQuestion = currentIndex === totalQuestions - 1;

  // If the session was already completed (e.g. user reopened the URL), send them
  // to the report instead of re-running a finished interview.
  useEffect(() => {
    if (session?.status === "completed") {
      navigate(`/interview/report/${sessionId}`, { replace: true });
    }
  }, [session?.status, sessionId, navigate]);

  // Resume support: skip past questions that already have an answer.
  const didInit = useRef(false);
  useEffect(() => {
    if (didInit.current || !session || !totalQuestions) return;
    didInit.current = true;
    const answered = new Set((session.answers || []).map((a) => a.questionIndex));
    let next = 0;
    while (next < totalQuestions && answered.has(next)) next += 1;
    setCurrentIndex(Math.min(next, totalQuestions - 1));
  }, [session, totalQuestions]);

  const beginAnswering = useCallback(() => {
    setPhase(PHASE.ANSWERING);
    if (isConversational && supported.recognition) {
      startListening({ reset: true });
    } else {
      resetTranscript();
    }
  }, [isConversational, supported.recognition, startListening, resetTranscript]);

  // Ask the current question: read it aloud (conversational) then open answering.
  const askedIndexRef = useRef(-1);
  useEffect(() => {
    if (!currentQuestion || phase === PHASE.FEEDBACK || phase === PHASE.EVALUATING) return;
    if (askedIndexRef.current === currentIndex) return;
    askedIndexRef.current = currentIndex;

    setPhase(PHASE.ASKING);
    setDraftAnswer("");
    setFeedback(null);
    resetTranscript();

    if (isConversational && supported.synthesis) {
      speak(currentQuestion.question, { onEnd: beginAnswering });
    } else {
      // Structured mode, or no TTS: go straight to the answer step.
      beginAnswering();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentIndex, currentQuestion]);

  // Keep the editable draft in step with the live transcript while recording.
  useEffect(() => {
    if (phase === PHASE.ANSWERING && isConversational) {
      setDraftAnswer(liveTranscript);
    }
  }, [liveTranscript, phase, isConversational]);

  const handleStopAndReview = () => {
    stopListening();
    cancelSpeech();
    // Prefer the finalised transcript; fall back to whatever is live.
    setDraftAnswer((prev) => (transcript || prev || "").trim());
    setPhase(PHASE.REVIEW);
  };

  const handleReRecord = () => {
    clearMicError();
    setDraftAnswer("");
    resetTranscript();
    setPhase(PHASE.ANSWERING);
    if (isConversational && supported.recognition) {
      startListening({ reset: true });
    }
  };

  const handleToggleMic = () => {
    if (isListening) {
      stopListening();
    } else {
      clearMicError();
      startListening({ reset: !draftAnswer });
    }
  };

  const handleSubmitAnswer = async () => {
    const answer = draftAnswer.trim();
    setSubmitting(true);
    stopListening();
    cancelSpeech();
    setPhase(PHASE.EVALUATING);
    try {
      const result = await submitAnswer({
        sessionId,
        questionIndex: currentIndex,
        answer,
        timeTaken: elapsed,
      });
      setFeedback(result?.evaluation || null);
      setPhase(PHASE.FEEDBACK);
    } catch (err) {
      toast.error(err?.message || "Could not score that answer. Please try again.");
      setPhase(PHASE.REVIEW);
    } finally {
      setSubmitting(false);
    }
  };

  const goToReport = useCallback(async () => {
    cancelSpeech();
    stopListening();
    try {
      await finishInterview(sessionId);
      navigate(`/interview/report/${sessionId}`, { replace: true });
    } catch (err) {
      toast.error(err?.message || "Could not generate your report. Please try again.");
    }
  }, [cancelSpeech, stopListening, finishInterview, sessionId, navigate]);

  const handleNext = () => {
    if (isLastQuestion) {
      goToReport();
    } else {
      setCurrentIndex((i) => i + 1);
    }
  };

  const avatarState = isSpeaking
    ? "speaking"
    : phase === PHASE.EVALUATING
    ? "thinking"
    : isListening
    ? "listening"
    : "idle";

  const answeredCount = useMemo(() => {
    const base = new Set((session?.answers || []).map((a) => a.questionIndex));
    if (phase === PHASE.FEEDBACK) base.add(currentIndex);
    return base.size;
  }, [session?.answers, phase, currentIndex]);

  // ------------------------------------------------------------------ rendering

  if (isLoading) {
    return (
      <div className="min-h-[60vh] grid place-items-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">Loading your interview…</p>
        </div>
      </div>
    );
  }

  if (isError || !session) {
    return (
      <div className="container mx-auto px-4 py-12 max-w-lg">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {error?.message || "We couldn't load this interview."}
          </AlertDescription>
        </Alert>
        <div className="flex gap-3 mt-4">
          <Button variant="outline" onClick={() => refetch()}>Try again</Button>
          <Button asChild><Link to="/interview">Back to Interview Coach</Link></Button>
        </div>
      </div>
    );
  }

  return (
    <main className="container mx-auto px-4 py-6 max-w-4xl">
      {/* Header: progress + end button */}
      <div className="flex items-center justify-between gap-4 mb-4">
        <div className="min-w-0">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
            {session.jobTitle} · {session.company}
          </p>
          <p className="text-sm text-foreground font-medium">
            Question {currentIndex + 1} of {totalQuestions}
          </p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="text-destructive hover:text-destructive hover:bg-destructive/10 gap-2 shrink-0"
          onClick={() => setShowEndConfirm(true)}
        >
          <PhoneOff className="w-4 h-4" /> End
        </Button>
      </div>

      <Progress value={(answeredCount / totalQuestions) * 100} className="h-1.5 mb-6" />

      <div className="grid md:grid-cols-[200px_1fr] gap-6">
        {/* Avatar rail */}
        <div className="flex md:flex-col items-center md:items-stretch gap-4">
          <div className="flex justify-center md:pt-4">
            <AiAvatar state={avatarState} />
          </div>
          <div className="w-24 md:w-full max-w-[200px] mx-auto hidden sm:block">
            <WebcamView />
          </div>
          <div className="flex-1 md:flex-none flex flex-col gap-2">
            <InterviewTimer
              running={phase === PHASE.ANSWERING}
              limitSeconds={currentQuestion?.timeLimit || 0}
              resetKey={currentIndex}
              onTick={setElapsed}
              className="w-full justify-center"
            />
            <div className="flex flex-wrap gap-1.5 justify-center">
              {currentQuestion?.category && (
                <Badge variant="secondary" className="capitalize text-[10px]">
                  {currentQuestion.category}
                </Badge>
              )}
              {currentQuestion?.difficulty && (
                <Badge variant="outline" className="capitalize text-[10px]">
                  {currentQuestion.difficulty}
                </Badge>
              )}
            </div>
          </div>
        </div>

        {/* Main column */}
        <div className="min-w-0">
          {/* Question */}
          <div className="rounded-2xl border border-border bg-card p-5 mb-4 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              {isSpeaking ? (
                <Volume2 className="w-4 h-4 text-primary animate-pulse" />
              ) : (
                <span className="text-xs font-semibold text-primary uppercase tracking-wide">
                  Interviewer
                </span>
              )}
            </div>
            <p className="text-lg font-medium text-foreground leading-relaxed">
              {currentQuestion?.question}
            </p>
            {isSpeaking && (
              <Button
                variant="ghost"
                size="sm"
                className="mt-3 -ml-2 text-muted-foreground"
                onClick={() => { cancelSpeech(); beginAnswering(); }}
              >
                Skip audio & answer now
              </Button>
            )}
          </div>

          {micError && (
            <Alert variant="destructive" className="mb-4">
              <MicOff className="h-4 w-4" />
              <AlertDescription className="flex items-center justify-between gap-3">
                <span>{micError}</span>
                <Button variant="outline" size="sm" onClick={clearMicError}>Dismiss</Button>
              </AlertDescription>
            </Alert>
          )}

          <AnimatePresence mode="wait">
            {/* ANSWERING */}
            {(phase === PHASE.ANSWERING || phase === PHASE.ASKING) && (
              <motion.div
                key="answering"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
              >
                {isConversational && supported.recognition ? (
                  <div className="rounded-2xl border-2 border-dashed border-border p-5">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm font-medium text-foreground flex items-center gap-2">
                        {isListening ? (
                          <><span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> Recording your answer</>
                        ) : (
                          <>Your answer</>
                        )}
                      </span>
                      <Button variant="ghost" size="sm" onClick={handleToggleMic} className="gap-2">
                        {isListening ? <><MicOff className="w-4 h-4" /> Pause</> : <><Mic className="w-4 h-4" /> Resume</>}
                      </Button>
                    </div>
                    <p className={cn(
                      "min-h-[96px] text-base leading-relaxed",
                      draftAnswer ? "text-foreground" : "text-muted-foreground"
                    )}>
                      {draftAnswer || (phase === PHASE.ASKING
                        ? "The interviewer is asking…"
                        : "Start speaking and your words will appear here.")}
                    </p>
                    <div className="flex flex-col sm:flex-row gap-2 mt-4">
                      <Button
                        onClick={handleStopAndReview}
                        disabled={phase === PHASE.ASKING || (!draftAnswer.trim() && !liveTranscript.trim())}
                        className="gap-2 flex-1"
                      >
                        <Square className="w-4 h-4" /> Done — review answer
                      </Button>
                    </div>
                  </div>
                ) : (
                  // Structured / no-mic: type the answer.
                  <div className="rounded-2xl border border-border p-5">
                    <label htmlFor="typed-answer" className="text-sm font-medium text-foreground mb-2 flex items-center gap-2">
                      <Keyboard className="w-4 h-4" /> Type your answer
                    </label>
                    <Textarea
                      id="typed-answer"
                      rows={6}
                      autoFocus
                      placeholder="Write your answer here…"
                      value={draftAnswer}
                      onChange={(e) => setDraftAnswer(e.target.value)}
                    />
                    <Button
                      onClick={() => setPhase(PHASE.REVIEW)}
                      disabled={!draftAnswer.trim()}
                      className="gap-2 mt-4 w-full sm:w-auto"
                    >
                      Review answer <ArrowRight className="w-4 h-4" />
                    </Button>
                  </div>
                )}
              </motion.div>
            )}

            {/* REVIEW / EDIT */}
            {phase === PHASE.REVIEW && (
              <motion.div
                key="review"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="rounded-2xl border border-border p-5"
              >
                <div className="flex items-center gap-2 mb-2">
                  <Pencil className="w-4 h-4 text-primary" />
                  <span className="text-sm font-semibold text-foreground">Review &amp; edit before submitting</span>
                </div>
                <p className="text-xs text-muted-foreground mb-3">
                  Speech-to-text isn't perfect. Fix any wording so you're scored on what you meant.
                </p>
                <Textarea
                  rows={6}
                  value={draftAnswer}
                  onChange={(e) => { setDraftAnswer(e.target.value); setTranscriptManually(e.target.value); }}
                  placeholder="Your answer…"
                />
                {!draftAnswer.trim() && (
                  <p className="text-xs text-amber-600 mt-2">
                    This answer is empty — you can submit it as skipped, or re-record.
                  </p>
                )}
                <div className="flex flex-col sm:flex-row gap-2 mt-4">
                  {isConversational && supported.recognition && (
                    <Button variant="outline" onClick={handleReRecord} className="gap-2">
                      <RotateCcw className="w-4 h-4" /> Re-record
                    </Button>
                  )}
                  <Button onClick={handleSubmitAnswer} disabled={submitting} className="gap-2 sm:ml-auto">
                    {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                    Submit answer
                  </Button>
                </div>
              </motion.div>
            )}

            {/* EVALUATING */}
            {phase === PHASE.EVALUATING && (
              <motion.div
                key="evaluating"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="rounded-2xl border border-border p-8 text-center"
              >
                <Loader2 className="w-7 h-7 animate-spin text-primary mx-auto mb-3" />
                <p className="text-sm font-medium text-foreground">Scoring your answer…</p>
                <p className="text-xs text-muted-foreground mt-1">This takes a few seconds.</p>
              </motion.div>
            )}

            {/* FEEDBACK */}
            {phase === PHASE.FEEDBACK && feedback && (
              <motion.div
                key="feedback"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="rounded-2xl border border-border p-5"
              >
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm font-semibold text-foreground">Feedback</span>
                  <div className="text-right">
                    <span className="text-2xl font-bold text-primary tabular-nums">{feedback.score}</span>
                    <span className="text-sm text-muted-foreground">/10</span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 mb-4">
                  <ScorePill label="Clarity" value={feedback.clarity} />
                  <ScorePill label="Relevance" value={feedback.relevance} />
                  <ScorePill label="Specificity" value={feedback.specificity} />
                  <ScorePill label="Confidence" value={feedback.confidence} />
                  <ScorePill label="Correctness" value={feedback.correctness} />
                </div>

                {feedback.feedback && (
                  <p className="text-sm text-foreground leading-relaxed mb-4">{feedback.feedback}</p>
                )}

                <div className="grid sm:grid-cols-2 gap-3 mb-4">
                  {feedback.whatWentWell && (
                    <div className="rounded-lg bg-emerald-500/10 border border-emerald-500/20 p-3">
                      <div className="flex items-center gap-1.5 mb-1">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        <span className="text-xs font-semibold text-emerald-700">What went well</span>
                      </div>
                      <p className="text-xs text-foreground leading-relaxed">{feedback.whatWentWell}</p>
                    </div>
                  )}
                  {feedback.whatToImprove && (
                    <div className="rounded-lg bg-amber-500/10 border border-amber-500/20 p-3">
                      <div className="flex items-center gap-1.5 mb-1">
                        <XCircle className="w-4 h-4 text-amber-600" />
                        <span className="text-xs font-semibold text-amber-700">To improve</span>
                      </div>
                      <p className="text-xs text-foreground leading-relaxed">{feedback.whatToImprove}</p>
                    </div>
                  )}
                </div>

                {feedback.improvedAnswer && (
                  <details className="rounded-lg bg-muted/60 p-3 mb-4 group">
                    <summary className="flex items-center gap-1.5 cursor-pointer text-xs font-semibold text-foreground">
                      <Lightbulb className="w-4 h-4 text-primary" /> See a stronger example answer
                    </summary>
                    <p className="text-sm text-foreground leading-relaxed mt-2">{feedback.improvedAnswer}</p>
                  </details>
                )}

                <Button onClick={handleNext} disabled={isFinishing} className="w-full gap-2" size="lg">
                  {isFinishing ? (
                    <><Loader2 className="w-4 h-4 animate-spin" /> Preparing report…</>
                  ) : isLastQuestion ? (
                    <>Finish &amp; see report <ArrowRight className="w-4 h-4" /></>
                  ) : (
                    <>Next question <ArrowRight className="w-4 h-4" /></>
                  )}
                </Button>
              </motion.div>
            )}
          </AnimatePresence>

          {currentQuestion?.tips && phase !== PHASE.FEEDBACK && (
            <p className="text-xs text-muted-foreground mt-4 flex items-start gap-1.5">
              <Lightbulb className="w-3.5 h-3.5 shrink-0 mt-0.5 text-amber-500" />
              <span>Tip: {currentQuestion.tips}</span>
            </p>
          )}
        </div>
      </div>

      <AlertDialog open={showEndConfirm} onOpenChange={setShowEndConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>End the interview now?</AlertDialogTitle>
            <AlertDialogDescription>
              We'll score what you've answered so far and generate your report. Unanswered
              questions will be marked as skipped.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep going</AlertDialogCancel>
            <AlertDialogAction onClick={goToReport}>End &amp; see report</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </main>
  );
}
