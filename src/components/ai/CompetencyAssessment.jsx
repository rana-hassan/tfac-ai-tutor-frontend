import React from 'react';
import { InvokeLLM } from '@/api/integrations';
import { Competency } from '@/api/entities';
import { TutorProgress } from '@/api/entities';

/**
 * AI-Powered Competency Assessment System
 * Analyzes user interactions to assess skill levels and unlock new competencies
 */
export class CompetencyAssessment {
  static async assessUserCompetency(userId, subject, interactions = []) {
    try {
      const assessmentData = await this.gatherAssessmentData(userId, subject, interactions);
      const analysis = await this.analyzeCompetency(assessmentData);
      const recommendations = await this.generateRecommendations(analysis);
      
      return {
        currentLevel: analysis.currentLevel,
        masteryScore: analysis.masteryScore,
        strengths: analysis.strengths,
        weaknesses: analysis.weaknesses,
        recommendations: recommendations,
        nextCompetencies: analysis.nextCompetencies,
        estimatedTimeToMastery: analysis.estimatedTime
      };
    } catch (error) {
      console.error('Competency assessment failed:', error);
      throw error;
    }
  }

  static async gatherAssessmentData(userId, subject, interactions) {
    // Gather comprehensive learning data
    const [competencies, progress, recentInteractions] = await Promise.all([
      Competency.filter({ learning_path: subject }),
      TutorProgress.filter({ created_by: userId }),
      this.getRecentInteractions(interactions)
    ]);

    return {
      subject,
      competencies,
      progress: progress.filter(p => p.competency_name?.toLowerCase().includes(subject.toLowerCase())),
      interactions: recentInteractions,
      totalInteractions: interactions.length
    };
  }

  static async getRecentInteractions(interactions) {
    // Process and analyze recent user interactions
    return interactions.slice(-20).map(interaction => ({
      query: interaction.content,
      complexity: this.estimateQueryComplexity(interaction.content),
      timestamp: interaction.created_date,
      responseQuality: interaction.confidence_score || 0.8
    }));
  }

  static estimateQueryComplexity(query) {
    const indicators = {
      basic: ['what is', 'define', 'explain simply', 'basic'],
      intermediate: ['how to', 'compare', 'analyze', 'implement'],
      advanced: ['optimize', 'design', 'evaluate', 'synthesize', 'critique']
    };

    const queryLower = query.toLowerCase();
    
    for (const [level, keywords] of Object.entries(indicators)) {
      if (keywords.some(keyword => queryLower.includes(keyword))) {
        return level;
      }
    }
    
    // Default complexity based on query length and structure
    if (query.length > 100) return 'intermediate';
    return 'basic';
  }

  static async analyzeCompetency(assessmentData) {
    const analysisPrompt = `
      Analyze this student's competency in ${assessmentData.subject} based on their learning data:
      
      Current Progress:
      ${JSON.stringify(assessmentData.progress, null, 2)}
      
      Recent Interactions:
      ${assessmentData.interactions.map(i => `- ${i.query} (${i.complexity} level)`).join('\n')}
      
      Available Competencies:
      ${assessmentData.competencies.map(c => `- ${c.name} (${c.level})`).join('\n')}
      
      Provide a comprehensive competency assessment including:
      1. Current skill level (beginner/intermediate/advanced)
      2. Mastery score (0-100)
      3. Key strengths demonstrated
      4. Areas needing improvement
      5. Recommended next competencies to unlock
      6. Estimated time to reach next level
      
      Base your analysis on learning progression patterns and educational best practices.
    `;

    const analysis = await InvokeLLM({
      prompt: analysisPrompt,
      response_json_schema: {
        type: "object",
        properties: {
          currentLevel: { type: "string", enum: ["beginner", "intermediate", "advanced", "expert"] },
          masteryScore: { type: "number", minimum: 0, maximum: 100 },
          strengths: { type: "array", items: { type: "string" } },
          weaknesses: { type: "array", items: { type: "string" } },
          nextCompetencies: { type: "array", items: { type: "string" } },
          estimatedTime: { type: "string" },
          confidence: { type: "number", minimum: 0, maximum: 1 },
          reasoning: { type: "string" }
        }
      }
    });

    return analysis;
  }

  static async generateRecommendations(analysis) {
    const recommendationPrompt = `
      Based on this competency analysis, generate specific learning recommendations:
      
      Current Level: ${analysis.currentLevel}
      Mastery Score: ${analysis.masteryScore}%
      Strengths: ${analysis.strengths.join(', ')}
      Weaknesses: ${analysis.weaknesses.join(', ')}
      
      Generate 3-5 specific, actionable recommendations that:
      1. Address identified weaknesses
      2. Build on existing strengths  
      3. Provide clear next steps
      4. Include specific study activities
      5. Set realistic timelines
      
      Format as concrete learning actions the student can take.
    `;

    const recommendations = await InvokeLLM({
      prompt: recommendationPrompt,
      response_json_schema: {
        type: "object",
        properties: {
          immediate: { type: "array", items: { type: "string" } },
          shortTerm: { type: "array", items: { type: "string" } },
          longTerm: { type: "array", items: { type: "string" } },
          studyPlan: { type: "string" },
          focusAreas: { type: "array", items: { type: "string" } }
        }
      }
    });

    return recommendations;
  }

  static async updateCompetencyProgress(userId, assessmentResult) {
    try {
      // Update user's competency unlocks based on assessment
      const competenciesToUnlock = await this.determineUnlocks(assessmentResult);
      
      for (const competencyId of competenciesToUnlock) {
        await Competency.update(competencyId, { 
          is_unlocked: true,
          unlocked_date: new Date().toISOString()
        });
      }

      // Update progress tracking
      await TutorProgress.create({
        competency_id: `assessment_${Date.now()}`,
        competency_name: assessmentResult.subject || 'General Assessment',
        percent_complete: assessmentResult.masteryScore,
        difficulty_level: assessmentResult.currentLevel,
        last_activity: new Date().toISOString(),
        goals_today: assessmentResult.recommendations.immediate?.map(rec => ({
          goal: rec,
          completed: false
        })) || []
      });

      return {
        success: true,
        unlockedCompetencies: competenciesToUnlock.length,
        updatedProgress: true
      };
    } catch (error) {
      console.error('Failed to update competency progress:', error);
      return { success: false, error: error.message };
    }
  }

  static async determineUnlocks(assessmentResult) {
    // Logic to determine which competencies should be unlocked
    // based on the assessment results
    const unlockThreshold = 70; // 70% mastery required to unlock next level
    
    if (assessmentResult.masteryScore >= unlockThreshold) {
      // Return next level competencies that should be unlocked
      return assessmentResult.nextCompetencies.slice(0, 2); // Unlock up to 2 new competencies
    }
    
    return [];
  }
}

// React Hook for competency assessment
export function useCompetencyAssessment() {
  const assessCompetency = async (userId, subject, interactions) => {
    return await CompetencyAssessment.assessUserCompetency(userId, subject, interactions);
  };

  const updateProgress = async (userId, assessmentResult) => {
    return await CompetencyAssessment.updateCompetencyProgress(userId, assessmentResult);
  };

  return { assessCompetency, updateProgress };
}