import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { useAuth } from "@/contexts/AuthContext";
import { useProfile, useUploadPhoto, useDeletePhoto } from "@/hooks/useProfile";
import { BasicInfoModal, CareerPreferencesModal, SkillsModal, EducationModal, ExperienceModal, ProjectsModal, SummaryModal, LanguagesModal, AccomplishmentsModal } from "@/components/profile/ProfileEditModals";
import { ResumeUploader } from "@/components/resume/ResumeUploader";
import { Edit2, Plus, MapPin, Phone, Mail, FileText, CheckCircle2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useResumes, useUploadResume } from "@/hooks/useResumes";
import { StaggeredText } from "@/components/ui/StaggeredText";
import { Reveal } from "@/components/ui/Reveal";

const SECTIONS = [
  { id: "summary", label: "Profile summary" },
  { id: "preference", label: "Preferences" },
  { id: "education", label: "Education" },
  { id: "experience", label: "Experience & Internships" },
  { id: "projects", label: "Projects" },
  { id: "skills", label: "Key skills" },
  { id: "languages", label: "Languages" },
  { id: "accomplishments", label: "Accomplishments" },
  { id: "resume", label: "Resume" },
  { id: "danger-zone", label: "Danger Zone" }
];

export default function Profile() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { data: profile, isLoading } = useProfile();
  const uploadPhoto = useUploadPhoto();
  const deletePhoto = useDeletePhoto();
  const [isHoveringPhoto, setIsHoveringPhoto] = useState(false);

  // Modal states
  const [showBasicInfoModal, setShowBasicInfoModal] = useState(false);
  const [showPrefsModal, setShowPrefsModal] = useState(false);
  const [showSkillsModal, setShowSkillsModal] = useState(false);
  const [showEducationModal, setShowEducationModal] = useState(false);
  const [showExperienceModal, setShowExperienceModal] = useState(false);
  const [showProjectsModal, setShowProjectsModal] = useState(false);
  const [showSummaryModal, setShowSummaryModal] = useState(false);
  const [showLanguagesModal, setShowLanguagesModal] = useState(false);
  const [showAccomplishmentsModal, setShowAccomplishmentsModal] = useState(false);

  const { data: resumes } = useResumes();
  const primaryResume = resumes?.find(r => r.is_primary) || resumes?.[0];
  const uploadResume = useUploadResume();

  const handleResumeUpload = async (file) => {
    await uploadResume.mutateAsync(file);
  };
  
  // Calculate completion percentage
  const calculateCompletion = () => {
    let score = 0;
    let missing = 0;
    if (user?.fullName) score += 10; else missing++;
    if (profile?.education?.length > 0) score += 20; else missing++;
    if (profile?.skills?.length > 0) score += 20; else missing++;
    if (profile?.careerPreferences) score += 10; else missing++;
    if (profile?.projects?.length > 0) score += 15; else missing++;
    if (profile?.languages?.length > 0) score += 5; else missing++;
    // Profile photo adds 20
    if (profile?.profilePhotoUrl) score += 20; else missing++;
    
    return { percent: Math.min(score, 100), missingDetails: missing };
  };

  const { percent, missingDetails } = isLoading ? { percent: 0, missingDetails: 7 } : calculateCompletion();

  const handlePhotoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert("File must be less than 5MB");
        return;
      }
      await uploadPhoto.mutateAsync(file);
    }
  };

  const handleRemovePhoto = async (e) => {
    e.stopPropagation();
    if (confirm("Are you sure you want to remove your profile photo?")) {
      await deletePhoto.mutateAsync();
    }
  };

  const handleScrollToSection = (e, id) => {
    e.preventDefault();
    const element = document.getElementById(id);
    if (element) {
      const y = element.getBoundingClientRect().top + window.pageYOffset - 100;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-6xl">
          
          {/* Top Profile Card */}
          <div className="bg-card rounded-2xl p-8 shadow-sm border border-border mb-6 flex flex-col md:flex-row items-start gap-8">
            {/* Left: Photo & Progress */}
            <div className="relative flex-shrink-0">
              <svg className="w-32 h-32 transform -rotate-90">
                <circle
                  cx="64" cy="64" r="60"
                  className="stroke-muted" strokeWidth="6" fill="none"
                />
                <circle
                  cx="64" cy="64" r="60"
                  className="stroke-primary transition-all duration-1000 ease-out"
                  strokeWidth="6" fill="none"
                  strokeDasharray="377"
                  strokeDashoffset={377 - (377 * percent) / 100}
                />
              </svg>
              
              <label 
                className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[110px] h-[110px] bg-muted/30 rounded-full flex flex-col items-center justify-center cursor-pointer overflow-hidden group"
                onMouseEnter={() => setIsHoveringPhoto(true)}
                onMouseLeave={() => setIsHoveringPhoto(false)}
              >
                <input type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} disabled={uploadPhoto.isPending} />
                
                {profile?.profilePhotoUrl ? (
                  <>
                    <img src={profile.profilePhotoUrl} alt="Profile" className="w-full h-full object-cover" />
                    {isHoveringPhoto && (
                      <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center text-white transition-opacity">
                        <Edit2 className="w-5 h-5 mb-1" />
                        <span className="text-[10px] font-medium">Change</span>
                        <button 
                          onClick={handleRemovePhoto}
                          className="absolute top-2 right-2 p-1 bg-destructive rounded-full hover:bg-destructive/90 transition"
                          title="Remove photo"
                        >
                          <Plus className="w-3 h-3 transform rotate-45" />
                        </button>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center text-muted-foreground group-hover:text-primary transition">
                    {uploadPhoto.isPending ? (
                      <span className="text-xs font-medium animate-pulse">Uploading...</span>
                    ) : (
                      <>
                        <Plus className="w-6 h-6 mb-1" />
                        <span className="text-xs font-medium">Add photo</span>
                      </>
                    )}
                  </div>
                )}
              </label>
              <div className="absolute -bottom-3 left-1/2 transform -translate-x-1/2 bg-background px-2 text-xs font-bold text-primary">
                {percent}%
              </div>
            </div>

            {/* Middle: Details */}
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <StaggeredText 
                  text={user?.fullName || "Your Name"} 
                  className="font-display text-2xl font-bold text-foreground" 
                />
                <button onClick={() => setShowBasicInfoModal(true)} className="flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-primary transition ml-4">
                  <Edit2 className="w-4 h-4" />
                  Edit
                </button>
              </div>
              <p className="text-muted-foreground mb-4">{profile?.education?.[0]?.degree || "Add Education"} • {profile?.education?.[0]?.institution || ""}</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-y-3 gap-x-8 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-muted-foreground/70" />
                  {profile?.location || "Add Location"}
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-muted-foreground/70" />
                  {profile?.phone || "Add Phone"}
                  {profile?.phone && <span className="text-primary font-medium text-xs ml-1 cursor-pointer" onClick={() => setShowBasicInfoModal(true)}>Verify</span>}
                </div>
                <div className="flex items-center gap-2 md:col-span-2">
                  <Mail className="w-4 h-4 text-muted-foreground/70" />
                  {user?.email}
                  <CheckCircle2 className="w-4 h-4 text-green-500 ml-1" />
                </div>
              </div>
            </div>

            {/* Right: Missing details actions */}
            <div className="w-full md:w-64 bg-accent/20 rounded-xl p-5 border border-accent/30">
              <div className="space-y-3 mb-4">
                <div className="flex items-center justify-between text-sm cursor-pointer hover:bg-muted/50 p-1 -mx-1 rounded" onClick={() => setShowBasicInfoModal(true)}>
                  <div className="flex items-center gap-2 text-foreground/80"><CheckCircle2 className="w-4 h-4 text-muted-foreground/70" /> Verify mobile</div>
                  <span className="text-green-600 font-medium">↑ 2%</span>
                </div>
                <div className="flex items-center justify-between text-sm cursor-pointer hover:bg-muted/50 p-1 -mx-1 rounded" onClick={() => setShowBasicInfoModal(true)}>
                  <div className="flex items-center gap-2 text-foreground/80"><Plus className="w-4 h-4 text-muted-foreground/70" /> Add details</div>
                  <span className="text-green-600 font-medium">↑ 8%</span>
                </div>
              </div>
              <Button className="w-full rounded-full font-medium" onClick={() => setShowBasicInfoModal(true)}>
                Add {missingDetails} missing details
              </Button>
            </div>
          </div>

          <div className="flex flex-col md:flex-row gap-6 items-start">
            {/* Quick Links Sidebar */}
            <Reveal delay={0.2} width="100%" className="md:w-64 shrink-0">
              <div className="w-full bg-card rounded-2xl shadow-sm border border-border sticky top-24 overflow-hidden">
                <div className="p-4 border-b border-border bg-muted/20 hidden md:block">
                  <h3 className="font-bold text-foreground">Quick links</h3>
                </div>
                <nav className="py-2 flex flex-row overflow-x-auto hide-scrollbar md:flex-col p-2 md:p-0">
                  {SECTIONS.map(section => (
                    <a
                      key={section.id}
                      href={`#${section.id}`}
                      onClick={(e) => handleScrollToSection(e, section.id)}
                      className="flex-shrink-0 flex items-center justify-between px-4 py-2 md:px-6 md:py-3 text-sm text-muted-foreground hover:text-primary hover:bg-primary/5 transition-colors group rounded-full md:rounded-none border border-border md:border-none mr-2 md:mr-0"
                    >
                      {section.label}
                      <span className="hidden md:inline text-primary font-medium opacity-0 group-hover:opacity-100 transition-opacity">Add</span>
                    </a>
                  ))}
                </nav>
              </div>
            </Reveal>

            {/* Main Content Area */}
            <Reveal delay={0.3} width="100%">
              <div className="flex-1 space-y-6">
                
                {/* Profile Summary */}
                <section id="summary" className="bg-card rounded-2xl p-6 shadow-sm border border-border">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-bold text-foreground">Profile summary</h2>
                    <button onClick={() => setShowSummaryModal(true)} className="text-primary text-sm font-medium hover:underline">Edit</button>
                  </div>
                  <div className="text-sm text-foreground/90 leading-relaxed whitespace-pre-wrap">
                    {profile?.summary || <span className="text-muted-foreground">Your Profile Summary should mention the highlights of your career and education, what your professional interests are, and what kind of a career you are looking for. Write a meaningful summary of more than 50 characters.</span>}
                  </div>
                </section>
                
                {/* Career Preferences */}
                <section id="preference" className="bg-card rounded-2xl p-6 shadow-sm border border-border">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-bold text-foreground">Your career preferences</h2>
                    <button onClick={() => setShowPrefsModal(true)} className="text-primary text-sm font-medium hover:underline">Edit</button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                    <div>
                      <p className="text-muted-foreground mb-1">Preferred job type</p>
                      <p className="font-medium text-foreground">{profile?.careerPreferences?.preferredJobType || "Not specified"}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground mb-1">Availability to work</p>
                      <p className="font-medium text-foreground">{profile?.careerPreferences?.availability || "Not specified"}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground mb-1">Preferred location</p>
                      <p className="font-medium text-foreground">{profile?.careerPreferences?.preferredLocation || "Not specified"}</p>
                    </div>
                  </div>
                </section>

                {/* Education */}
                <section id="education" className="bg-card rounded-2xl p-6 shadow-sm border border-border">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-bold text-foreground">Education</h2>
                    <button onClick={() => setShowEducationModal(true)} className="text-primary text-sm font-medium hover:underline">Add / Edit</button>
                  </div>
                  <div className="text-muted-foreground text-sm">
                    {profile?.education?.length > 0 ? (
                      profile.education.map((edu, i) => (
                        <div key={i} className="mb-4 last:mb-0">
                          <h4 className="font-bold text-foreground text-base">{edu.degree} in {edu.fieldOfStudy}</h4>
                          <p>{edu.institution}</p>
                          <p className="text-muted-foreground mt-1">{edu.startYear} - {edu.isCurrent ? "Present" : edu.endYear}</p>
                        </div>
                      ))
                    ) : (
                      <p>Details like course, university, and more help recruiters identify your educational background</p>
                    )}
                  </div>
                </section>

                {/* Experience & Internships */}
                <section id="experience" className="bg-card rounded-2xl p-6 shadow-sm border border-border">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-bold text-foreground">Experience & Internships</h2>
                    <button onClick={() => setShowExperienceModal(true)} className="text-primary text-sm font-medium hover:underline">Add / Edit</button>
                  </div>
                  <div className="text-muted-foreground text-sm">
                    {profile?.experience?.length > 0 ? (
                      profile.experience.map((exp, i) => (
                        <div key={i} className="mb-4 last:mb-0">
                          <h4 className="font-bold text-foreground text-base">{exp.position || exp.title}</h4>
                          <p className="font-medium">{exp.company}</p>
                          <p className="text-muted-foreground mt-1">
                            {exp.startDate ? new Date(exp.startDate).toLocaleDateString(undefined, { year: 'numeric', month: 'short' }) : (exp.startMonth + " " + exp.startYear)} 
                            {" - "} 
                            {exp.isCurrent ? "Present" : (exp.endDate ? new Date(exp.endDate).toLocaleDateString(undefined, { year: 'numeric', month: 'short' }) : `${exp.endMonth} ${exp.endYear}`)}
                          </p>
                          {exp.description && <p className="mt-2 text-foreground/80">{exp.description}</p>}
                        </div>
                      ))
                    ) : (
                      <p>Highlight your professional experience and internships to stand out to employers</p>
                    )}
                  </div>
                </section>

                {/* Projects */}
                <section id="projects" className="bg-card rounded-2xl p-6 shadow-sm border border-border">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-bold text-foreground">Projects</h2>
                    <button onClick={() => setShowProjectsModal(true)} className="text-primary text-sm font-medium hover:underline">Add / Edit</button>
                  </div>
                  <div className="text-muted-foreground text-sm">
                    {profile?.projects?.length > 0 ? (
                      profile.projects.map((proj, i) => (
                        <div key={i} className="mb-4 last:mb-0">
                          <div className="flex items-center justify-between">
                            <h4 className="font-bold text-foreground text-base">{proj.name}</h4>
                            { (proj.liveUrl || proj.link) && <a href={proj.liveUrl || proj.link} target="_blank" rel="noopener noreferrer" className="text-primary text-xs hover:underline">View Project</a>}
                          </div>
                          {proj.description && <p className="mt-2 text-foreground/80">{proj.description}</p>}
                        </div>
                      ))
                    ) : (
                      <p>Showcase your hands-on work and technical abilities</p>
                    )}
                  </div>
                </section>

                {/* Key Skills */}
                <section id="skills" className="bg-card rounded-2xl p-6 shadow-sm border border-border">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-bold text-foreground">Key skills</h2>
                    <button onClick={() => setShowSkillsModal(true)} className="text-primary text-sm font-medium hover:underline">Edit</button>
                  </div>
                  {profile?.skills?.length > 0 ? (
                    <div className="flex flex-wrap gap-2 mt-3">
                      {profile.skills.map((skill) => (
                        <span key={skill} className="px-3 py-1.5 bg-muted border border-border text-foreground text-sm rounded-full shadow-sm hover:shadow-md transition">
                          {skill}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground text-sm">Tell recruiters what you know or what you are known for e.g. Direct Marketing, Oracle, Java etc.</p>
                  )}
                </section>

                {/* Languages */}
                <section id="languages" className="bg-card rounded-2xl p-6 shadow-sm border border-border">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-bold text-foreground">Languages</h2>
                    <button onClick={() => setShowLanguagesModal(true)} className="text-primary text-sm font-medium hover:underline">Add / Edit</button>
                  </div>
                  <div className="text-muted-foreground text-sm">
                    {profile?.languages?.length > 0 ? (
                      <div className="space-y-2">
                        {profile.languages.map((lang, i) => (
                          <div key={i} className="flex items-center justify-between bg-muted/50 p-3 rounded-xl">
                            <span className="font-semibold text-foreground">{lang.language}</span>
                            <span className="text-primary bg-primary/10 px-2 py-1 rounded-md text-xs font-bold">{lang.proficiency}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p>Showcase your language proficiencies</p>
                    )}
                  </div>
                </section>

                {/* Accomplishments */}
                <section id="accomplishments" className="bg-card rounded-2xl p-6 shadow-sm border border-border">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-bold text-foreground">Accomplishments</h2>
                    <button onClick={() => setShowAccomplishmentsModal(true)} className="text-primary text-sm font-medium hover:underline">Add / Edit</button>
                  </div>
                  <div className="text-muted-foreground text-sm">
                    {profile?.achievements?.length > 0 ? (
                      <div className="space-y-4">
                        {profile.achievements.map((achieve, i) => (
                          <div key={i} className="flex flex-col">
                            <h4 className="font-bold text-foreground text-base">{achieve.title}</h4>
                            {achieve.date && <p className="text-xs text-muted-foreground mt-0.5">{new Date(achieve.date).toLocaleDateString()}</p>}
                            {achieve.description && <p className="mt-1">{achieve.description}</p>}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p>Highlight your awards, publications, and special achievements</p>
                    )}
                  </div>
                </section>

                {/* Resume */}
                <section id="resume" className="bg-card rounded-2xl p-6 shadow-sm border border-border">
                  <div className="mb-4">
                    <h2 className="text-lg font-bold text-foreground">Resume</h2>
                    <p className="text-muted-foreground text-sm mt-1">Your resume is the first impression you make on potential employers. Craft it carefully to secure your desired job or internship.</p>
                  </div>
                  <div className="w-full max-w-xl">
                    <ResumeUploader 
                      currentResume={primaryResume?.file_name}
                      currentResumeUrl={primaryResume?.cloudinary_url}
                      onUpload={handleResumeUpload}
                      onView={!!primaryResume?.cloudinary_url}
                    />
                  </div>
                </section>

                {/* Danger Zone */}
                <section id="danger-zone" className="bg-red-50/50 dark:bg-red-950/20 rounded-2xl p-6 shadow-sm border border-red-200 dark:border-red-900/50 mt-8">
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-red-100 dark:bg-red-900/50 rounded-xl flex-shrink-0">
                      <AlertCircle className="w-6 h-6 text-red-600 dark:text-red-400" />
                    </div>
                    <div>
                      <h2 className="text-lg font-bold text-red-700 dark:text-red-400">Danger Zone</h2>
                      <p className="text-muted-foreground text-sm mt-1 mb-4">
                        Permanently delete your account and all associated data. This action cannot be undone.
                      </p>
                      <Button 
                        variant="destructive" 
                        onClick={() => navigate('/settings/delete-account')}
                      >
                        Delete My Account
                      </Button>
                    </div>
                  </div>
                </section>
              </div>
            </Reveal>
          </div>
        </div>
      </main>
      
      <Footer />
      
      {/* Modals */}
      <BasicInfoModal 
        profile={profile} 
        isOpen={showBasicInfoModal} 
        onClose={() => setShowBasicInfoModal(false)} 
      />
      <CareerPreferencesModal 
        profile={profile} 
        isOpen={showPrefsModal} 
        onClose={() => setShowPrefsModal(false)} 
      />
      <SkillsModal 
        profile={profile} 
        isOpen={showSkillsModal} 
        onClose={() => setShowSkillsModal(false)} 
      />
      <EducationModal 
        profile={profile} 
        isOpen={showEducationModal} 
        onClose={() => setShowEducationModal(false)} 
      />
      <ExperienceModal 
        profile={profile} 
        isOpen={showExperienceModal} 
        onClose={() => setShowExperienceModal(false)} 
      />
      <ProjectsModal 
        profile={profile} 
        isOpen={showProjectsModal} 
        onClose={() => setShowProjectsModal(false)} 
      />
      <SummaryModal 
        profile={profile} 
        isOpen={showSummaryModal} 
        onClose={() => setShowSummaryModal(false)} 
      />
      <LanguagesModal 
        profile={profile} 
        isOpen={showLanguagesModal} 
        onClose={() => setShowLanguagesModal(false)} 
      />
      <AccomplishmentsModal 
        profile={profile} 
        isOpen={showAccomplishmentsModal} 
        onClose={() => setShowAccomplishmentsModal(false)} 
      />
    </div>
  );
}
