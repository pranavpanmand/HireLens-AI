import { useMemo, useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { toast } from "sonner";
import {
  Sparkles, ArrowLeft, Loader2, Briefcase, FileText, Target,
  MessagesSquare, ClipboardList, AlertCircle, Mic, Keyboard,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { cn } from "@/lib/utils";

import { useStartMockInterview } from "@/hooks/useMockInterview";
import { useSavedJobs } from "@/hooks/useSavedJobs";
import { speechSupport } from "@/hooks/useSpeech";

const MODES = [
  {
    value: "conversational",
    label: "Conversational Interview",
    description: "The interviewer reads each question aloud and you answer by speaking. Closest to the real thing.",
    icon: Mic,
  },
  {
    value: "structured",
    label: "Structured Practice",
    description: "Questions are shown as text and you type your answers. Quieter, and works without a microphone.",
    icon: Keyboard,
  },
];

const SOURCES = [
  { value: "General", label: "Target role", description: "Describe the role you're aiming for", icon: Target },
  { value: "Saved Job", label: "A saved job", description: "Use a job you've bookmarked", icon: Briefcase },
  { value: "Resume", label: "My resume", description: "Questions drawn from your own experience", icon: FileText },
];

const CATEGORIES = [
  { value: "Mixed", label: "Mixed" },
  { value: "Technical", label: "Technical" },
  { value: "Behavioral", label: "Behavioral" },
  { value: "HR", label: "HR / Managerial" },
];

const DIFFICULTIES = [
  { value: "Entry-Level", label: "Entry", hint: "Fundamentals" },
  { value: "Mid-Level", label: "Mid", hint: "Applied depth" },
  { value: "Senior", label: "Senior", hint: "Architecture & strategy" },
];

const QUESTION_COUNTS = [
  { value: 5, label: "5", hint: "~10 min" },
  { value: 10, label: "10", hint: "~20 min" },
  { value: 15, label: "15", hint: "~30 min" },
];

/** A selectable card used throughout the setup form. */
const OptionCard = ({ selected, onClick, icon: Icon, title, description, className }) => (
  <button
    type="button"
    onClick={onClick}
    aria-pressed={selected}
    className={cn(
      "text-left p-4 rounded-xl border-2 transition-all w-full",
      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
      selected
        ? "border-primary bg-primary/5 shadow-sm"
        : "border-border hover:border-primary/40 hover:bg-muted/50",
      className
    )}
  >
    <div className="flex items-start gap-3">
      {Icon && (
        <span
          className={cn(
            "shrink-0 w-9 h-9 rounded-lg grid place-items-center",
            selected ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
          )}
        >
          <Icon className="w-4.5 h-4.5" />
        </span>
      )}
      <span className="min-w-0">
        <span className="block text-sm font-semibold text-foreground">{title}</span>
        {description && (
          <span className="block text-xs text-muted-foreground mt-0.5 leading-relaxed">
            {description}
          </span>
        )}
      </span>
    </div>
  </button>
);

/** Compact segmented control for the short option lists. */
const Segmented = ({ options, value, onChange, label }) => (
  <fieldset>
    <legend className="text-sm font-semibold text-foreground mb-2">{label}</legend>
    <div className="grid grid-cols-3 gap-2">
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          aria-pressed={value === opt.value}
          onClick={() => onChange(opt.value)}
          className={cn(
            "px-3 py-2.5 rounded-lg border-2 text-sm font-medium transition-all",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
            value === opt.value
              ? "border-primary bg-primary/5 text-primary"
              : "border-border text-foreground hover:border-primary/40 hover:bg-muted/50"
          )}
        >
          <span className="block">{opt.label}</span>
          {opt.hint && (
            <span className="block text-[10px] font-normal text-muted-foreground mt-0.5">
              {opt.hint}
            </span>
          )}
        </button>
      ))}
    </div>
  </fieldset>
);

export default function InterviewSetup() {
  const navigate = useNavigate();
  const location = useLocation();
  const { mutate: startInterview, isPending, error: startError } = useStartMockInterview();
  const { data: savedJobsData, isLoading: savedJobsLoading } = useSavedJobs();

  // A job handed over from the Job Board ("Practice Interview") pre-fills the form.
  // It lands on the editable "Target role" source rather than "Saved Job" so that what
  // the user sees is exactly what gets sent — passing jobId would make the server
  // silently override any edit they make to the description below.
  const prefillJob = location.state?.job;

  const [mode, setMode] = useState(
    speechSupport.recognition ? "conversational" : "structured"
  );
  const [source, setSource] = useState("General");
  const [selectedJobId, setSelectedJobId] = useState("");
  const [jobTitle, setJobTitle] = useState(prefillJob?.title || "");
  const [company, setCompany] = useState(prefillJob?.company || "");
  const [jobDescription, setJobDescription] = useState(prefillJob?.description || "");
  const [category, setCategory] = useState("Mixed");
  const [difficulty, setDifficulty] = useState("Mid-Level");
  const [numberOfQuestions, setNumberOfQuestions] = useState(5);

  // Saved jobs come back either as raw saved-job docs or with `jobId` populated.
  const savedJobs = useMemo(() => {
    const raw = Array.isArray(savedJobsData) ? savedJobsData : savedJobsData?.savedJobs || [];
    return raw
      .map((entry) => {
        const job = entry?.jobId && typeof entry.jobId === "object" ? entry.jobId : entry?.job || entry;
        if (!job || typeof job !== "object") return null;
        const id = job._id || job.id;
        if (!id || !job.title) return null;
        return { id, title: job.title, company: job.company, description: job.description || "" };
      })
      .filter(Boolean);
  }, [savedJobsData]);

  const handlePickSavedJob = (job) => {
    setSelectedJobId(job.id);
    setJobTitle(job.title);
    setCompany(job.company || "");
    setJobDescription(job.description || "");
  };

  const handleSourceChange = (next) => {
    setSource(next);
    if (next !== "Saved Job") setSelectedJobId("");
  };

  const canSubmit =
    !isPending &&
    (source === "Resume" || jobTitle.trim().length > 1) &&
    (source !== "Saved Job" || Boolean(selectedJobId));

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!canSubmit) {
      if (source === "Saved Job" && !selectedJobId) toast.error("Pick a saved job to continue.");
      else toast.error("Add the role you want to practise for.");
      return;
    }

    startInterview(
      {
        jobId: source === "Saved Job" ? selectedJobId : undefined,
        jobTitle: jobTitle.trim() || "Target Position",
        company: company.trim(),
        jobDescription: jobDescription.trim(),
        interviewType: category,
        difficulty,
        numberOfQuestions: Number(numberOfQuestions),
        source,
      },
      {
        onSuccess: (session) => {
          const id = session?.id || session?._id;
          if (!id) {
            toast.error("The interview started but no session was returned. Please try again.");
            return;
          }
          navigate(`/interview/session/${id}`, { state: { mode }, replace: true });
        },
        onError: (err) =>
          toast.error(err?.message || "Could not start the interview. Please try again."),
      }
    );
  };

  return (
    <main className="container mx-auto px-4 py-8 max-w-3xl">
      <Button variant="ghost" size="sm" asChild className="mb-4 -ml-2">
        <Link to="/interview" className="gap-2">
          <ArrowLeft className="w-4 h-4" /> Interview Coach
        </Link>
      </Button>

      <header className="mb-8">
        <h1 className="text-2xl md:text-3xl font-display font-bold text-foreground">
          Set up your mock interview
        </h1>
        <p className="text-muted-foreground mt-1">
          Six choices, then you're in. Everything is scored and saved to your history.
        </p>
      </header>

      {!speechSupport.recognition && (
        <Alert className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Your browser doesn't support speech recognition, so we've selected{" "}
            <strong>Structured Practice</strong>. Chrome or Edge unlock the spoken interview.
          </AlertDescription>
        </Alert>
      )}

      {startError && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{startError.message}</AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Mode */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <MessagesSquare className="w-4 h-4 text-primary" /> How do you want to practise?
            </CardTitle>
          </CardHeader>
          <CardContent className="grid sm:grid-cols-2 gap-3">
            {MODES.map((m) => (
              <OptionCard
                key={m.value}
                selected={mode === m.value}
                onClick={() => setMode(m.value)}
                icon={m.icon}
                title={m.label}
                description={m.description}
              />
            ))}
          </CardContent>
        </Card>

        {/* Source */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <ClipboardList className="w-4 h-4 text-primary" /> What should the questions be based on?
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid sm:grid-cols-3 gap-3">
              {SOURCES.map((s) => (
                <OptionCard
                  key={s.value}
                  selected={source === s.value}
                  onClick={() => handleSourceChange(s.value)}
                  icon={s.icon}
                  title={s.label}
                  description={s.description}
                />
              ))}
            </div>

            {source === "Saved Job" && (
              <div className="pt-1">
                {savedJobsLoading ? (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground py-4">
                    <Loader2 className="w-4 h-4 animate-spin" /> Loading your saved jobs…
                  </div>
                ) : savedJobs.length === 0 ? (
                  <div className="text-center py-6 px-4 rounded-xl border border-dashed border-border">
                    <Briefcase className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm font-medium text-foreground">No saved jobs yet</p>
                    <p className="text-xs text-muted-foreground mt-1 mb-3">
                      Save a job from the Job Board and it'll show up here.
                    </p>
                    <Button type="button" variant="outline" size="sm" asChild>
                      <Link to="/jobs">Browse jobs</Link>
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                    {savedJobs.map((job) => (
                      <OptionCard
                        key={job.id}
                        selected={selectedJobId === job.id}
                        onClick={() => handlePickSavedJob(job)}
                        title={job.title}
                        description={job.company}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}

            {source === "Resume" && (
              <Alert>
                <FileText className="h-4 w-4" />
                <AlertDescription className="text-sm">
                  We'll use your primary resume. Add a role below to focus the questions, or leave it
                  blank for a general run-through of your experience.
                </AlertDescription>
              </Alert>
            )}

            {source !== "Saved Job" && (
              <div className="grid sm:grid-cols-2 gap-4 pt-1">
                <div>
                  <label htmlFor="job-title" className="text-sm font-medium text-foreground mb-1.5 block">
                    Role {source === "Resume" ? <span className="text-muted-foreground font-normal">(optional)</span> : "*"}
                  </label>
                  <Input
                    id="job-title"
                    placeholder="e.g. Frontend Engineer"
                    value={jobTitle}
                    onChange={(e) => setJobTitle(e.target.value)}
                  />
                </div>
                <div>
                  <label htmlFor="company" className="text-sm font-medium text-foreground mb-1.5 block">
                    Company <span className="text-muted-foreground font-normal">(optional)</span>
                  </label>
                  <Input
                    id="company"
                    placeholder="e.g. Stripe"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                  />
                </div>
                <div className="sm:col-span-2">
                  <label htmlFor="jd" className="text-sm font-medium text-foreground mb-1.5 block">
                    Job description <span className="text-muted-foreground font-normal">(optional — sharpens the questions)</span>
                  </label>
                  <Textarea
                    id="jd"
                    rows={4}
                    placeholder="Paste the JD or the key skills you'll be tested on…"
                    value={jobDescription}
                    onChange={(e) => setJobDescription(e.target.value)}
                  />
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Shape */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Shape of the interview</CardTitle>
            <CardDescription>Questions get harder as you go.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <fieldset>
              <legend className="text-sm font-semibold text-foreground mb-2">Category</legend>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {CATEGORIES.map((c) => (
                  <button
                    key={c.value}
                    type="button"
                    aria-pressed={category === c.value}
                    onClick={() => setCategory(c.value)}
                    className={cn(
                      "px-3 py-2.5 rounded-lg border-2 text-sm font-medium transition-all",
                      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                      category === c.value
                        ? "border-primary bg-primary/5 text-primary"
                        : "border-border text-foreground hover:border-primary/40 hover:bg-muted/50"
                    )}
                  >
                    {c.label}
                  </button>
                ))}
              </div>
            </fieldset>

            <Segmented
              label="Difficulty"
              options={DIFFICULTIES}
              value={difficulty}
              onChange={setDifficulty}
            />

            <Segmented
              label="Number of questions"
              options={QUESTION_COUNTS}
              value={numberOfQuestions}
              onChange={setNumberOfQuestions}
            />
          </CardContent>
        </Card>

        <div className="flex flex-col sm:flex-row gap-3 sm:justify-end pb-4">
          <Button type="button" variant="outline" asChild disabled={isPending}>
            <Link to="/interview">Cancel</Link>
          </Button>
          <Button type="submit" size="lg" disabled={!canSubmit} className="gap-2">
            {isPending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Writing your questions…
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                Start interview
              </>
            )}
          </Button>
        </div>
      </form>
    </main>
  );
}
