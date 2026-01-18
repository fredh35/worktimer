/**
 * Calendar Module - Handles calendar view and navigation
 */

import { Stats } from './stats.js';
import { Utils } from './utils.js';
import { Storage } from './storage.js';

export const Calendar = {
  currentDate: new Date(),
  elements: {},

  init(elementMap) {
    this.elements = elementMap;
  },

  getIntensityColor(ms) {
    const hours = ms / 3600000;
    if (hours === 0) return '#f5f5f5';
    if (hours < 2) return '#c8e6c9';
    if (hours < 4) return '#81c784';
    if (hours < 6) return '#4caf50';
    return '#2e7d32';
  },

  render() {
    const year = this.currentDate.getFullYear();
    const month = this.currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    
    this.elements.monthLabel.textContent = firstDay.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    this.elements.calendarGrid.innerHTML = '';
    
    // Render weekday headers
    const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    weekdays.forEach(day => {
      const weekdayEl = document.createElement('div');
      weekdayEl.className = 'calendar-weekday';
      weekdayEl.textContent = day;
      this.elements.calendarGrid.appendChild(weekdayEl);
    });
    
    // Render calendar days
    const daily = Stats.getDailyTotals();
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
      
      const dateKey = Utils.getDateKey(date);
      const duration = daily[dateKey] || 0;
      
      dayEl.style.background = this.getIntensityColor(duration);
      
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
      
      dayEl.addEventListener('click', () => this.showDayDetail(dateKey));
      this.elements.calendarGrid.appendChild(dayEl);
    }
  },

  showDayDetail(dateKey) {
    const sessions = Stats.getSessionsForDay(dateKey);
    
    if (sessions.length === 0) {
      this.elements.dayDetail.innerHTML = '<div class="day-detail-empty">No sessions logged for this day</div>';
      return;
    }
    
    const dateStr = Utils.formatDateFull(dateKey + 'T00:00:00Z');
    const total = sessions.reduce((sum, s) => sum + s.duration, 0);
    
    let html = `<h3>${dateStr} (${Utils.formatDuration(total)})</h3><div class="day-detail-items">`;
    sessions.forEach(s => {
      html += `<div class="day-detail-item">
        <span class="day-detail-item-task">${Utils.escapeHtml(s.task)}</span>
        <span class="day-detail-item-duration">${Utils.formatDuration(s.duration)}</span>
      </div>`;
    });
    html += '</div>';
    
    this.elements.dayDetail.innerHTML = html;
  },

  prevMonth() {
    this.currentDate.setMonth(this.currentDate.getMonth() - 1);
    this.render();
  },

  nextMonth() {
    this.currentDate.setMonth(this.currentDate.getMonth() + 1);
    this.render();
  },

  updateToToday() {
    this.showDayDetail(Utils.getDateKey());
  }
};
