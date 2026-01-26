/**
 * UI Module - Manages DOM updates and rendering
 */

import { Utils } from './utils.js';
import { Stats } from './stats.js';
import { Storage } from './storage.js';
import { CopilotSuggestions } from './copilot-suggestions.js';

export const UI = {
  elements: {},
  suggestionUpdateTimeout: null,

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
  },

  /**
   * Display task suggestions
   */
  async displayTaskSuggestions() {
    try {
      const suggestions = await CopilotSuggestions.getTaskSuggestions();
      const container = document.getElementById('taskSuggestionsContainer');
      
      if (!container) return;
      
      if (suggestions.length === 0) {
        container.innerHTML = '';
        return;
      }
      
      container.innerHTML = `
        <div class="suggestions-container">
          <div class="task-suggestions">
            ${suggestions.map(task => `
              <button class="suggestion-chip" onclick="window.fillTaskSuggestion('${Utils.escapeHtml(task)}')">
                ${Utils.escapeHtml(task)}
              </button>
            `).join('')}
          </div>
        </div>
      `;
    } catch (error) {
      console.error('Error displaying task suggestions:', error);
    }
  },

  /**
   * Display session insights and recommendations
   */
  async displaySessionSuggestions(elapsedTime, taskName) {
    try {
      const container = document.getElementById('sessionSuggestionsContainer');
      
      if (!container) return;
      
      // Only show suggestions during active sessions
      if (elapsedTime === 0) {
        container.innerHTML = '';
        return;
      }
      
      // Generate insights
      const insight = await CopilotSuggestions.generateSessionInsight(elapsedTime, taskName);
      const breakRec = CopilotSuggestions.getBreakRecommendation(elapsedTime);
      
      let html = `<div class="suggestions-container">`;
      
      if (insight) {
        html += `<div class="suggestion-item insight">💡 ${Utils.escapeHtml(insight)}</div>`;
      }
      
      if (breakRec) {
        html += `<div class="suggestion-item break">${Utils.escapeHtml(breakRec)}</div>`;
      }
      
      html += `</div>`;
      
      container.innerHTML = html;
    } catch (error) {
      console.error('Error displaying session suggestions:', error);
    }
  },

  /**
   * Display daily productivity tip
   */
  async displayProductivityTip() {
    try {
      const tip = await CopilotSuggestions.getProductivityTip();
      const container = document.getElementById('sessionSuggestionsContainer');
      
      if (!container || !tip) return;
      
      const html = `<div class="suggestions-container"><div class="suggestion-item tip">${Utils.escapeHtml(tip)}</div></div>`;
      
      if (container.innerHTML === '') {
        container.innerHTML = html;
      }
    } catch (error) {
      console.error('Error displaying productivity tip:', error);
    }
  }
};
