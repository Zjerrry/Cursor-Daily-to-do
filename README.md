# cursor/daily-todo

A GitHub-style daily issue log for tracking Cursor work. Each day gets its own
issue list; every issue carries a Cursor feature label (Agent, Tab, Cmd+K, MCP,
Rules, Cloud Agents, Bugbot), a global auto-incremented issue number, and an
Open/Closed state — all rendered like the Issues page of a GitHub repository.

## Features

- **GitHub-inspired UI** — repo header with Public badge, repository tabs, issue
  rows with colored labels, Open/Closed state tabs, and a sidebar with About,
  topic filters, and a progress check.
- **Daily logs** — browse to the previous/next day or jump back to **Today**;
  each day keeps its own independent list.
- **Open / Closed workflow** — check an issue to close it (closed issues turn
  purple, like GitHub); reopen it from the Closed tab, or delete it permanently.
- **Feature labels & filters** — filter the list by Agent, Tab, Cmd+K, MCP,
  Rules, Cloud Agents, or Bugbot from the repo tabs or the sidebar topics;
  click again (or the Issues tab) to clear the filter.
- **Auto issue numbers** — every new issue gets a global incrementing `#number`
  that never repeats across days.
- **Progress sidebar** — live closed/total count and percentage bar for the
  selected day.
- **Local persistence** — everything is stored in `localStorage`; no server and
  no build step required.
- **Responsive layout** — the sidebar stacks under the list on narrow screens.

## Getting started

No dependencies or build step required.

- Open `index.html` directly in a modern browser, or
- serve the folder statically, e.g. `npx serve .` or `python -m http.server`.

## Usage

1. Type a title, pick a Cursor feature from the dropdown, and press
   **New issue**.
2. Check the box on a row to close the issue; uncheck it in the **Closed** tab
   to reopen it.
3. Click **Delete** on a row to remove an issue permanently.
4. Use **Previous / Next / Today** to switch days. Issues are stored per day.
5. Click a feature tab (or a sidebar topic) to filter the list; click it again,
   or click **Issues**, to clear the filter.

## Data storage

All data lives in `localStorage` under two keys:

| Key | Contents |
| --- | --- |
| `daily-todo-lists` | Object mapping `YYYY-MM-DD` to that day's array of issues, each `{ id, number, text, done, feature }`. Days with no issues are removed. |
| `daily-todo-issue-number` | The last issued global issue number. |

Clearing the browser's site data resets the board completely.

## File structure

| File | Role |
| --- | --- |
| `index.html` | Page markup: top bar, repo header, feature tabs, toolbar, new-issue form, issue list, sidebar. |
| `styles.css` | GitHub Primer-inspired styling: color tokens, labels, pill badges, joined issue-box layout, responsive rules. |
| `app.js` | State and rendering: day navigation, open/closed and feature filters, add/close/delete, progress meter, `localStorage` persistence. |

## Browser support

Uses `crypto.randomUUID()` and `Intl.DateTimeFormat`; any modern browser
(Chrome, Edge, Firefox, Safari) works.
