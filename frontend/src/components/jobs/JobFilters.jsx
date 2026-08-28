import { useState } from "react";
import { Search, MapPin, Briefcase, Filter, X, ChevronDown, ChevronUp, SlidersHorizontal } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const LOCATIONS = [
  "Remote", "Lucknow", "Delhi", "Mumbai", "Bangalore", "Hyderabad",
  "Pune", "Chennai", "Noida", "Gurgaon", "Kolkata"
];

const WORK_MODES = ["All", "Remote", "Hybrid", "On-site"];
const JOB_TYPES = ["All", "Full-time", "Part-time", "Internship", "Contract", "Temporary"];
const EXPERIENCE_LEVELS = ["All", "Fresher", "Entry Level", "0-1 years", "1-3 years", "3-5 years", "5+ years"];
const POSTED_OPTIONS = [
  { label: "Any time", value: "" },
  { label: "Past 24 hours", value: "24h" },
  { label: "Past 3 days", value: "3d" },
  { label: "Past 7 days", value: "7d" },
  { label: "Past 30 days", value: "30d" },
];
const SORT_OPTIONS = [
  { label: "Most Recent", value: "recent" },
  { label: "Relevance", value: "relevance" },
  { label: "Salary: High → Low", value: "salary_desc" },
  { label: "Salary: Low → High", value: "salary_asc" },
];
const SUGGESTED_SKILLS = [
  "Python", "JavaScript", "React", "Node.js", "Java", "C++",
  "MongoDB", "SQL", "AWS", "Docker", "Machine Learning", "TypeScript",
  "Git", "HTML", "CSS", "Express", "Spring", "Angular"
];

export const JobFilters = ({ filters, onFiltersChange, onSearch, totalJobs, sortValue, onSortChange }) => {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [locationInput, setLocationInput] = useState("");
  const [skillInput, setSkillInput] = useState("");
  const [showLocationDropdown, setShowLocationDropdown] = useState(false);

  const updateFilter = (key, value) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const toggleArrayFilter = (key, value) => {
    const current = filters[key] || [];
    const updated = current.includes(value)
      ? current.filter(v => v !== value)
      : [...current, value];
    updateFilter(key, updated);
  };

  const addSkill = (skill) => {
    if (skill && !(filters.skills || []).includes(skill)) {
      updateFilter("skills", [...(filters.skills || []), skill]);
    }
    setSkillInput("");
  };

  const removeSkill = (skill) => {
    updateFilter("skills", (filters.skills || []).filter(s => s !== skill));
  };

  const clearAll = () => {
    onFiltersChange({
      search: "", location: "", source: "All", workMode: "All",
      jobType: "All", experienceLevel: "All", minSalary: "",
      maxSalary: "", skills: [], postedWithin: "", page: 1
    });
    onSortChange("recent");
  };

  const activeFilters = [];
  if (filters.search) activeFilters.push({ key: "search", label: filters.search });
  if (filters.location && filters.location !== "All") activeFilters.push({ key: "location", label: `📍 ${filters.location}` });
  if (filters.source && filters.source !== "All") activeFilters.push({ key: "source", label: filters.source });
  if (filters.workMode && filters.workMode !== "All") activeFilters.push({ key: "workMode", label: filters.workMode });
  if (filters.jobType && filters.jobType !== "All") activeFilters.push({ key: "jobType", label: filters.jobType });
  if (filters.experienceLevel && filters.experienceLevel !== "All") activeFilters.push({ key: "experienceLevel", label: filters.experienceLevel });
  if (filters.postedWithin) activeFilters.push({ key: "postedWithin", label: POSTED_OPTIONS.find(o => o.value === filters.postedWithin)?.label || filters.postedWithin });
  (filters.skills || []).forEach(s => activeFilters.push({ key: "skill", label: s, value: s }));

  const removeFilter = (f) => {
    if (f.key === "skill") {
      removeSkill(f.value);
    } else if (f.key === "search") {
      updateFilter("search", "");
    } else {
      updateFilter(f.key, f.key === "postedWithin" ? "" : "All");
    }
  };

  const filteredLocations = locationInput
    ? LOCATIONS.filter(l => l.toLowerCase().includes(locationInput.toLowerCase()))
    : LOCATIONS;

  const handleLocationSelect = (loc) => {
    updateFilter("location", loc);
    setLocationInput("");
    setShowLocationDropdown(false);
  };

  const handleLocationInputKeyDown = (e) => {
    if (e.key === "Enter" && locationInput.trim()) {
      updateFilter("location", locationInput.trim());
      setShowLocationDropdown(false);
    }
  };

  const FilterPanel = ({ isMobile = false }) => (
    <div className={`grid gap-6 ${isMobile ? "grid-cols-1" : "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"}`}>
      {/* Location */}
      <div>
        <h4 className="text-sm font-semibold text-foreground mb-3">Location</h4>
        <div className="relative">
          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search or type a location"
            value={locationInput || (filters.location !== "All" ? filters.location : "")}
            onChange={(e) => { setLocationInput(e.target.value); setShowLocationDropdown(true); updateFilter("location", e.target.value || "All"); }}
            onFocus={() => setShowLocationDropdown(true)}
            onKeyDown={handleLocationInputKeyDown}
            className="pl-9 h-10 text-sm"
          />
          {showLocationDropdown && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-popover border border-border rounded-lg shadow-lg z-50 max-h-48 overflow-y-auto">
              <button
                onClick={() => handleLocationSelect("All")}
                className="w-full text-left px-3 py-2 text-sm hover:bg-muted transition-colors"
              >Any Location</button>
              {filteredLocations.map(loc => (
                <button
                  key={loc}
                  onClick={() => handleLocationSelect(loc)}
                  className={`w-full text-left px-3 py-2 text-sm hover:bg-muted transition-colors ${filters.location === loc ? "bg-primary/10 text-primary font-medium" : ""}`}
                >{loc}</button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Work Mode */}
      <div>
        <h4 className="text-sm font-semibold text-foreground mb-3">Work Mode</h4>
        <div className="flex flex-wrap gap-2">
          {WORK_MODES.map(mode => (
            <button
              key={mode}
              onClick={() => updateFilter("workMode", mode)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                filters.workMode === mode
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >{mode}</button>
          ))}
        </div>
      </div>

      {/* Job Type */}
      <div>
        <h4 className="text-sm font-semibold text-foreground mb-3">Job Type</h4>
        <div className="flex flex-wrap gap-2">
          {JOB_TYPES.map(type => (
            <button
              key={type}
              onClick={() => updateFilter("jobType", type)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                filters.jobType === type
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >{type}</button>
          ))}
        </div>
      </div>

      {/* Experience Level */}
      <div>
        <h4 className="text-sm font-semibold text-foreground mb-3">Experience</h4>
        <div className="flex flex-wrap gap-2">
          {EXPERIENCE_LEVELS.map(level => (
            <button
              key={level}
              onClick={() => updateFilter("experienceLevel", level)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                filters.experienceLevel === level
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >{level}</button>
          ))}
        </div>
      </div>

      {/* Salary Range */}
      <div>
        <h4 className="text-sm font-semibold text-foreground mb-3">Salary Range (LPA)</h4>
        <div className="flex gap-2 items-center">
          <Input
            type="number"
            placeholder="Min"
            value={filters.minSalary || ""}
            onChange={(e) => updateFilter("minSalary", e.target.value)}
            className="h-10 text-sm"
          />
          <span className="text-muted-foreground text-sm">to</span>
          <Input
            type="number"
            placeholder="Max"
            value={filters.maxSalary || ""}
            onChange={(e) => updateFilter("maxSalary", e.target.value)}
            className="h-10 text-sm"
          />
        </div>
      </div>

      {/* Posted */}
      <div>
        <h4 className="text-sm font-semibold text-foreground mb-3">Posted</h4>
        <div className="flex flex-wrap gap-2">
          {POSTED_OPTIONS.map(opt => (
            <button
              key={opt.value}
              onClick={() => updateFilter("postedWithin", opt.value)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                filters.postedWithin === opt.value
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >{opt.label}</button>
          ))}
        </div>
      </div>

      {/* Source */}
      <div>
        <h4 className="text-sm font-semibold text-foreground mb-3">Source</h4>
        <div className="flex flex-wrap gap-2">
          {["All", "Adzuna", "Arbeitnow", "Remotive"].map(s => (
            <button
              key={s}
              onClick={() => updateFilter("source", s)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                filters.source === s
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >{s}</button>
          ))}
        </div>
      </div>

      {/* Skills */}
      <div className="md:col-span-2 lg:col-span-1">
        <h4 className="text-sm font-semibold text-foreground mb-3">Skills</h4>
        <div className="relative mb-2">
          <Input
            placeholder="Add a skill..."
            value={skillInput}
            onChange={(e) => setSkillInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") { addSkill(skillInput.trim()); e.preventDefault(); } }}
            className="h-10 text-sm"
          />
        </div>
        <div className="flex flex-wrap gap-1.5 mb-2">
          {(filters.skills || []).map(skill => (
            <Badge key={skill} variant="default" className="gap-1 cursor-pointer hover:bg-primary/80" onClick={() => removeSkill(skill)}>
              {skill} <X className="w-3 h-3" />
            </Badge>
          ))}
        </div>
        <div className="flex flex-wrap gap-1">
          {SUGGESTED_SKILLS.filter(s => !(filters.skills || []).includes(s)).slice(0, 8).map(skill => (
            <button
              key={skill}
              onClick={() => addSkill(skill)}
              className="px-2 py-1 rounded text-xs bg-muted text-muted-foreground hover:bg-muted/80 transition-colors"
            >+ {skill}</button>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-4" onClick={(e) => {
      if (!e.target.closest('[data-location-dropdown]')) setShowLocationDropdown(false);
    }}>
      {/* Main Search Bar */}
      <div className="bg-card rounded-2xl p-4 md:p-6 shadow-card border border-border">
        <div className="flex flex-col md:flex-row gap-3">
          {/* Search Input */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              placeholder="Job title, keywords, or company"
              value={filters.search || ""}
              onChange={(e) => updateFilter("search", e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") onSearch(); }}
              className="pl-10 h-12 text-base"
            />
          </div>

          {/* Quick Location */}
          <div className="relative md:w-56" data-location-dropdown>
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground z-10" />
            <Input
              placeholder="Location"
              value={filters.location !== "All" ? filters.location : ""}
              onChange={(e) => { updateFilter("location", e.target.value || "All"); setShowLocationDropdown(true); }}
              onFocus={() => setShowLocationDropdown(true)}
              onKeyDown={(e) => { if (e.key === "Enter") { onSearch(); setShowLocationDropdown(false); } }}
              className="pl-10 h-12 text-base"
            />
            {showLocationDropdown && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-popover border border-border rounded-lg shadow-lg z-50 max-h-48 overflow-y-auto">
                <button onClick={() => handleLocationSelect("All")} className="w-full text-left px-3 py-2 text-sm hover:bg-muted transition-colors">Any Location</button>
                {filteredLocations.map(loc => (
                  <button
                    key={loc}
                    onClick={() => handleLocationSelect(loc)}
                    className={`w-full text-left px-3 py-2 text-sm hover:bg-muted transition-colors ${filters.location === loc ? "bg-primary/10 text-primary font-medium" : ""}`}
                  >{loc}</button>
                ))}
              </div>
            )}
          </div>

          {/* Search Button */}
          <Button onClick={onSearch} className="bg-gradient-primary hover:opacity-90 h-12 px-8 text-base font-medium">
            Search
          </Button>
        </div>

        {/* Quick Filter Tags */}
        <div className="flex flex-wrap items-center gap-2 mt-4">
          <Button
            variant={showAdvanced ? "default" : "outline"}
            size="sm"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="gap-1.5"
          >
            <SlidersHorizontal className="w-4 h-4" />
            All Filters
            {showAdvanced ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </Button>
          
          {/* Quick toggles */}
          {["Remote", "Internship", "Fresher"].map(tag => {
            const isActive =
              (tag === "Remote" && filters.workMode === "Remote") ||
              (tag === "Internship" && filters.jobType === "Internship") ||
              (tag === "Fresher" && filters.experienceLevel === "Fresher");
            return (
              <button
                key={tag}
                onClick={() => {
                  if (tag === "Remote") updateFilter("workMode", isActive ? "All" : "Remote");
                  if (tag === "Internship") updateFilter("jobType", isActive ? "All" : "Internship");
                  if (tag === "Fresher") updateFilter("experienceLevel", isActive ? "All" : "Fresher");
                }}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all border ${
                  isActive
                    ? "bg-primary text-primary-foreground border-primary shadow-sm"
                    : "bg-background text-muted-foreground border-border hover:border-primary/40"
                }`}
              >{tag}</button>
            );
          })}
        </div>
      </div>

      {/* Advanced Filters Panel */}
      {showAdvanced && (
        <div className="bg-card rounded-2xl p-4 md:p-6 shadow-card border border-border animate-in slide-in-from-top-2 duration-300">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-foreground">Filters</h3>
            <Button variant="ghost" size="sm" onClick={clearAll} className="text-muted-foreground hover:text-foreground">
              Clear All
            </Button>
          </div>
          <FilterPanel />
        </div>
      )}

      {/* Applied Filter Chips */}
      {activeFilters.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          {activeFilters.map((f, i) => (
            <Badge
              key={`${f.key}-${f.label}-${i}`}
              variant="secondary"
              className="gap-1 cursor-pointer hover:bg-destructive/10 hover:text-destructive transition-colors pr-1.5"
              onClick={() => removeFilter(f)}
            >
              {f.label}
              <X className="w-3 h-3" />
            </Badge>
          ))}
          <button
            onClick={clearAll}
            className="text-xs text-muted-foreground hover:text-foreground underline transition-colors"
          >Clear all</button>
        </div>
      )}

      {/* Results Count + Sort */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {totalJobs !== undefined ? (
            <>
              <span className="font-semibold text-foreground">{totalJobs.toLocaleString()}</span> jobs found
            </>
          ) : (
            "Searching..."
          )}
        </p>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">Sort:</span>
          <select
            value={sortValue}
            onChange={(e) => onSortChange(e.target.value)}
            className="text-xs bg-muted border-0 rounded-lg px-3 py-1.5 text-foreground focus:ring-1 focus:ring-primary outline-none cursor-pointer"
          >
            {SORT_OPTIONS.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
};