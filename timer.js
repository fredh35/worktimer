#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import readline from 'readline';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const LOG_FILE = path.join(__dirname, 'worklog.json');

let startTime = null;
let pausedTime = 0;
let pauseStart = null;
let isPaused = false;
let currentTask = '';

function loadLog() {
  if (fs.existsSync(LOG_FILE)) {
    return JSON.parse(fs.readFileSync(LOG_FILE, 'utf-8'));
  }
  return { sessions: [] };
}

function saveLog(log) {
  fs.writeFileSync(LOG_FILE, JSON.stringify(log, null, 2));
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

function displayStatus() {
  console.clear();
  console.log('\n🕐 WORK TIMER\n');
  console.log(`Task: ${currentTask || '(no task set)'}`);
  console.log(`Status: ${!startTime ? 'Stopped' : isPaused ? 'Paused' : 'Running'}`);
  console.log(`Time: ${formatDuration(getElapsedTime())}\n`);
  console.log('Commands:');
  console.log('  [s] Start/Resume  [p] Pause  [x] Stop & Save');
  console.log('  [t] Set Task      [l] View Log  [q] Quit\n');
}

function startTimer() {
  if (!startTime) {
    startTime = Date.now();
    pausedTime = 0;
    isPaused = false;
    console.log('Timer started!');
  } else if (isPaused) {
    pausedTime += Date.now() - pauseStart;
    isPaused = false;
    console.log('Timer resumed!');
  }
}

function pauseTimer() {
  if (startTime && !isPaused) {
    pauseStart = Date.now();
    isPaused = true;
    console.log('Timer paused.');
  }
}

function stopTimer() {
  if (!startTime) {
    console.log('No timer running.');
    return;
  }

  const elapsed = getElapsedTime();
  const log = loadLog();
  
  log.sessions.push({
    date: new Date().toISOString(),
    task: currentTask || 'Unspecified',
    duration: elapsed,
    durationFormatted: formatDuration(elapsed)
  });
  
  saveLog(log);
  console.log(`\nSession saved: ${formatDuration(elapsed)}`);
  
  startTime = null;
  pausedTime = 0;
  isPaused = false;
  currentTask = '';
}

function viewLog() {
  const log = loadLog();
  console.clear();
  console.log('\n📋 WORK LOG\n');
  
  if (log.sessions.length === 0) {
    console.log('No sessions logged yet.\n');
  } else {
    let totalMs = 0;
    log.sessions.slice(-10).forEach((s, i) => {
      const date = new Date(s.date).toLocaleDateString();
      console.log(`${i + 1}. ${date} - ${s.task}: ${s.durationFormatted}`);
      totalMs += s.duration;
    });
    console.log(`\nTotal (last 10): ${formatDuration(totalMs)}`);
    console.log(`Total sessions: ${log.sessions.length}\n`);
  }
  console.log('Press any key to return...');
}

async function setTask(rl) {
  return new Promise((resolve) => {
    rl.question('Enter task name: ', (answer) => {
      currentTask = answer.trim();
      resolve();
    });
  });
}

async function main() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  readline.emitKeypressEvents(process.stdin);
  if (process.stdin.isTTY) {
    process.stdin.setRawMode(true);
  }

  let inPrompt = false;
  let inLogView = false;

  const refresh = setInterval(() => {
    if (!inPrompt && !inLogView) displayStatus();
  }, 1000);

  displayStatus();

  process.stdin.on('keypress', async (str, key) => {
    if (inPrompt) return;
    
    if (key.ctrl && key.name === 'c') {
      clearInterval(refresh);
      rl.close();
      process.exit();
    }

    if (inLogView) {
      inLogView = false;
      displayStatus();
      return;
    }

    switch (str?.toLowerCase()) {
      case 's':
        startTimer();
        break;
      case 'p':
        pauseTimer();
        break;
      case 'x':
        stopTimer();
        break;
      case 't':
        inPrompt = true;
        await setTask(rl);
        inPrompt = false;
        displayStatus();
        break;
      case 'l':
        inLogView = true;
        viewLog();
        break;
      case 'q':
        if (startTime) {
          console.log('\nStopping timer before quit...');
          stopTimer();
        }
        clearInterval(refresh);
        rl.close();
        process.exit();
    }

    if (!inLogView) setTimeout(() => displayStatus(), 100);
  });
}

main().catch(console.error);
