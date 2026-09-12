import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { fetchApi } from "@/services/api";
import { toast } from "react-toastify";
import { Mail, ArrowRight, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { Navbar } from "@/components/layout/Navbar";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSent, setIsSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) return;

    setIsLoading(true);
    try {
      await fetchApi("/auth/forgot-password", {
        method: "POST",
        body: JSON.stringify({ email })
      });
      setIsSent(true);
      toast.success("If that email exists, a reset link has been sent.");
    } catch (err) {
      toast.error(err.message || "Failed to send reset email.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 h-[calc(100vh-80px)] flex items-center justify-center">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md bg-card border border-border p-8 rounded-2xl shadow-card"
        >
          <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-6 mx-auto">
            <Mail className="w-6 h-6 text-primary" />
          </div>
          <h2 className="text-2xl font-bold text-center text-foreground mb-2">Forgot Password</h2>
          
          {isSent ? (
            <div className="text-center space-y-4">
              <p className="text-muted-foreground">
                We've sent an email to <span className="font-medium text-foreground">{email}</span> with a link to reset your password.
              </p>
              <Button variant="outline" className="w-full mt-4" onClick={() => setIsSent(false)}>
                Try another email
              </Button>
            </div>
          ) : (
            <>
              <p className="text-center text-muted-foreground mb-6">
                Enter the email associated with your account and we'll send you a link to reset your password.
              </p>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Input
                    type="email"
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={isLoading}
                  />
                </div>
                <Button type="submit" className="w-full h-11 bg-primary hover:bg-primary/90" disabled={isLoading}>
                  {isLoading ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : null}
                  {isLoading ? "Sending..." : "Send Reset Link"}
                </Button>
              </form>
            </>
          )}

          <div className="mt-6 text-center">
            <Link to="/login" className="text-sm font-medium text-primary hover:underline flex items-center justify-center gap-1">
              Back to login <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
