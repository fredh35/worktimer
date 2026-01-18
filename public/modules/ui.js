/**
 * UI Module - Manages DOM updates and rendering
 */

import { Utils } from './utils.js';
import { Stats } from './stats.js';
import { Storage } from './storage.js';

export const UI = {
  elements: {},

  init(elementMap) {
    this.elements = elementMap;
  },

  updateTimerDisplay(elapsed) {
    this.elements.timerDisplay.textContent = Utils.formatDuration(elapsed);
  },

  updateStats() {
    this.elements.todayStat.textContent = Utils.formatDuration(Stats.getToday());
    this.elements.weekStat.textContent = Utils.formatDuration(Stats.getWeek());
    this.elements.allTimeStat.textContent = Utils.formatDuration(Stats.getAllTime());
  },

  updateClock() {
    const now = new Date();
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    this.elements.clockDisplay.textContent = `${hours}:${minutes}`;
  },

  renderSessions() {
    const sessions = Storage.getSessions().slice(0, 100);
    
    if (sessions.length === 0) {
      this.elements.logList.innerHTML = '<p class="empty-state">No sessions logged yet.</p>';
      return;
    }
    
    this.elements.logList.innerHTML = sessions.map(s => `
      <div class="log-item" data-id="${s.id}">
        <span class="log-task">${Utils.escapeHtml(s.task)}</span>
        ${s.description ? `<div class="log-description">${Utils.escapeHtml(s.description)}</div>` : ''}
        <div class="log-meta">
          <span class="log-date">${Utils.formatDate(s.createdAt)}</span>
          <span class="log-duration">${Utils.formatDuration(s.duration)}</span>
          <button class="log-delete" onclick="window.deleteSessionHandler(${s.id})">✕</button>
        </div>
      </div>
    `).join('');
  },

  setTimerButtonsState(isRunning, isPaused) {
    this.elements.startBtn.disabled = isRunning;
    this.elements.pauseBtn.disabled = !isRunning;
    this.elements.stopBtn.disabled = !isRunning && !isPaused;
    this.elements.startBtn.textContent = isRunning || isPaused ? (isPaused ? 'Resume' : 'Running...') : 'Start';
  },

  resetTimerDisplay() {
    this.elements.timerDisplay.textContent = '00:00:00';
    this.elements.taskInput.value = '';
  }
};
