import { motion } from "framer-motion";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      
      <main className="flex-1 pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-12"
          >
            <h1 className="text-4xl md:text-5xl font-display font-bold text-foreground mb-4">
              Privacy <span className="text-primary">Policy</span>
            </h1>
            <p className="text-muted-foreground">Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="prose prose-slate dark:prose-invert max-w-none prose-headings:font-display prose-headings:font-bold prose-a:text-primary hover:prose-a:text-primary/80"
          >
            <p>
              At HireLens, we take your privacy seriously. This Privacy Policy describes how we collect, use, and protect your personal information when you use our AI-powered job matching platform.
            </p>

            <h2>1. Information We Collect</h2>
            <p>
              We collect information you provide directly to us when you create an account, upload a resume, fill out your profile, or communicate with us. This includes:
            </p>
            <ul>
              <li><strong>Contact Information:</strong> Name, email address, phone number.</li>
              <li><strong>Professional Information:</strong> Employment history, education, skills, resumes, and cover letters.</li>
              <li><strong>Usage Data:</strong> Information about how you interact with our services, search queries, and job applications.</li>
            </ul>

            <h2>2. How We Use Your Information</h2>
            <p>
              We use the information we collect to provide, maintain, and improve our services, including:
            </p>
            <ul>
              <li>Powering our AI matching algorithms to connect you with relevant job opportunities.</li>
              <li>Generating personalized insights, cover letters, and resume feedback.</li>
              <li>Communicating with you about job alerts, account updates, and promotional offers (if you opt-in).</li>
            </ul>

            <h2>3. AI Processing and Data Security</h2>
            <p>
              Your professional data is processed using advanced Large Language Models (LLMs) to extract skills and match you with jobs. We ensure that:
            </p>
            <ul>
              <li>Your data is never sold to third-party data brokers.</li>
              <li>We use industry-standard encryption to protect your data both in transit and at rest.</li>
              <li>Our AI models are designed to minimize bias and protect user anonymity where possible.</li>
            </ul>

            <h2>4. Your Rights</h2>
            <p>
              You have the right to access, update, or delete your personal information at any time. You can manage your data directly from your Account Dashboard. If you wish to completely remove your account and all associated data, you may contact our support team.
            </p>

            <h2>5. Contact Us</h2>
            <p>
              If you have any questions or concerns about this Privacy Policy, please contact us at <a href="mailto:privacy@hirelens.ai">privacy@hirelens.ai</a>.
            </p>
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default PrivacyPolicy;
