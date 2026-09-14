import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useParams, useNavigate, useLocation, Link } from "react-router-dom";
import { toast } from "react-toastify";
import { motion, AnimatePresence } from "framer-motion";
import {
  Loader2, Mic, MicOff, Square, Send, ArrowRight, Pencil, RotateCcw,
  CheckCircle2, XCircle, AlertCircle, Lightbulb, Volume2, PhoneOff, Keyboard,
  Code, MessageSquare, Maximize2, Minimize2, ShieldAlert, MonitorX,
  Monitor, Eye, Copy, Mouse, Columns2, Timer, Fingerprint, BookOpen
} from "lucide-react";

import Editor from "@monaco-editor/react";
import { marked } from "marked";
import DOMPurify from "dompurify";

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

const CODE_BOILERPLATES = {
  javascript: "// Write your JavaScript code here\n\nfunction solution() {\n  \n}\n",
  python: "# Write your Python code here\n\ndef solution():\n    pass\n",
  java: "// Write your Java code here\n\nclass Solution {\n    public void solve() {\n        \n    }\n}\n",
  cpp: "// Write your C++ code here\n#include <iostream>\nusing namespace std;\n\nint main() {\n    \n    return 0;\n}\n",
  csharp: "// Write your C# code here\nusing System;\n\nclass Solution {\n    static void Main() {\n        \n    }\n}\n",
  go: "// Write your Go code here\npackage main\n\nimport \"fmt\"\n\nfunc main() {\n    \n}\n",
  ruby: "# Write your Ruby code here\n\ndef solution\n  \nend\n",
  rust: "// Write your Rust code here\nfn main() {\n    \n}\n",
  php: "<?php\n// Write your PHP code here\n\nfunction solution() {\n    \n}\n?>\n",
  swift: "// Write your Swift code here\n\nfunc solution() {\n    \n}\n",
  typescript: "// Write your TypeScript code here\n\nfunction solution(): void {\n  \n}\n",
  sql: "-- Write your SQL query here\n\nSELECT * FROM table_name;\n",
  plaintext: "Type your plain text or pseudocode here..."
};

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
  const [isCodeMode, setIsCodeMode] = useState(false);
  const [codeLanguage, setCodeLanguage] = useState("javascript");
  const [isEditorExpanded, setIsEditorExpanded] = useState(false);

  // ---- Anti-cheat: Fullscreen + Tab-switch detection ----
  const [hasAcceptedRules, setHasAcceptedRules] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showFullscreenWarning, setShowFullscreenWarning] = useState(false);
  const [tabSwitchCount, setTabSwitchCount] = useState(0);
  const [autoTerminated, setAutoTerminated] = useState(false);
  const interviewContainerRef = useRef(null);
  const MAX_VIOLATIONS = 5;

  // Request fullscreen when rules are accepted
  useEffect(() => {
    if (!hasAcceptedRules || !session || session.status === "completed") return;
    const el = interviewContainerRef.current || document.documentElement;
    const enterFullscreen = async () => {
      try {
        if (el.requestFullscreen) await el.requestFullscreen();
        else if (el.webkitRequestFullscreen) await el.webkitRequestFullscreen();
        else if (el.msRequestFullscreen) await el.msRequestFullscreen();
      } catch (err) {
        console.warn("Fullscreen request denied:", err);
      }
    };
    const timer = setTimeout(enterFullscreen, 300);
    return () => clearTimeout(timer);
  }, [hasAcceptedRules, session]);

  // Listen for fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      const isFull = !!(
        document.fullscreenElement ||
        document.webkitFullscreenElement ||
        document.msFullscreenElement
      );
      setIsFullscreen(isFull);
      if (!isFull && hasAcceptedRules && session && session.status !== "completed") {
        setShowFullscreenWarning(true);
      }
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    document.addEventListener("webkitfullscreenchange", handleFullscreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
      document.removeEventListener("webkitfullscreenchange", handleFullscreenChange);
    };
  }, [session]);

  // Helper: add a violation
  const addViolation = useCallback((reason) => {
    setTabSwitchCount((c) => {
      const next = c + 1;
      toast.error(`🚫 ${reason} (Violation ${next}/${MAX_VIOLATIONS})`, { autoClose: 4000 });
      if (next >= MAX_VIOLATIONS) {
        setAutoTerminated(true);
        toast.error("❌ Interview auto-terminated due to repeated violations.", { autoClose: 8000 });
      }
      return next;
    });
  }, []);

  // Auto-terminate: navigate to report when limit exceeded
  useEffect(() => {
    if (autoTerminated && sessionId) {
      const timer = setTimeout(async () => {
        try {
          await finishInterview(sessionId);
        } catch (_) { /* best effort */ }
        navigate(`/interview/report/${sessionId}`, { replace: true });
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [autoTerminated, sessionId, finishInterview, navigate]);

  // Detect tab switching / window blur (covers Alt+Tab too)
  useEffect(() => {
    if (!hasAcceptedRules || !session || session.status === "completed") return;
    const handleVisibilityChange = () => {
      if (document.hidden) addViolation("Tab switch detected!");
    };
    const handleWindowBlur = () => {
      if (!document.hidden) addViolation("Window focus lost!");
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("blur", handleWindowBlur);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("blur", handleWindowBlur);
    };
  }, [session, addViolation]);

  // Block keyboard shortcuts (Ctrl+C, Ctrl+V, Ctrl+T, Ctrl+Tab, Ctrl+Shift+I, F12, etc.)
  useEffect(() => {
    if (!hasAcceptedRules || !session || session.status === "completed") return;
    const handleKeyDown = (e) => {
      // Allow normal typing in textareas and inputs
      const tag = e.target.tagName;
      const isEditable = tag === "TEXTAREA" || tag === "INPUT" || e.target.isContentEditable;
      const isMonaco = e.target.closest(".monaco-editor");

      // Block F12 (DevTools)
      if (e.key === "F12") {
        e.preventDefault();
        e.stopPropagation();
        addViolation("DevTools shortcut blocked!");
        return;
      }

      // Block Ctrl/Cmd shortcuts
      if (e.ctrlKey || e.metaKey) {
        const blocked = ["c", "v", "x", "t", "n", "w", "u", "s", "p", "g", "f", "h", "j", "l"];
        // Allow Ctrl+A, Ctrl+Z, Ctrl+Shift+Z inside editable fields
        if (blocked.includes(e.key.toLowerCase())) {
          // Allow copy/paste/cut ONLY inside the code editor (Monaco)
          if (isMonaco && ["c", "v", "x", "a", "z"].includes(e.key.toLowerCase())) return;
          e.preventDefault();
          e.stopPropagation();
          if (["c", "v", "x"].includes(e.key.toLowerCase())) {
            addViolation("Copy/Paste blocked!");
          }
          return;
        }
        // Block Ctrl+Shift+I (DevTools), Ctrl+Shift+J (Console)
        if (e.shiftKey && ["i", "j", "c"].includes(e.key.toLowerCase())) {
          e.preventDefault();
          e.stopPropagation();
          addViolation("DevTools shortcut blocked!");
          return;
        }
      }

      // Block Alt+Tab notification (can't actually prevent but blur catches it)
      if (e.altKey && e.key === "Tab") {
        e.preventDefault();
        return;
      }
    };
    document.addEventListener("keydown", handleKeyDown, true);
    return () => document.removeEventListener("keydown", handleKeyDown, true);
  }, [session, addViolation]);

  // Block right-click context menu
  useEffect(() => {
    if (!hasAcceptedRules || !session || session.status === "completed") return;
    const handleContextMenu = (e) => {
      // Allow right-click inside Monaco editor only
      if (e.target.closest(".monaco-editor")) return;
      e.preventDefault();
      addViolation("Right-click blocked!");
    };
    document.addEventListener("contextmenu", handleContextMenu);
    return () => document.removeEventListener("contextmenu", handleContextMenu);
  }, [session, addViolation]);

  // Block copy/paste/cut events globally (except inside Monaco editor)
  useEffect(() => {
    if (!hasAcceptedRules || !session || session.status === "completed") return;
    const blockClipboard = (e) => {
      if (e.target.closest(".monaco-editor")) return;
      e.preventDefault();
    };
    document.addEventListener("copy", blockClipboard);
    document.addEventListener("paste", blockClipboard);
    document.addEventListener("cut", blockClipboard);
    return () => {
      document.removeEventListener("copy", blockClipboard);
      document.removeEventListener("paste", blockClipboard);
      document.removeEventListener("cut", blockClipboard);
    };
  }, [session]);

  // Detect window resize (split screen cheating)
  useEffect(() => {
    if (!hasAcceptedRules || !session || session.status === "completed") return;
    const expectedW = window.screen.width;
    const expectedH = window.screen.height;
    const handleResize = () => {
      // Only trigger if the window is significantly smaller than the screen (split-screen)
      if (document.fullscreenElement && (window.innerWidth < expectedW * 0.9 || window.innerHeight < expectedH * 0.9)) {
        addViolation("Window resize / split-screen detected!");
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [session, addViolation]);

  // Disable text selection via CSS (except in editable areas)
  useEffect(() => {
    if (!hasAcceptedRules || !session || session.status === "completed") return;
    document.body.classList.add("interview-lockdown");
    return () => document.body.classList.remove("interview-lockdown");
  }, [session]);

  // Re-enter fullscreen helper
  const reEnterFullscreen = async () => {
    const el = interviewContainerRef.current || document.documentElement;
    try {
      if (el.requestFullscreen) await el.requestFullscreen();
      else if (el.webkitRequestFullscreen) await el.webkitRequestFullscreen();
      else if (el.msRequestFullscreen) await el.msRequestFullscreen();
      setShowFullscreenWarning(false);
    } catch (err) {
      console.warn("Fullscreen re-entry failed:", err);
    }
  };

  // Exit fullscreen on unmount (when interview ends / navigates away)
  useEffect(() => {
    return () => {
      if (document.fullscreenElement) {
        document.exitFullscreen().catch(() => {});
      }
    };
  }, []);

  // Hide chatbot widget during interview
  useEffect(() => {
    const chatbot = document.getElementById("chatbot-widget");
    if (chatbot) chatbot.style.display = "none";
    return () => {
      if (chatbot) chatbot.style.display = "";
    };
  }, []);

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
    if (isConversational && supported.recognition && !isCodeMode) {
      startListening({ reset: true });
    } else if (!isCodeMode) {
      resetTranscript();
    }
  }, [isConversational, supported.recognition, startListening, resetTranscript, isCodeMode]);

  const handleLanguageChange = (newLang) => {
    const isCurrentBoilerplate = Object.values(CODE_BOILERPLATES).includes(draftAnswer.trim());
    if (!draftAnswer.trim() || isCurrentBoilerplate) {
      setDraftAnswer(CODE_BOILERPLATES[newLang]);
    }
    setCodeLanguage(newLang);
  };

  const handleCodeModeToggle = (enable) => {
    setIsCodeMode(enable);
    if (enable) {
      stopListening();
      cancelSpeech();
      const isCurrentBoilerplate = Object.values(CODE_BOILERPLATES).includes(draftAnswer.trim());
      if (!draftAnswer.trim() || isCurrentBoilerplate || draftAnswer === liveTranscript.trim()) {
        setDraftAnswer(CODE_BOILERPLATES[codeLanguage]);
      }
    } else {
      if (isConversational && supported.recognition && phase === PHASE.ANSWERING) {
        startListening({ reset: false });
      }
    }
  };

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
    setIsCodeMode(false); // Reset to text mode for each new question

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
        isCode: isCodeMode,
        language: codeLanguage,
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
      setPhase(PHASE.ASKING);
      setFeedback(null);
      setDraftAnswer("");
      setIsCodeMode(false);
      resetTranscript();
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

  // ---- Pre-interview instructions screen ----
  if (!hasAcceptedRules) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-2xl"
        >
          <div className="rounded-2xl border border-border bg-card shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-primary/20 via-primary/10 to-transparent p-6 border-b border-border">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
                  <BookOpen className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-foreground">Interview Rules & Guidelines</h1>
                  <p className="text-sm text-muted-foreground">Please read carefully before starting</p>
                </div>
              </div>
            </div>

            {/* Interview info */}
            <div className="px-6 pt-4 pb-2">
              <div className="flex flex-wrap gap-2 text-xs">
                <Badge variant="secondary">{session.jobTitle}</Badge>
                {session.company && <Badge variant="outline">{session.company}</Badge>}
                <Badge variant="outline">{totalQuestions} Questions</Badge>
                <Badge variant="outline" className="capitalize">{session.interviewType || "Mixed"}</Badge>
              </div>
            </div>

            {/* Rules list */}
            <div className="p-6 space-y-3">
              {[
                { icon: Monitor, color: "text-blue-500", title: "Fullscreen Required", desc: "Your browser will enter fullscreen mode. You must stay in fullscreen throughout the interview." },
                { icon: Eye, color: "text-amber-500", title: "Camera Monitoring", desc: "Your webcam feed will be visible during the interview for proctoring purposes." },
                { icon: AlertCircle, color: "text-red-500", title: "Tab Switching Detected", desc: "Switching tabs or windows (Alt+Tab) will be recorded as a violation." },
                { icon: Copy, color: "text-orange-500", title: "Copy/Paste Disabled", desc: "Copy, paste, and cut are disabled outside the code editor to prevent cheating." },
                { icon: Mouse, color: "text-purple-500", title: "Right-Click Disabled", desc: "Right-click context menu is blocked during the interview session." },
                { icon: Columns2, color: "text-cyan-500", title: "Split-Screen Detection", desc: "Resizing or splitting the browser window will be flagged as a violation." },
                { icon: Fingerprint, color: "text-emerald-500", title: "DevTools Blocked", desc: "Keyboard shortcuts for browser DevTools (F12, Ctrl+Shift+I) are disabled." },
                { icon: Timer, color: "text-red-600", title: "Auto-Termination", desc: `After ${MAX_VIOLATIONS} violations, your interview will be automatically ended and scored.` },
              ].map(({ icon: Icon, color, title, desc }) => (
                <div key={title} className="flex gap-3 items-start p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                  <Icon className={cn("w-5 h-5 mt-0.5 shrink-0", color)} />
                  <div>
                    <p className="text-sm font-semibold text-foreground">{title}</p>
                    <p className="text-xs text-muted-foreground leading-relaxed">{desc}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Warning */}
            <div className="px-6 pb-4">
              <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-3 flex gap-2 items-start">
                <ShieldAlert className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                <p className="text-xs text-amber-700 dark:text-amber-400 leading-relaxed">
                  <strong>Important:</strong> Once you click the button below, your browser will enter fullscreen mode
                  and all anti-cheating measures will activate. Make sure you are ready, your webcam is working,
                  and you are in a quiet environment.
                </p>
              </div>
            </div>

            {/* Start button */}
            <div className="p-6 pt-2 border-t border-border bg-muted/30">
              <Button
                onClick={() => setHasAcceptedRules(true)}
                size="lg"
                className="w-full gap-2 text-base font-bold h-12 bg-gradient-primary hover:opacity-90"
              >
                <ShieldAlert className="w-5 h-5" />
                I Understand, Begin Interview
              </Button>
              <p className="text-[10px] text-muted-foreground text-center mt-3">
                By clicking above, you agree to the proctoring guidelines and acknowledge that violations will be recorded.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div ref={interviewContainerRef} className="min-h-screen bg-background">
      {/* Fullscreen exit warning overlay */}
      {showFullscreenWarning && (
        <div className="fixed inset-0 z-[9999] bg-black/80 backdrop-blur-md flex items-center justify-center">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-card border border-destructive/50 rounded-2xl p-8 max-w-md text-center shadow-2xl"
          >
            <MonitorX className="w-16 h-16 text-destructive mx-auto mb-4" />
            <h2 className="text-xl font-bold text-foreground mb-2">Fullscreen Mode Required</h2>
            <p className="text-sm text-muted-foreground mb-6">
              You exited fullscreen mode. To maintain interview integrity,
              please return to fullscreen to continue your session.
            </p>
            <Button onClick={reEnterFullscreen} size="lg" className="w-full gap-2">
              <Maximize2 className="w-5 h-5" /> Return to Fullscreen
            </Button>
          </motion.div>
        </div>
      )}

      {/* Tab-switch violation banner */}
      {tabSwitchCount > 0 && (
        <div className={cn(
          "sticky top-0 z-50 text-center py-2 text-xs font-bold flex items-center justify-center gap-2 transition-colors",
          tabSwitchCount >= MAX_VIOLATIONS - 1
            ? "bg-red-600 text-white animate-pulse"
            : tabSwitchCount >= 3
            ? "bg-red-500/90 text-white"
            : "bg-amber-500/90 text-black"
        )}>
          <ShieldAlert className="w-4 h-4" />
          {tabSwitchCount >= MAX_VIOLATIONS
            ? "⛔ Interview terminated due to repeated violations!"
            : `⚠️ ${tabSwitchCount}/${MAX_VIOLATIONS} violations — ${MAX_VIOLATIONS - tabSwitchCount} remaining before auto-termination`
          }
        </div>
      )}

    <main className={cn("container mx-auto px-4 py-6 transition-all duration-500", isFullscreen ? "max-w-7xl" : "max-w-4xl")}>
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

      <div className={cn("grid gap-8 transition-all duration-500", isFullscreen ? "md:grid-cols-[400px_1fr]" : "md:grid-cols-[280px_1fr]")}>
        {/* Avatar rail */}
        <div className="flex md:flex-col items-center md:items-stretch gap-6">
          <div className="flex justify-center md:pt-4 transition-all duration-500">
            <AiAvatar state={avatarState} size={isFullscreen ? 280 : 200} />
          </div>
          <div className={cn("mx-auto w-32 md:w-full transition-all duration-500", isFullscreen ? "max-w-[400px]" : "max-w-[280px]")}>
            <WebcamView className="shadow-lg border-2 border-border/50 w-full" />
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
                {/* Code Mode Toggle (Only for Technical Questions) */}
                {currentQuestion?.category === 'technical' && (
                  <div className="flex justify-end mb-3">
                    <div className="flex items-center gap-1 bg-muted p-1 rounded-lg">
                      <Button
                        variant={!isCodeMode ? "secondary" : "ghost"}
                        size="sm"
                        className="h-7 text-xs px-3"
                        onClick={() => handleCodeModeToggle(false)}
                      >
                        <MessageSquare className="w-3 h-3 mr-1.5" />
                        Voice / Text
                      </Button>
                      <Button
                        variant={isCodeMode ? "secondary" : "ghost"}
                        size="sm"
                        className="h-7 text-xs px-3"
                        onClick={() => handleCodeModeToggle(true)}
                      >
                        <Code className="w-3 h-3 mr-1.5" />
                        Code Editor
                      </Button>
                    </div>
                  </div>
                )}

                {isCodeMode ? (
                  <div className="rounded-2xl border border-border overflow-hidden bg-card shadow-sm flex flex-col">
                     <div className="bg-muted px-4 py-2 border-b border-border flex items-center justify-between">
                       <span className="text-sm font-medium flex items-center gap-2">
                         <Code className="w-4 h-4 text-primary" />
                         Code Editor
                       </span>
                       <div className="flex items-center gap-2">
                         <select 
                           value={codeLanguage} 
                           onChange={(e) => handleLanguageChange(e.target.value)}
                           className="text-xs bg-background border border-border rounded-md px-2 py-1 outline-none"
                         >
                           <option value="javascript">JavaScript</option>
                           <option value="python">Python</option>
                           <option value="java">Java</option>
                           <option value="cpp">C++</option>
                           <option value="csharp">C#</option>
                           <option value="go">Go</option>
                           <option value="ruby">Ruby</option>
                           <option value="rust">Rust</option>
                           <option value="php">PHP</option>
                           <option value="swift">Swift</option>
                           <option value="typescript">TypeScript</option>
                           <option value="sql">SQL</option>
                           <option value="plaintext">Plain Text</option>
                         </select>
                         <Button 
                           variant="ghost" 
                           size="sm" 
                           className="h-7 w-7 p-0"
                           onClick={() => setIsEditorExpanded(!isEditorExpanded)}
                           title={isEditorExpanded ? "Minimize Editor" : "Maximize Editor"}
                         >
                           {isEditorExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                         </Button>
                       </div>
                     </div>
                     <div className={cn("w-full transition-all duration-200", isEditorExpanded ? "h-[65vh]" : "h-[300px]")}>
                       <Editor
                         height="100%"
                         language={codeLanguage}
                         theme="vs-dark"
                         value={draftAnswer}
                         onChange={(val) => setDraftAnswer(val || "")}
                         options={{
                           minimap: { enabled: false },
                           fontSize: 14,
                           wordWrap: "on",
                           scrollBeyondLastLine: false,
                           suggestOnTriggerCharacters: true,
                           quickSuggestions: true,
                           formatOnType: true,
                         }}
                       />
                     </div>
                     <div className="p-4 border-t border-border bg-card">
                        <Button
                          onClick={() => setPhase(PHASE.REVIEW)}
                          disabled={!draftAnswer.trim()}
                          className="w-full sm:w-auto"
                        >
                          Review Code <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                     </div>
                  </div>
                ) : (
                  isConversational && supported.recognition ? (
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
                        Review answer <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    </div>
                  )
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
                  {isCodeMode 
                    ? "Review your code before submitting. Ensure it handles edge cases."
                    : "Speech-to-text isn't perfect. Fix any wording so you're scored on what you meant."}
                </p>
                {isCodeMode ? (
                  <div className="h-[300px] w-full rounded-md overflow-hidden border border-border">
                    <Editor
                      height="100%"
                      language={codeLanguage}
                      theme="vs-dark"
                      value={draftAnswer}
                      onChange={(val) => {
                        setDraftAnswer(val || "");
                        setTranscriptManually(val || "");
                      }}
                      options={{
                        minimap: { enabled: false },
                        fontSize: 14,
                        wordWrap: "on",
                        scrollBeyondLastLine: false,
                        suggestOnTriggerCharacters: true,
                        quickSuggestions: true,
                        formatOnType: true,
                      }}
                    />
                  </div>
                ) : (
                  <Textarea
                    rows={6}
                    value={draftAnswer}
                    onChange={(e) => { setDraftAnswer(e.target.value); setTranscriptManually(e.target.value); }}
                    placeholder="Your answer…"
                  />
                )}
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
                    <summary className="flex items-center gap-1.5 cursor-pointer text-xs font-semibold text-foreground mb-2">
                      <Lightbulb className="w-4 h-4 text-primary" /> See a stronger example answer
                    </summary>
                    <div 
                      className="text-sm text-foreground leading-relaxed prose prose-sm dark:prose-invert max-w-none"
                      dangerouslySetInnerHTML={{
                        __html: DOMPurify.sanitize(marked.parse(feedback.improvedAnswer))
                      }}
                    />
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
    </div>
  );
}
