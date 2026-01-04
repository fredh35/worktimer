# Work Timer

A web-based timer application for logging working time, with SQLite database storage.

## Features

- Start, pause, and stop timer with task names
- Sessions saved to SQLite database
- Statistics: today, this week, all time totals
- Delete sessions from log
- Responsive design inspired by SEPAQ brand guidelines

## Installation

```bash
npm install
```

## Usage

Start the web server:

```bash
npm start
```

Then open http://localhost:3000

### CLI Version

A command-line version is also available:

```bash
npm run cli
```

## Tech Stack

- **Backend**: Node.js, Express
- **Database**: SQLite (better-sqlite3)
- **Frontend**: Vanilla HTML, CSS, JavaScript

## License

MIT
