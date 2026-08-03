# Donation Management System

React + Vite + Axios + Tailwind + JSON Server donation/expense/loan management app.

## Requirements
- Node.js 18+ installed (download from https://nodejs.org)

## How to Run

1. Unzip this folder, open a terminal inside it (`donation-system/`)
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start both the app and the JSON server together:
   ```bash
   npm start
   ```
4. Open your browser at: **http://localhost:3000**

The JSON "database" (`db.json`) will be served at `http://localhost:5000` and all
donations/expenses/loans/repayments you add will be saved permanently into that file.

## Alternative: run servers separately (two terminals)

```bash
# Terminal 1
npm run server

# Terminal 2
npm run dev
```

## Notes
- Currency used: PKR
- To back up your data, use Settings → Export Backup (JSON)
- To reset all data, stop the server and replace the contents of `db.json` with:
  ```json
  { "donations": [], "expenses": [], "loans": [], "repayments": [] }
  ```
