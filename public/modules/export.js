/**
 * Export Module - Handles data export functionality
 */

import { Storage } from './storage.js';
import { Utils } from './utils.js';

export const Export = {
  toCSV() {
    const sessions = Storage.getSessions();
    
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
      const durationFormatted = Utils.formatDuration(s.duration);
      const durationHours = Utils.formatDurationHours(s.duration);
      
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
    this.download(csv, `worktimer-export-${Utils.getDateKey()}.csv`);
  },

  download(content, filename) {
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};
