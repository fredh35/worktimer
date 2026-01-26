/**
 * Work Timer - Refactored Main Application
 * 
 * Modular architecture with separated concerns:
 * - Storage: Data persistence
 * - Timer: Timer state management
 * - UI: DOM updates and rendering
 * - Calendar: Calendar view management
 * - Stats: Statistics calculations
 * - Export: Data export functionality
 * - Theme: Dark mode management
 * - Utils: Shared utilities
 */

import { Storage } from './modules/storage.js';
import { Timer } from './modules/timer.js';
import { UI } from './modules/ui.js';
import { Calendar } from './modules/calendar.js';
import { Stats } from './modules/stats.js';
import { Export } from './modules/export.js';
import { Theme } from './modules/theme.js';
import { Utils } from './modules/utils.js';
import { Sound } from './modules/sound.js';
import { Automation } from './modules/automation.js';
import { CopilotSuggestions } from './modules/copilot-suggestions.js';

// ============================================================================
// Initialization
// ============================================================================

const elementMap = {
  timerDisplay: document.getElementById('timerDisplay'),
  taskInput: document.getElementById('taskInput'),
  startBtn: document.getElementById('startBtn'),
  pauseBtn: document.getElementById('pauseBtn'),
  stopBtn: document.getElementById('stopBtn'),
  logList: document.getElementById('logList'),
  todayStat: document.getElementById('todayStat'),
  weekStat: document.getElementById('weekStat'),
  allTimeStat: document.getElementById('allTimeStat'),
  clockDisplay: document.getElementById('clock'),
  calendarGrid: document.getElementById('calendarGrid'),
  monthLabel: document.getElementById('monthLabel'),
  prevBtn: document.getElementById('prevBtn'),
  nextBtn: document.getElementById('nextBtn'),
  dayDetail: document.getElementById('dayDetail'),
  exportBtn: document.getElementById('exportBtn'),
  themeToggle: document.getElementById('themeToggle')
};

UI.init(elementMap);
Calendar.init({
  calendarGrid: elementMap.calendarGrid,
  monthLabel: elementMap.monthLabel,
  dayDetail: elementMap.dayDetail
});
Theme.init(elementMap.themeToggle);

// Initialize n8n automation webhook (if available)
// Configure via environment or query parameter
const params = new URLSearchParams(window.location.search);
const n8nWebhook = params.get('n8n_webhook');
if (n8nWebhook) {
  Automation.init(decodeURIComponent(n8nWebhook));
}

// ============================================================================
// Timer Control Handlers
// ============================================================================

function startTimer() {
  Timer.start();
  Timer.interval = setInterval(() => {
    const elapsed = Timer.getElapsed();
    UI.updateTimerDisplay(elapsed);
    
    // Update session suggestions every 10 seconds
    if (Math.floor(elapsed / 1000) % 10 === 0) {
      const taskName = elementMap.taskInput.value || 'Work';
      UI.displaySessionSuggestions(elapsed, taskName);
    }
  }, 100);
  
  elementMap.startBtn.disabled = true;
  elementMap.pauseBtn.disabled = false;
  elementMap.stopBtn.disabled = false;
  elementMap.startBtn.textContent = 'Running...';
}

function pauseTimer() {
  Timer.pause();
  clearInterval(Timer.interval);
  
  elementMap.startBtn.disabled = false;
  elementMap.startBtn.textContent = 'Resume';
  elementMap.pauseBtn.disabled = true;
}

function stopTimer() {
  const result = Timer.stop();
  if (!result) return;
  
  const { duration, endTime, startTimeISO } = result;
  const task = elementMap.taskInput.value || 'Unspecified';
  const description = document.getElementById('descriptionInput').value || '';
  Storage.addSession(task, startTimeISO, endTime, duration, description);
  
  // Play success sound
  Sound.playSessionSaved();
  
  // Trigger n8n automation workflow
  Automation.notifySessionSaved(task, duration);
  
  UI.resetTimerDisplay();
  document.getElementById('descriptionInput').value = '';
  elementMap.startBtn.disabled = false;
  elementMap.pauseBtn.disabled = true;
  elementMap.stopBtn.disabled = true;
  elementMap.startBtn.textContent = 'Start';
  
  refreshUI();
}

// ============================================================================
// Data Management
// ============================================================================

window.deleteSessionHandler = (id) => {
  Storage.deleteSession(id);
  refreshUI();
};

// ============================================================================
// UI Refresh
// ============================================================================

function refreshUI() {
  UI.renderSessions();
  UI.updateStats();
  Calendar.render();
  Calendar.updateToToday();
}

// ============================================================================
// Event Listeners
// ============================================================================

elementMap.startBtn.addEventListener('click', startTimer);
elementMap.pauseBtn.addEventListener('click', pauseTimer);
elementMap.stopBtn.addEventListener('click', stopTimer);
elementMap.prevBtn.addEventListener('click', () => {
  Calendar.prevMonth();
});
elementMap.nextBtn.addEventListener('click', () => {
  Calendar.nextMonth();
});
elementMap.exportBtn.addEventListener('click', () => {
  Export.toCSV();
});
elementMap.themeToggle.addEventListener('click', () => {
  Theme.toggle();
});

// Task input listener for smart suggestions
elementMap.taskInput.addEventListener('input', async () => {
  await UI.displayTaskSuggestions();
});

// Global function to fill task suggestion
window.fillTaskSuggestion = (task) => {
  elementMap.taskInput.value = task;
  elementMap.taskInput.focus();
};

// ============================================================================
// Initialization
// ============================================================================

Theme.initialize();

// Update clock immediately and then every minute
UI.updateClock();
setInterval(() => UI.updateClock(), 60000);

// Initial render
UI.renderSessions();
UI.updateStats();
Calendar.render();
Calendar.updateToToday();

// Display initial productivity tip and task suggestions
UI.displayProductivityTip();
UI.displayTaskSuggestions();
