// productivity-analyst.js

/**
 * Productivity Analyst Module
 * This module provides comprehensive features for analyzing
 * productivity data. It includes functions for tracking tasks,
 * measuring time spent, and generating reports.
 */

class ProductivityAnalyst {
    constructor() {
        this.tasks = [];
    }

    /**
     * Add a new task to the tracker.
     * @param {string} taskName - Name of the task.
     * @param {number} timeSpent - Time spent on the task in hours.
     */
    addTask(taskName, timeSpent) {
        this.tasks.push({ taskName, timeSpent });
    }

    /**
     * Calculate total time spent on tasks.
     * @returns {number} Total time in hours.
     */
    calculateTotalTime() {
        return this.tasks.reduce((total, task) => total + task.timeSpent, 0);
    }

    /**
     * Generate a report of productivity.
     * @returns {string} Summary report of tasks and time spent.
     */
    generateReport() {
        let report = 'Productivity Report:\n';
        report += '====================\n';
        this.tasks.forEach(task => {
            report += `Task: ${task.taskName}, Time Spent: ${task.timeSpent} hours\n`;
        });
        report += `Total Time Spent: ${this.calculateTotalTime()} hours\n`;
        return report;
    }
}

module.exports = ProductivityAnalyst;
