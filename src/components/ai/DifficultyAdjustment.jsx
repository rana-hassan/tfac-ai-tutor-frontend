import React, { useState, useEffect } from 'react';
import { InvokeLLM } from '@/api/integrations';
import { User } from '@/api/entities';

/**
 * Smart Difficulty Adjustment System
 * Dynamically adjusts content difficulty based on user performance and engagement
 */
export class DifficultyAdjustment {
  static async adjustDifficulty(userId, currentLevel, performanceData) {
    try {
      const userContext = await this.getUserContext(userId);
      const performanceAnalysis = await this.analyzePerformance(performanceData);
      const adjustment = await this.calculateAdjustment(userContext, performanceAnalysis);
      
      return {
        newDifficulty: adjustment.recommendedLevel,
        adjustmentReason: adjustment.reasoning,
        confidence: adjustment.confidence,
        recommendations: adjustment.recommendations,
        adaptiveElements: adjustment.adaptiveElements
      };
    } catch (error) {
      console.error('Difficulty adjustment failed:', error);
      return { newDifficulty: currentLevel, adjustmentReason: 'Maintained current level due to error' };
    }
  }

  static async getUserContext(userId) {
    const user = await User.me();
    
    return {
      currentLevel: user.preferences?.difficulty_level || 'beginner',
      learningStyle: user.preferences?.learning_style || 'balanced',
      rpgStats: user.rpg_stats || {},
      preferences: user.preferences || {},
      adaptiveSettings: user.preferences?.adaptive_settings || {
        autoAdjust: true,
        sensitivity: 'medium',
        preferredPace: 'steady'
      }
    };
  }

  static async analyzePerformance(performanceData) {
    const analysisPrompt = `
      Analyze this student's learning performance to determine optimal difficulty adjustment:
      
      Performance Data:
      ${JSON.stringify(performanceData, null, 2)}
      
      Consider:
      1. Success rate on questions/tasks
      2. Time spent on different difficulty levels
      3. Engagement indicators (follow-up questions, session length)
      4. Error patterns and recovery
      5. Progress velocity
      6. Confidence indicators
      
      Provide analysis focusing on learning optimization and student engagement.
    `;

    const analysis = await InvokeLLM({
      prompt: analysisPrompt,
      response_json_schema: {
        type: "object",
        properties: {
          successRate: { type: "number", minimum: 0, maximum: 1 },
          engagementLevel: { type: "string", enum: ["low", "medium", "high"] },
          strugglingAreas: { type: "array", items: { type: "string" } },
          strengthAreas: { type: "array", items: { type: "string" } },
          learningVelocity: { type: "string", enum: ["slow", "steady", "fast"] },
          confidenceLevel: { type: "string", enum: ["low", "medium", "high"] },
          recommendedAdjustment: { type: "string", enum: ["decrease", "maintain", "increase"] },
          reasoning: { type: "string" }
        }
      }
    });

    return analysis;
  }

  static async calculateAdjustment(userContext, performanceAnalysis) {
    const adjustmentPrompt = `
      Determine the optimal difficulty adjustment based on user context and performance:
      
      User Context:
      ${JSON.stringify(userContext, null, 2)}
      
      Performance Analysis:
      ${JSON.stringify(performanceAnalysis, null, 2)}
      
      Educational Guidelines:
      - Maintain 70-85% success rate for optimal learning
      - Adjust gradually to avoid frustration or boredom
      - Consider user preferences and adaptive settings
      - Ensure continuous challenge without overwhelming
      - Account for learning momentum and confidence
      
      Recommend specific difficulty adjustments and supporting strategies.
    `;

    const adjustment = await InvokeLLM({
      prompt: adjustmentPrompt,
      response_json_schema: {
        type: "object",
        properties: {
          recommendedLevel: { type: "string", enum: ["beginner", "intermediate", "advanced", "expert"] },
          adjustmentMagnitude: { type: "string", enum: ["minor", "moderate", "significant"] },
          reasoning: { type: "string" },
          confidence: { type: "number", minimum: 0, maximum: 1 },
          timeframe: { type: "string" },
          recommendations: { type: "array", items: { type: "string" } },
          adaptiveElements: {
            type: "object",
            properties: {
              contentComplexity: { type: "string" },
              questionDifficulty: { type: "string" },
              explanationDepth: { type: "string" },
              scaffoldingLevel: { type: "string" }
            }
          }
        }
      }
    });

    return adjustment;
  }

  static async implementAdjustment(userId, adjustment) {
    try {
      // Update user preferences with new difficulty settings
      const currentUser = await User.me();
      const updatedPreferences = {
        ...currentUser.preferences,
        difficulty_level: adjustment.recommendedLevel,
        adaptive_settings: {
          ...currentUser.preferences?.adaptive_settings,
          lastAdjustment: new Date().toISOString(),
          adjustmentReason: adjustment.reasoning,
          confidence: adjustment.confidence
        }
      };

      await User.updateMyUserData({ preferences: updatedPreferences });

      return {
        success: true,
        newLevel: adjustment.recommendedLevel,
        adjustmentApplied: adjustment.adjustmentMagnitude,
        nextReview: this.calculateNextReviewTime(adjustment.timeframe)
      };
    } catch (error) {
      console.error('Failed to implement difficulty adjustment:', error);
      return { success: false, error: error.message };
    }
  }

  static calculateNextReviewTime(timeframe) {
    const now = new Date();
    const timeframes = {
      'immediate': 1, // 1 day
      'short': 3,     // 3 days
      'medium': 7,    // 1 week
      'long': 14      // 2 weeks
    };

    const days = timeframes[timeframe] || 7;
    now.setDate(now.getDate() + days);
    return now.toISOString();
  }

  static async monitorAdjustmentEffectiveness(userId, adjustmentId, performanceMetrics) {
    // Track how well the difficulty adjustment is working
    const effectivenessPrompt = `
      Evaluate the effectiveness of a recent difficulty adjustment:
      
      Adjustment Made: ${adjustmentId}
      Post-Adjustment Performance:
      ${JSON.stringify(performanceMetrics, null, 2)}
      
      Determine:
      1. Is the adjustment achieving desired learning outcomes?
      2. Should the adjustment be maintained, refined, or reversed?
      3. What additional adaptations might be beneficial?
      4. How confident are we in the current difficulty level?
      
      Provide actionable insights for continued optimization.
    `;

    const effectiveness = await InvokeLLM({
      prompt: effectivenessPrompt,
      response_json_schema: {
        type: "object",
        properties: {
          effectiveness: { type: "string", enum: ["poor", "fair", "good", "excellent"] },
          recommendation: { type: "string", enum: ["reverse", "refine", "maintain", "enhance"] },
          nextSteps: { type: "array", items: { type: "string" } },
          confidence: { type: "number", minimum: 0, maximum: 1 },
          metrics: {
            type: "object",
            properties: {
              learningVelocity: { type: "number" },
              engagementScore: { type: "number" },
              retentionRate: { type: "number" }
            }
          }
        }
      }
    });

    return effectiveness;
  }
}

// React Hook for difficulty adjustment
export function useDifficultyAdjustment() {
  const [currentDifficulty, setCurrentDifficulty] = useState('beginner');
  const [adjustmentHistory, setAdjustmentHistory] = useState([]);

  const adjustDifficulty = async (userId, performanceData) => {
    const result = await DifficultyAdjustment.adjustDifficulty(userId, currentDifficulty, performanceData);
    
    if (result.newDifficulty !== currentDifficulty) {
      setCurrentDifficulty(result.newDifficulty);
      setAdjustmentHistory(prev => [...prev, {
        timestamp: new Date().toISOString(),
        from: currentDifficulty,
        to: result.newDifficulty,
        reason: result.adjustmentReason
      }]);
    }
    
    return result;
  };

  const implementAdjustment = async (userId, adjustment) => {
    return await DifficultyAdjustment.implementAdjustment(userId, adjustment);
  };

  return { 
    currentDifficulty, 
    adjustmentHistory, 
    adjustDifficulty, 
    implementAdjustment 
  };
}