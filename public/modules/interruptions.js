/**
 * Interruptions Module - Tracks distraction/interruption logging
 *
 * Helps developers understand context-switches and focus quality
 * by logging quick tags during work sessions
 */

export const Interruptions = {
  currentSessionInterruptions: [],

  // Predefined interruption types optimized for developers
  TYPES: {
    'slack': { icon: '💬', label: 'Slack', color: '#36C5F0' },
    'email': { icon: '📧', label: 'Email', color: '#FF6B6B' },
    'bug-fix': { icon: '🐛', label: 'Bug Fix Detour', color: '#FFD93D' },
    'code-review': { icon: '👀', label: 'Code Review', color: '#6BCB77' },
    'pair-session': { icon: '👥', label: 'Pair Session', color: '#4D96FF' },
    'meeting': { icon: '📞', label: 'Meeting', color: '#A366FF' },
    'other': { icon: '❓', label: 'Other', color: '#999999' }
  },

  /**
   * Track an interruption during current session
   */
  log(type) {
    if (!this.TYPES[type]) {
      console.warn(`Unknown interruption type: ${type}`);
      return;
    }

    const interruption = {
      timestamp: Date.now(),
      type,
      label: this.TYPES[type].label
    };

    this.currentSessionInterruptions.push(interruption);
  },

  /**
   * Get list of interruptions for current session
   */
  getCurrentInterruptions() {
    return [...this.currentSessionInterruptions];
  },

  /**
   * Get count of interruptions
   */
  getCount() {
    return this.currentSessionInterruptions.length;
  },

  /**
   * Get breakdown by type
   */
  getBreakdown() {
    const breakdown = {};

    this.currentSessionInterruptions.forEach(interrupt => {
      breakdown[interrupt.type] = (breakdown[interrupt.type] || 0) + 1;
    });

    return breakdown;
  },

  /**
   * Get formatted summary of interruptions
   * Example: "3 interruptions: 2x Slack, 1x Email"
   */
  getSummary() {
    const count = this.getCount();
    if (count === 0) return null;

    const breakdown = this.getBreakdown();
    const items = Object.entries(breakdown)
      .map(([type, count]) => `${count}x ${this.TYPES[type].label}`)
      .join(', ');

    return `${count} interruption${count !== 1 ? 's' : ''}: ${items}`;
  },

  /**
   * Get interruption types for UI display
   */
  getTypes() {
    return this.TYPES;
  },

  /**
   * Get type display info
   */
  getTypeInfo(type) {
    return this.TYPES[type] || null;
  },

  /**
   * Persist interruptions to session metadata (called when saving session)
   * Returns object to merge with session
   */
  getSessionMetadata() {
    return {
      interruptions: this.getCurrentInterruptions(),
      interruptionCount: this.getCount(),
      interruptionSummary: this.getSummary(),
      interruptionBreakdown: this.getBreakdown()
    };
  },

  /**
   * Reset interruptions for new session
   */
  reset() {
    this.currentSessionInterruptions = [];
  },

  /**
   * Reset and return the interruption data
   * (useful for saving before clearing)
   */
  resetAndGet() {
    const data = this.getSessionMetadata();
    this.reset();
    return data;
  }
};
