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
import { Pomodoro } from './modules/pomodoro.js';
import { Interruptions } from './modules/interruptions.js';

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

// Initialize Pomodoro module
Pomodoro.init();

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
  // If Pomodoro mode is enabled, set target duration
  if (Pomodoro.isMode() && !Pomodoro.isInBreak()) {
    Pomodoro.startWorkCycle();
    const targetMs = Pomodoro.getRecommendedDuration();
    Timer.setPomodoroTarget(targetMs);
  }

  Timer.start();
  Timer.interval = setInterval(() => {
    const elapsed = Timer.getElapsed();
    UI.updateTimerDisplay(elapsed);

    // Update Pomodoro UI every 100ms
    if (Pomodoro.isMode()) {
      UI.displayPomodoroStatus(elapsed);
      UI.updatePomodoroProgress(Timer.getPomodoroProgress());
      UI.displayInterruptionTags();
      UI.displayPomodoroBreakSuggestion();
      UI.displayPomodoroIndicators();
    }

    // Update session suggestions every 10 seconds
    if (Math.floor(elapsed / 1000) % 10 === 0) {
      const taskName = elementMap.taskInput.value || 'Work';
      UI.displaySessionSuggestions(elapsed, taskName);
    }

    // Check if Pomodoro work target reached
    if (Pomodoro.isMode() && !Pomodoro.isInBreak() && Timer.hasPomodoroTargetReached()) {
      pauseTimer();
      Sound.playSessionSaved();
      Pomodoro.completeWorkCycle(Interruptions.getCount());
      UI.displayPomodoroBreakSuggestion();
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

  // Capture interruption data before resetting
  const interruptionData = Interruptions.resetAndGet();

  // Create session with optional Pomodoro metadata
  const session = {
    task,
    description,
    startTime: startTimeISO,
    endTime,
    duration,
    isPomodoroSession: Pomodoro.isMode(),
    pomodoroPhase: Pomodoro.isMode() ? (Pomodoro.isInBreak() ? 'break' : 'work') : null,
    ...interruptionData  // Spread interruption data into session
  };

  Storage.addSession(session.task, session.startTime, session.endTime, session.duration, session.description);

  // If using Pomodoro, complete break phase and prepare for next cycle
  if (Pomodoro.isMode() && Pomodoro.isInBreak()) {
    Pomodoro.completeBreakPhase();
  }

  // Clear timer target
  Timer.clearPomodoroTarget();

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

  // Clear Pomodoro UI containers
  if (Pomodoro.isMode()) {
    document.getElementById('pomodoroStatusContainer').innerHTML = '';
    document.getElementById('interruptionTagsContainer').innerHTML = '';
    document.getElementById('pomodoroBreakContainer').innerHTML = '';
    document.getElementById('pomodoroProgressBar').style.display = 'none';
  }

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
// Pomodoro Handlers
// ============================================================================

window.togglePomodoroMode = () => {
  const isCurrentlyEnabled = Pomodoro.isMode();
  Pomodoro.setMode(!isCurrentlyEnabled);

  // Update UI
  const btn = document.getElementById('pomodoroModeBtn');
  if (btn) {
    btn.style.background = !isCurrentlyEnabled ? '#4CAF50' : '#ccc';
    btn.style.color = !isCurrentlyEnabled ? 'white' : '#333';
    btn.textContent = !isCurrentlyEnabled ? '⏱️ Pomodoro ON' : 'Pomodoro OFF';
  }

  // Clear Pomodoro containers if disabling
  if (isCurrentlyEnabled) {
    Interruptions.reset();
    Pomodoro.reset();
    document.getElementById('pomodoroStatusContainer').innerHTML = '';
    document.getElementById('interruptionTagsContainer').innerHTML = '';
    document.getElementById('pomodoroBreakContainer').innerHTML = '';
    document.getElementById('pomodoroProgressBar').style.display = 'none';
    document.getElementById('pomodoroIndicatorsContainer').innerHTML = '';
  }
};

window.logInterruption = (type) => {
  Interruptions.log(type);
  UI.displayInterruptionTags();
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
