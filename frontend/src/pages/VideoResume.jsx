import { useState, useRef, useEffect } from "react";
import { PageTransition } from "@/components/layout/PageTransition";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Video, Mic, Square, Play, Download, Trash2, Camera, Sparkles } from "lucide-react";
import { useProfile } from "@/hooks/useProfile";
import { toast } from "sonner";

const VideoResume = () => {
  const { data: profile } = useProfile();
  
  const videoRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordedChunks, setRecordedChunks] = useState([]);
  const [videoURL, setVideoURL] = useState(null);
  const [cameraEnabled, setCameraEnabled] = useState(false);

  useEffect(() => {
    return () => {
      // Cleanup stream on unmount
      if (videoRef.current && videoRef.current.srcObject) {
        const tracks = videoRef.current.srcObject.getTracks();
        tracks.forEach(track => track.stop());
      }
    };
  }, []);

  const enableCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setCameraEnabled(true);
    } catch (err) {
      console.error(err);
      toast.error("Could not access camera/microphone. Please check permissions.");
    }
  };

  const startRecording = () => {
    setRecordedChunks([]);
    const stream = videoRef.current.srcObject;
    const mediaRecorder = new MediaRecorder(stream, { mimeType: 'video/webm' });

    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        setRecordedChunks((prev) => [...prev, event.data]);
      }
    };

    mediaRecorder.onstop = () => {
      // Create blob when recording stops (handled in useEffect below to ensure state is updated)
    };

    mediaRecorderRef.current = mediaRecorder;
    mediaRecorder.start();
    setIsRecording(true);
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  useEffect(() => {
    if (!isRecording && recordedChunks.length > 0) {
      const blob = new Blob(recordedChunks, { type: "video/webm" });
      const url = URL.createObjectURL(blob);
      setVideoURL(url);
    }
  }, [recordedChunks, isRecording]);

  const discardRecording = () => {
    setVideoURL(null);
    setRecordedChunks([]);
    // Re-enable live camera preview
    if (cameraEnabled && videoRef.current && !videoRef.current.srcObject) {
      enableCamera();
    }
  };

  const teleprompterText = profile?.summary || "Hi, my name is [Your Name]. I am a passionate professional with expertise in [Your Field]. I am excited to bring my skills in [Skill 1] and [Skill 2] to a dynamic team. I am a quick learner and thrive in collaborative environments.";

  return (
    <PageTransition>
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="mb-8">
          <div className="inline-flex items-center justify-center p-3 bg-red-500/10 rounded-2xl mb-4">
            <Video className="w-8 h-8 text-red-500" />
          </div>
          <h1 className="text-4xl font-bold mb-2">Video Resume Studio</h1>
          <p className="text-muted-foreground text-lg">
            Record a short, professional video introduction to stand out to recruiters.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Main Video Area */}
          <div className="md:col-span-2 space-y-6">
            <Card className="bg-card shadow-card overflow-hidden border-0">
              <div className="aspect-video bg-black relative flex items-center justify-center overflow-hidden">
                {!videoURL ? (
                  <>
                    <video 
                      ref={videoRef}
                      autoPlay 
                      playsInline 
                      muted 
                      className={`w-full h-full object-cover ${cameraEnabled ? 'opacity-100' : 'opacity-0'}`}
                      style={{ transform: 'scaleX(-1)' }} // Mirror effect
                    />
                    {!cameraEnabled && (
                      <div className="absolute inset-0 flex flex-col items-center justify-center text-white/50">
                        <Camera className="w-16 h-16 mb-4" />
                        <p>Camera is disabled</p>
                      </div>
                    )}
                    {isRecording && (
                      <div className="absolute top-4 right-4 flex items-center gap-2 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-full text-white text-sm font-medium animate-pulse">
                        <div className="w-2.5 h-2.5 rounded-full bg-red-500" /> Recording
                      </div>
                    )}
                  </>
                ) : (
                  <video 
                    src={videoURL} 
                    controls 
                    className="w-full h-full object-contain bg-black"
                  />
                )}
              </div>
              <CardContent className="p-4 border-t border-border/50 bg-muted/20">
                <div className="flex items-center justify-center gap-4">
                  {!cameraEnabled && !videoURL ? (
                    <Button onClick={enableCamera} className="bg-gradient-primary">
                      <Camera className="w-4 h-4 mr-2" /> Enable Camera
                    </Button>
                  ) : !videoURL ? (
                    <>
                      {!isRecording ? (
                        <Button 
                          onClick={startRecording} 
                          className="bg-red-500 hover:bg-red-600 text-white shadow-lg w-40"
                        >
                          <div className="w-3 h-3 rounded-full bg-white mr-2" /> Start Recording
                        </Button>
                      ) : (
                        <Button 
                          onClick={stopRecording} 
                          variant="secondary"
                          className="w-40"
                        >
                          <Square className="w-4 h-4 mr-2" /> Stop
                        </Button>
                      )}
                    </>
                  ) : (
                    <>
                      <Button variant="outline" onClick={discardRecording} className="text-destructive hover:bg-destructive/10 hover:text-destructive">
                        <Trash2 className="w-4 h-4 mr-2" /> Discard
                      </Button>
                      <Button className="bg-gradient-primary">
                        <Download className="w-4 h-4 mr-2" /> Download Video
                      </Button>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Teleprompter */}
          <div className="md:col-span-1">
            <Card className="bg-card shadow-card h-full flex flex-col border-primary/20">
              <CardHeader className="border-b border-border/50 pb-4">
                <CardTitle className="flex items-center gap-2 text-primary">
                  <Sparkles className="w-5 h-5" /> Teleprompter
                </CardTitle>
                <CardDescription>Read this script while recording. It is based on your profile summary.</CardDescription>
              </CardHeader>
              <CardContent className="flex-1 p-0 overflow-hidden relative">
                <div className="absolute inset-0 p-6 overflow-y-auto custom-scrollbar">
                  <p className="text-xl leading-relaxed text-foreground/90 font-medium whitespace-pre-wrap">
                    {teleprompterText}
                  </p>
                </div>
                {/* Fade effect at the bottom */}
                <div className="absolute bottom-0 left-0 w-full h-12 bg-gradient-to-t from-card to-transparent pointer-events-none" />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </PageTransition>
  );
};

export default VideoResume;
