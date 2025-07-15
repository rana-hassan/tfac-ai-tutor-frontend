import React, { useState, useEffect } from "react";
import { StudyPlan } from "@/api/entities";
import { User } from "@/api/entities";
import { InvokeLLM } from "@/api/integrations";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  BookOpen,
  Target,
  Clock,
  Brain,
  Plus,
  CheckCircle,
  Calendar,
  Sparkles,
  TrendingUp,
  Award
} from "lucide-react";

export default function StudyPlannerPage() {
  const [studyPlans, setStudyPlans] = useState([]);
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [newPlan, setNewPlan] = useState({
    title: "",
    description: "",
    subject: "",
    difficulty_level: "beginner",
    estimated_hours: 10
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [userData, plansData] = await Promise.all([
        User.me(),
        StudyPlan.list("-created_date")
      ]);
      setUser(userData);
      setStudyPlans(plansData);
    } catch (error) {
      console.error("Error loading study planner data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const generateAIPlan = async () => {
    if (!newPlan.subject || !newPlan.title) return;
    
    setIsGenerating(true);
    try {
      const response = await InvokeLLM({
        prompt: `Create a detailed study plan for learning "${newPlan.subject}" at ${newPlan.difficulty_level} level. 
        The plan should be titled "${newPlan.title}" and take approximately ${newPlan.estimated_hours} hours to complete.
        
        Please provide:
        1. A comprehensive description of what the student will learn
        2. 5-8 specific milestones/checkpoints with clear learning objectives
        3. Estimated XP rewards for each milestone (15-50 XP based on complexity)
        
        Consider the student's background: ${user?.preferences?.subjects?.join(', ') || 'general learning'}`,
        response_json_schema: {
          type: "object",
          properties: {
            description: { type: "string" },
            milestones: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  title: { type: "string" },
                  description: { type: "string" },
                  xp_reward: { type: "number" },
                  completed: { type: "boolean" }
                }
              }
            }
          }
        }
      });

      const planData = {
        ...newPlan,
        description: response.description,
        milestones: response.milestones.map(m => ({ ...m, completed: false })),
        is_active: true,
        progress_percentage: 0
      };

      await StudyPlan.create(planData);
      await loadData();
      setShowCreateForm(false);
      setNewPlan({
        title: "",
        description: "",
        subject: "",
        difficulty_level: "beginner",
        estimated_hours: 10
      });
    } catch (error) {
      console.error("Error generating AI study plan:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  const toggleMilestone = async (planId, milestoneIndex) => {
    const plan = studyPlans.find(p => p.id === planId);
    if (!plan) return;

    const updatedMilestones = plan.milestones.map((milestone, index) => 
      index === milestoneIndex 
        ? { ...milestone, completed: !milestone.completed }
        : milestone
    );

    const completedCount = updatedMilestones.filter(m => m.completed).length;
    const progressPercentage = (completedCount / updatedMilestones.length) * 100;

    // Award XP if milestone was just completed
    if (!plan.milestones[milestoneIndex].completed && updatedMilestones[milestoneIndex].completed) {
      const xpGained = updatedMilestones[milestoneIndex].xp_reward || 25;
      await awardXP(xpGained);
    }

    await StudyPlan.update(planId, {
      milestones: updatedMilestones,
      progress_percentage: progressPercentage
    });

    await loadData();
  };

  const awardXP = async (amount) => {
    try {
      const currentStats = user.rpg_stats || {
        level: 1, total_xp: 0, current_level_xp: 0, xp_to_next_level: 100
      };
      
      const newTotalXP = currentStats.total_xp + amount;
      const newCurrentLevelXP = currentStats.current_level_xp + amount;
      
      let newLevel = currentStats.level;
      let newXPToNext = currentStats.xp_to_next_level;
      
      if (newCurrentLevelXP >= currentStats.xp_to_next_level) {
        newLevel += 1;
        newXPToNext = newLevel * 100;
      }
      
      const updatedStats = {
        ...currentStats,
        level: newLevel,
        total_xp: newTotalXP,
        current_level_xp: newCurrentLevelXP >= currentStats.xp_to_next_level ? 
          newCurrentLevelXP - currentStats.xp_to_next_level : newCurrentLevelXP,
        xp_to_next_level: newXPToNext
      };
      
      await User.updateMyUserData({ rpg_stats: updatedStats });
      setUser(prev => ({ ...prev, rpg_stats: updatedStats }));
    } catch (error) {
      console.error("Error awarding XP:", error);
    }
  };

  const activePlans = studyPlans.filter(plan => plan.is_active);
  const completedPlans = studyPlans.filter(plan => plan.progress_percentage === 100);

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 mb-2">Study Planner</h1>
              <p className="text-slate-600">AI-powered personalized learning paths</p>
            </div>
            <Button 
              onClick={() => setShowCreateForm(true)}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="w-5 h-5 mr-2" />
              Create New Plan
            </Button>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-slate-600">Active Plans</CardTitle>
                <BookOpen className="w-4 h-4 text-blue-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900">{activePlans.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-slate-600">Completed</CardTitle>
                <CheckCircle className="w-4 h-4 text-green-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900">{completedPlans.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-slate-600">Total Hours</CardTitle>
                <Clock className="w-4 h-4 text-purple-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900">
                {studyPlans.reduce((sum, plan) => sum + (plan.estimated_hours || 0), 0)}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-slate-600">Avg Progress</CardTitle>
                <TrendingUp className="w-4 h-4 text-orange-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900">
                {studyPlans.length > 0 
                  ? Math.round(studyPlans.reduce((sum, plan) => sum + plan.progress_percentage, 0) / studyPlans.length)
                  : 0}%
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Create Plan Form */}
        <AnimatePresence>
          {showCreateForm && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <Card className="mb-8">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-purple-500" />
                    Create AI-Powered Study Plan
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-slate-700 mb-2 block">Plan Title</label>
                      <Input
                        placeholder="e.g., Master Python Programming"
                        value={newPlan.title}
                        onChange={(e) => setNewPlan({...newPlan, title: e.target.value})}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-slate-700 mb-2 block">Subject</label>
                      <Input
                        placeholder="e.g., Python, Mathematics, Physics"
                        value={newPlan.subject}
                        onChange={(e) => setNewPlan({...newPlan, subject: e.target.value})}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-slate-700 mb-2 block">Difficulty Level</label>
                      <Select value={newPlan.difficulty_level} onValueChange={(value) => setNewPlan({...newPlan, difficulty_level: value})}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="beginner">Beginner</SelectItem>
                          <SelectItem value="intermediate">Intermediate</SelectItem>
                          <SelectItem value="advanced">Advanced</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-slate-700 mb-2 block">Estimated Hours</label>
                      <Input
                        type="number"
                        min="1"
                        max="100"
                        value={newPlan.estimated_hours}
                        onChange={(e) => setNewPlan({...newPlan, estimated_hours: parseInt(e.target.value) || 10})}
                      />
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <Button 
                      onClick={generateAIPlan}
                      disabled={!newPlan.title || !newPlan.subject || isGenerating}
                      className="bg-purple-600 hover:bg-purple-700"
                    >
                      {isGenerating ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                          Generating...
                        </>
                      ) : (
                        <>
                          <Brain className="w-4 h-4 mr-2" />
                          Generate AI Plan
                        </>
                      )}
                    </Button>
                    <Button variant="outline" onClick={() => setShowCreateForm(false)}>
                      Cancel
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Study Plans Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {studyPlans.map((plan, index) => (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="h-full">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg mb-2">{plan.title}</CardTitle>
                      <div className="flex items-center gap-2 mb-3">
                        <Badge variant="outline">{plan.difficulty_level}</Badge>
                        <Badge variant="secondary">{plan.subject}</Badge>
                        <div className="text-sm text-slate-500 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {plan.estimated_hours}h
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-slate-900">{plan.progress_percentage}%</div>
                      <div className="text-xs text-slate-500">Complete</div>
                    </div>
                  </div>
                  <Progress value={plan.progress_percentage} className="h-2" />
                </CardHeader>
                
                <CardContent>
                  <p className="text-slate-600 text-sm mb-4 line-clamp-2">{plan.description}</p>
                  
                  {plan.milestones && plan.milestones.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium text-slate-700 flex items-center gap-2">
                        <Target className="w-4 h-4" />
                        Milestones ({plan.milestones.filter(m => m.completed).length}/{plan.milestones.length})
                      </h4>
                      <div className="space-y-2 max-h-32 overflow-y-auto">
                        {plan.milestones.map((milestone, milestoneIndex) => (
                          <div 
                            key={milestoneIndex}
                            className="flex items-center gap-2 p-2 rounded-lg hover:bg-slate-50 cursor-pointer transition-colors"
                            onClick={() => toggleMilestone(plan.id, milestoneIndex)}
                          >
                            <div className={`w-2 h-2 rounded-full ${
                              milestone.completed ? 'bg-green-500' : 'bg-slate-300'
                            }`}></div>
                            <span className={`text-sm flex-1 ${
                              milestone.completed ? 'line-through text-slate-500' : 'text-slate-700'
                            }`}>
                              {milestone.title}
                            </span>
                            {milestone.xp_reward && (
                              <Badge className="bg-yellow-100 text-yellow-800 text-xs">
                                +{milestone.xp_reward} XP
                              </Badge>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {studyPlans.length === 0 && !isLoading && (
          <div className="text-center py-12">
            <BookOpen className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-900 mb-2">No Study Plans Yet</h3>
            <p className="text-slate-600 mb-4">Create your first AI-powered study plan to get started</p>
            <Button onClick={() => setShowCreateForm(true)} className="bg-blue-600 hover:bg-blue-700">
              <Plus className="w-5 h-5 mr-2" />
              Create Your First Plan
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}