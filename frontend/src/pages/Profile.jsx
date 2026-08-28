import { useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { useAuth } from "@/contexts/AuthContext";
import { useProfile, useUploadPhoto, useDeletePhoto } from "@/hooks/useProfile";
import { BasicInfoModal, CareerPreferencesModal, SkillsModal } from "@/components/profile/ProfileEditModals";
import { Edit2, Plus, MapPin, Phone, Mail, FileText, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";

const SECTIONS = [
  { id: "preference", label: "Preference" },
  { id: "education", label: "Education" },
  { id: "skills", label: "Key skills" },
  { id: "languages", label: "Languages" },
  { id: "internships", label: "Internships" },
  { id: "projects", label: "Projects" },
  { id: "summary", label: "Profile summary" },
  { id: "accomplishments", label: "Accomplishments" },
  { id: "resume", label: "Resume" }
];

export default function Profile() {
  const { user } = useAuth();
  const { data: profile, isLoading } = useProfile();
  const uploadPhoto = useUploadPhoto();
  const deletePhoto = useDeletePhoto();
  const [isHoveringPhoto, setIsHoveringPhoto] = useState(false);

  // Modal states
  const [showBasicInfoModal, setShowBasicInfoModal] = useState(false);
  const [showPrefsModal, setShowPrefsModal] = useState(false);
  const [showSkillsModal, setShowSkillsModal] = useState(false);
  
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

  const { percent, missingDetails } = calculateCompletion();

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

  return (
    <div className="min-h-screen bg-[#F5F7FA]">
      <Navbar />
      
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-6xl">
          
          {/* Top Profile Card */}
          <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 mb-6 flex flex-col md:flex-row items-start gap-8">
            {/* Left: Photo & Progress */}
            <div className="relative flex-shrink-0">
              <svg className="w-32 h-32 transform -rotate-90">
                <circle
                  cx="64" cy="64" r="60"
                  className="stroke-gray-100" strokeWidth="6" fill="none"
                />
                <circle
                  cx="64" cy="64" r="60"
                  className="stroke-red-500 transition-all duration-1000 ease-out"
                  strokeWidth="6" fill="none"
                  strokeDasharray="377"
                  strokeDashoffset={377 - (377 * percent) / 100}
                />
              </svg>
              
              <label 
                className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[110px] h-[110px] bg-gray-100 rounded-full flex flex-col items-center justify-center cursor-pointer overflow-hidden group"
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
                          className="absolute top-2 right-2 p-1 bg-red-500 rounded-full hover:bg-red-600 transition"
                          title="Remove photo"
                        >
                          <Plus className="w-3 h-3 transform rotate-45" />
                        </button>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center text-gray-500 group-hover:text-primary transition">
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
              <div className="absolute -bottom-3 left-1/2 transform -translate-x-1/2 bg-white px-2 text-xs font-bold text-red-500">
                {percent}%
              </div>
            </div>

            {/* Middle: Details */}
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h1 className="text-2xl font-bold text-gray-900">{user?.fullName || "Your Name"}</h1>
                <button onClick={() => setShowBasicInfoModal(true)} className="flex items-center gap-1 text-sm font-medium text-gray-500 hover:text-primary transition">
                  <Edit2 className="w-4 h-4" />
                  Edit
                </button>
              </div>
              <p className="text-gray-600 mb-4">{profile?.education?.[0]?.degree || "Add Education"} • {profile?.education?.[0]?.institution || ""}</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-y-3 gap-x-8 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-gray-400" />
                  {profile?.location || "Add Location"}
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-gray-400" />
                  {profile?.phone || "Add Phone"}
                  {profile?.phone && <span className="text-primary font-medium text-xs ml-1 cursor-pointer">Verify</span>}
                </div>
                <div className="flex items-center gap-2 md:col-span-2">
                  <Mail className="w-4 h-4 text-gray-400" />
                  {user?.email}
                  <CheckCircle2 className="w-4 h-4 text-green-500 ml-1" />
                </div>
              </div>
            </div>

            {/* Right: Missing details actions */}
            <div className="w-full md:w-64 bg-orange-50/50 rounded-xl p-5 border border-orange-100">
              <div className="space-y-3 mb-4">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2 text-gray-700"><CheckCircle2 className="w-4 h-4 text-gray-400" /> Verify mobile</div>
                  <span className="text-green-600 font-medium">↑ 2%</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2 text-gray-700"><Plus className="w-4 h-4 text-gray-400" /> Add details</div>
                  <span className="text-green-600 font-medium">↑ 8%</span>
                </div>
              </div>
              <Button className="w-full bg-[#FF6B4A] hover:bg-[#E55A39] text-white rounded-full font-medium">
                Add {missingDetails} missing details
              </Button>
            </div>
          </div>

          <div className="flex flex-col md:flex-row gap-6 items-start">
            {/* Quick Links Sidebar */}
            <div className="w-full md:w-64 bg-white rounded-2xl shadow-sm border border-gray-100 sticky top-24 overflow-hidden">
              <div className="p-4 border-b border-gray-100 bg-gray-50/50">
                <h3 className="font-bold text-gray-900">Quick links</h3>
              </div>
              <nav className="py-2">
                {SECTIONS.map(section => (
                  <a
                    key={section.id}
                    href={`#${section.id}`}
                    className="flex items-center justify-between px-6 py-3 text-sm text-gray-600 hover:text-primary hover:bg-primary/5 transition-colors group"
                  >
                    {section.label}
                    <span className="text-primary font-medium opacity-0 group-hover:opacity-100 transition-opacity">Add</span>
                  </a>
                ))}
              </nav>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 space-y-6">
              
              {/* Career Preferences */}
              <section id="preference" className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-bold text-gray-900">Your career preferences</h2>
                  <button onClick={() => setShowPrefsModal(true)} className="text-primary text-sm font-medium hover:underline">Edit</button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                  <div>
                    <p className="text-gray-500 mb-1">Preferred job type</p>
                    <p className="font-medium text-gray-900">{profile?.careerPreferences?.preferredJobType || "Not specified"}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 mb-1">Availability to work</p>
                    <p className="font-medium text-gray-900">{profile?.careerPreferences?.availability || "Not specified"}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 mb-1">Preferred location</p>
                    <p className="font-medium text-gray-900">{profile?.careerPreferences?.preferredLocation || "Not specified"}</p>
                  </div>
                </div>
              </section>

              {/* Education */}
              <section id="education" className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-bold text-gray-900">Education</h2>
                  <button className="text-primary text-sm font-medium hover:underline">Add</button>
                </div>
                <div className="text-gray-600 text-sm">
                  {profile?.education?.length > 0 ? (
                    profile.education.map((edu, i) => (
                      <div key={i} className="mb-4 last:mb-0">
                        <h4 className="font-bold text-gray-900 text-base">{edu.degree} in {edu.fieldOfStudy}</h4>
                        <p>{edu.institution}</p>
                        <p className="text-gray-500 mt-1">{edu.startYear} - {edu.isCurrent ? "Present" : edu.endYear}</p>
                      </div>
                    ))
                  ) : (
                    <p>Details like course, university, and more help recruiters identify your educational background</p>
                  )}
                </div>
              </section>

              {/* Key Skills */}
              <section id="skills" className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-bold text-gray-900">Key skills</h2>
                  <button onClick={() => setShowSkillsModal(true)} className="text-primary text-sm font-medium hover:underline">Edit</button>
                </div>
                {profile?.skills?.length > 0 ? (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {profile.skills.map((skill) => (
                      <span key={skill} className="px-3 py-1.5 bg-gray-50 border border-gray-200 text-gray-700 text-sm rounded-full">
                        {skill}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-600 text-sm">Tell recruiters what you know or what you are known for e.g. Direct Marketing, Oracle, Java etc.</p>
                )}
              </section>

              {/* Resume */}
              <section id="resume" className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <div className="mb-4">
                  <h2 className="text-lg font-bold text-gray-900">Resume</h2>
                  <p className="text-gray-600 text-sm mt-1">Your resume is the first impression you make on potential employers. Craft it carefully to secure your desired job or internship.</p>
                </div>
                <div className="border-2 border-dashed border-gray-200 rounded-xl p-8 flex flex-col items-center justify-center text-center">
                  <Button variant="outline" className="rounded-full px-8 text-primary border-primary hover:bg-primary/5">
                    Upload resume
                  </Button>
                  <p className="text-xs text-gray-500 mt-3">Supported formats: doc, docx, rtf, pdf, up to 2MB</p>
                </div>
              </section>

            </div>
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
    </div>
  );
}
