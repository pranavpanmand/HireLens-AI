import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, FileText, CheckCircle, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";






export const ResumeUploader = ({ onUpload, currentResume, currentResumeUrl, onView }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [showReplace, setShowReplace] = useState(false);
  const [isViewing, setIsViewing] = useState(false);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (file && file.type === "application/pdf") {
      handleFileUpload(file);
    }
  }, []);

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  const handleFileUpload = async (file) => {
    setIsUploading(true);
    setUploadedFile(file);

    // Simulate upload delay
    await new Promise((resolve) => setTimeout(resolve, 1500));

    onUpload(file);
    setIsUploading(false);
  };

  const removeFile = () => {
    setUploadedFile(null);
  };

  return (
    <div className="w-full">
      <AnimatePresence mode="wait">
        {uploadedFile ?
        <motion.div
          key="uploaded"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="p-6 rounded-2xl border-2 border-score-excellent/30 bg-score-excellent/5">
          
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-score-excellent/10 flex items-center justify-center">
                {isUploading ?
              <Loader2 className="w-7 h-7 text-score-excellent animate-spin" /> :

              <CheckCircle className="w-7 h-7 text-score-excellent" />
              }
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-foreground truncate">{uploadedFile.name}</p>
                <p className="text-sm text-muted-foreground">
                  {isUploading ? "Parsing resume..." : "Resume uploaded successfully"}
                </p>
              </div>
              {!isUploading &&
            <Button variant="ghost" size="icon" onClick={removeFile} className="flex-shrink-0">
                  <X className="w-5 h-5" />
                </Button>
            }
            </div>
          </motion.div> :

        (currentResume && !showReplace) ?
        <motion.div
          key="current"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="p-6 rounded-2xl border-2 border-primary/20 bg-primary/5">
          
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center">
                <FileText className="w-7 h-7 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-foreground truncate">{currentResume}</p>
                <p className="text-sm text-muted-foreground">
                  Primary Resume Active
                </p>
              </div>
              <div className="flex items-center gap-2">
                {onView && (
                  <Button variant="outline" size="sm" onClick={() => setIsViewing(!isViewing)}>
                    {isViewing ? "Hide" : "View"}
                  </Button>
                )}
                <Button variant="secondary" size="sm" onClick={() => setShowReplace(true)}>
                  Replace
                </Button>
              </div>
            </div>
            
            <AnimatePresence>
              {isViewing && currentResumeUrl && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 600 }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-6 w-full rounded-xl overflow-hidden border border-border"
                >
                  <iframe 
                    src={`${currentResumeUrl}#toolbar=0`} 
                    className="w-full h-full"
                    title="Resume Viewer"
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div> :

        <motion.label
          key="upload"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={cn(
            "block p-8 rounded-2xl border-2 border-dashed transition-all cursor-pointer",
            isDragging ?
            "border-primary bg-primary/5 scale-[1.02]" :
            "border-border hover:border-primary/50 hover:bg-muted/50"
          )}>
          
            <input
            type="file"
            accept=".pdf"
            onChange={handleFileSelect}
            className="hidden" />
          
            <div className="flex flex-col items-center text-center">
              <div className={cn(
              "w-16 h-16 rounded-2xl flex items-center justify-center mb-4 transition-colors",
              isDragging ? "bg-primary/10" : "bg-muted"
            )}>
                <Upload className={cn(
                "w-8 h-8 transition-colors",
                isDragging ? "text-primary" : "text-muted-foreground"
              )} />
              </div>
              <h3 className="font-display font-semibold text-lg text-foreground mb-2">
                {isDragging ? "Drop your resume here" : currentResume ? "Upload a new resume" : "Upload your resume"}
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                Drag and drop your PDF resume, or click to browse
              </p>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <FileText className="w-4 h-4" />
                <span>PDF format only, max 10MB</span>
              </div>
              {showReplace && currentResume && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="mt-4 text-xs h-8"
                  onClick={(e) => {
                    e.preventDefault();
                    setShowReplace(false);
                  }}
                >
                  Cancel Replace
                </Button>
              )}
            </div>
          </motion.label>
        }
      </AnimatePresence>
    </div>);

};