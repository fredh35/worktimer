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

async function stopTimer() {
  if (!startTime) return;
  
  clearInterval(timerInterval);
  
  const duration = getElapsedTime();
  const endTime = new Date().toISOString();
  const startTimeISO = new Date(startTime).toISOString();
  
  await fetch('/api/sessions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      task: taskInput.value || 'Unspecified',
      startTime: startTimeISO,
      endTime: endTime,
      duration: duration
    })
  });
  
  startTime = null;
  pausedTime = 0;
  isPaused = false;
  
  timerDisplay.textContent = '00:00:00';
  taskInput.value = '';
  
  startBtn.disabled = false;
  pauseBtn.disabled = true;
  stopBtn.disabled = true;
  startBtn.textContent = 'Start';
  
  loadSessions();
  loadStats();
}

async function loadSessions() {
  const res = await fetch('/api/sessions');
  const sessions = await res.json();
  
  if (sessions.length === 0) {
    logList.innerHTML = '<p class="empty-state">No sessions logged yet.</p>';
    return;
  }
  
  logList.innerHTML = sessions.map(s => `
    <div class="log-item" data-id="${s.id}">
      <span class="log-task">${escapeHtml(s.task)}</span>
      <div class="log-meta">
        <span class="log-date">${formatDate(s.created_at)}</span>
        <span class="log-duration">${formatDuration(s.duration)}</span>
        <button class="log-delete" onclick="deleteSession(${s.id})">✕</button>
      </div>
    </div>
  `).join('');
}

async function deleteSession(id) {
  await fetch(`/api/sessions/${id}`, { method: 'DELETE' });
  loadSessions();
  loadStats();
}

async function loadStats() {
  const res = await fetch('/api/stats');
  const stats = await res.json();
  
  todayStat.textContent = formatDuration(stats.today);
  weekStat.textContent = formatDuration(stats.week);
  allTimeStat.textContent = formatDuration(stats.allTime);
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

loadSessions();
loadStats();
