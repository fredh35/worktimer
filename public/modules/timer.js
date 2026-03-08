/**
 * Timer Module - Manages work timer state and logic
 */

export const Timer = {
  startTime: null,
  pausedTime: 0,
  pauseStart: null,
  isPaused: false,
  interval: null,
  pomodoroTargetMs: null,  // For Pomodoro mode: target duration in ms

  start() {
    if (!this.startTime) {
      this.startTime = Date.now();
      this.pausedTime = 0;
      this.isPaused = false;
    } else if (this.isPaused) {
      this.pausedTime += Date.now() - this.pauseStart;
      this.isPaused = false;
    }
  },

  pause() {
    if (this.startTime && !this.isPaused) {
      this.pauseStart = Date.now();
      this.isPaused = true;
    }
  },

  stop() {
    if (!this.startTime) return null;
    
    const duration = this.getElapsed();
    const endTime = new Date().toISOString();
    const startTimeISO = new Date(this.startTime).toISOString();
    
    this.reset();
    
    return { duration, endTime, startTimeISO };
  },

  reset() {
    this.startTime = null;
    this.pausedTime = 0;
    this.pauseStart = null;
    this.isPaused = false;
    if (this.interval) clearInterval(this.interval);
    this.interval = null;
  },

  getElapsed() {
    if (!this.startTime) return 0;
    const now = this.isPaused ? this.pauseStart : Date.now();
    return now - this.startTime - this.pausedTime;
  },

  isRunning() {
    return this.startTime !== null && !this.isPaused;
  },

  isStopped() {
    return this.startTime === null;
  },

  /**
   * Set Pomodoro target duration (in milliseconds)
   * Used to show progress towards Pomodoro goal
   */
  setPomodoroTarget(ms) {
    this.pomodoroTargetMs = ms;
  },

  /**
   * Check if Pomodoro target has been reached
   */
  hasPomodoroTargetReached() {
    if (!this.pomodoroTargetMs) return false;
    return this.getElapsed() >= this.pomodoroTargetMs;
  },

  /**
   * Get progress towards Pomodoro target (0-100%)
   */
  getPomodoroProgress() {
    if (!this.pomodoroTargetMs) return 0;
    const percent = (this.getElapsed() / this.pomodoroTargetMs) * 100;
    return Math.min(percent, 100);
  },

  /**
   * Clear Pomodoro target
   */
  clearPomodoroTarget() {
    this.pomodoroTargetMs = null;
  }
};
