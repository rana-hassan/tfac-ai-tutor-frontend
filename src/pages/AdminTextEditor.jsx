
import React, { useState, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import { User } from "@/api/entities";
import { ResponseTemplate } from "@/api/entities";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Save, Plus, Trash2, Edit3, Shield, Info } from "lucide-react";
import { motion } from "framer-motion";
import { useToast } from "@/components/ui/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Helper to generate a URL-friendly slug from a string
const slugify = (text) => {
  return text
    .toString()
    .toLowerCase()
    .replace(/\s+/g, '-')       // Replace spaces with -
    .replace(/[^\w\-]+/g, '')   // Remove all non-word chars
    .replace(/\-\-+/g, '-')     // Replace multiple - with single -
    .replace(/^-+/, '')         // Trim - from start of text
    .replace(/-+$/, '');        // Trim - from end of text
};


export default function AdminTextEditorPage() {
  const [user, setUser] = useState(null);
  const [templates, setTemplates] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({
    key: "",
    title: "",
    content: "",
    prompt_keywords: [],
    is_active: true,
    version: 1,
  });
  const { toast } = useToast();

  useEffect(() => {
    checkAdminAndLoad();
  }, []);

  const checkAdminAndLoad = async () => {
    try {
      const currentUser = await User.me();
      if (currentUser?.role !== 'admin') {
        return; // Non-admin users will see access denied
      }
      
      setUser(currentUser);
      await loadTemplates();
    } catch (error) {
      console.error("Error checking admin status:", error);
       toast({
        title: "Error",
        description: "Could not verify admin status.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const loadTemplates = async () => {
    try {
      const data = await ResponseTemplate.list('-updated_date');
      setTemplates(data);
      
      const newAIExplanationContent = `Think of AI as software that learns from examples the way we do—from photos, words, or numbers—so it can spot patterns and make decisions on its own. It's basically teaching computers to "think" just enough to help with tasks like recommending songs, answering questions, or even driving cars.`;

      // Create default AI explanation template if it doesn't exist
      const aiTemplate = data.find(t => t.key === 'ai_explanation');
      if (!aiTemplate) {
        await ResponseTemplate.create({
          key: 'ai_explanation',
          title: 'AI Explanation',
          content: newAIExplanationContent,
          prompt_keywords: ['ai', 'artificial intelligence', 'what is ai', 'what\'s ai'],
          is_active: true,
          version: 1,
        });
        await loadTemplates(); // Refresh
      } else {
        // Update existing template with new content if it's different
        if (aiTemplate.content !== newAIExplanationContent) {
          await ResponseTemplate.update(aiTemplate.id, {
            ...aiTemplate,
            content: newAIExplanationContent,
            version: (aiTemplate.version || 1) + 1
          });
          await loadTemplates(); // Refresh
        }
      }
    } catch (error) {
      console.error("Error loading templates:", error);
      toast({
        title: "Error Loading Templates",
        description: "Could not fetch response templates.",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (template) => {
    setEditingId(template.id);
    setEditForm({
      key: template.key,
      title: template.title,
      content: template.content,
      prompt_keywords: template.prompt_keywords || [],
      is_active: template.is_active,
      version: template.version || 1
    });
  };

  const handleSave = async () => {
    try {
      // Normalize keywords before saving
      const normalizedKeywords = editForm.prompt_keywords.map(k => k.toLowerCase().trim());
      const payload = { ...editForm, prompt_keywords: normalizedKeywords };

      if (editingId) {
        // Increment version on update
        payload.version = (payload.version || 1) + 1;
        await ResponseTemplate.update(editingId, payload);
        toast({ title: "Success", description: `Template "${payload.title}" updated.` });
      } else {
        await ResponseTemplate.create(payload);
        toast({ title: "Success", description: `Template "${payload.title}" created.` });
      }
      
      setEditingId(null);
      resetForm();
      await loadTemplates();
    } catch (error) {
      console.error("Error saving template:", error);
      toast({ title: "Save Failed", description: "Could not save the template.", variant: "destructive" });
    }
  };

  const handleDelete = async (id) => {
    if (confirm("Are you sure you want to delete this template?")) {
      try {
        await ResponseTemplate.delete(id);
        await loadTemplates();
        toast({ title: "Template Deleted", description: "The template was successfully deleted." });
      } catch (error) {
        console.error("Error deleting template:", error);
        toast({ title: "Delete Failed", description: "Could not delete the template.", variant: "destructive" });
      }
    }
  };

  const addKeyword = (keywordInput) => {
    const keyword = keywordInput.value;
    if (keyword && !editForm.prompt_keywords.includes(keyword)) {
      setEditForm({
        ...editForm,
        prompt_keywords: [...editForm.prompt_keywords, keyword]
      });
      keywordInput.value = ""; // Clear input after adding
    }
  };

  const removeKeyword = (keyword) => {
    setEditForm({
      ...editForm,
      prompt_keywords: editForm.prompt_keywords.filter(k => k !== keyword)
    });
  };

  const handleTitleChange = (e) => {
    const newTitle = e.target.value;
    setEditForm(prev => ({
      ...prev,
      title: newTitle,
      // Auto-slugify the key from the title for new templates
      key: editingId ? prev.key : slugify(newTitle)
    }));
  };
  
  const resetForm = () => {
    setEditingId(null);
    setEditForm({
      key: "",
      title: "",
      content: "",
      prompt_keywords: [],
      is_active: true,
      version: 1,
    });
  };


  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-slate-500">Loading...</div>
      </div>
    );
  }

  if (!user || user.role !== 'admin') {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Card className="w-96">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-600">
              <Shield className="w-6 h-6" />
              Access Denied
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-slate-600">You must be an administrator to access this page.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 p-6">
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Editor Form */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Edit3 className="w-6 h-6" />
                  {editingId ? "Edit Template" : "Create New Template"}
                </div>
                {editingId && (
                  <Button variant="outline" size="sm" onClick={resetForm}>
                    <Plus className="w-4 h-4 mr-2" />
                    Create New
                  </Button>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <label htmlFor="title" className="font-medium">Title</label>
                <Input
                  id="title"
                  placeholder="e.g., Simple AI Explanation"
                  value={editForm.title}
                  onChange={handleTitleChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="key" className="font-medium">Key</label>
                <Input
                  id="key"
                  placeholder="auto-generated-from-title"
                  value={editForm.key}
                  onChange={(e) => setEditForm({ ...editForm, key: e.target.value })}
                  disabled={!!editingId}
                  required
                />
              </div>

              {/* Markdown Editor with Preview */}
              <div className="space-y-2">
                <label htmlFor="content" className="font-medium">Response Content</label>
                <Tabs defaultValue="write" className="w-full">
                  <TabsList>
                    <TabsTrigger value="write">Write</TabsTrigger>
                    <TabsTrigger value="preview">Preview</TabsTrigger>
                  </TabsList>
                  <TabsContent value="write" className="mt-2">
                    <Textarea
                      id="content"
                      placeholder="Write the response text here... Markdown is supported."
                      value={editForm.content}
                      onChange={(e) => setEditForm({ ...editForm, content: e.target.value })}
                      rows={12}
                      required
                      className="resize-y"
                    />
                  </TabsContent>
                  <TabsContent value="preview" className="mt-2">
                    <div className="p-4 border rounded-md min-h-[258px] bg-slate-50">
                      <article className="prose prose-sm max-w-none">
                        <ReactMarkdown>{editForm.content || "Nothing to preview yet."}</ReactMarkdown>
                      </article>
                    </div>
                  </TabsContent>
                </Tabs>
              </div>

              <div className="space-y-3">
                <label className="font-medium">Prompt Keywords</label>
                <div className="flex gap-2">
                  <Input
                    id="keyword-input"
                    placeholder="Type a keyword and press Enter"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addKeyword(e.target);
                      }
                    }}
                  />
                  <Button
                    type="button"
                    onClick={() => addKeyword(document.getElementById('keyword-input'))}
                  >
                    Add
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {editForm.prompt_keywords.map(keyword => (
                    <Badge key={keyword} variant="secondary" className="flex items-center gap-2">
                      {keyword}
                      <button onClick={() => removeKeyword(keyword)} className="text-red-500 hover:text-red-700">
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>
              <div className="flex justify-between items-center pt-4 border-t">
                <div className="text-sm text-slate-500">
                  Version: {editForm.version}
                </div>
                <Button onClick={handleSave} size="lg">
                  <Save className="w-4 h-4 mr-2" />
                  {editingId ? "Save Changes" : "Create Template"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Template List */}
        <div className="space-y-4">
          <Card className="bg-blue-50 border-blue-200">
              <CardContent className="p-4 flex items-start gap-3">
                  <Info className="w-5 h-5 text-blue-600 mt-1 flex-shrink-0"/>
                  <div>
                      <h4 className="font-semibold text-blue-800">How it works</h4>
                      <p className="text-sm text-blue-700">Templates override the AI. If a user's prompt contains any of your keywords, this text will be shown instead of a generated response.</p>
                  </div>
              </CardContent>
          </Card>
        
          <h2 className="text-xl font-bold text-slate-800">Existing Templates</h2>
          <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-2">
            {templates.map(template => (
              <motion.div
                key={template.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                layout
              >
                <Card className={`transition-all ${editingId === template.id ? 'border-blue-500 ring-2 ring-blue-500' : ''}`}>
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-base">{template.title}</CardTitle>
                      <Badge variant={template.is_active ? "default" : "outline"}>
                        {template.is_active ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                    <p className="text-xs text-slate-500 pt-1">
                      Key: {template.key} | v{template.version || 1}
                    </p>
                  </CardHeader>
                  <CardContent>
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" size="sm" onClick={() => handleDelete(template.id)}>
                        <Trash2 className="w-3 h-3" />
                      </Button>
                      <Button size="sm" onClick={() => handleEdit(template)}>
                        <Edit3 className="w-3 h-3 mr-1" />
                        Edit
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
