import { useEffect, useRef, useState } from "react";
import { Camera, CameraOff } from "lucide-react";
import { cn } from "@/lib/utils";

export function WebcamView({ className }) {
  const videoRef = useRef(null);
  const [hasCamera, setHasCamera] = useState(true);
  const [stream, setStream] = useState(null);

  useEffect(() => {
    let activeStream = null;

    const startCamera = async () => {
      try {
        const s = await navigator.mediaDevices.getUserMedia({ video: true });
        setStream(s);
        activeStream = s;
        if (videoRef.current) {
          videoRef.current.srcObject = s;
        }
      } catch (err) {
        console.warn("Camera access denied or unavailable", err);
        setHasCamera(false);
      }
    };

    startCamera();

    return () => {
      if (activeStream) {
        activeStream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  if (!hasCamera) {
    return (
      <div className={cn("flex flex-col items-center justify-center bg-muted rounded-xl border border-border aspect-video", className)}>
        <CameraOff className="w-6 h-6 text-muted-foreground mb-2" />
        <span className="text-xs text-muted-foreground">Camera off</span>
      </div>
    );
  }

  return (
    <div className={cn("relative rounded-xl overflow-hidden border border-border bg-black aspect-video", className)}>
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="w-full h-full object-cover"
        style={{ transform: 'scaleX(-1)' }}
      />
      <div className="absolute bottom-2 left-2 flex items-center gap-1.5 bg-black/50 backdrop-blur-sm px-2 py-1 rounded-md">
        <Camera className="w-3 h-3 text-white" />
        <span className="text-[10px] font-medium text-white tracking-wide">YOU</span>
      </div>
    </div>
  );
}
