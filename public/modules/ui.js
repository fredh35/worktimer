/**
 * UI Module - Manages DOM updates and rendering
 */

import { Utils } from './utils.js';
import { Stats } from './stats.js';
import { Storage } from './storage.js';
import { CopilotSuggestions } from './copilot-suggestions.js';
import { Pomodoro } from './pomodoro.js';
import { Interruptions } from './interruptions.js';

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
  },

  // ============================================================================
  // Pomodoro UI Methods
  // ============================================================================

  /**
   * Display Pomodoro mode indicator and cycle counter
   */
  displayPomodoroStatus(elapsedMs) {
    const container = document.getElementById('pomodoroStatusContainer');
    if (!container) return;

    if (!Pomodoro.isMode()) {
      container.innerHTML = '';
      return;
    }

    const cycle = Pomodoro.getCurrentCycle();
    const isBreak = Pomodoro.isInBreak();
    const phase = isBreak ? '☕ Break' : '⚙️ Focus';
    const phaseColor = isBreak ? '#ff9500' : '#4CAF50';

    const html = `
      <div class="pomodoro-status" style="border-left: 4px solid ${phaseColor}; padding: 8px 12px; margin: 8px 0; background: rgba(0, 0, 0, 0.05); border-radius: 4px;">
        <div style="font-weight: 600; margin-bottom: 4px;">${phase} - Pomodoro #${cycle}</div>
        <div style="font-size: 0.9em; color: #666;">Streak: ${Pomodoro.getConsecutivePomodoros()} uninterrupted</div>
      </div>
    `;

    container.innerHTML = html;
  },

  /**
   * Display interruption tag buttons during session
   */
  displayInterruptionTags() {
    const container = document.getElementById('interruptionTagsContainer');
    if (!container) return;

    const types = Interruptions.getTypes();
    const currentCount = Interruptions.getCount();

    let html = '<div class="interruption-tags">';
    html += `<div style="font-size: 0.85em; color: #666; margin-bottom: 6px;">Document interruptions (${currentCount}):</div>`;

    Object.entries(types).forEach(([key, info]) => {
      html += `
        <button
          class="interruption-tag"
          onclick="window.logInterruption('${key}')"
          title="${info.label}"
          style="
            background: ${info.color};
            color: white;
            border: none;
            padding: 6px 10px;
            border-radius: 4px;
            font-size: 0.85em;
            cursor: pointer;
            margin: 2px 2px 2px 0;
            opacity: 0.9;
            transition: opacity 0.2s;
          "
          onmouseover="this.style.opacity='1'"
          onmouseout="this.style.opacity='0.9'"
        >
          ${info.icon} ${info.label}
        </button>
      `;
    });

    html += '</div>';

    // Show current interruptions summary if any
    const summary = Interruptions.getSummary();
    if (summary) {
      html += `<div style="font-size: 0.85em; color: #ff6b6b; margin-top: 8px;">📊 ${summary}</div>`;
    }

    container.innerHTML = html;
  },

  /**
   * Display break suggestion and phase message
   */
  displayPomodoroBreakSuggestion() {
    const container = document.getElementById('pomodoroBreakContainer');
    if (!container) return;

    if (!Pomodoro.isMode()) {
      container.innerHTML = '';
      return;
    }

    const message = Pomodoro.getPhaseMessage();
    if (!message) {
      container.innerHTML = '';
      return;
    }

    const isBreak = Pomodoro.isInBreak();
    const icon = isBreak ? '☕' : '⏱️';
    const bgColor = isBreak ? '#fff3cd' : '#d1ecf1';
    const borderColor = isBreak ? '#ffc107' : '#17a2b8';

    const html = `
      <div style="
        background: ${bgColor};
        border-left: 4px solid ${borderColor};
        padding: 12px;
        border-radius: 4px;
        margin: 8px 0;
        font-size: 0.95em;
      ">
        ${icon} ${Utils.escapeHtml(message)}
      </div>
    `;

    container.innerHTML = html;
  },

  /**
   * Update Pomodoro progress bar/indicator
   */
  updatePomodoroProgress(progress) {
    const progressBar = document.getElementById('pomodoroProgressBar');
    if (!progressBar) return;

    if (!Pomodoro.isMode() || progress <= 0) {
      progressBar.style.display = 'none';
      return;
    }

    progressBar.style.display = 'block';
    const color = Pomodoro.isInBreak() ? '#ff9500' : '#4CAF50';
    progressBar.style.background = `linear-gradient(to right, ${color} 0%, ${color} ${progress}%, #f0f0f0 ${progress}%, #f0f0f0 100%)`;
    progressBar.style.height = '4px';
    progressBar.style.width = '100%';
    progressBar.style.borderRadius = '2px';
    progressBar.style.transition = 'background 0.1s';
  },

  /**
   * Display Pomodoro cycle indicators (visual representation)
   */
  displayPomodoroIndicators() {
    const container = document.getElementById('pomodoroIndicatorsContainer');
    if (!container) return;

    if (!Pomodoro.isMode()) {
      container.innerHTML = '';
      return;
    }

    const completedToday = Pomodoro.getCompletedTodayCount();
    const uninterruptedToday = Pomodoro.getUninterruptedTodayCount();

    let html = '<div class="pomodoro-indicators" style="display: flex; gap: 12px; align-items: center; font-size: 0.9em;">';

    html += `
      <div>
        <span style="font-weight: 600;">Today:</span>
        <span>${completedToday} completed</span>
        <span style="color: #4CAF50; margin-left: 4px;">(${uninterruptedToday} uninterrupted)</span>
      </div>
    `;

    html += '</div>';

    container.innerHTML = html;
  }
};
