import { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Loader2, Linkedin, Copy, CheckCircle2, User, Building2, Briefcase } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNetworkingGenerator } from '@/hooks/useNetworkingGenerator';
import { useResumes } from '@/hooks/useResumes';
import { toast } from 'sonner';

export default function NetworkingGenerator() {
  const { data: resumes = [], isLoading: isLoadingResumes } = useResumes();
  const generateMessage = useNetworkingGenerator();
  
  const [selectedResumeId, setSelectedResumeId] = useState('');
  const [targetRole, setTargetRole] = useState('');
  const [targetCompany, setTargetCompany] = useState('');
  const [recipientName, setRecipientName] = useState('');
  const [messageType, setMessageType] = useState('linkedin');
  
  const [result, setResult] = useState(null);
  const [copiedSection, setCopiedSection] = useState(null);

  const primaryResume = resumes.find(r => r.isPrimary) || resumes[0];

  const handleGenerate = async (e) => {
    e.preventDefault();
    if (!targetRole || !targetCompany) {
      toast.error("Please fill in the target role and company.");
      return;
    }

    try {
      const targetResumeId = selectedResumeId || (primaryResume ? primaryResume._id : null);
      if (!targetResumeId) {
        toast.error("Please select a resume or upload one first.");
        return;
      }
      
      const response = await generateMessage.mutateAsync({ 
        resumeId: targetResumeId,
        targetRole,
        targetCompany,
        recipientName,
        messageType
      });
      setResult(response);
      toast.success("Networking message generated successfully!");
    } catch (err) {
      toast.error(err.message || "Failed to generate message");
    }
  };

  const copyToClipboard = (text, section) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(section);
    toast.success("Copied to clipboard!");
    setTimeout(() => setCopiedSection(null), 2000);
  };

  return (
    <div className="container max-w-5xl py-12">
      <div className="mb-12">
        <h1 className="text-4xl font-bold mb-4 flex items-center gap-3">
          <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
            <Mail className="w-6 h-6 text-primary" />
          </div>
          Networking & Outreach AI
        </h1>
        <p className="text-xl text-muted-foreground">
          Generate highly personalized cold emails and LinkedIn connection requests tailored to specific recruiters and hiring managers.
        </p>
      </div>

      <div className="grid md:grid-cols-12 gap-8">
        <div className="md:col-span-5 space-y-6">
          <motion.form 
            onSubmit={handleGenerate}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-card border border-border rounded-xl p-6 shadow-sm space-y-5"
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
              <label className="block text-sm font-medium mb-2">Message Type</label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setMessageType('linkedin')}
                  className={`p-2 rounded-lg border text-xs flex flex-col items-center justify-center gap-1 transition-colors ${
                    messageType === 'linkedin' 
                      ? 'border-[#0A66C2] bg-[#0A66C2]/10 text-[#0A66C2]' 
                      : 'border-border hover:bg-muted text-muted-foreground'
                  }`}
                >
                  <Linkedin className="w-4 h-4" />
                  <span>LinkedIn</span>
                </button>
                <button
                  type="button"
                  onClick={() => setMessageType('email')}
                  className={`p-2 rounded-lg border text-xs flex flex-col items-center justify-center gap-1 transition-colors ${
                    messageType === 'email' 
                      ? 'border-primary bg-primary/10 text-primary' 
                      : 'border-border hover:bg-muted text-muted-foreground'
                  }`}
                >
                  <Mail className="w-4 h-4" />
                  <span>Cold Email</span>
                </button>
                <button
                  type="button"
                  onClick={() => setMessageType('followup')}
                  className={`p-2 rounded-lg border text-xs flex flex-col items-center justify-center gap-1 transition-colors ${
                    messageType === 'followup' 
                      ? 'border-accent bg-accent/10 text-accent' 
                      : 'border-border hover:bg-muted text-muted-foreground'
                  }`}
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Follow-Up</span>
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Target Role *</label>
              <div className="relative">
                <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  required
                  value={targetRole}
                  onChange={(e) => setTargetRole(e.target.value)}
                  placeholder="e.g. Frontend Developer"
                  className="w-full pl-9 p-2.5 rounded-md border border-input bg-background text-sm focus:ring-2 focus:ring-primary/50"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Target Company *</label>
              <div className="relative">
                <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  required
                  value={targetCompany}
                  onChange={(e) => setTargetCompany(e.target.value)}
                  placeholder="e.g. Google"
                  className="w-full pl-9 p-2.5 rounded-md border border-input bg-background text-sm focus:ring-2 focus:ring-primary/50"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Recipient Name (Optional)</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  value={recipientName}
                  onChange={(e) => setRecipientName(e.target.value)}
                  placeholder="e.g. Jane Doe"
                  className="w-full pl-9 p-2.5 rounded-md border border-input bg-background text-sm focus:ring-2 focus:ring-primary/50"
                />
              </div>
            </div>

            <Button
              type="submit"
              className="w-full bg-gradient-primary"
              disabled={generateMessage.isPending || !targetRole || !targetCompany}
            >
              {generateMessage.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Drafting Message...
                </>
              ) : (
                "Generate Message"
              )}
            </Button>
          </motion.form>
        </div>

        <div className="md:col-span-7">
          {result ? (
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-card border border-border rounded-xl shadow-sm overflow-hidden flex flex-col h-full"
            >
              <div className="bg-muted px-6 py-4 border-b border-border flex justify-between items-center">
                <h3 className="font-semibold text-lg flex items-center gap-2">
                  {messageType === 'linkedin' && <Linkedin className="w-5 h-5 text-[#0A66C2]" />}
                  {messageType === 'email' && <Mail className="w-5 h-5 text-primary" />}
                  {messageType === 'followup' && <CheckCircle2 className="w-5 h-5 text-accent" />}
                  Generated Output
                </h3>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => copyToClipboard(result.subject ? `${result.subject}\n\n${result.message}` : result.message, 'full')}
                >
                  {copiedSection === 'full' ? <CheckCircle2 className="w-4 h-4 text-green-500 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
                  {copiedSection === 'full' ? 'Copied' : 'Copy All'}
                </Button>
              </div>
              
              <div className="p-6 flex-1 bg-background/50">
                {result.subject && (
                  <div className="mb-4 pb-4 border-b border-border">
                    <p className="text-sm text-muted-foreground mb-1">Subject</p>
                    <p className="font-semibold">{result.subject}</p>
                  </div>
                )}
                
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Message Body</p>
                  <div className="whitespace-pre-wrap text-foreground/90 leading-relaxed font-mono text-sm bg-muted/30 p-4 rounded-lg border border-border/50">
                    {result.message}
                  </div>
                </div>
              </div>

              <div className="bg-primary/5 p-4 border-t border-primary/10">
                <div className="flex gap-3">
                  <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center shrink-0 mt-0.5">
                    <span className="text-xs font-bold text-primary">!</span>
                  </div>
                  <p className="text-sm text-primary/80 font-medium">
                    {result.tips}
                  </p>
                </div>
              </div>
            </motion.div>
          ) : (
            <div className="h-full border-2 border-dashed border-border rounded-xl flex flex-col items-center justify-center p-12 text-center text-muted-foreground bg-muted/10">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                <Mail className="w-8 h-8 opacity-50" />
              </div>
              <p className="font-medium text-lg text-foreground mb-2">No Message Generated Yet</p>
              <p className="max-w-sm text-sm">
                Fill out the target role and company details on the left, select your preferred format, and let AI draft the perfect networking message for you.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
