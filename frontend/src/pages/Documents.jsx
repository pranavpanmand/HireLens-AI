import { useState } from "react";
import { PageTransition } from "@/components/layout/PageTransition";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Download, FilePlus, Eye, Search, Filter } from "lucide-react";
import { useResumes } from "@/hooks/useResumes";
import { GlobalLoader } from "@/components/ui/GlobalLoader";
import { Input } from "@/components/ui/input";

const Documents = () => {
  const { data: resumes, isLoading } = useResumes();
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("all");

  if (isLoading) return <GlobalLoader />;

  // Mock data for Cover Letters and Tailored Resumes since we don't have dedicated hooks for listing them yet
  const documents = [
    ...(resumes || []).map(r => ({ id: r._id, type: "Base Resume", title: r.originalName || "Primary Resume", date: new Date(r.createdAt).toLocaleDateString(), url: r.fileUrl })),
    { id: "gen1", type: "Tailored Resume", title: "Frontend Developer - Google", date: new Date().toLocaleDateString(), url: "#" },
    { id: "cl1", type: "Cover Letter", title: "Software Engineer - Amazon", date: new Date(Date.now() - 86400000).toLocaleDateString(), url: "#" }
  ];

  const filteredDocs = documents.filter(doc => {
    if (activeTab !== "all" && doc.type.toLowerCase() !== activeTab.toLowerCase().replace('-', ' ')) return false;
    if (searchTerm && !doc.title.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    return true;
  });

  return (
    <PageTransition>
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <div className="inline-flex items-center justify-center p-3 bg-secondary/10 rounded-2xl mb-4">
              <FileText className="w-8 h-8 text-secondary" />
            </div>
            <h1 className="text-4xl font-bold mb-2">My Documents</h1>
            <p className="text-muted-foreground text-lg">
              Manage your resumes, tailored versions, and cover letters in one place.
            </p>
          </div>
          
          <Button className="bg-gradient-primary h-11 px-6 shadow-elevated">
            <FilePlus className="w-5 h-5 mr-2" /> Upload New
          </Button>
        </div>

        <Card className="bg-card shadow-card">
          <CardHeader className="border-b border-border pb-6 mb-6">
            <div className="flex flex-col md:flex-row justify-between gap-4">
              <div className="flex bg-muted p-1 rounded-xl w-full md:w-auto">
                <button onClick={() => setActiveTab('all')} className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'all' ? 'bg-background shadow text-foreground' : 'text-muted-foreground'}`}>All</button>
                <button onClick={() => setActiveTab('base resume')} className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'base resume' ? 'bg-background shadow text-foreground' : 'text-muted-foreground'}`}>Base Resumes</button>
                <button onClick={() => setActiveTab('tailored resume')} className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'tailored resume' ? 'bg-background shadow text-foreground' : 'text-muted-foreground'}`}>Tailored</button>
                <button onClick={() => setActiveTab('cover letter')} className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'cover letter' ? 'bg-background shadow text-foreground' : 'text-muted-foreground'}`}>Cover Letters</button>
              </div>
              
              <div className="relative w-full md:w-72">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input 
                  placeholder="Search documents..." 
                  className="pl-9 h-10 bg-background"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {filteredDocs.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs text-muted-foreground uppercase bg-muted/50">
                    <tr>
                      <th className="px-6 py-4 rounded-tl-lg">Document Name</th>
                      <th className="px-6 py-4">Type</th>
                      <th className="px-6 py-4">Created Date</th>
                      <th className="px-6 py-4 text-right rounded-tr-lg">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredDocs.map((doc, idx) => (
                      <tr key={doc.id} className="border-b border-border hover:bg-muted/30 transition-colors group">
                        <td className="px-6 py-4 font-medium text-foreground flex items-center gap-3">
                          <FileText className={`w-5 h-5 ${doc.type === 'Cover Letter' ? 'text-secondary' : 'text-primary'}`} />
                          {doc.title}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                            doc.type === 'Base Resume' ? 'bg-blue-500/10 text-blue-500' :
                            doc.type === 'Tailored Resume' ? 'bg-primary/10 text-primary' :
                            'bg-secondary/10 text-secondary'
                          }`}>
                            {doc.type}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-muted-foreground">{doc.date}</td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary">
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary">
                              <Download className="w-4 h-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-12">
                <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                <h3 className="text-lg font-medium text-foreground">No documents found</h3>
                <p className="text-muted-foreground">Upload a base resume or generate new ones using our AI tools.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </PageTransition>
  );
};

export default Documents;
