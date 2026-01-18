/**
 * Stats Module - Calculates and manages work statistics
 */

import { Storage } from './storage.js';
import { Utils } from './utils.js';

export const Stats = {
  getToday() {
    const sessions = Storage.getSessions();
    const todayStart = Utils.getTodayStart();
    
    return sessions
      .filter(s => new Date(s.createdAt).getTime() >= todayStart)
      .reduce((sum, s) => sum + s.duration, 0);
  },

  getWeek() {
    const sessions = Storage.getSessions();
    const weekStart = Utils.getWeekStart();
    
    return sessions
      .filter(s => new Date(s.createdAt).getTime() >= weekStart)
      .reduce((sum, s) => sum + s.duration, 0);
  },

  getAllTime() {
    const sessions = Storage.getSessions();
    return sessions.reduce((sum, s) => sum + s.duration, 0);
  },

  getDailyTotals() {
    const sessions = Storage.getSessions();
    const daily = {};
    
    sessions.forEach(s => {
      const dateKey = Utils.getDateKey(new Date(s.createdAt));
      daily[dateKey] = (daily[dateKey] || 0) + s.duration;
    });
    
    return daily;
  },

  getSessionsForDay(dateKey) {
    const sessions = Storage.getSessions();
    return sessions.filter(s => Utils.getDateKey(new Date(s.createdAt)) === dateKey);
  }
};
