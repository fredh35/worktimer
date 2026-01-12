# Work Timer - Amp Commands

Project-specific commands and workflows for the Work Timer application.

## Web Server

### `start`
Start the development server on http://localhost:3000
```bash
npm start
```

### `cli`
Launch the CLI timer interface for command-line work tracking
```bash
npm run cli
```

## Feature Development

### `add feature [name]`
Create a new feature with:
- HTML markup in public/index.html
- CSS styling in public/style.css
- JS logic in public/app.js

**Usage:**
```
add feature weekly-goals
```

### `add calendar view [type]`
Add calendar view variants:
- `weekly` - 7-day week view with daily totals
- `year` - 12-month year overview heatmap
- `day` - Hourly breakdown view

**Usage:**
```
add calendar view weekly
```

## Data Management

### `export sessions [format]`
Export work session data:
- `csv` - Comma-separated values for Excel
- `json` - JSON for backup/analysis
- `pdf` - PDF report with charts

**Usage:**
```
export sessions csv
```

### `clear data [date-range]`
Delete sessions in date range (requires confirmation)
- `--today` - Clear today only
- `--this-week` - Clear current week
- `--before [YYYY-MM-DD]` - Clear before date

**Usage:**
```
clear data --this-week
```

### `backup database`
Create timestamped backup of worktimer.db and localStorage sessions

## Analytics

### `show stats [period]`
Display work statistics:
- `daily` - Average hours per day
- `weekly` - Weekly totals and trends
- `monthly` - Month-over-month comparison
- `tasks` - Top tasks by hours

**Usage:**
```
show stats weekly
```

### `analyze patterns`
Generate insights:
- Most productive times
- Most frequent tasks
- Work consistency score
- Suggested daily goal

## Quality Assurance

### `lint`
Check code style (add ESLint config)
```bash
npm run lint
```

### `test`
Run unit tests for timer logic and data persistence

### `validate data`
Check database integrity and fix corrupted sessions

## UI Improvements

### `add dark mode`
Toggle dark/light theme with localStorage persistence

### `add notifications`
Browser notifications for:
- Work session milestones (1h, 2h, 4h)
- Daily goals reached
- Break reminders

### `add charts`
Integrate chart library for:
- Daily hour trends
- Task distribution pie chart
- Weekly heatmap

## Database

### `migrate schema [version]`
Update database schema safely with migrations

### `seed data [count]`
Generate sample sessions for testing (past 30 days)

## Deployment

### `deploy`
Deploy to Vercel (configured in vercel.json)

### `build`
Production build and optimization

---

## Quick Commands

| Command | Purpose |
|---------|---------|
| `npm start` | Dev server |
| `npm run cli` | CLI timer |
| `add feature [name]` | New UI feature |
| `export sessions csv` | Download data |
| `show stats weekly` | View analytics |
| `backup database` | Safety backup |
