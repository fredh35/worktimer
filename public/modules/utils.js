/**
 * Utilities Module - Formatting and helper functions
 */

export const Utils = {
  formatDuration(ms) {
    const seconds = Math.floor(ms / 1000) % 60;
    const minutes = Math.floor(ms / 60000) % 60;
    const hours = Math.floor(ms / 3600000);
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  },

  formatDurationHours(ms) {
    return (ms / 3600000).toFixed(2);
  },

  formatDate(isoString) {
    const date = new Date(isoString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  },

  formatDateFull(isoString) {
    const date = new Date(isoString);
    return date.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  },

  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  },

  getDateKey(date = new Date()) {
    return date.toISOString().split('T')[0];
  },

  getTodayStart() {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  },

  getWeekStart() {
    return this.getTodayStart() - (7 * 24 * 60 * 60 * 1000);
  }
};
