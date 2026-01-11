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
}

function deleteSession(id) {
  const sessions = loadSessions().filter(s => s.id !== id);
  saveSessions(sessions);
  renderSessions();
  renderStats();
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

startBtn.addEventListener('click', startTimer);
pauseBtn.addEventListener('click', pauseTimer);
stopBtn.addEventListener('click', stopTimer);

renderSessions();
renderStats();
