import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { fetchApi } from "@/services/api";
import { MailX, CheckCircle, ArrowRight, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { Navbar } from "@/components/layout/Navbar";

export default function Unsubscribe() {
  const { token } = useParams();
  const [status, setStatus] = useState("loading"); // loading, success, error
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const doUnsubscribe = async () => {
      try {
        await fetchApi(`/alerts/unsubscribe/${token}`);
        setStatus("success");
      } catch (err) {
        setStatus("error");
        setErrorMessage(err.message || "Invalid or expired link.");
      }
    };
    doUnsubscribe();
  }, [token]);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 h-[calc(100vh-80px)] flex items-center justify-center">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md bg-card border border-border p-8 rounded-2xl shadow-card text-center"
        >
          {status === "loading" && (
            <div className="flex flex-col items-center">
              <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
              <h2 className="text-2xl font-bold text-foreground">Processing...</h2>
              <p className="text-muted-foreground mt-2">Unsubscribing you from job alerts</p>
            </div>
          )}

          {status === "success" && (
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-6">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-foreground">Unsubscribed Successfully</h2>
              <p className="text-muted-foreground mt-2 mb-8">
                You will no longer receive weekly job matches in your inbox. You can re-enable alerts anytime from your Profile preferences.
              </p>
              <Button asChild className="w-full bg-primary hover:bg-primary/90">
                <Link to="/jobs">Browse Jobs <ArrowRight className="w-4 h-4 ml-2" /></Link>
              </Button>
            </div>
          )}

          {status === "error" && (
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mb-6">
                <MailX className="w-8 h-8 text-destructive" />
              </div>
              <h2 className="text-2xl font-bold text-foreground">Link Expired</h2>
              <p className="text-muted-foreground mt-2 mb-8">
                {errorMessage}
              </p>
              <Button asChild className="w-full">
                <Link to="/">Go Home</Link>
              </Button>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
