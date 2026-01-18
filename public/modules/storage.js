/**
 * Storage Module - Handles all localStorage operations
 */

const STORAGE_KEY = 'worktimer_sessions';

export const Storage = {
  load() {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  },

  save(sessions) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
  },

  addSession(task, startTime, endTime, duration, description = '') {
    const sessions = this.load();
    sessions.unshift({
      id: Date.now(),
      task: task || 'Unspecified',
      description: description || '',
      startTime,
      endTime,
      duration,
      createdAt: new Date().toISOString()
    });
    this.save(sessions);
    return sessions[0];
  },

  deleteSession(id) {
    const sessions = this.load().filter(s => s.id !== id);
    this.save(sessions);
    return sessions;
  },

  getSessions() {
    return this.load();
  }
};
