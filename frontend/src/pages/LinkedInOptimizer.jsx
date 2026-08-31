import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Briefcase, Loader2, Linkedin, Copy, CheckCircle2, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLinkedInOptimizer } from '@/hooks/useLinkedInOptimizer';
import { useResumes } from '@/hooks/useResumes';
import { toast } from 'sonner';

export default function LinkedInOptimizer() {
  const { data: resumes = [], isLoading: isLoadingResumes } = useResumes();
  const generateLinkedIn = useLinkedInOptimizer();
  
  const [selectedResumeId, setSelectedResumeId] = useState('');
  const [result, setResult] = useState(null);
  const [copiedSection, setCopiedSection] = useState(null);

  const primaryResume = resumes.find(r => r.isPrimary) || resumes[0];

  const handleGenerate = async () => {
    try {
      const targetResumeId = selectedResumeId || (primaryResume ? primaryResume._id : null);
      if (!targetResumeId) {
        toast.error("Please select a resume or upload one first.");
        return;
      }
      
      const response = await generateLinkedIn.mutateAsync({ resumeId: targetResumeId });
      setResult(response);
      toast.success("LinkedIn profile optimized successfully!");
    } catch (err) {
      toast.error(err.message || "Failed to optimize profile");
    }
  };

  const copyToClipboard = (text, section) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(section);
    toast.success(`Copied ${section} to clipboard!`);
    setTimeout(() => setCopiedSection(null), 2000);
  };

  return (
    <div className="container max-w-5xl py-12">
      <div className="mb-12">
        <h1 className="text-4xl font-bold mb-4 flex items-center gap-3">
          <div className="w-12 h-12 bg-[#0A66C2]/10 rounded-xl flex items-center justify-center">
            <Linkedin className="w-6 h-6 text-[#0A66C2]" />
          </div>
          LinkedIn Profile Optimizer
        </h1>
        <p className="text-xl text-muted-foreground">
          Transform your resume into a highly optimized, keyword-rich LinkedIn profile designed to attract top recruiters and hiring managers.
        </p>
      </div>

      {!result ? (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card border border-border rounded-xl p-8 shadow-sm max-w-2xl"
        >
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-primary" />
                Select Resume for Context
              </label>
              {isLoadingResumes ? (
                <div className="h-10 w-full bg-muted animate-pulse rounded-md"></div>
              ) : resumes.length === 0 ? (
                <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-md text-amber-600 dark:text-amber-400 text-sm">
                  You need to upload a resume first to use this feature.
                </div>
              ) : (
                <select
                  value={selectedResumeId}
                  onChange={(e) => setSelectedResumeId(e.target.value)}
                  className="w-full p-3 rounded-md border border-input bg-background focus:ring-2 focus:ring-primary/50 text-sm"
                >
                  <option value="">Use Primary Resume ({primaryResume?.title || 'None'})</option>
                  {resumes.map(r => (
                    <option key={r._id} value={r._id}>{r.title} {r.isPrimary ? '(Primary)' : ''}</option>
                  ))}
                </select>
              )}
            </div>

            <Button
              size="lg"
              className="w-full bg-[#0A66C2] hover:bg-[#084b90] text-white"
              onClick={handleGenerate}
              disabled={generateLinkedIn.isPending || resumes.length === 0}
            >
              {generateLinkedIn.isPending ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Analyzing Resume & Generating Profile...
                </>
              ) : (
                <>
                  <Linkedin className="w-5 h-5 mr-2" />
                  Optimize My LinkedIn Profile
                </>
              )}
            </Button>
            
            <p className="text-xs text-center text-muted-foreground mt-4">
              Our AI will extract your core skills, format a compelling headline, write an engaging "About" summary, and create impact-driven bullet points for your roles.
            </p>
          </div>
        </motion.div>
      ) : (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-8"
        >
          <div className="flex justify-between items-center bg-card p-4 rounded-xl border border-border shadow-sm">
            <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
              <CheckCircle2 className="w-5 h-5" />
              <span className="font-medium">Optimization Complete</span>
            </div>
            <Button variant="outline" size="sm" onClick={() => setResult(null)}>
              Optimize Another
            </Button>
          </div>

          {/* Headline */}
          <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
            <div className="bg-muted px-6 py-4 border-b border-border flex justify-between items-center">
              <h3 className="font-semibold text-lg">Headline</h3>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => copyToClipboard(result.headline, 'headline')}
              >
                {copiedSection === 'headline' ? <CheckCircle2 className="w-4 h-4 text-green-500 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
                {copiedSection === 'headline' ? 'Copied' : 'Copy'}
              </Button>
            </div>
            <div className="p-6">
              <p className="text-xl font-medium text-foreground">{result.headline}</p>
              <p className="text-xs text-muted-foreground mt-2">Max 220 characters. Paste this directly into your LinkedIn Headline section.</p>
            </div>
          </div>

          {/* About Section */}
          <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
            <div className="bg-muted px-6 py-4 border-b border-border flex justify-between items-center">
              <h3 className="font-semibold text-lg">About</h3>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => copyToClipboard(result.aboutSummary, 'about')}
              >
                {copiedSection === 'about' ? <CheckCircle2 className="w-4 h-4 text-green-500 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
                {copiedSection === 'about' ? 'Copied' : 'Copy'}
              </Button>
            </div>
            <div className="p-6">
              <div className="whitespace-pre-wrap text-foreground/90 leading-relaxed text-sm md:text-base">
                {result.aboutSummary}
              </div>
            </div>
          </div>

          {/* Experience Section */}
          <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
            <div className="bg-muted px-6 py-4 border-b border-border">
              <h3 className="font-semibold text-lg">Experience Bullet Points</h3>
              <p className="text-sm text-muted-foreground">Impact-driven, quantifiable achievements tailored for recruiters.</p>
            </div>
            <div className="divide-y divide-border">
              {result.experiences.map((exp, index) => (
                <div key={index} className="p-6 relative group">
                  <div className="absolute right-6 top-6 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => copyToClipboard(exp.optimizedBullets.join('\n'), `exp-${index}`)}
                    >
                      {copiedSection === `exp-${index}` ? <CheckCircle2 className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                    </Button>
                  </div>
                  <h4 className="font-bold text-lg mb-1">{exp.title}</h4>
                  <p className="text-primary font-medium mb-4">{exp.company}</p>
                  <ul className="space-y-3">
                    {exp.optimizedBullets.map((bullet, i) => (
                      <li key={i} className="flex items-start gap-3 text-sm md:text-base text-foreground/80">
                        <ChevronRight className="w-5 h-5 text-muted-foreground shrink-0 mt-0.5" />
                        <span>{bullet}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
