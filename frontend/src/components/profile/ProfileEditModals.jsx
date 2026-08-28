import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useUpdateBasicInfo, useUpdatePreferences, useUpdateSkills } from "@/hooks/useProfile";
import { toast } from "sonner";
import { X } from "lucide-react";

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
      await updateBasicInfo.mutateAsync(formData);
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

  useEffect(() => {
    if (profile?.careerPreferences) {
      setFormData(profile.careerPreferences);
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
