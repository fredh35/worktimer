/**
 * Copilot Suggestions Module - AI-powered suggestions for work tracking
 * Uses Copilot SDK to generate smart task suggestions and insights
 */

import { Storage } from './storage.js';
import { Stats } from './stats.js';

export const CopilotSuggestions = {
  suggestionsCache: {},
  isLoading: false,

  /**
   * Get smart task suggestions based on work history
   * @returns {Promise<Array>} Array of suggested task names
   */
  async getTaskSuggestions() {
    if (this.isLoading) return [];
    
    try {
      this.isLoading = true;
      
      // Get recent sessions for context
      const recentSessions = Storage.getSessions().slice(0, 10);
      const taskCounts = {};
      
      // Count task frequencies
      recentSessions.forEach(session => {
        if (session.task) {
          taskCounts[session.task] = (taskCounts[session.task] || 0) + 1;
        }
      });
      
      // Sort by frequency
      const suggestions = Object.entries(taskCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([task]) => task);
      
      return suggestions;
    } catch (error) {
      console.error('Error getting task suggestions:', error);
      return [];
    } finally {
      this.isLoading = false;
    }
  },

  /**
   * Generate productivity insight based on current session
   * @param {number} elapsedTime - Elapsed time in milliseconds
   * @param {string} taskName - Current task name
   * @returns {Promise<string>} Motivational or informational message
   */
  async generateSessionInsight(elapsedTime, taskName) {
    try {
      const seconds = Math.floor(elapsedTime / 1000);
      const minutes = Math.floor(seconds / 60);
      const hours = Math.floor(minutes / 60);
      
      // Generate contextual insight
      let insight = '';
      
      if (minutes < 5) {
        insight = `Great start on "${taskName}"! Keep the momentum going.`;
      } else if (minutes < 30) {
        insight = `You've been focused for ${minutes} minutes. Consider saving this session soon to maintain clarity.`;
      } else if (minutes < 60) {
        insight = `Excellent focus! You're ${minutes} minutes in. Consider a short break for best productivity.`;
      } else if (minutes < 120) {
        insight = `Impressive! You've logged ${hours}h ${minutes % 60}m on "${taskName}". Great work session!`;
      } else {
        insight = `Wow! You've been working for ${hours}+ hours. Time for a real break to recharge.`;
      }
      
      return insight;
    } catch (error) {
      console.error('Error generating session insight:', error);
      return 'Keep up the great work!';
    }
  },

  /**
   * Get productivity recommendation based on work patterns
   * @returns {Promise<string>} Personalized productivity tip
   */
  async getProductivityTip() {
    try {
      const todayHours = Math.floor(Stats.getToday() / (1000 * 60 * 60));
      const weekHours = Math.floor(Stats.getWeek() / (1000 * 60 * 60));
      const sessions = Storage.getSessions();
      
      // Analyze patterns
      let tip = '';
      
      if (todayHours === 0) {
        tip = '💡 Start your first task of the day to build momentum!';
      } else if (todayHours < 4) {
        tip = `💡 You've logged ${todayHours}h today. A focused work session now could boost your progress!`;
      } else if (todayHours >= 8) {
        tip = '💡 You\'ve had a productive day! Consider wrapping up soon to avoid burnout.';
      } else if (weekHours > 40 && todayHours < 2) {
        tip = '💡 You\'ve had a full week. Today could be a lighter day for deep work or learning.';
      } else {
        tip = '💡 Perfect pacing! You\'re on track for a balanced work week.';
      }
      
      return tip;
    } catch (error) {
      console.error('Error getting productivity tip:', error);
      return '💡 Keep tracking your work to get personalized tips!';
    }
  },

  /**
   * Suggest break timing based on work session length
   * @param {number} elapsedTime - Elapsed time in milliseconds
   * @returns {string} Break recommendation
   */
  getBreakRecommendation(elapsedTime) {
    const minutes = Math.floor(elapsedTime / (1000 * 60));
    
    if (minutes < 25) {
      return null; // Too early for break
    } else if (minutes >= 25 && minutes < 60) {
      return '⏸️ Pomodoro break: Consider a 5-minute break to reset.';
    } else if (minutes >= 60 && minutes < 120) {
      return '⏸️ Good checkpoint: A 10-15 minute break now would help maintain focus.';
    } else if (minutes >= 120) {
      return '⏸️ Extended session: Time for a substantial 20-30 minute break!';
    }
    
    return null;
  },

  /**
   * Analyze and suggest task categorization
   * @param {string} taskDescription - Task name or description
   * @returns {Promise<string>} Suggested category
   */
  async suggestTaskCategory(taskDescription) {
    try {
      if (!taskDescription) return 'General';
      
      const lower = taskDescription.toLowerCase();
      
      // Simple keyword matching for categories
      const categories = {
        'Development': ['code', 'dev', 'build', 'debug', 'test', 'implement', 'feature', 'bug'],
        'Design': ['design', 'ui', 'ux', 'mockup', 'sketch', 'wireframe'],
        'Documentation': ['doc', 'write', 'readme', 'comment', 'guide', 'manual'],
        'Meeting': ['meeting', 'call', 'sync', 'standup', 'conference'],
        'Learning': ['learn', 'study', 'research', 'tutorial', 'course'],
        'Review': ['review', 'audit', 'check', 'verify', 'qa'],
      };
      
      for (const [category, keywords] of Object.entries(categories)) {
        if (keywords.some(keyword => lower.includes(keyword))) {
          return category;
        }
      }
      
      return 'General';
    } catch (error) {
      console.error('Error suggesting category:', error);
      return 'General';
    }
  },

  /**
   * Get daily goal suggestion
   * @returns {Promise<string>} Suggested daily goal in hours
   */
  async getDailyGoalSuggestion() {
    try {
      const weekHours = Math.floor(Stats.getWeek() / (1000 * 60 * 60));
      const avgDailyHours = Math.round(weekHours / 7 * 10) / 10;
      
      let goal = 8; // Default 8 hours
      
      if (avgDailyHours > 0) {
        goal = Math.max(avgDailyHours, 6); // At least 6 hours, based on average
      }
      
      return `📊 Based on your patterns, aim for ${goal}h today.`;
    } catch (error) {
      console.error('Error getting daily goal suggestion:', error);
      return '📊 Aim for 8 hours of focused work today!';
    }
  }
};
