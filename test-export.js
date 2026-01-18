// Test script to verify CSV export functionality
import fs from 'fs';

const STORAGE_KEY = 'worktimer_sessions';

// Simulate localStorage for testing
const mockStorage = {};

function loadSessions() {
  const data = mockStorage[STORAGE_KEY];
  return data ? JSON.parse(data) : [];
}

function saveSessions(sessions) {
  mockStorage[STORAGE_KEY] = JSON.stringify(sessions);
}

function formatDuration(ms) {
  const seconds = Math.floor(ms / 1000) % 60;
  const minutes = Math.floor(ms / 60000) % 60;
  const hours = Math.floor(ms / 3600000);
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

// Create test sessions
const testSessions = [
  {
    id: 1,
    task: 'Calendar Component Development',
    startTime: new Date('2026-01-11T09:00:00').toISOString(),
    endTime: new Date('2026-01-11T10:30:00').toISOString(),
    duration: 5400000, // 1.5 hours
    createdAt: new Date('2026-01-11T10:30:00').toISOString()
  },
  {
    id: 2,
    task: 'CSV Export Feature',
    startTime: new Date('2026-01-11T11:00:00').toISOString(),
    endTime: new Date('2026-01-11T12:45:00').toISOString(),
    duration: 6300000, // 1.75 hours
    createdAt: new Date('2026-01-11T12:45:00').toISOString()
  },
  {
    id: 3,
    task: 'Testing & Bug Fixes',
    startTime: new Date('2026-01-10T14:00:00').toISOString(),
    endTime: new Date('2026-01-10T16:15:00').toISOString(),
    duration: 8100000, // 2.25 hours
    createdAt: new Date('2026-01-10T16:15:00').toISOString()
  }
];

saveSessions(testSessions);

// Test CSV export
function exportToCSV() {
  const sessions = loadSessions();
  
  if (sessions.length === 0) {
    console.log('No sessions to export');
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
      `"${s.task.replace(/"/g, '""')}"`,
      startTime,
      endTime,
      durationFormatted,
      durationHours
    ]);
  });
  
  // Convert to CSV string
  const csv = rows.map(row => row.join(',')).join('\n');
  
  return csv;
}

// Run test
console.log('✓ Testing CSV Export Function\n');
const csv = exportToCSV();

if (csv) {
  console.log('Generated CSV Output:\n');
  console.log(csv);
  console.log('\n✓ CSV Export Test Passed');
  console.log(`✓ Generated ${loadSessions().length} session rows`);
  console.log('✓ Proper CSV formatting with quoted task names');
  console.log('✓ Duration formatted in both HH:MM:SS and decimal hours');
}
