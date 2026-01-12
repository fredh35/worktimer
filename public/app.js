const STORAGE_KEY = 'worktimer_sessions';

let startTime = null;
let pausedTime = 0;
let pauseStart = null;
let isPaused = false;
let timerInterval = null;

const timerDisplay = document.getElementById('timerDisplay');
const taskInput = document.getElementById('taskInput');
const startBtn = document.getElementById('startBtn');
const pauseBtn = document.getElementById('pauseBtn');
const stopBtn = document.getElementById('stopBtn');
const logList = document.getElementById('logList');
const todayStat = document.getElementById('todayStat');
const weekStat = document.getElementById('weekStat');
const allTimeStat = document.getElementById('allTimeStat');
const clockDisplay = document.getElementById('clock');
const calendarGrid = document.getElementById('calendarGrid');
const monthLabel = document.getElementById('monthLabel');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const dayDetail = document.getElementById('dayDetail');
const exportBtn = document.getElementById('exportBtn');
const themeToggle = document.getElementById('themeToggle');

let currentDate = new Date();
const THEME_KEY = 'worktimer_theme';

function loadSessions() {
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : [];
}

function saveSessions(sessions) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
}

function formatDuration(ms) {
  const seconds = Math.floor(ms / 1000) % 60;
  const minutes = Math.floor(ms / 60000) % 60;
  const hours = Math.floor(ms / 3600000);
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

function getElapsedTime() {
  if (!startTime) return 0;
  const now = isPaused ? pauseStart : Date.now();
  return now - startTime - pausedTime;
}

function updateDisplay() {
  timerDisplay.textContent = formatDuration(getElapsedTime());
}

function startTimer() {
  if (!startTime) {
    startTime = Date.now();
    pausedTime = 0;
    isPaused = false;
  } else if (isPaused) {
    pausedTime += Date.now() - pauseStart;
    isPaused = false;
  }
  
  timerInterval = setInterval(updateDisplay, 100);
  
  startBtn.disabled = true;
  pauseBtn.disabled = false;
  stopBtn.disabled = false;
  startBtn.textContent = 'Running...';
}

function pauseTimer() {
  if (startTime && !isPaused) {
    pauseStart = Date.now();
    isPaused = true;
    clearInterval(timerInterval);
    
    startBtn.disabled = false;
    startBtn.textContent = 'Resume';
    pauseBtn.disabled = true;
  }
}

function stopTimer() {
  if (!startTime) return;
  
  clearInterval(timerInterval);
  
  const duration = getElapsedTime();
  const endTime = new Date().toISOString();
  const startTimeISO = new Date(startTime).toISOString();
  
  const sessions = loadSessions();
  sessions.unshift({
    id: Date.now(),
    task: taskInput.value || 'Unspecified',
    startTime: startTimeISO,
    endTime: endTime,
    duration: duration,
    createdAt: new Date().toISOString()
  });
  saveSessions(sessions);
  
  startTime = null;
  pausedTime = 0;
  isPaused = false;
  
  timerDisplay.textContent = '00:00:00';
  taskInput.value = '';
  
  startBtn.disabled = false;
  pauseBtn.disabled = true;
  stopBtn.disabled = true;
  startBtn.textContent = 'Start';
  
  renderSessions();
  renderStats();
  renderCalendar();
  showDayDetail(new Date().toISOString().split('T')[0]);
}

function deleteSession(id) {
  const sessions = loadSessions().filter(s => s.id !== id);
  saveSessions(sessions);
  renderSessions();
  renderStats();
  renderCalendar();
  showDayDetail(new Date().toISOString().split('T')[0]);
}

function renderSessions() {
  const sessions = loadSessions().slice(0, 100);
  
  if (sessions.length === 0) {
    logList.innerHTML = '<p class="empty-state">No sessions logged yet.</p>';
    return;
  }
  
  logList.innerHTML = sessions.map(s => `
    <div class="log-item" data-id="${s.id}">
      <span class="log-task">${escapeHtml(s.task)}</span>
      <div class="log-meta">
        <span class="log-date">${formatDate(s.createdAt)}</span>
        <span class="log-duration">${formatDuration(s.duration)}</span>
        <button class="log-delete" onclick="deleteSession(${s.id})">✕</button>
      </div>
    </div>
  `).join('');
}

function renderStats() {
  const sessions = loadSessions();
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const weekStart = todayStart - (7 * 24 * 60 * 60 * 1000);
  
  let todayTotal = 0;
  let weekTotal = 0;
  let allTimeTotal = 0;
  
  sessions.forEach(s => {
    const sessionTime = new Date(s.createdAt).getTime();
    allTimeTotal += s.duration;
    
    if (sessionTime >= todayStart) {
      todayTotal += s.duration;
    }
    if (sessionTime >= weekStart) {
      weekTotal += s.duration;
    }
  });
  
  todayStat.textContent = formatDuration(todayTotal);
  weekStat.textContent = formatDuration(weekTotal);
  allTimeStat.textContent = formatDuration(allTimeTotal);
}

function formatDate(isoString) {
  const date = new Date(isoString);
  return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function updateClock() {
  const now = new Date();
  const hours = now.getHours().toString().padStart(2, '0');
  const minutes = now.getMinutes().toString().padStart(2, '0');
  clockDisplay.textContent = `${hours}:${minutes}`;
}

function getDailyTotals() {
  const sessions = loadSessions();
  const daily = {};
  
  sessions.forEach(s => {
    const date = new Date(s.createdAt);
    const dateKey = date.toISOString().split('T')[0];
    daily[dateKey] = (daily[dateKey] || 0) + s.duration;
  });
  
  return daily;
}

function getIntensityColor(ms) {
  const hours = ms / 3600000;
  if (hours === 0) return '#f5f5f5';
  if (hours < 2) return '#c8e6c9';
  if (hours < 4) return '#81c784';
  if (hours < 6) return '#4caf50';
  return '#2e7d32';
}

function renderCalendar() {
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startDate = new Date(firstDay);
  startDate.setDate(startDate.getDate() - firstDay.getDay());
  
  monthLabel.textContent = firstDay.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  
  calendarGrid.innerHTML = '';
  
  const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  weekdays.forEach(day => {
    const weekdayEl = document.createElement('div');
    weekdayEl.className = 'calendar-weekday';
    weekdayEl.textContent = day;
    calendarGrid.appendChild(weekdayEl);
  });
  
  const daily = getDailyTotals();
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  for (let i = 0; i < 42; i++) {
    const date = new Date(startDate);
    date.setDate(date.getDate() + i);
    
    const dayEl = document.createElement('div');
    dayEl.className = 'calendar-day';
    
    if (date.getMonth() !== month) {
      dayEl.classList.add('other-month');
    }
    
    if (date.getTime() === today.getTime()) {
      dayEl.classList.add('today');
    }
    
    const dateKey = date.toISOString().split('T')[0];
    const duration = daily[dateKey] || 0;
    
    dayEl.style.background = getIntensityColor(duration);
    
    const dayNum = document.createElement('span');
    dayNum.className = 'calendar-day-num';
    dayNum.textContent = date.getDate();
    dayEl.appendChild(dayNum);
    
    if (duration > 0) {
      const hours = (duration / 3600000).toFixed(1);
      const hoursEl = document.createElement('span');
      hoursEl.className = 'calendar-day-hours';
      hoursEl.textContent = hours + 'h';
      dayEl.appendChild(hoursEl);
    }
    
    dayEl.addEventListener('click', () => showDayDetail(dateKey));
    calendarGrid.appendChild(dayEl);
  }
}

function showDayDetail(dateKey) {
  const sessions = loadSessions();
  const daySessions = sessions.filter(s => s.createdAt.split('T')[0] === dateKey);
  
  if (daySessions.length === 0) {
    dayDetail.innerHTML = '<div class="day-detail-empty">No sessions logged for this day</div>';
    return;
  }
  
  const date = new Date(dateKey);
  const dateStr = date.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  const total = daySessions.reduce((sum, s) => sum + s.duration, 0);
  
  let html = `<h3>${dateStr} (${formatDuration(total)})</h3><div class="day-detail-items">`;
  daySessions.forEach(s => {
    html += `<div class="day-detail-item">
      <span class="day-detail-item-task">${escapeHtml(s.task)}</span>
      <span class="day-detail-item-duration">${formatDuration(s.duration)}</span>
    </div>`;
  });
  html += '</div>';
  
  dayDetail.innerHTML = html;
}

function prevMonth() {
  currentDate.setMonth(currentDate.getMonth() - 1);
  renderCalendar();
}

function nextMonth() {
  currentDate.setMonth(currentDate.getMonth() + 1);
  renderCalendar();
}

function exportToCSV() {
  const sessions = loadSessions();
  
  if (sessions.length === 0) {
    alert('No sessions to export');
    return;
  }
  
  // CSV header
  const headers = ['Date', 'Task', 'Start Time', 'End Time', 'Duration (HH:MM:SS)', 'Duration (Hours)'];
  const rows = [headers];
  
  // CSV rows
  sessions.forEach(s => {
    const date = new Date(s.createdAt).toLocaleDateString();
    const startTime = new Date(s.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    const endTime = new Date(s.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    const durationFormatted = formatDuration(s.duration);
    const durationHours = (s.duration / 3600000).toFixed(2);
    
    rows.push([
      date,
      `"${s.task.replace(/"/g, '""')}"`, // Escape quotes in task name
      startTime,
      endTime,
      durationFormatted,
      durationHours
    ]);
  });
  
  // Convert to CSV string
  const csv = rows.map(row => row.join(',')).join('\n');
  
  // Create blob and download
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', `worktimer-export-${new Date().toISOString().split('T')[0]}.csv`);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

function initTheme() {
  const savedTheme = localStorage.getItem(THEME_KEY);
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const isDarkMode = savedTheme ? savedTheme === 'dark' : prefersDark;
  
  if (isDarkMode) {
    document.body.classList.add('dark-mode');
    themeToggle.textContent = '☀️';
  } else {
    document.body.classList.remove('dark-mode');
    themeToggle.textContent = '🌙';
  }
}

function toggleTheme() {
  document.body.classList.toggle('dark-mode');
  const isDarkMode = document.body.classList.contains('dark-mode');
  localStorage.setItem(THEME_KEY, isDarkMode ? 'dark' : 'light');
  themeToggle.textContent = isDarkMode ? '☀️' : '🌙';
}

startBtn.addEventListener('click', startTimer);
pauseBtn.addEventListener('click', pauseTimer);
stopBtn.addEventListener('click', stopTimer);
prevBtn.addEventListener('click', prevMonth);
nextBtn.addEventListener('click', nextMonth);
exportBtn.addEventListener('click', exportToCSV);
themeToggle.addEventListener('click', toggleTheme);

// Initialize theme based on saved preference or system setting
initTheme();

// Update clock immediately and then every minute
updateClock();
setInterval(updateClock, 60000);

renderSessions();
renderStats();
renderCalendar();
showDayDetail(new Date().toISOString().split('T')[0]);
