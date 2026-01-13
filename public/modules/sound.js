/**
 * Sound Module - Handles audio notifications
 */

export const Sound = {
  audioContext: null,

  init() {
    // Initialize Audio Context on first user interaction
    if (!this.audioContext && typeof AudioContext !== 'undefined') {
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }
  },

  /**
   * Play a beep sound when session is saved
   * Uses Web Audio API to generate a simple tone
   */
  playSessionSaved() {
    this.init();
    
    if (!this.audioContext) return;

    try {
      const ctx = this.audioContext;
      const now = ctx.currentTime;
      
      // Create oscillator for beep sound
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      // Two beeps: high then low (success sound)
      osc.frequency.setValueAtTime(800, now);           // High frequency
      osc.frequency.setValueAtTime(600, now + 0.1);     // Low frequency
      
      gain.gain.setValueAtTime(0.3, now);               // Volume
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2); // Fade out
      
      osc.start(now);
      osc.stop(now + 0.2);
    } catch (e) {
      // Silently fail if audio context not available
      console.debug('Sound notification unavailable', e);
    }
  },

  /**
   * Play notification sound (optional for future use)
   */
  playNotification() {
    this.init();
    
    if (!this.audioContext) return;

    try {
      const ctx = this.audioContext;
      const now = ctx.currentTime;
      
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      // Single beep
      osc.frequency.setValueAtTime(1000, now);
      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
      
      osc.start(now);
      osc.stop(now + 0.15);
    } catch (e) {
      console.debug('Sound notification unavailable', e);
    }
  }
};
