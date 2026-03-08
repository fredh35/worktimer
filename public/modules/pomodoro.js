/**
 * Pomodoro Module - Manages Pomodoro mode tracking and cycle counting
 *
 * Pomodoro technique:
 * - 25 min focused work (1 pomodoro)
 * - 5 min short break
 * - After 4 pomodoros: 15-30 min long break
 */

const POMODORO_WORK_MS = 25 * 60 * 1000;  // 25 minutes
const POMODORO_SHORT_BREAK_MS = 5 * 60 * 1000;  // 5 minutes
const POMODORO_LONG_BREAK_MS = 15 * 60 * 1000;  // 15 minutes
const STORAGE_KEY = 'worktimer_pomodoro';

export const Pomodoro = {
  isEnabled: false,
  currentCycle: 0,
  isBreakPhase: false,
  consecutivePomodoros: 0,  // Pomodoros without interruption
  sessionPomodoros: [],  // Track pomodoro sessions for the day

  init() {
    this.loadState();
    this.resetDailyIfNeeded();
  },

  // ============================================================================
  // Mode Control
  // ============================================================================

  /**
   * Enable/disable Pomodoro mode
   */
  setMode(enabled) {
    this.isEnabled = enabled;
    this.saveState();
  },

  isMode() {
    return this.isEnabled;
  },

  /**
   * Get recommended timer duration based on current phase
   * Returns milliseconds
   */
  getRecommendedDuration() {
    if (!this.isEnabled) return null;

    if (this.isBreakPhase) {
      // After every 4 pomodoros, suggest longer break
      return this.currentCycle % 4 === 0 ? POMODORO_LONG_BREAK_MS : POMODORO_SHORT_BREAK_MS;
    }

    return POMODORO_WORK_MS;
  },

  /**
   * Get duration in minutes for display
   */
  getRecommendedMinutes() {
    const ms = this.getRecommendedDuration();
    return ms ? Math.round(ms / 1000 / 60) : null;
  },

  // ============================================================================
  // Cycle Management
  // ============================================================================

  /**
   * Start a new work cycle (increment counter)
   */
  startWorkCycle() {
    if (!this.isEnabled) return;

    this.isBreakPhase = false;
    this.currentCycle += 1;
    this.saveState();
  },

  /**
   * Mark work cycle as completed (move to break phase)
   */
  completeWorkCycle(interruptionCount = 0) {
    if (!this.isEnabled) return;

    this.isBreakPhase = true;

    // Track consecutive pomodoros (reset if interrupted)
    if (interruptionCount === 0) {
      this.consecutivePomodoros += 1;
    } else {
      this.consecutivePomodoros = 0;
    }

    // Record for daily tracking
    this.sessionPomodoros.push({
      timestamp: Date.now(),
      cycleNumber: this.currentCycle,
      interrupted: interruptionCount > 0,
      interruptionCount
    });

    this.saveState();
  },

  /**
   * Start break phase
   */
  startBreakPhase() {
    if (!this.isEnabled) return;
    this.isBreakPhase = true;
    this.saveState();
  },

  /**
   * Complete break phase (return to work)
   */
  completeBreakPhase() {
    if (!this.isEnabled) return;
    this.isBreakPhase = false;
    this.saveState();
  },

  getCurrentCycle() {
    return this.currentCycle;
  },

  isInBreak() {
    return this.isBreakPhase;
  },

  getConsecutivePomodoros() {
    return this.consecutivePomodoros;
  },

  // ============================================================================
  // Daily Tracking
  // ============================================================================

  /**
   * Get total pomodoros completed today
   */
  getCompletedTodayCount() {
    return this.sessionPomodoros.length;
  },

  /**
   * Get pomodoros completed today without interruption
   */
  getUninterruptedTodayCount() {
    return this.sessionPomodoros.filter(p => !p.interrupted).length;
  },

  /**
   * Get today's interruption rate (0-100%)
   */
  getTodayInterruptionRate() {
    if (this.sessionPomodoros.length === 0) return 0;
    const interrupted = this.sessionPomodoros.filter(p => p.interrupted).length;
    return Math.round((interrupted / this.sessionPomodoros.length) * 100);
  },

  /**
   * Reset daily counters if it's a new day
   */
  resetDailyIfNeeded() {
    const state = this.loadState();
    if (!state.lastResetDate) {
      return;
    }

    const today = new Date().toDateString();
    if (state.lastResetDate !== today) {
      this.sessionPomodoros = [];
      this.consecutivePomodoros = 0;
      this.currentCycle = 0;
      this.isBreakPhase = false;
      this.isEnabled = false;
      this.saveState();
    }
  },

  // ============================================================================
  // Break Recommendation
  // ============================================================================

  /**
   * Get break message for current phase
   */
  getPhaseMessage() {
    if (!this.isEnabled) return null;

    if (this.isBreakPhase) {
      const breakDuration = this.currentCycle % 4 === 0 ? '15-30' : '5';
      return `Break time! Take a ${breakDuration} minute break. Pomodoro #${this.currentCycle}`;
    }

    return `Pomodoro #${this.currentCycle} - 25 minutes of focused work`;
  },

  /**
   * Get break type string for logging
   */
  getBreakType() {
    if (!this.isBreakPhase) return null;
    return this.currentCycle % 4 === 0 ? 'long-break' : 'short-break';
  },

  // ============================================================================
  // Persistence
  // ============================================================================

  saveState() {
    const state = {
      isEnabled: this.isEnabled,
      currentCycle: this.currentCycle,
      isBreakPhase: this.isBreakPhase,
      consecutivePomodoros: this.consecutivePomodoros,
      sessionPomodoros: this.sessionPomodoros,
      lastResetDate: new Date().toDateString()
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  },

  loadState() {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return null;

    const state = JSON.parse(stored);
    this.isEnabled = state.isEnabled || false;
    this.currentCycle = state.currentCycle || 0;
    this.isBreakPhase = state.isBreakPhase || false;
    this.consecutivePomodoros = state.consecutivePomodoros || 0;
    this.sessionPomodoros = state.sessionPomodoros || [];

    return state;
  },

  /**
   * Reset all Pomodoro data (for testing/reset button)
   */
  reset() {
    this.isEnabled = false;
    this.currentCycle = 0;
    this.isBreakPhase = false;
    this.consecutivePomodoros = 0;
    this.sessionPomodoros = [];
    localStorage.removeItem(STORAGE_KEY);
  }
};
