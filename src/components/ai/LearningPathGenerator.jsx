import React from 'react';
import { InvokeLLM } from '@/api/integrations';
import { Competency } from '@/api/entities';
import { StudyPlan } from '@/api/entities';
import { User } from '@/api/entities';

/**
 * AI-Powered Learning Path Generator
 * Creates personalized learning journeys based on user goals, current level, and preferences
 */
export class LearningPathGenerator {
  static async generatePersonalizedPath(userId, subject, goals = {}) {
    try {
      const userProfile = await this.buildUserProfile(userId);
      const subjectAnalysis = await this.analyzeSubjectDomain(subject);
      const pathStructure = await this.designLearningPath(userProfile, subjectAnalysis, goals);
      const detailedPath = await this.createDetailedPath(pathStructure);
      
      return {
        pathId: `path_${Date.now()}`,
        subject,
        userLevel: userProfile.currentLevel,
        estimatedDuration: pathStructure.estimatedWeeks,
        competencies: detailedPath.competencies,
        milestones: detailedPath.milestones,
        studyPlans: detailedPath.studyPlans,
        adaptiveElements: detailedPath.adaptiveFeatures
      };
    } catch (error) {
      console.error('Learning path generation failed:', error);
      throw error;
    }
  }

  static async buildUserProfile(userId) {
    const [user, existingCompetencies, progress] = await Promise.all([
      User.me(),
      Competency.filter({ created_by: userId }),
      // Get user's learning history and preferences
    ]);

    const profile = {
      userId,
      currentLevel: this.calculateOverallLevel(existingCompetencies),
      preferences: user.preferences || {},
      learningStyle: user.preferences?.learning_style || 'balanced',
      timeAvailable: user.preferences?.dailyGoalMinutes || 30,
      completedCompetencies: existingCompetencies.filter(c => c.is_completed),
      strengths: this.identifyStrengths(existingCompetencies),
      challenges: this.identifyChallenges(progress)
    };

    return profile;
  }

  static calculateOverallLevel(competencies) {
    if (!competencies.length) return 'beginner';
    
    const levelScores = { beginner: 1, intermediate: 2, advanced: 3, expert: 4 };
    const avgScore = competencies.reduce((sum, c) => 
      sum + (levelScores[c.level] || 1), 0) / competencies.length;
    
    if (avgScore <= 1.5) return 'beginner';
    if (avgScore <= 2.5) return 'intermediate';
    if (avgScore <= 3.5) return 'advanced';
    return 'expert';
  }

  static identifyStrengths(competencies) {
    return competencies
      .filter(c => c.is_completed && c.progress > 85)
      .map(c => c.learning_path)
      .reduce((acc, path) => {
        acc[path] = (acc[path] || 0) + 1;
        return acc;
      }, {});
  }

  static identifyChallenges(progress) {
    return progress
      .filter(p => p.percent_complete < 50)
      .map(p => p.competency_name);
  }

  static async analyzeSubjectDomain(subject) {
    const analysisPrompt = `
      Analyze the learning domain "${subject}" to understand its structure and progression:
      
      Provide a comprehensive analysis including:
      1. Core foundational concepts (prerequisite knowledge)
      2. Progressive skill levels (beginner to expert)
      3. Key competency areas and their relationships
      4. Typical learning progression pathways
      5. Common challenges and learning obstacles
      6. Practical applications and project opportunities
      7. Assessment and validation methods
      
      Structure this as an educational framework suitable for personalized learning path design.
    `;

    const analysis = await InvokeLLM({
      prompt: analysisPrompt,
      add_context_from_internet: true,
      response_json_schema: {
        type: "object",
        properties: {
          foundationalConcepts: { type: "array", items: { type: "string" } },
          skillLevels: {
            type: "object",
            properties: {
              beginner: { type: "array", items: { type: "string" } },
              intermediate: { type: "array", items: { type: "string" } },
              advanced: { type: "array", items: { type: "string" } },
              expert: { type: "array", items: { type: "string" } }
            }
          },
          competencyAreas: { type: "array", items: { 
            type: "object",
            properties: {
              name: { type: "string" },
              description: { type: "string" },
              prerequisites: { type: "array", items: { type: "string" } },
              difficulty: { type: "string" }
            }
          }},
          commonChallenges: { type: "array", items: { type: "string" } },
          practicalApplications: { type: "array", items: { type: "string" } },
          assessmentMethods: { type: "array", items: { type: "string" } }
        }
      }
    });

    return analysis;
  }

  static async designLearningPath(userProfile, subjectAnalysis, goals) {
    const designPrompt = `
      Design a personalized learning path based on this user profile and subject analysis:
      
      User Profile:
      - Current Level: ${userProfile.currentLevel}
      - Learning Style: ${userProfile.learningStyle}
      - Time Available: ${userProfile.timeAvailable} minutes/day
      - Strengths: ${Object.keys(userProfile.strengths).join(', ')}
      - Challenges: ${userProfile.challenges.join(', ')}
      
      Subject Analysis:
      ${JSON.stringify(subjectAnalysis, null, 2)}
      
      Goals:
      ${JSON.stringify(goals, null, 2)}
      
      Create a structured learning path that:
      1. Starts at the user's current level
      2. Builds systematically on prerequisites
      3. Accommodates their learning style and time constraints
      4. Addresses their specific goals
      5. Includes adaptive checkpoints for difficulty adjustment
      6. Provides multiple pathways for different learning preferences
      
      Structure the path with clear phases, milestones, and competency progression.
    `;

    const pathStructure = await InvokeLLM({
      prompt: designPrompt,
      response_json_schema: {
        type: "object",
        properties: {
          phases: {
            type: "array",
            items: {
              type: "object",
              properties: {
                name: { type: "string" },
                description: { type: "string" },
                estimatedWeeks: { type: "number" },
                competencies: { type: "array", items: { type: "string" } },
                learningObjectives: { type: "array", items: { type: "string" } },
                assessmentCriteria: { type: "array", items: { type: "string" } }
              }
            }
          },
          totalEstimatedWeeks: { type: "number" },
          adaptiveCheckpoints: { type: "array", items: { type: "string" } },
          alternativePathways: { type: "array", items: { type: "string" } },
          recommendedResources: { type: "array", items: { type: "string" } }
        }
      }
    });

    return pathStructure;
  }

  static async createDetailedPath(pathStructure) {
    // Convert the path structure into detailed competencies and study plans
    const competencies = [];
    const milestones = [];
    const studyPlans = [];

    for (let phaseIndex = 0; phaseIndex < pathStructure.phases.length; phaseIndex++) {
      const phase = pathStructure.phases[phaseIndex];
      
      // Create competencies for this phase
      for (const competencyName of phase.competencies) {
        competencies.push({
          name: competencyName,
          description: `${competencyName} - ${phase.description}`,
          learning_path: pathStructure.subject || 'Custom Path',
          level: this.mapPhaseToLevel(phaseIndex, pathStructure.phases.length),
          icon: 'BookOpen',
          is_unlocked: phaseIndex === 0, // Only first phase unlocked initially
          is_completed: false,
          prerequisites: phaseIndex > 0 ? [pathStructure.phases[phaseIndex - 1].competencies[0]] : [],
          progress: 0
        });
      }

      // Create milestones
      milestones.push({
        phase: phase.name,
        description: phase.description,
        estimatedWeeks: phase.estimatedWeeks,
        learningObjectives: phase.learningObjectives,
        assessmentCriteria: phase.assessmentCriteria
      });

      // Create study plan for this phase
      studyPlans.push({
        title: `${phase.name} Study Plan`,
        description: phase.description,
        subject: pathStructure.subject || 'Custom Learning',
        difficulty_level: this.mapPhaseToLevel(phaseIndex, pathStructure.phases.length),
        estimated_hours: phase.estimatedWeeks * 7 * 0.5, // Assuming 30 min/day
        milestones: phase.learningObjectives.map(obj => ({
          title: obj,
          description: `Complete: ${obj}`,
          completed: false,
          xp_reward: 25
        })),
        is_active: phaseIndex === 0,
        progress_percentage: 0
      });
    }

    return {
      competencies,
      milestones,
      studyPlans,
      adaptiveFeatures: {
        difficultyAdjustment: true,
        paceAdaptation: true,
        styleCustomization: true,
        checkpoints: pathStructure.adaptiveCheckpoints
      }
    };
  }

  static mapPhaseToLevel(phaseIndex, totalPhases) {
    const ratio = phaseIndex / (totalPhases - 1);
    if (ratio <= 0.25) return 'beginner';
    if (ratio <= 0.75) return 'intermediate';
    return 'advanced';
  }

  static async saveGeneratedPath(userId, learningPath) {
    try {
      // Save competencies
      const savedCompetencies = [];
      for (const competency of learningPath.competencies) {
        const saved = await Competency.create(competency);
        savedCompetencies.push(saved);
      }

      // Save study plans
      const savedStudyPlans = [];
      for (const plan of learningPath.studyPlans) {
        const saved = await StudyPlan.create(plan);
        savedStudyPlans.push(saved);
      }

      return {
        success: true,
        pathId: learningPath.pathId,
        competenciesCreated: savedCompetencies.length,
        studyPlansCreated: savedStudyPlans.length
      };
    } catch (error) {
      console.error('Failed to save learning path:', error);
      return { success: false, error: error.message };
    }
  }
}

// React Hook for learning path generation
export function useLearningPathGenerator() {
  const generatePath = async (userId, subject, goals) => {
    return await LearningPathGenerator.generatePersonalizedPath(userId, subject, goals);
  };

  const savePath = async (userId, learningPath) => {
    return await LearningPathGenerator.saveGeneratedPath(userId, learningPath);
  };

  return { generatePath, savePath };
}