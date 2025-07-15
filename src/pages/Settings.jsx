
import React, { useState, useEffect } from "react";
import { User } from "@/api/entities";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Slider } from "@/components/ui/slider";
import {
  User as UserIcon,
  Bell,
  Shield,
  Palette,
  Database,
  LogOut,
  Save,
  Trash2,
  LayoutTemplate,
  Zap,
  Lightbulb,
  Footprints,
  Undo2,
  Download,
  Award,
  Settings,
  HelpCircle,
  Sliders, // New icon for the tune control
  MessageSquare, // Icon for response templates
} from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function SettingsPage() {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [notifications, setNotifications] = useState({
    email: true,
    push: false,
    weekly_summary: true,
    achievement_alerts: true
  });
  const [preferences, setPreferences] = useState({
    theme: "light",
    difficulty_mode: "adaptive",
    auto_save: true,
    tech_phobic_mode: false,
    use_analogies: false,
    use_micro_steps: false,
    show_safety_net: false,
    enable_cheat_cards: false,
    enable_micro_wins: false,
    rpg_mode_enabled: true, // New RPG mode toggle
  });
  const [showDifficultyOverride, setShowDifficultyOverride] = useState(false);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const userData = await User.me();
      setUser(userData);
      // Load saved preferences and notifications, falling back to defaults
      if (userData.preferences) {
        const loadedPrefs = { ...preferences, ...userData.preferences };
        setPreferences(loadedPrefs);
        // Show override controls if user has selected manual difficulty
        if (loadedPrefs.difficulty_mode !== 'adaptive') {
          setShowDifficultyOverride(true);
        }
      }
      if (userData.notifications) {
        setNotifications(prev => ({ ...prev, ...userData.notifications }));
      }
    } catch (error) {
      console.error("Error loading user data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    try {
      await User.updateMyUserData({
        ...user,
        preferences,
        notifications
      });
      // In a real application, you might show a success toast or message here.
      console.log("Profile saved successfully!");
    } catch (error) {
      console.error("Error saving profile:", error);
      // In a real application, you might show an error toast or message here.
    }
  };

  const handleLogout = async () => {
    try {
      await User.logout();
      // Redirect to login page or home page after logout
      window.location.href = '/login'; // Or use react-router-dom's navigate
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  const handleSeedData = async () => {
    try {
      // This is a placeholder for a real API call to seed sample data.
      // In a production environment, this functionality should be carefully controlled
      // and typically only available in development or staging environments.
      console.log("Attempting to seed sample data...");
      // Simulate an API call delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      console.log("Sample data seeded successfully!");
      // Optionally, refresh user data or relevant data after seeding
    } catch (error) {
      console.error("Error seeding sample data:", error);
      // Show error message
    }
  };

  const handleTechPhobicToggle = (checked) => {
    setPreferences(prev => ({
      ...prev,
      tech_phobic_mode: checked,
      use_analogies: checked,
      use_micro_steps: checked,
      show_safety_net: checked,
      enable_cheat_cards: checked,
      enable_micro_wins: checked,
    }));
  };

  const handleReturnToAdaptive = () => {
    setPreferences(prev => ({...prev, difficulty_mode: 'adaptive'}));
    setShowDifficultyOverride(false);
  };

  const getDifficultyFromSlider = (value) => {
    const modes = ['easy', 'adaptive', 'challenging'];
    return modes[value] || 'adaptive';
  };

  const getSliderFromDifficulty = (mode) => {
    const modes = ['easy', 'adaptive', 'challenging'];
    return modes.indexOf(mode) !== -1 ? modes.indexOf(mode) : 1;
  };

  const handleSliderChange = (value) => {
    const newMode = getDifficultyFromSlider(value[0]);
    setPreferences(prev => ({...prev, difficulty_mode: newMode}));
  };

  const getDifficultyLabel = (mode) => {
    switch (mode) {
      case 'easy': return 'Easy';
      case 'challenging': return 'Challenging';
      default: return 'Adaptive';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-slate-500">Loading settings...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Settings</h1>
          <p className="text-slate-600">Manage your account and learning preferences</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Settings */}
          <div className="lg:col-span-2 space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <UserIcon className="w-5 h-5" />
                    Profile Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="fullName">Full Name</Label>
                      <Input
                        id="fullName"
                        value={user?.full_name || ""}
                        onChange={(e) => setUser({...user, full_name: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        value={user?.email || ""}
                        disabled
                        className="bg-slate-50"
                      />
                    </div>
                  </div>
                  <Button onClick={handleSaveProfile} className="w-full md:w-auto">
                    <Save className="w-4 h-4 mr-2" />
                    Save Changes
                  </Button>
                </CardContent>
              </Card>
            </motion.div>

            {/* Notification Settings */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Bell className="w-5 h-5" />
                    Notifications
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Email Notifications</Label>
                      <p className="text-sm text-slate-500">Receive learning updates via email</p>
                    </div>
                    <Switch
                      checked={notifications.email}
                      onCheckedChange={(checked) =>
                        setNotifications({...notifications, email: checked})
                      }
                    />
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Achievement Alerts</Label>
                      <p className="text-sm text-slate-500">Get notified when you unlock new badges</p>
                    </div>
                    <Switch
                      checked={notifications.achievement_alerts}
                      onCheckedChange={(checked) =>
                        setNotifications({...notifications, achievement_alerts: checked})
                      }
                    />
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Weekly Summary</Label>
                      <p className="text-sm text-slate-500">Weekly progress reports</p>
                    </div>
                    <Switch
                      checked={notifications.weekly_summary}
                      onCheckedChange={(checked) =>
                        setNotifications({...notifications, weekly_summary: checked})
                      }
                    />
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Learning Preferences */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Palette className="w-5 h-5" />
                    Learning Preferences
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-2 rounded-lg bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200">
                    <div>
                      <Label htmlFor="rpg-mode" className="font-semibold text-purple-900">RPG Adventure Mode</Label>
                      <p className="text-sm text-purple-700">Transform learning into an epic quest with XP, levels, and achievements.</p>
                    </div>
                    <Switch
                      id="rpg-mode"
                      checked={preferences.rpg_mode_enabled}
                      onCheckedChange={(checked) => 
                        setPreferences({...preferences, rpg_mode_enabled: checked})
                      }
                    />
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border">
                    <div>
                      <Label htmlFor="tech-phobic-mode" className="font-semibold">Tech-Phobic Mode</Label>
                      <p className="text-sm text-slate-500">Enable a gentler, more guided learning experience.</p>
                    </div>
                    <Switch
                      id="tech-phobic-mode"
                      checked={preferences.tech_phobic_mode}
                      onCheckedChange={handleTechPhobicToggle}
                    />
                  </div>

                  <Separator />

                  <div className="space-y-4 pt-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Lightbulb className="w-4 h-4 text-slate-500" />
                        <div>
                          <Label>Real-life Analogies</Label>
                          <p className="text-sm text-slate-500">Explain concepts with familiar examples.</p>
                        </div>
                      </div>
                      <Switch
                        checked={preferences.use_analogies}
                        onCheckedChange={(checked) => setPreferences({...preferences, use_analogies: checked})}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Footprints className="w-4 h-4 text-slate-500" />
                        <div>
                          <Label>Micro-steps & Repetition</Label>
                          <p className="text-sm text-slate-500">Break down topics and reinforce learning.</p>
                        </div>
                      </div>
                      <Switch
                        checked={preferences.use_micro_steps}
                        onCheckedChange={(checked) => setPreferences({...preferences, use_micro_steps: checked})}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Undo2 className="w-4 h-4 text-slate-500" />
                        <div>
                          <Label>Safety Net Banners</Label>
                          <p className="text-sm text-slate-500">Show undo options and helpful tips first.</p>
                        </div>
                      </div>
                      <Switch
                        checked={preferences.show_safety_net}
                        onCheckedChange={(checked) => setPreferences({...preferences, show_safety_net: checked})}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Download className="w-4 h-4 text-slate-500" />
                        <div>
                          <Label>Downloadable Cheat Cards</Label>
                          <p className="text-sm text-slate-500">Provide quick-reference summaries.</p>
                        </div>
                      </div>
                      <Switch
                        checked={preferences.enable_cheat_cards}
                        onCheckedChange={(checked) => setPreferences({...preferences, enable_cheat_cards: checked})}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Award className="w-4 h-4 text-slate-500" />
                        <div>
                          <Label>Micro-win Badges</Label>
                          <p className="text-sm text-slate-500">Celebrate small achievements along the way.</p>
                        </div>
                      </div>
                      <Switch
                        checked={preferences.enable_micro_wins}
                        onCheckedChange={(checked) => setPreferences({...preferences, enable_micro_wins: checked})}
                      />
                    </div>
                  </div>

                  <Separator />

                  {/* Difficulty Mode */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Label>Learning Difficulty</Label>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button variant="ghost" size="icon" className="w-4 h-4 text-slate-400 hover:text-slate-600">
                                <HelpCircle className="w-3 h-3" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent className="max-w-xs">
                              <p>Adaptive mode automatically adjusts difficulty based on your progress and performance. Recommended for most learners.</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <div className={`flex items-center gap-2 px-3 py-2 rounded-full border transition-colors ${
                          preferences.difficulty_mode === 'adaptive' 
                            ? 'bg-blue-50 border-blue-200 text-blue-700' 
                            : 'bg-slate-50 border-slate-200 text-slate-700'
                        }`}>
                          <div className="w-2 h-2 bg-current rounded-full opacity-60"></div>
                          <span className="text-sm font-medium">
                            Autopilot: {getDifficultyLabel(preferences.difficulty_mode)}
                          </span>
                        </div>
                        
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setShowDifficultyOverride(!showDifficultyOverride)}
                          className="text-slate-500 hover:text-slate-700 p-2"
                        >
                          <Sliders className="w-4 h-4" />
                        </Button>
                        
                        {preferences.difficulty_mode !== 'adaptive' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleReturnToAdaptive}
                            className="text-blue-600 hover:text-blue-700 text-xs px-3 py-1 h-7 rounded-full border border-blue-200 bg-blue-50"
                          >
                            Reset to Adaptive
                          </Button>
                        )}
                      </div>

                      {showDifficultyOverride && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          className="border rounded-lg p-4 bg-slate-50"
                        >
                          <div className="space-y-4">
                            <div className="flex items-center justify-between text-xs text-slate-500">
                              <span>Easy</span>
                              <span>Adaptive</span>
                              <span>Challenging</span>
                            </div>
                            
                            <Slider
                              value={[getSliderFromDifficulty(preferences.difficulty_mode)]}
                              onValueChange={handleSliderChange}
                              max={2}
                              min={0}
                              step={1}
                              className="w-full"
                            />
                            
                            <div className="text-center">
                              <span className="text-sm font-medium text-slate-700">
                                Current: {getDifficultyLabel(preferences.difficulty_mode)}
                              </span>
                              {preferences.difficulty_mode === 'adaptive' && (
                                <p className="text-xs text-slate-500 mt-1">
                                  System will automatically adjust based on your progress
                                </p>
                              )}
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Account Actions */}
          <div className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="w-5 h-5" />
                    Account
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-center">
                    <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="text-2xl font-bold text-white">
                        {user?.full_name?.[0]?.toUpperCase() || "U"}
                      </span>
                    </div>
                    <h3 className="font-semibold text-slate-900">{user?.full_name}</h3>
                    <p className="text-sm text-slate-500">{user?.role}</p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {user?.role === 'admin' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-purple-600">
                      <LayoutTemplate className="w-5 h-5" />
                      Admin Tools
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <Button asChild variant="outline" className="w-full justify-start">
                      <Link to={createPageUrl('AdminTextEditor')}>
                        <MessageSquare className="w-4 h-4 mr-2" />
                        Response Editor
                      </Link>
                    </Button>
                    <Button asChild variant="outline" className="w-full justify-start">
                      <Link to={createPageUrl('LayoutManager')}>
                        <LayoutTemplate className="w-4 h-4 mr-2" />
                        Manage Sidebar
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: user?.role === 'admin' ? 0.6 : 0.5 }} // Adjust delay based on previous card
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Database className="w-5 h-5" />
                    Data Management
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button variant="outline" className="w-full justify-start">
                    <Database className="w-4 h-4 mr-2" />
                    Export Learning Data
                  </Button>
                  {user?.role === 'admin' && (
                    <Button variant="outline" className="w-full justify-start" onClick={handleSeedData}>
                      <Zap className="w-4 h-4 mr-2" />
                      Seed Sample Data
                    </Button>
                  )}
                  <Button variant="outline" className="w-full justify-start text-red-600 hover:text-red-700">
                    <Trash2 className="w-4 h-4 mr-2" />
                    Clear Progress
                  </Button>
                  <Separator />
                  <Button
                    variant="destructive"
                    className="w-full"
                    onClick={handleLogout}
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Sign Out
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
