/**
 * Timer Module - Manages work timer state and logic
 */

export const Timer = {
  startTime: null,
  pausedTime: 0,
  pauseStart: null,
  isPaused: false,
  interval: null,

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
  }
};
