/**
 * Theme Module - Manages dark mode and theme persistence
 */

const THEME_KEY = 'worktimer_theme';

export const Theme = {
  themeToggle: null,

  init(toggleElement) {
    this.themeToggle = toggleElement;
  },

  initialize() {
    const savedTheme = localStorage.getItem(THEME_KEY);
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const isDarkMode = savedTheme ? savedTheme === 'dark' : prefersDark;
    
    if (isDarkMode) {
      this.enable();
    } else {
      this.disable();
    }
  },

  toggle() {
    const isDarkMode = document.body.classList.contains('dark-mode');
    isDarkMode ? this.disable() : this.enable();
  },

  enable() {
    document.body.classList.add('dark-mode');
    localStorage.setItem(THEME_KEY, 'dark');
    if (this.themeToggle) this.themeToggle.textContent = '☀️';
  },

  disable() {
    document.body.classList.remove('dark-mode');
    localStorage.setItem(THEME_KEY, 'light');
    if (this.themeToggle) this.themeToggle.textContent = '🌙';
  },

  isDark() {
    return document.body.classList.contains('dark-mode');
  }
};
