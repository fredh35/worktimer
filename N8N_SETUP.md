# Work Timer + n8n Integration Setup
## Simple Automation: Slack Notification on Session Save

---

## Overview

This setup integrates **Work Timer** with **n8n** (workflow automation platform) to send **Slack notifications** when a work session is saved.

**Flow:**
1. User starts timer in Work Timer
2. User stops & saves session
3. Work Timer sends webhook to n8n
4. n8n sends Slack message with task + duration

---

## Prerequisites

- [ ] Docker installed (`docker --version`)
- [ ] Docker Compose installed (`docker-compose --version`)
- [ ] Slack workspace (to receive notifications)
- [ ] Slack bot token (from Slack App)

---

## Step 1: Set Up n8n Locally

### 1.1 Start n8n with Docker

```bash
cd /Users/fredherrera/worktimer-n8n

# Start n8n server
docker-compose up -d

# Wait 30 seconds for startup
sleep 30

# Check logs
docker-compose logs n8n
```

Access n8n at: **http://localhost:5678**

### 1.2 Create n8n Account

1. Open http://localhost:5678
2. Create admin account
3. Set username & password
4. Login

---

## Step 2: Create Slack App (n8n needs this)

### 2.1 Create Bot in Slack

1. Go to https://api.slack.com/apps
2. Click "Create New App"
3. Choose "From scratch"
4. Name: "Work Timer"
5. Pick your workspace
6. Click "Create App"

### 2.2 Get Bot Token

1. In left menu → "OAuth & Permissions"
2. Copy **Bot User OAuth Token** (starts with `xoxb-`)
3. Save this - you'll need it for n8n

### 2.3 Give Bot Permissions

1. In "Scopes" section → "Bot Token Scopes"
2. Add scopes:
   - `chat:write` (send messages)
   - `channels:read` (list channels)

### 2.4 Install App to Workspace

1. Click "Install to Workspace"
2. Authorize the app

---

## Step 3: Create n8n Workflow

### 3.1 In n8n Dashboard

1. Click **"+ New"** button
2. Click **"New Workflow"**

### 3.2 Add Webhook Node (Trigger)

1. Click **"Add a node"**
2. Search: **"Webhook"**
3. Select **"Webhook"**
4. Copy the webhook URL (you'll need this for Work Timer)
   - Example: `http://localhost:5678/webhook/work-timer-automation`

### 3.3 Add Slack Node (Action)

1. Click **"+"** to add another node
2. Search: **"Slack"**
3. Select **"Slack"** → **"Send Message"**
4. Configure:
   - **Authentication**: Click "Create new credential"
     - Bot Token: Paste your Slack bot token (from Step 2.2)
     - Click "Create"
   - **Channel**: Select channel or type `#notifications`
   - **Text**: Use expression:
     ```
     Task: {{$json.body.task}}
     Duration: {{$json.body.durationHours}} hours
     Time: {{$json.body.timestamp}}
     ```

### 3.4 Connect Nodes

1. Click on **Webhook node** → drag connector down
2. Connect to **Slack node**

### 3.5 Save & Activate Workflow

1. Click **"Save"** (top left)
2. Name: "Work Timer Session Saved"
3. Click **"Activate"** toggle (on)

---

## Step 4: Connect Work Timer to n8n

### 4.1 Get n8n Webhook URL

1. In your n8n workflow, find the **Webhook node**
2. Copy the **Test URL** (looks like: `http://localhost:5678/webhook/...`)

### 4.2 Start Work Timer with n8n Webhook

**Option A: Query Parameter**
```bash
# Start app with webhook URL
open "http://localhost:3000?n8n_webhook=http://localhost:5678/webhook/work-timer-automation"
```

**Option B: Update HTML (hardcode)**
```javascript
// In public/app.js, find this line:
Automation.init('http://localhost:5678/webhook/work-timer-automation');
```

---

## Step 5: Test the Integration

### 5.1 Test in Work Timer

1. Go to http://localhost:3000
2. Enter task: "Testing n8n integration"
3. Click "Start"
4. Wait 5 seconds
5. Click "Stop & Save"
6. Check your Slack channel → should see notification! ✅

### 5.2 Test in n8n (if not working)

1. In n8n workflow, click the **Webhook node**
2. Click **"Test trigger"**
3. In another tab/window, complete a Work Timer session
4. Check if webhook received data

---

## Troubleshooting

### Slack message not appearing?

**Check:**
1. Is n8n workflow **activated** (toggle on)?
2. Is Slack bot in the right channel?
3. Check n8n logs: `docker-compose logs n8n`

### n8n not receiving webhook data?

**Check:**
1. Work Timer console: Open DevTools (F12) → Console
2. Look for errors
3. Verify webhook URL is correct (no typos)
4. Try `curl` test:
```bash
curl -X POST http://localhost:5678/webhook/work-timer-automation \
  -H "Content-Type: application/json" \
  -d '{"task": "test", "duration": 3600000}'
```

### Docker not running?

```bash
# Restart
docker-compose restart

# Or recreate
docker-compose down
docker-compose up -d
```

---

## Next Steps

Once basic workflow works, you can add:

### Additional Actions
- **Email** - Send email notification
- **Google Sheets** - Append session to sheet
- **Discord** - Send Discord message
- **Database** - Log to external DB

### Additional Triggers
- Daily summary at end of day
- Weekly report every Friday
- Goal reached alert (e.g., 8 hours logged)

### Example: Email on Milestone

```
Trigger: Session saved
Condition: IF duration >= 2 hours
Action: Send email to user@example.com
```

---

## Architecture

```
Work Timer (localhost:3000)
       ↓
  Click "Stop & Save"
       ↓
  Automation.notifySessionSaved()
       ↓
  POST to n8n webhook
       ↓
  n8n Workflow (localhost:5678)
       ↓
  Send Slack message
       ↓
  Slack Channel 💬
```

---

## Production Deployment

When deploying to production:

1. **n8n**: Host on server (AWS, DigitalOcean, etc.)
   ```bash
   # Use managed n8n Cloud
   # Or self-host on VPS with Docker
   ```

2. **Work Timer**: Update webhook URL
   ```javascript
   // Use production n8n URL
   Automation.init('https://your-domain.com/webhook/work-timer');
   ```

3. **Slack**: Use production bot

---

## Stop n8n

```bash
cd /Users/fredherrera/worktimer-n8n
docker-compose down
```

---

## Resources

- n8n Docs: https://docs.n8n.io
- n8n + Slack: https://docs.n8n.io/integrations/builtin/credentials/slack/
- Slack API: https://api.slack.com

---

**Status:** Setup Complete ✅

Next: Test the workflow with actual Work Timer sessions!
