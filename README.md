# Ledger & Line — Expense & Budget Visualizer

A mobile-friendly expense tracker built with vanilla HTML, CSS, and JavaScript.
Add transactions, watch your total update live, and see spending broken down
by category in a pie chart. Everything is saved to your browser's Local
Storage — no backend, no build step.

## Features (MVP)

- **Input form** — item name, amount, category (Food / Transport / Fun), with
  validation that all fields are filled before a transaction is added.
- **Transaction list** — scrollable list showing name, amount, and category,
  with a delete button per row.
- **Total balance** — updates automatically whenever a transaction is added
  or removed.
- **Pie chart** (Chart.js) — spending distribution by category, redrawn
  automatically on every change.

## Optional challenges implemented (3 of 5)

1. **Sort transactions** — by newest first, amount (high→low / low→high), or
   category, via the dropdown above the list.
2. **Highlight spending over a set limit** — type a limit into the "Spending
   limit" field; the total balance stamp turns red and a warning appears once
   you go over it.
3. **Dark / light mode toggle** — top-right button, preference is remembered
   between visits.

## Folder structure

```
expense-visualizer/
├── index.html
├── css/
│   └── style.css      (only CSS file, per assignment rules)
├── js/
│   └── app.js          (only JS file, per assignment rules)
└── README.md
```

## Running it locally

No build tools needed. Just open `index.html` in a browser, or serve the
folder with any static server, e.g.:

```bash
npx serve .
```

## Before you push to GitHub

1. Rename/move this folder to match the required repo naming format:
   `CodingCamp-[batch date ddmmyy]-[participantname]`
   e.g. `CodingCamp-17August26-yamaroni`
2. Make sure your project's `.kiro` folder (created automatically while you
   work in Kiro) is included in the repo before you push.
3. Initialize the repo with GitHub Desktop, commit, and push.

## Deploying with GitHub Pages

1. Push the repo to GitHub.
2. In the repo, go to **Settings → Pages**.
3. Under "Build and deployment", set **Source** to `Deploy from a branch`,
   choose the `main` branch and `/ (root)` folder, then save.
4. GitHub will give you a published URL (e.g.
   `https://yourusername.github.io/your-repo-name/`) — that's the link to
   submit on the Paperform.

## Submission checklist

- [ ] GitHub repo URL
- [ ] Published GitHub Pages URL
- [ ] AWS Builder ID (from signing up for Kiro)
- [ ] `.kiro` folder present in the repo
- [ ] All three links/items submitted together on Paperform (partial
      submissions are not valid)
