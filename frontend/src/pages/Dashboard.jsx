import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { useJobs } from "@/hooks/useJobs";
import { useProfile, useUploadPhoto, useDeletePhoto } from "@/hooks/useProfile";
import { useResumes, useUploadResume } from "@/hooks/useResumes";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Link } from "react-router-dom";
import { 
  Briefcase, Mail, Star, MapPin, Building2, ChevronRight, 
  CheckCircle2, Clock, XCircle, AlertCircle, Edit2, Plus, Phone
} from "lucide-react";
import { GlobalLoader } from "@/components/ui/GlobalLoader";
import { StaggeredText } from "@/components/ui/StaggeredText";
import { Reveal } from "@/components/ui/Reveal";
import { StudentAnalytics } from "@/components/dashboard/StudentAnalytics";
import { ResumeUploader } from "@/components/resume/ResumeUploader";
import { 
  BasicInfoModal, CareerPreferencesModal, SkillsModal, EducationModal, 
  ExperienceModal, ProjectsModal, SummaryModal, LanguagesModal, AccomplishmentsModal 
} from "@/components/profile/ProfileEditModals";

const SECTIONS = [
  { id: "summary", label: "Profile summary" },
  { id: "preference", label: "Preferences" },
  { id: "education", label: "Education" },
  { id: "experience", label: "Experience & Internships" },
  { id: "projects", label: "Projects" },
  { id: "skills", label: "Key skills" },
  { id: "languages", label: "Languages" },
  { id: "accomplishments", label: "Accomplishments" },
  { id: "resume", label: "Resume" }
];

const Dashboard = () => {
  const { user } = useAuth();
  const { data: profile, isLoading: profileLoading } = useProfile();
  const { data: jobsData, isLoading: jobsLoading } = useJobs({ page: 1, limit: 5 });
  const uploadPhoto = useUploadPhoto();
  const deletePhoto = useDeletePhoto();
  const { data: resumes } = useResumes();
  const uploadResume = useUploadResume();

  const primaryResume = resumes?.find(r => r.is_primary) || resumes?.[0];

  const [activeTab, setActiveTab] = useState("jobs");
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

  if (profileLoading || jobsLoading) return <GlobalLoader />;

  // Mock data for Dashboard panels
  const applications = [
    { role: "Software Engineer", company: "Google", stage: "Interview", status: "pending", date: "2 days ago" },
    { role: "Frontend Developer", company: "Meta", stage: "Applied", status: "pending", date: "1 week ago" }
  ];
  const pendingCount = applications.filter(a => a.status === 'pending').length;

  const calculateCompletion = () => {
    let score = 0;
    let missing = 0;
    if (user?.fullName) score += 10; else missing++;
    if (profile?.education?.length > 0) score += 20; else missing++;
    if (profile?.skills?.length > 0) score += 20; else missing++;
    if (profile?.careerPreferences) score += 10; else missing++;
    if (profile?.projects?.length > 0) score += 15; else missing++;
    if (profile?.languages?.length > 0) score += 5; else missing++;
    if (profile?.profilePhotoUrl) score += 20; else missing++;
    return { percent: Math.min(score, 100), missingDetails: missing };
  };

  const { percent, missingDetails } = calculateCompletion();

  const handlePhotoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) return alert("File must be less than 5MB");
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
    setActiveTab("profile");
    setTimeout(() => {
      const element = document.getElementById(id);
      if (element) {
        const y = element.getBoundingClientRect().top + window.pageYOffset - 100;
        window.scrollTo({ top: y, behavior: 'smooth' });
      }
    }, 100);
  };

  const handleResumeUpload = async (file) => {
    await uploadResume.mutateAsync(file);
  };

  return (
    <div className="bg-background pb-16">
      <div className="container mx-auto px-4 max-w-6xl">
        
        {/* Top Profile Card */}
        <div className="bg-card rounded-2xl p-8 shadow-sm border border-border mt-6 mb-6 flex flex-col md:flex-row items-start gap-8">
          <div className="relative flex-shrink-0">
            <svg className="w-32 h-32 transform -rotate-90">
              <circle cx="64" cy="64" r="60" className="stroke-muted" strokeWidth="6" fill="none" />
              <circle
                cx="64" cy="64" r="60"
                className="stroke-primary transition-all duration-1000 ease-out"
                strokeWidth="6" fill="none" strokeDasharray="377"
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
                      <button onClick={handleRemovePhoto} className="absolute top-2 right-2 p-1 bg-destructive rounded-full hover:bg-destructive/90 transition">
                        <Plus className="w-3 h-3 transform rotate-45" />
                      </button>
                    </div>
                  )}
                </>
              ) : (
                <div className="flex flex-col items-center justify-center text-muted-foreground group-hover:text-primary transition">
                  {uploadPhoto.isPending ? <span className="text-xs font-medium animate-pulse">Uploading...</span> : <><Plus className="w-6 h-6 mb-1" /><span className="text-xs font-medium">Add photo</span></>}
                </div>
              )}
            </label>
            <div className="absolute -bottom-3 left-1/2 transform -translate-x-1/2 bg-background px-2 text-xs font-bold text-primary">{percent}%</div>
          </div>

          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <StaggeredText text={user?.fullName || "Your Name"} className="font-display text-2xl font-bold text-foreground" />
              <button onClick={() => setShowBasicInfoModal(true)} className="flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-primary transition ml-4">
                <Edit2 className="w-4 h-4" /> Edit
              </button>
            </div>
            <p className="text-muted-foreground mb-4">{profile?.education?.[0]?.degree || "Add Education"} • {profile?.education?.[0]?.institution || ""}</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-3 gap-x-8 text-sm text-muted-foreground">
              <div className="flex items-center gap-2"><MapPin className="w-4 h-4 text-muted-foreground/70" />{profile?.location || "Add Location"}</div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-muted-foreground/70" />{profile?.phone || "Add Phone"}
                {profile?.phone && <span className="text-primary font-medium text-xs ml-1 cursor-pointer" onClick={() => setShowBasicInfoModal(true)}>Verify</span>}
              </div>
              <div className="flex items-center gap-2 md:col-span-2">
                <Mail className="w-4 h-4 text-muted-foreground/70" />{user?.email}<CheckCircle2 className="w-4 h-4 text-green-500 ml-1" />
              </div>
            </div>
          </div>

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
            <Button className="w-full rounded-full font-medium" onClick={() => setShowBasicInfoModal(true)}>Add {missingDetails} missing details</Button>
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
                <button onClick={() => setActiveTab("jobs")} className={`flex-shrink-0 flex items-center justify-between px-4 py-2 md:px-6 md:py-3 text-sm transition-colors group rounded-full md:rounded-none border border-border md:border-none mr-2 md:mr-0 ${activeTab === 'jobs' ? 'bg-primary/10 text-primary font-semibold' : 'text-muted-foreground hover:text-primary hover:bg-primary/5'}`}>
                  Jobs Dashboard
                </button>
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
          <div className="flex-1">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6 hidden">
                {/* Hidden TabsList since we use Quick Links to switch */}
                <TabsTrigger value="jobs">Jobs Dashboard</TabsTrigger>
                <TabsTrigger value="profile">Profile Details</TabsTrigger>
              </TabsList>

              <TabsContent value="jobs" className="space-y-6 mt-0">
                <StudentAnalytics />
                
                {/* Application Status Panel */}
                <Card className="border-border shadow-sm">
                  <CardHeader className="pb-3 flex flex-row items-center justify-between">
                    <CardTitle className="text-lg font-semibold flex items-center gap-2"><Clock className="w-5 h-5 text-primary" /> Application Status</CardTitle>
                    <div className="text-sm text-muted-foreground font-medium"><span className="text-primary font-bold">{pendingCount}</span> Active</div>
                  </CardHeader>
                  <CardContent>
                    {applications.map((app, idx) => (
                      <div key={idx} className="flex items-center justify-between p-3 rounded-lg border border-border/50 hover:bg-muted/30 transition-colors mb-3 last:mb-0">
                        <div className="flex items-center gap-4">
                          <div className={`w-2 h-2 rounded-full ${app.status === 'accepted' ? 'bg-green-500' : 'bg-amber-500 animate-pulse'}`} />
                          <div><h4 className="font-semibold text-sm">{app.role}</h4><p className="text-xs text-muted-foreground">{app.company} • {app.date}</p></div>
                        </div>
                        <div className="text-right"><div className="text-sm font-medium">{app.stage}</div></div>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                {/* Latest Jobs Panel */}
                <Card className="border-border shadow-sm">
                  <CardHeader className="pb-3 flex flex-row items-center justify-between">
                    <CardTitle className="text-lg font-semibold flex items-center gap-2"><Briefcase className="w-5 h-5 text-primary" /> Latest Job Postings</CardTitle>
                    <Button variant="ghost" size="sm" asChild className="h-8 text-xs"><Link to="/jobs">View All <ChevronRight className="w-3 h-3 ml-1" /></Link></Button>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {jobsData?.jobs?.map((job) => (
                        <div key={job.id} className="group p-4 border border-border rounded-xl hover:border-primary/40 hover:bg-primary/5 transition-all flex items-start gap-4">
                          <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center shrink-0 border border-border"><Building2 className="w-6 h-6 text-muted-foreground" /></div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-foreground truncate">{job.title}</h4>
                            <p className="text-sm text-muted-foreground flex items-center gap-3 mt-1"><span>{job.company}</span><span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {job.location || 'Remote'}</span></p>
                          </div>
                          <Button size="sm" variant="secondary" asChild className="shrink-0"><Link to={`/jobs/${job.id}`}>View</Link></Button>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="profile" className="space-y-6 mt-0">
                {/* Profile Summary */}
                <section id="summary" className="bg-card rounded-2xl p-6 shadow-sm border border-border">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-bold text-foreground">Profile summary</h2>
                    <button onClick={() => setShowSummaryModal(true)} className="text-primary text-sm font-medium hover:underline">Edit</button>
                  </div>
                  <div className="text-sm text-foreground/90 leading-relaxed whitespace-pre-wrap">
                    {profile?.summary || <span className="text-muted-foreground">Your Profile Summary should mention the highlights of your career...</span>}
                  </div>
                </section>

                {/* Preferences */}
                <section id="preference" className="bg-card rounded-2xl p-6 shadow-sm border border-border">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-bold text-foreground">Preferences</h2>
                    <button onClick={() => setShowPrefsModal(true)} className="text-primary text-sm font-medium hover:underline">Edit</button>
                  </div>
                  <div className="text-sm">
                    {profile?.careerPreferences ? (
                      <div className="grid grid-cols-2 gap-4">
                        <div><span className="text-muted-foreground">Job Type:</span> <span className="font-medium">{profile.careerPreferences.jobType}</span></div>
                        <div><span className="text-muted-foreground">Location:</span> <span className="font-medium">{profile.careerPreferences.locations?.join(', ')}</span></div>
                        <div><span className="text-muted-foreground">Availability:</span> <span className="font-medium">{profile.careerPreferences.availability}</span></div>
                      </div>
                    ) : <span className="text-muted-foreground">Add your career preferences</span>}
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
                          <p className="font-medium">{edu.institution}</p>
                          <p className="text-muted-foreground mt-1">{edu.startYear} - {edu.isCurrent ? "Present" : edu.endYear}</p>
                        </div>
                      ))
                    ) : <p>Highlight your educational background</p>}
                  </div>
                </section>

                {/* Experience */}
                <section id="experience" className="bg-card rounded-2xl p-6 shadow-sm border border-border">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-bold text-foreground">Experience & Internships</h2>
                    <button onClick={() => setShowExperienceModal(true)} className="text-primary text-sm font-medium hover:underline">Add / Edit</button>
                  </div>
                  <div className="text-muted-foreground text-sm">
                    {profile?.experience?.length > 0 ? (
                      profile.experience.map((exp, i) => (
                        <div key={i} className="mb-4 last:mb-0">
                          <h4 className="font-bold text-foreground text-base">{exp.position}</h4>
                          <p className="font-medium">{exp.company}</p>
                        </div>
                      ))
                    ) : <p>Highlight your professional experience</p>}
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
                            {(proj.liveUrl) && <a href={proj.liveUrl} target="_blank" rel="noopener noreferrer" className="text-primary text-xs hover:underline">View</a>}
                          </div>
                          {proj.description && <p className="mt-2 text-foreground/80">{proj.description}</p>}
                        </div>
                      ))
                    ) : <p>Showcase your hands-on work</p>}
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
                  ) : <p className="text-muted-foreground text-sm">Tell recruiters what you know.</p>}
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
                    ) : <p>Showcase your language proficiencies</p>}
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
                          </div>
                        ))}
                      </div>
                    ) : <p>Highlight your awards and special achievements</p>}
                  </div>
                </section>

                {/* Resume */}
                <section id="resume" className="bg-card rounded-2xl p-6 shadow-sm border border-border">
                  <div className="mb-4">
                    <h2 className="text-lg font-bold text-foreground">Resume</h2>
                    <p className="text-muted-foreground text-sm mt-1">Your resume is the first impression you make.</p>
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
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
      
      {/* Modals */}
      <BasicInfoModal profile={profile} isOpen={showBasicInfoModal} onClose={() => setShowBasicInfoModal(false)} />
      <CareerPreferencesModal profile={profile} isOpen={showPrefsModal} onClose={() => setShowPrefsModal(false)} />
      <SkillsModal profile={profile} isOpen={showSkillsModal} onClose={() => setShowSkillsModal(false)} />
      <EducationModal profile={profile} isOpen={showEducationModal} onClose={() => setShowEducationModal(false)} />
      <ExperienceModal profile={profile} isOpen={showExperienceModal} onClose={() => setShowExperienceModal(false)} />
      <ProjectsModal profile={profile} isOpen={showProjectsModal} onClose={() => setShowProjectsModal(false)} />
      <SummaryModal profile={profile} isOpen={showSummaryModal} onClose={() => setShowSummaryModal(false)} />
      <LanguagesModal profile={profile} isOpen={showLanguagesModal} onClose={() => setShowLanguagesModal(false)} />
      <AccomplishmentsModal profile={profile} isOpen={showAccomplishmentsModal} onClose={() => setShowAccomplishmentsModal(false)} />
    </div>
  );
};

export default Dashboard;