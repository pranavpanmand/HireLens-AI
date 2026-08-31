import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, Loader2, Target, Briefcase, ChevronDown, ChevronUp, Copy, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useStarStories } from '@/hooks/useStarStories';
import { useResumes } from '@/hooks/useResumes';
import { toast } from 'sonner';

export default function StarStories() {
  const { data: resumes = [], isLoading: isLoadingResumes } = useResumes();
  const generateStories = useStarStories();
  
  const [selectedResumeId, setSelectedResumeId] = useState('');
  const [targetRole, setTargetRole] = useState('');
  
  const [result, setResult] = useState(null);
  const [expandedStory, setExpandedStory] = useState(0);
  const [copiedSection, setCopiedSection] = useState(null);

  const primaryResume = resumes.find(r => r.isPrimary) || resumes[0];

  const handleGenerate = async (e) => {
    e.preventDefault();
    try {
      const targetResumeId = selectedResumeId || (primaryResume ? primaryResume._id : null);
      if (!targetResumeId) {
        toast.error("Please select a resume or upload one first.");
        return;
      }
      
      const response = await generateStories.mutateAsync({ 
        resumeId: targetResumeId,
        targetRole
      });
      setResult(response);
      setExpandedStory(0);
      toast.success("STAR Stories generated successfully!");
    } catch (err) {
      toast.error(err.message || "Failed to generate stories");
    }
  };

  const copyToClipboard = (story, index) => {
    const text = `Title: ${story.title}\nQuestion: ${story.questionAnswered}\n\nSituation: ${story.situation}\nTask: ${story.task}\nAction: ${story.action}\nResult: ${story.result}`;
    navigator.clipboard.writeText(text);
    setCopiedSection(index);
    toast.success("Story copied to clipboard!");
    setTimeout(() => setCopiedSection(null), 2000);
  };

  return (
    <div className="container max-w-5xl py-12">
      <div className="mb-12">
        <h1 className="text-4xl font-bold mb-4 flex items-center gap-3">
          <div className="w-12 h-12 bg-accent/10 rounded-xl flex items-center justify-center">
            <BookOpen className="w-6 h-6 text-accent" />
          </div>
          Behavioral STAR Stories
        </h1>
        <p className="text-xl text-muted-foreground">
          Turn your resume achievements into perfectly structured behavioral interview stories using the S.T.A.R. method.
        </p>
      </div>

      <div className="grid md:grid-cols-12 gap-8">
        <div className="md:col-span-4 space-y-6">
          <motion.form 
            onSubmit={handleGenerate}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-card border border-border rounded-xl p-6 shadow-sm space-y-5 sticky top-24"
          >
            <div>
              <label className="block text-sm font-medium mb-2">Resume Context</label>
              {isLoadingResumes ? (
                <div className="h-10 w-full bg-muted animate-pulse rounded-md"></div>
              ) : (
                <select
                  value={selectedResumeId}
                  onChange={(e) => setSelectedResumeId(e.target.value)}
                  className="w-full p-2.5 rounded-md border border-input bg-background text-sm focus:ring-2 focus:ring-primary/50"
                >
                  <option value="">Use Primary Resume ({primaryResume?.title || 'None'})</option>
                  {resumes.map(r => (
                    <option key={r._id} value={r._id}>{r.title} {r.isPrimary ? '(Primary)' : ''}</option>
                  ))}
                </select>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Target Role (Optional)</label>
              <div className="relative">
                <Target className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  value={targetRole}
                  onChange={(e) => setTargetRole(e.target.value)}
                  placeholder="e.g. Product Manager"
                  className="w-full pl-9 p-2.5 rounded-md border border-input bg-background text-sm focus:ring-2 focus:ring-primary/50"
                />
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Providing a role helps the AI extract stories that highlight the most relevant skills.
              </p>
            </div>

            <Button
              type="submit"
              className="w-full bg-gradient-primary"
              disabled={generateStories.isPending}
            >
              {generateStories.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Extracting Stories...
                </>
              ) : (
                "Generate STAR Stories"
              )}
            </Button>
          </motion.form>
        </div>

        <div className="md:col-span-8">
          {result ? (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              {result.stories.map((story, index) => (
                <div key={index} className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
                  <div 
                    className="p-5 flex items-center justify-between cursor-pointer hover:bg-muted/30 transition-colors"
                    onClick={() => setExpandedStory(expandedStory === index ? null : index)}
                  >
                    <div>
                      <h3 className="font-bold text-lg">{story.title}</h3>
                      <p className="text-sm text-primary font-medium mt-1">Answers: "{story.questionAnswered}"</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation();
                          copyToClipboard(story, index);
                        }}
                      >
                        {copiedSection === index ? <CheckCircle2 className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                      </Button>
                      {expandedStory === index ? (
                        <ChevronUp className="w-5 h-5 text-muted-foreground" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-muted-foreground" />
                      )}
                    </div>
                  </div>

                  <AnimatePresence>
                    {expandedStory === index && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden border-t border-border"
                      >
                        <div className="p-5 space-y-4 bg-background/50">
                          <div className="grid grid-cols-[100px_1fr] gap-4">
                            <div className="font-semibold text-blue-600 dark:text-blue-400">Situation</div>
                            <div className="text-foreground/90 leading-relaxed text-sm">{story.situation}</div>
                          </div>
                          
                          <div className="grid grid-cols-[100px_1fr] gap-4 pt-4 border-t border-border/50">
                            <div className="font-semibold text-amber-600 dark:text-amber-400">Task</div>
                            <div className="text-foreground/90 leading-relaxed text-sm">{story.task}</div>
                          </div>
                          
                          <div className="grid grid-cols-[100px_1fr] gap-4 pt-4 border-t border-border/50">
                            <div className="font-semibold text-purple-600 dark:text-purple-400">Action</div>
                            <div className="text-foreground/90 leading-relaxed text-sm">{story.action}</div>
                          </div>
                          
                          <div className="grid grid-cols-[100px_1fr] gap-4 pt-4 border-t border-border/50">
                            <div className="font-semibold text-emerald-600 dark:text-emerald-400">Result</div>
                            <div className="text-foreground/90 leading-relaxed text-sm font-medium">{story.result}</div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </motion.div>
          ) : (
            <div className="h-full min-h-[400px] border-2 border-dashed border-border rounded-xl flex flex-col items-center justify-center p-12 text-center text-muted-foreground bg-muted/10">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                <BookOpen className="w-8 h-8 opacity-50" />
              </div>
              <p className="font-medium text-lg text-foreground mb-2">No Stories Generated</p>
              <p className="max-w-sm text-sm">
                Select your resume on the left, and AI will analyze your past experiences to write out comprehensive behavioral STAR stories for your interviews.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
