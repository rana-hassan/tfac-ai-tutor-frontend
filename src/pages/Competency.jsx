
import React, { useState, useEffect } from "react";
import { Competency } from "@/api/entities";
import { User } from "@/api/entities"; // Added import for User entity
import { TutorProgress } from "@/api/entities"; // Added import for TutorProgress entity
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Shapes,
  CheckCircle,
  BookOpen,
  PieChart,
  Lock,
  GitFork
} from "lucide-react";
import HoneycombGrid from "../components/competency/HoneycombGrid";

export default function CompetencyPage() {
  const [competencies, setCompetencies] = useState([]);
  const [learningPaths, setLearningPaths] = useState(null); // Changed to null to indicate initial unset state
  const [selectedPath, setSelectedPath] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadCompetencies();
  }, []);

  const loadCompetencies = async () => {
    try {
      console.log('[CompetencyPage] Loading competencies...');
      
      const currentUser = await User.me(); // Fetch the current user
      
      // Load competency definitions and user-specific progress in parallel
      const [competencyDefinitions, progressData] = await Promise.all([
        Competency.list(), // Global competency definitions
        TutorProgress.filter({ created_by: currentUser.email }) // User's progress records
      ]);
      
      // Ensure fetched data is an array
      const safeCompetencyDefinitions = Array.isArray(competencyDefinitions) ? competencyDefinitions : [];
      const safeProgressData = Array.isArray(progressData) ? progressData : [];

      // Merge competency definitions with user's specific progress
      const competenciesWithProgress = safeCompetencyDefinitions.map(comp => {
        const userProgress = safeProgressData.find(p => p.competency_id === comp.id);
        
        // Initialize with default values (e.g., for competencies without specific user progress)
        let progress = 0;
        let is_unlocked = comp.prerequisites?.length === 0; // Default to unlocked if no prerequisites
        let is_completed = false;

        // Apply user-specific progress if found
        if (userProgress) {
          if (userProgress.percent_complete !== undefined && userProgress.percent_complete !== null) {
            progress = userProgress.percent_complete;
            is_completed = userProgress.percent_complete >= 100;
          }
          if (userProgress.is_unlocked !== undefined && userProgress.is_unlocked !== null) {
            is_unlocked = userProgress.is_unlocked;
          }
        }

        return {
          ...comp,
          progress,
          is_unlocked,
          is_completed
        };
      });
      
      console.log('[CompetencyPage] Merged competencies with user progress:', competenciesWithProgress);
      setCompetencies(competenciesWithProgress);

      // Extract unique learning paths from the merged competencies
      const paths = [...new Set(competenciesWithProgress.map(c => c?.learning_path).filter(Boolean))]; 
      console.log('[CompetencyPage] Extracted learning paths:', paths);
      
      setLearningPaths(paths);
      if (paths.length > 0) {
        setSelectedPath(paths[0]);
      } else {
        setSelectedPath(null); // No paths available
      }
    } catch (error) {
      console.error("Error loading competencies:", error);
      setCompetencies([]); // Ensure we have a safe fallback
      setLearningPaths([]); // Ensure paths are cleared on error
      setSelectedPath(null);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Add a check for 'c' being truthy to prevent errors if an item is undefined/null
  const filteredCompetencies = competencies.filter(c => c && c.learning_path === selectedPath);

  const completedCount = competencies.filter(c => c.is_completed).length;
  const inProgressCount = competencies.filter(c => c.is_unlocked && !c.is_completed).length;

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Competency Map</h1>
          <p className="text-slate-600">Visualize your learning journey and unlock new skills</p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <Card>
              <CardHeader className="pb-3 flex-row items-center justify-between">
                <CardTitle className="text-sm font-medium text-slate-600">Total Competencies</CardTitle>
                <Shapes className="w-4 h-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-slate-900">{competencies.length}</div>
              </CardContent>
            </Card>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <Card>
              <CardHeader className="pb-3 flex-row items-center justify-between">
                <CardTitle className="text-sm font-medium text-slate-600">Mastered</CardTitle>
                <CheckCircle className="w-4 h-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-slate-900">{completedCount}</div>
              </CardContent>
            </Card>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <Card>
              <CardHeader className="pb-3 flex-row items-center justify-between">
                <CardTitle className="text-sm font-medium text-slate-600">In Progress</CardTitle>
                <BookOpen className="w-4 h-4 text-orange-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-slate-900">{inProgressCount}</div>
              </CardContent>
            </Card>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
            <Card>
              <CardHeader className="pb-3 flex-row items-center justify-between">
                <CardTitle className="text-sm font-medium text-slate-600">Learning Paths</CardTitle>
                <GitFork className="w-4 h-4 text-purple-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-slate-900">{Array.isArray(learningPaths) ? learningPaths.length : 0}</div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Learning Path Selection */}
        <div className="flex flex-wrap gap-2 mb-6">
          {Array.isArray(learningPaths) && learningPaths.length > 0 ? (
            learningPaths.map((path) => (
              <Button
                key={path}
                variant={selectedPath === path ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedPath(path)}
                className="capitalize"
              >
                {path}
              </Button>
            ))
          ) : (
            <p className="text-slate-500">No learning paths available.</p>
          )}
        </div>

        {/* Competency Grid */}
        <Card>
          <CardContent className="p-2 sm:p-6 md:p-10 flex justify-center items-center">
            {isLoading ? (
              <div className="text-center text-slate-500">Loading...</div>
            ) : (
              <HoneycombGrid 
                competencies={filteredCompetencies} 
                onSelect={(id) => console.log('Selected competency:', id)}
                rpgMode={true}
              />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
