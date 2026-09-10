import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  useUpdateBasicInfo, 
  useUpdatePreferences, 
  useUpdateSkills,
  useUpdateEducation, 
  useUpdateExperience, 
  useUpdateProjects,
  useUpdateSummary, 
  useUpdateLanguages, 
  useUpdateAccomplishments 
} from "@/hooks/useProfile";
import { useJobAlerts, useToggleJobAlerts } from "@/hooks/useJobAlerts";
import { toast } from "sonner";
import { X } from "lucide-react";
import { Switch } from "@/components/ui/switch";

export function BasicInfoModal({ profile, isOpen, onClose }) {
  const [formData, setFormData] = useState({
    location: "",
    phone: ""
  });
  const updateBasicInfo = useUpdateBasicInfo();

  useEffect(() => {
    if (profile) {
      setFormData({
        location: profile.location || "",
        phone: profile.phone || ""
      });
    }
  }, [profile, isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const parts = formData.location.split(',').map(s => s.trim());
      const payload = {
        phone: formData.phone,
        city: parts[0] || "",
        state: parts[1] || "",
        country: parts[2] || ""
      };
      await updateBasicInfo.mutateAsync(payload);
      toast.success("Profile updated successfully");
      onClose();
    } catch (err) {
      toast.error(err.message || "Failed to update profile");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Basic Info</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Location</label>
            <Input 
              value={formData.location} 
              onChange={e => setFormData(prev => ({ ...prev, location: e.target.value }))}
              placeholder="e.g. Bangalore, India"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Phone Number</label>
            <Input 
              value={formData.phone} 
              onChange={e => setFormData(prev => ({ ...prev, phone: e.target.value }))}
              placeholder="e.g. +91 9876543210"
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={updateBasicInfo.isPending}>Save changes</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function CareerPreferencesModal({ profile, isOpen, onClose }) {
  const [formData, setFormData] = useState({
    preferredJobType: "Full-time",
    availability: "Immediate",
    preferredLocation: "Any"
  });
  const updatePreferences = useUpdatePreferences();
  const { data: alertData } = useJobAlerts();
  const toggleAlerts = useToggleJobAlerts();

  useEffect(() => {
    if (profile?.careerPreferences) {
      setFormData({
        preferredJobType: profile.careerPreferences.jobType || "Full-time",
        availability: profile.careerPreferences.availability || "Immediate",
        preferredLocation: profile.careerPreferences.locations?.[0] || "Any"
      });
    }
  }, [profile, isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await updatePreferences.mutateAsync(formData);
      toast.success("Preferences updated successfully");
      onClose();
    } catch (err) {
      toast.error(err.message || "Failed to update preferences");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Career Preferences</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Preferred Job Type</label>
            <select 
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
              value={formData.preferredJobType}
              onChange={e => setFormData(prev => ({ ...prev, preferredJobType: e.target.value }))}
            >
              <option value="Full-time">Full-time</option>
              <option value="Part-time">Part-time</option>
              <option value="Internship">Internship</option>
              <option value="Contract">Contract</option>
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Availability</label>
            <select 
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
              value={formData.availability}
              onChange={e => setFormData(prev => ({ ...prev, availability: e.target.value }))}
            >
              <option value="Immediate">Immediate</option>
              <option value="15 Days">15 Days</option>
              <option value="1 Month">1 Month</option>
              <option value="2 Months">2 Months</option>
              <option value="3 Months+">3 Months+</option>
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Preferred Location</label>
            <Input 
              value={formData.preferredLocation} 
              onChange={e => setFormData(prev => ({ ...prev, preferredLocation: e.target.value }))}
              placeholder="e.g. Remote, Bangalore"
            />
          </div>
          
          <div className="space-y-2 pt-2 border-t border-border mt-4">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium">Weekly Job Alerts</label>
                <p className="text-xs text-muted-foreground">Receive weekly emails with tailored job matches.</p>
              </div>
              <Switch 
                checked={alertData?.isEnabled || false} 
                onCheckedChange={(checked) => toggleAlerts.mutate(checked)}
                disabled={toggleAlerts.isPending}
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={updatePreferences.isPending}>Save changes</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function SkillsModal({ profile, isOpen, onClose }) {
  const [skills, setSkills] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const updateSkills = useUpdateSkills();

  useEffect(() => {
    if (profile?.skills) {
      setSkills(profile.skills);
    }
  }, [profile, isOpen]);

  const addSkill = (e) => {
    e.preventDefault();
    if (inputValue.trim() && !skills.includes(inputValue.trim())) {
      setSkills([...skills, inputValue.trim()]);
      setInputValue("");
    }
  };

  const removeSkill = (skillToRemove) => {
    setSkills(skills.filter(s => s !== skillToRemove));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await updateSkills.mutateAsync(skills);
      toast.success("Skills updated successfully");
      onClose();
    } catch (err) {
      toast.error(err.message || "Failed to update skills");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Edit Key Skills</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-4">
          <form onSubmit={addSkill} className="flex gap-2">
            <Input 
              value={inputValue} 
              onChange={e => setInputValue(e.target.value)}
              placeholder="Add a skill and press Enter"
            />
            <Button type="submit" variant="secondary">Add</Button>
          </form>
          
          <div className="flex flex-wrap gap-2 mt-4 max-h-[200px] overflow-y-auto p-1">
            {skills.map(skill => (
              <span key={skill} className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm flex items-center gap-1">
                {skill}
                <X className="w-3 h-3 cursor-pointer hover:text-red-500" onClick={() => removeSkill(skill)} />
              </span>
            ))}
            {skills.length === 0 && <span className="text-sm text-muted-foreground">No skills added yet.</span>}
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button onClick={handleSubmit} disabled={updateSkills.isPending}>Save changes</Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}


export function EducationModal({ profile, isOpen, onClose }) {
  const [education, setEducation] = useState([]);
  const updateEducation = useUpdateEducation();

  useEffect(() => {
    if (profile?.education) {
      setEducation(profile.education);
    }
  }, [profile, isOpen]);

  const addEdu = () => setEducation([...education, { degree: "", fieldOfStudy: "", institution: "", startYear: "", endYear: "", isCurrent: false }]);
  const updateEdu = (index, field, value) => {
    const newEdu = [...education];
    newEdu[index][field] = value;
    setEducation(newEdu);
  };
  const removeEdu = (index) => setEducation(education.filter((_, i) => i !== index));

  const handleSubmit = async () => {
    try {
      await updateEducation.mutateAsync(education);
      onClose();
    } catch (err) {}
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Education</DialogTitle>
        </DialogHeader>
        <div className="space-y-6 pt-4">
          {education.map((edu, index) => (
            <div key={index} className="p-4 border border-border rounded-xl space-y-4 relative">
              <button onClick={() => removeEdu(index)} className="absolute top-4 right-4 text-muted-foreground hover:text-destructive">
                <X className="w-4 h-4" />
              </button>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Degree</label>
                  <Input value={edu.degree} onChange={e => updateEdu(index, "degree", e.target.value)} placeholder="e.g. B.Tech" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Field of Study</label>
                  <Input value={edu.fieldOfStudy} onChange={e => updateEdu(index, "fieldOfStudy", e.target.value)} placeholder="e.g. Computer Science" />
                </div>
                <div className="space-y-2 col-span-2">
                  <label className="text-sm font-medium">Institution</label>
                  <Input value={edu.institution} onChange={e => updateEdu(index, "institution", e.target.value)} placeholder="e.g. MIT" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Start Year</label>
                  <Input value={edu.startYear} onChange={e => updateEdu(index, "startYear", e.target.value)} placeholder="e.g. 2020" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">End Year</label>
                  <Input value={edu.endYear} onChange={e => updateEdu(index, "endYear", e.target.value)} placeholder="e.g. 2024" disabled={edu.isCurrent} />
                </div>
              </div>
            </div>
          ))}
          <Button type="button" variant="outline" onClick={addEdu} className="w-full">
            + Add Education
          </Button>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button onClick={handleSubmit} disabled={updateEducation.isPending}>Save changes</Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function ExperienceModal({ profile, isOpen, onClose }) {
  const [experience, setExperience] = useState([]);
  const updateExperience = useUpdateExperience();

  useEffect(() => {
    if (profile?.experience) {
      setExperience(profile.experience);
    }
  }, [profile, isOpen]);

  const addExp = () => setExperience([...experience, { position: "", company: "", location: "", startDate: "", endDate: "", isCurrent: false, description: "" }]);
  const updateExp = (index, field, value) => {
    const newExp = [...experience];
    newExp[index][field] = value;
    setExperience(newExp);
  };
  const removeExp = (index) => setExperience(experience.filter((_, i) => i !== index));

  const handleSubmit = async () => {
    try {
      await updateExperience.mutateAsync(experience);
      onClose();
    } catch (err) {}
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Experience</DialogTitle>
        </DialogHeader>
        <div className="space-y-6 pt-4">
          {experience.map((exp, index) => (
            <div key={index} className="p-4 border border-border rounded-xl space-y-4 relative">
              <button onClick={() => removeExp(index)} className="absolute top-4 right-4 text-muted-foreground hover:text-destructive">
                <X className="w-4 h-4" />
              </button>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Job Title</label>
                  <Input value={exp.position || exp.title} onChange={e => updateExp(index, "position", e.target.value)} placeholder="e.g. Software Engineer" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Company</label>
                  <Input value={exp.company} onChange={e => updateExp(index, "company", e.target.value)} placeholder="e.g. Google" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Start Date</label>
                  <Input type="date" value={exp.startDate ? new Date(exp.startDate).toISOString().split('T')[0] : ""} onChange={e => updateExp(index, "startDate", e.target.value)} />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">End Date</label>
                  <Input type="date" value={exp.endDate ? new Date(exp.endDate).toISOString().split('T')[0] : ""} onChange={e => updateExp(index, "endDate", e.target.value)} disabled={exp.isCurrent} />
                </div>
                <div className="space-y-2 col-span-2">
                  <label className="text-sm font-medium">Description</label>
                  <textarea 
                    className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    value={exp.description} 
                    onChange={e => updateExp(index, "description", e.target.value)} 
                    placeholder="Describe your role" 
                  />
                </div>
              </div>
            </div>
          ))}
          <Button type="button" variant="outline" onClick={addExp} className="w-full">
            + Add Experience
          </Button>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button onClick={handleSubmit} disabled={updateExperience.isPending}>Save changes</Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function ProjectsModal({ profile, isOpen, onClose }) {
  const [projects, setProjects] = useState([]);
  const updateProjects = useUpdateProjects();

  useEffect(() => {
    if (profile?.projects) {
      setProjects(profile.projects);
    }
  }, [profile, isOpen]);

  const addProject = () => setProjects([...projects, { name: "", description: "", liveUrl: "", technologies: [] }]);
  const updateProject = (index, field, value) => {
    const newProj = [...projects];
    newProj[index][field] = value;
    setProjects(newProj);
  };
  const removeProject = (index) => setProjects(projects.filter((_, i) => i !== index));

  const handleSubmit = async () => {
    try {
      await updateProjects.mutateAsync(projects);
      onClose();
    } catch (err) {}
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Projects</DialogTitle>
        </DialogHeader>
        <div className="space-y-6 pt-4">
          {projects.map((proj, index) => (
            <div key={index} className="p-4 border border-border rounded-xl space-y-4 relative">
              <button onClick={() => removeProject(index)} className="absolute top-4 right-4 text-muted-foreground hover:text-destructive">
                <X className="w-4 h-4" />
              </button>
              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Project Name</label>
                  <Input value={proj.name} onChange={e => updateProject(index, "name", e.target.value)} placeholder="e.g. E-commerce Platform" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Project Link</label>
                  <Input value={proj.liveUrl || proj.link} onChange={e => updateProject(index, "liveUrl", e.target.value)} placeholder="e.g. https://github.com/my-project" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Description</label>
                  <textarea 
                    className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    value={proj.description} 
                    onChange={e => updateProject(index, "description", e.target.value)} 
                    placeholder="Describe your project" 
                  />
                </div>
              </div>
            </div>
          ))}
          <Button type="button" variant="outline" onClick={addProject} className="w-full">
            + Add Project
          </Button>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button onClick={handleSubmit} disabled={updateProjects.isPending}>Save changes</Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}


export function SummaryModal({ profile, isOpen, onClose }) {
  const [summary, setSummary] = useState("");
  const updateSummary = useUpdateSummary();

  useEffect(() => {
    if (profile?.summary) {
      setSummary(profile.summary);
    }
  }, [profile, isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await updateSummary.mutateAsync(summary);
      onClose();
    } catch (err) {}
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Profile Summary</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Summary</label>
            <textarea 
              className="flex min-h-[150px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              value={summary} 
              onChange={e => setSummary(e.target.value)} 
              placeholder="Your Profile Summary should mention the highlights of your career..." 
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={updateSummary.isPending}>Save changes</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function LanguagesModal({ profile, isOpen, onClose }) {
  const [languages, setLanguages] = useState([]);
  const updateLanguages = useUpdateLanguages();

  useEffect(() => {
    if (profile?.languages) {
      setLanguages(profile.languages);
    }
  }, [profile, isOpen]);

  const addLang = () => setLanguages([...languages, { language: "", proficiency: "Professional" }]);
  const updateLang = (index, field, value) => {
    const newLang = [...languages];
    newLang[index][field] = value;
    setLanguages(newLang);
  };
  const removeLang = (index) => setLanguages(languages.filter((_, i) => i !== index));

  const handleSubmit = async () => {
    try {
      await updateLanguages.mutateAsync(languages);
      onClose();
    } catch (err) {}
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Languages</DialogTitle>
        </DialogHeader>
        <div className="space-y-6 pt-4">
          {languages.map((lang, index) => (
            <div key={index} className="flex items-start gap-4 p-4 border border-border rounded-xl relative">
              <div className="flex-1 space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Language</label>
                  <Input value={lang.language} onChange={e => updateLang(index, "language", e.target.value)} placeholder="e.g. English" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Proficiency</label>
                  <select 
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    value={lang.proficiency}
                    onChange={e => updateLang(index, "proficiency", e.target.value)}
                  >
                    <option value="Native">Native</option>
                    <option value="Fluent">Fluent</option>
                    <option value="Professional">Professional</option>
                    <option value="Conversational">Conversational</option>
                    <option value="Basic">Basic</option>
                  </select>
                </div>
              </div>
              <button onClick={() => removeLang(index)} className="text-muted-foreground hover:text-destructive mt-8">
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
          <Button type="button" variant="outline" onClick={addLang} className="w-full">
            + Add Language
          </Button>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button onClick={handleSubmit} disabled={updateLanguages.isPending}>Save changes</Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function AccomplishmentsModal({ profile, isOpen, onClose }) {
  const [achievements, setAchievements] = useState([]);
  const updateAccomplishments = useUpdateAccomplishments();

  useEffect(() => {
    if (profile?.achievements) {
      setAchievements(profile.achievements);
    }
  }, [profile, isOpen]);

  const addAchieve = () => setAchievements([...achievements, { title: "", description: "", date: "" }]);
  const updateAchieve = (index, field, value) => {
    const newAchieve = [...achievements];
    newAchieve[index][field] = value;
    setAchievements(newAchieve);
  };
  const removeAchieve = (index) => setAchievements(achievements.filter((_, i) => i !== index));

  const handleSubmit = async () => {
    try {
      await updateAccomplishments.mutateAsync(achievements);
      onClose();
    } catch (err) {}
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Accomplishments</DialogTitle>
        </DialogHeader>
        <div className="space-y-6 pt-4">
          {achievements.map((achieve, index) => (
            <div key={index} className="p-4 border border-border rounded-xl space-y-4 relative">
              <button onClick={() => removeAchieve(index)} className="absolute top-4 right-4 text-muted-foreground hover:text-destructive">
                <X className="w-4 h-4" />
              </button>
              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Title</label>
                  <Input value={achieve.title} onChange={e => updateAchieve(index, "title", e.target.value)} placeholder="e.g. Employee of the Month" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Date (Optional)</label>
                  <Input type="date" value={achieve.date ? new Date(achieve.date).toISOString().split('T')[0] : ""} onChange={e => updateAchieve(index, "date", e.target.value)} />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Description</label>
                  <textarea 
                    className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    value={achieve.description} 
                    onChange={e => updateAchieve(index, "description", e.target.value)} 
                    placeholder="Describe the accomplishment" 
                  />
                </div>
              </div>
            </div>
          ))}
          <Button type="button" variant="outline" onClick={addAchieve} className="w-full">
            + Add Accomplishment
          </Button>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button onClick={handleSubmit} disabled={updateAccomplishments.isPending}>Save changes</Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}
