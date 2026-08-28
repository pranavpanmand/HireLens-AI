import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Mic, Send, Loader2, CheckCircle2, AlertTriangle, MessageSquare, Play, PlayCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useStartMockInterview, useSubmitAnswer } from "@/hooks/useMockInterview";
import { toast } from "sonner";
import { CircularProgress } from "@/components/ui/CircularProgress";

export function MockInterviewModal({ job, onClose }) {
  const [session, setSession] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answer, setAnswer] = useState("");
  const [feedback, setFeedback] = useState(null);
  const [isFinished, setIsFinished] = useState(false);

  const startInterview = useStartMockInterview();
  const submitAnswer = useSubmitAnswer();

  const handleStart = async () => {
    try {
      const data = await startInterview.mutateAsync(job.id);
      setSession(data);
    } catch (err) {
      toast.error(err.message || "Failed to start interview");
    }
  };

  const handleSubmit = async () => {
    if (!answer.trim()) {
      toast.error("Please provide an answer");
      return;
    }
    
    try {
      const result = await submitAnswer.mutateAsync({
        sessionId: session._id,
        questionIndex: currentQuestionIndex,
        answer
      });
      setFeedback(result.evaluation);
    } catch (err) {
      toast.error(err.message || "Failed to submit answer");
    }
  };

  const handleNext = () => {
    if (currentQuestionIndex < session.questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setAnswer("");
      setFeedback(null);
    } else {
      setIsFinished(true);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="bg-background w-full max-w-4xl max-h-[90vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-border relative"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border bg-card">
          <div>
            <h2 className="text-xl font-bold flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-primary" />
              AI Mock Interview
            </h2>
            <p className="text-sm text-muted-foreground mt-1">for {job.title} at {job.company}</p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 rounded-full hover:bg-muted text-muted-foreground transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {!session && !startInterview.isPending && (
            <div className="flex flex-col items-center justify-center h-full text-center py-12">
              <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mb-6">
                <PlayCircle className="w-10 h-10 text-primary" />
              </div>
              <h3 className="text-2xl font-bold mb-4">Ready for your interview?</h3>
              <p className="text-muted-foreground max-w-md mb-8">
                Our AI will ask you technical and behavioral questions tailored to this job description. You'll get instant, detailed feedback on every answer to help you improve.
              </p>
              <Button size="lg" onClick={handleStart} className="px-8 h-12 text-lg">
                Start Interview Now
              </Button>
            </div>
          )}

          {startInterview.isPending && (
            <div className="flex flex-col items-center justify-center h-full py-12">
              <Loader2 className="w-12 h-12 animate-spin text-primary mb-4" />
              <h3 className="text-xl font-semibold">Preparing Your Interview...</h3>
              <p className="text-muted-foreground mt-2">Analyzing the job description and generating tailored questions.</p>
            </div>
          )}

          {session && !isFinished && (
            <div className="space-y-6">
              <div className="flex justify-between items-center mb-2">
                <div className="text-sm font-medium text-muted-foreground">
                  Question {currentQuestionIndex + 1} of {session.questions.length}
                </div>
                <div className="text-sm font-bold px-3 py-1 rounded-full bg-primary/10 text-primary uppercase tracking-wider">
                  {session.questions[currentQuestionIndex].category}
                </div>
              </div>

              {/* Progress bar */}
              <div className="w-full h-2 bg-muted rounded-full overflow-hidden mb-6">
                <div 
                  className="h-full bg-primary transition-all duration-500" 
                  style={{ width: `${((currentQuestionIndex) / session.questions.length) * 100}%` }}
                />
              </div>

              {/* Question */}
              <div className="bg-primary/5 border border-primary/20 rounded-xl p-6 mb-6">
                <h3 className="text-2xl font-semibold text-foreground mb-4 leading-relaxed">
                  "{session.questions[currentQuestionIndex].question}"
                </h3>
                {session.questions[currentQuestionIndex].tips && (
                  <div className="flex items-start gap-2 text-sm text-muted-foreground bg-background/50 p-3 rounded-lg">
                    <LightbulbIcon className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
                    <p>{session.questions[currentQuestionIndex].tips}</p>
                  </div>
                )}
              </div>

              {/* Answer Area */}
              {!feedback ? (
                <div className="space-y-4">
                  <textarea
                    value={answer}
                    onChange={(e) => setAnswer(e.target.value)}
                    placeholder="Type your answer here... (Speak clearly and use the STAR method for behavioral questions)"
                    className="w-full h-48 p-4 rounded-xl border border-border bg-background focus:ring-2 focus:ring-primary/50 resize-none"
                  />
                  <div className="flex justify-end gap-3">
                    <Button 
                      onClick={handleSubmit} 
                      disabled={submitAnswer.isPending || !answer.trim()}
                      className="px-6"
                    >
                      {submitAnswer.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Send className="w-4 h-4 mr-2" />}
                      Submit Answer
                    </Button>
                  </div>
                </div>
              ) : (
                /* Feedback Area */
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-card border border-border rounded-xl overflow-hidden"
                >
                  <div className="bg-muted p-4 border-b border-border font-medium flex items-center justify-between">
                    <span>AI Feedback</span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">Score:</span>
                      <span className={`font-bold ${feedback.score >= 8 ? 'text-green-500' : feedback.score >= 5 ? 'text-orange-500' : 'text-red-500'}`}>
                        {feedback.score}/10
                      </span>
                    </div>
                  </div>
                  
                  <div className="p-6 space-y-6">
                    <div className="grid grid-cols-3 gap-4 mb-6">
                      <div className="bg-background rounded-lg p-3 text-center border border-border">
                        <div className="text-xs text-muted-foreground mb-1 uppercase tracking-wider">Clarity</div>
                        <div className="text-xl font-bold">{feedback.clarity}/10</div>
                      </div>
                      <div className="bg-background rounded-lg p-3 text-center border border-border">
                        <div className="text-xs text-muted-foreground mb-1 uppercase tracking-wider">Relevance</div>
                        <div className="text-xl font-bold">{feedback.relevance}/10</div>
                      </div>
                      <div className="bg-background rounded-lg p-3 text-center border border-border">
                        <div className="text-xs text-muted-foreground mb-1 uppercase tracking-wider">Specificity</div>
                        <div className="text-xl font-bold">{feedback.specificity}/10</div>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold mb-2 flex items-center gap-2">
                        <MessageSquare className="w-4 h-4 text-primary" /> Constructive Feedback
                      </h4>
                      <p className="text-foreground/80 leading-relaxed bg-primary/5 p-4 rounded-lg">
                        {feedback.feedback}
                      </p>
                    </div>

                    <div>
                      <h4 className="font-semibold mb-2 flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-green-500" /> Model Answer
                      </h4>
                      <p className="text-foreground/80 leading-relaxed bg-green-50 dark:bg-green-950/20 p-4 rounded-lg border border-green-100 dark:border-green-900">
                        {feedback.improvedAnswer}
                      </p>
                    </div>

                    <div className="flex justify-end pt-4 border-t border-border">
                      <Button onClick={handleNext} className="px-8">
                        {currentQuestionIndex < session.questions.length - 1 ? "Next Question" : "Finish Interview"}
                      </Button>
                    </div>
                  </div>
                </motion.div>
              )}
            </div>
          )}

          {isFinished && (
            <div className="flex flex-col items-center justify-center h-full text-center py-12">
              <div className="w-20 h-20 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mb-6">
                <CheckCircle2 className="w-10 h-10 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="text-2xl font-bold mb-4">Interview Complete!</h3>
              <p className="text-muted-foreground max-w-md mb-8">
                Great job practicing. You can review all your answers and feedback in your dashboard.
              </p>
              <Button size="lg" onClick={onClose} className="px-8">
                Return to Job
              </Button>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}

function LightbulbIcon(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.9 1.3 1.5 1.5 2.5" />
      <path d="M9 18h6" />
      <path d="M10 22h4" />
    </svg>
  )
}
