/**
 * Automation Module - Integrates with n8n for notifications
 */

export const Automation = {
  n8nWebhookUrl: null,

  /**
   * Initialize n8n webhook URL
   * @param {string} webhookUrl - n8n webhook endpoint
   */
  init(webhookUrl) {
    this.n8nWebhookUrl = webhookUrl;
  },

  /**
   * Notify n8n when session is saved
   * Triggers automated workflows (Slack, email, etc.)
   */
  async notifySessionSaved(task, duration) {
    if (!this.n8nWebhookUrl) {
      console.debug('n8n webhook not configured');
      return;
    }

    try {
      const durationHours = (duration / 3600000).toFixed(2);
      
      const payload = {
        event: 'session_saved',
        task,
        duration,
        durationHours,
        timestamp: new Date().toISOString(),
        source: 'worktimer'
      };

      const response = await fetch(this.n8nWebhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        console.warn('n8n webhook request failed:', response.status);
      }
    } catch (error) {
      // Silently fail - don't interrupt user experience
      console.debug('Automation notification error:', error);
    }
  },

  /**
   * Notify n8n when daily goal is reached (future use)
   */
  async notifyDailyGoalReached(totalHours) {
    if (!this.n8nWebhookUrl) return;

    try {
      await fetch(this.n8nWebhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event: 'daily_goal_reached',
          totalHours,
          timestamp: new Date().toISOString(),
          source: 'worktimer'
        })
      });
    } catch (error) {
      console.debug('Automation notification error:', error);
    }
  }
};
