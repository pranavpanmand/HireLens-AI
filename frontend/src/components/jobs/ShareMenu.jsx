import { useState, useEffect } from "react";
import { Share2, Link as LinkIcon, MessageCircle, Mail, Copy, Check } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { toast } from "react-toastify";

export function ShareMenu({ job }) {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isNativeShareSupported, setIsNativeShareSupported] = useState(false);

  // The public URL for this job
  const jobUrl = `${window.location.origin}/jobs/${job._id || job.id}`;
  const jobTitle = `${job.title} at ${job.company}`;

  useEffect(() => {
    // Check if the browser supports the native Web Share API
    if (navigator.share) {
      setIsNativeShareSupported(true);
    }
  }, []);

  const handleNativeShare = async (e) => {
    e.preventDefault();
    try {
      await navigator.share({
        title: jobTitle,
        text: `Check out this job: ${jobTitle}`,
        url: jobUrl,
      });
      toast.success("Shared successfully!");
    } catch (err) {
      // User cancelled or share failed, fallback handled implicitly
      console.log("Share failed or cancelled", err);
    }
  };

  const copyToClipboard = async (text, successMessage) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      toast.success(successMessage);
      setTimeout(() => {
        setCopied(false);
        setIsOpen(false);
      }, 1500);
    } catch (err) {
      toast.error("Failed to copy");
    }
  };

  const handleCopyLink = () => {
    copyToClipboard(jobUrl, "Link copied!");
  };

  const handleCopyText = () => {
    const text = `Job Opportunity: ${job.title}\nCompany: ${job.company}\nLocation: ${job.location || 'Not specified'}\nApply here: ${jobUrl}`;
    copyToClipboard(text, "Job summary copied!");
  };

  const handleWhatsApp = () => {
    const text = encodeURIComponent(`Check out this job: ${jobTitle} — ${jobUrl}`);
    window.open(`https://wa.me/?text=${text}`, '_blank');
    setIsOpen(false);
  };

  const handleEmail = () => {
    const subject = encodeURIComponent(`Job Opportunity: ${jobTitle}`);
    const body = encodeURIComponent(`Check out this job opportunity:\n\nTitle: ${job.title}\nCompany: ${job.company}\nLocation: ${job.location || 'Not specified'}\n\nView details and apply here: ${jobUrl}`);
    window.open(`mailto:?subject=${subject}&body=${body}`);
    setIsOpen(false);
  };

  // If native share is supported and we're on a mobile device, just use that directly
  if (isNativeShareSupported && window.innerWidth < 768) {
    return (
      <Button variant="ghost" size="icon" onClick={handleNativeShare} title="Share job" className="text-muted-foreground hover:text-primary">
        <Share2 className="w-4 h-4" />
      </Button>
    );
  }

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" title="Share job" className="text-muted-foreground hover:text-primary transition-colors">
          <Share2 className="w-4 h-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-56 p-2 bg-card border-border shadow-lg" align="end">
        <div className="flex flex-col space-y-1">
          <Button variant="ghost" className="justify-start px-2 py-1.5 h-auto font-normal text-sm" onClick={handleCopyLink}>
            {copied ? <Check className="w-4 h-4 mr-2 text-emerald-500" /> : <LinkIcon className="w-4 h-4 mr-2 text-muted-foreground" />}
            {copied ? "Copied!" : "Copy Link"}
          </Button>
          
          <Button variant="ghost" className="justify-start px-2 py-1.5 h-auto font-normal text-sm" onClick={handleWhatsApp}>
            <MessageCircle className="w-4 h-4 mr-2 text-emerald-500" />
            Share to WhatsApp
          </Button>
          
          <Button variant="ghost" className="justify-start px-2 py-1.5 h-auto font-normal text-sm" onClick={handleEmail}>
            <Mail className="w-4 h-4 mr-2 text-blue-500" />
            Share via Email
          </Button>
          
          <div className="h-px bg-border my-1 mx-2" />
          
          <Button variant="ghost" className="justify-start px-2 py-1.5 h-auto font-normal text-sm" onClick={handleCopyText}>
            <Copy className="w-4 h-4 mr-2 text-muted-foreground" />
            Copy formatted text
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
