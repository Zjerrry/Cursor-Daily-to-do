const STORAGE_KEY = "daily-todo-lists";
const NUMBER_KEY = "daily-todo-issue-number";

const FEATURES = {
  agent: { name: "Agent", hint: "multi-step coding agent" },
  tab: { name: "Tab", hint: "inline completions" },
  inline: { name: "Cmd+K", hint: "inline edit" },
  mcp: { name: "MCP", hint: "Model Context Protocol" },
  rules: { name: "Rules", hint: "persistent agent guidance" },
  cloud: { name: "Cloud Agents", hint: "remote agent runs" },
  bugbot: { name: "Bugbot", hint: "PR review agent" },
};

const fullDateEl = document.getElementById("full-date");
const prevDayBtn = document.getElementById("prev-day");
const nextDayBtn = document.getElementById("next-day");
const todayBtn = document.getElementById("today-btn");
const addForm = document.getElementById("add-form");
const taskInput = document.getElementById("task-input");
const featureSelect = document.getElementById("feature-select");
const taskListEl = document.getElementById("task-list");
const emptyStateEl = document.getElementById("empty-state");
const progressLabelEl = document.getElementById("progress-label");
const progressPercentEl = document.getElementById("progress-percent");
const progressBarEl = document.getElementById("progress-bar");
const progressTrackEl = document.querySelector(".progress-track");
const openCountEl = document.getElementById("open-count");
const closedCountEl = document.getElementById("closed-count");
const issueCountEl = document.getElementById("issue-count");
const filterOpenBtn = document.getElementById("filter-open");
const filterClosedBtn = document.getElementById("filter-closed");

const fullDateFmt = new Intl.DateTimeFormat(undefined, {
  weekday: "short",
  month: "short",
  day: "numeric",
  year: "numeric",
});

let selectedDate = startOfDay(new Date());
let statusFilter = "open";
let featureFilter = "all";

function startOfDay(date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function dateKey(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function loadStore() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
  } catch {
    return {};
  }
}

function saveStore(store) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
}

function nextIssueNumber() {
  const current = Number(localStorage.getItem(NUMBER_KEY) || "0") + 1;
  localStorage.setItem(NUMBER_KEY, String(current));
  return current;
}

function normalizeTask(task) {
  return {
    id: task.id,
    number: task.number,
    text: task.text,
    done: Boolean(task.done),
    feature: FEATURES[task.feature] ? task.feature : "agent",
  };
}

function getTasks() {
  const store = loadStore();
  return (store[dateKey(selectedDate)] || []).map(normalizeTask);
}

function setTasks(tasks) {
  const store = loadStore();
  const key = dateKey(selectedDate);
  if (tasks.length === 0) {
    delete store[key];
  } else {
    store[key] = tasks;
  }
  saveStore(store);
}

function shiftDay(days) {
  selectedDate = startOfDay(
    new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate() + days)
  );
  render();
}

function visibleTasks(tasks) {
  return tasks.filter((task) => {
    const statusOk = statusFilter === "open" ? !task.done : task.done;
    const featureOk = featureFilter === "all" || task.feature === featureFilter;
    return statusOk && featureOk;
  });
}

function syncFeatureFilterUI() {
  document.querySelectorAll(".tab").forEach((tab) => {
    const isIssues = tab.dataset.filter === "all";
    tab.classList.toggle("selected", isIssues ? featureFilter === "all" : tab.dataset.feature === featureFilter);
  });
  document.querySelectorAll(".feature-topics button").forEach((button) => {
    button.classList.toggle("selected", button.dataset.feature === featureFilter);
  });
}

function setFeatureFilter(feature) {
  featureFilter = feature === featureFilter ? "all" : feature;
  syncFeatureFilterUI();
  render();
}

function setStatusFilter(status) {
  statusFilter = status;
  filterOpenBtn.classList.toggle("selected", status === "open");
  filterClosedBtn.classList.toggle("selected", status === "closed");
  render();
}

function render() {
  fullDateEl.textContent = fullDateFmt.format(selectedDate);

  const tasks = getTasks();
  const openCount = tasks.filter((task) => !task.done).length;
  const closedCount = tasks.length - openCount;
  openCountEl.textContent = String(openCount);
  closedCountEl.textContent = String(closedCount);
  issueCountEl.textContent = String(tasks.length);

  const shown = visibleTasks(tasks);
  taskListEl.innerHTML = "";

  shown.forEach((task) => {
    const feature = FEATURES[task.feature];
    const item = document.createElement("li");
    item.className = `issue${task.done ? " done" : ""}`;
    item.dataset.id = task.id;

    const icon = document.createElement("span");
    icon.className = "issue-icon";
    icon.innerHTML = task.done
      ? `<svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true"><path fill="currentColor" d="M11.28 6.78a.75.75 0 00-1.06-1.06L7.25 8.69 5.78 7.22a.75.75 0 00-1.06 1.06l2 2a.75.75 0 001.06 0z"/><path fill="currentColor" d="M16 8A8 8 0 110 8a8 8 0 0116 0zm-1.5 0a6.5 6.5 0 10-13 0 6.5 6.5 0 0013 0z"/></svg>`
      : `<svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true"><path fill="currentColor" d="M8 9.5a1.5 1.5 0 100-3 1.5 1.5 0 000 3z"/><path fill="currentColor" d="M8 0a8 8 0 100 16A8 8 0 008 0zM1.5 8a6.5 6.5 0 1113 0 6.5 6.5 0 01-13 0z"/></svg>`;

    const body = document.createElement("div");
    const title = document.createElement("p");
    title.className = "issue-title";
    title.textContent = task.text;

    const label = document.createElement("span");
    label.className = `label label-${task.feature}`;
    label.textContent = feature.name;
    title.append(" ", label);

    const meta = document.createElement("p");
    meta.className = "issue-meta";
    meta.textContent = `#${task.number} · ${feature.hint} · ${dateKey(selectedDate)}`;

    body.append(title, meta);

    const actions = document.createElement("div");
    actions.className = "issue-actions";

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = task.done;
    checkbox.setAttribute("aria-label", `${task.done ? "Reopen" : "Close"} "${task.text}"`);

    const deleteBtn = document.createElement("button");
    deleteBtn.type = "button";
    deleteBtn.className = "delete-btn";
    deleteBtn.textContent = "Delete";
    deleteBtn.setAttribute("aria-label", `Delete "${task.text}"`);

    actions.append(checkbox, deleteBtn);
    item.append(icon, body, actions);
    taskListEl.append(item);
  });

  taskListEl.hidden = shown.length === 0;
  emptyStateEl.classList.toggle("visible", shown.length === 0);
  const emptyTitle = emptyStateEl.querySelector("h2");
  const emptyBody = emptyStateEl.querySelector("p");
  if (tasks.length === 0) {
    emptyTitle.textContent = "No issues for this day";
    emptyBody.textContent =
      "Open a Cursor issue above. Label it Agent, Tab, Cmd+K, MCP, Rules, Cloud Agents, or Bugbot.";
  } else if (featureFilter !== "all") {
    emptyTitle.textContent = `No ${statusFilter} ${FEATURES[featureFilter].name} issues`;
    emptyBody.textContent = "Switch Open/Closed or pick Issues to see the rest of the day.";
  } else if (statusFilter === "open") {
    emptyTitle.textContent = "No open issues";
    emptyBody.textContent = "All issues for this day are closed. Open Closed to review them.";
  } else {
    emptyTitle.textContent = "No closed issues";
    emptyBody.textContent = "Nothing closed yet. Check items in the Open list to close them.";
  }

  const percent = tasks.length === 0 ? 0 : Math.round((closedCount / tasks.length) * 100);
  progressLabelEl.textContent = `${closedCount} / ${tasks.length}`;
  progressPercentEl.textContent = `${percent}% of daily issues closed`;
  progressBarEl.style.transform = `scaleX(${percent / 100})`;
  progressTrackEl.setAttribute("aria-valuenow", String(percent));
}

addForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const text = taskInput.value.trim();
  if (!text) {
    return;
  }

  const feature = featureSelect.value;
  const tasks = getTasks();
  tasks.unshift({
    id: crypto.randomUUID(),
    number: nextIssueNumber(),
    text,
    done: false,
    feature,
  });
  setTasks(tasks);
  taskInput.value = "";

  if (featureFilter !== "all" && featureFilter !== feature) {
    featureFilter = "all";
    syncFeatureFilterUI();
  }
  setStatusFilter("open");
});

taskListEl.addEventListener("change", (event) => {
  const checkbox = event.target;
  if (!(checkbox instanceof HTMLInputElement) || checkbox.type !== "checkbox") {
    return;
  }

  const item = checkbox.closest(".issue");
  if (!item) {
    return;
  }

  setTasks(
    getTasks().map((task) => (task.id === item.dataset.id ? { ...task, done: checkbox.checked } : task))
  );
  render();
});

taskListEl.addEventListener("click", (event) => {
  const button = event.target.closest(".delete-btn");
  if (!button) {
    return;
  }

  const item = button.closest(".issue");
  if (!item) {
    return;
  }

  setTasks(getTasks().filter((task) => task.id !== item.dataset.id));
  render();
});

filterOpenBtn.addEventListener("click", () => setStatusFilter("open"));
filterClosedBtn.addEventListener("click", () => setStatusFilter("closed"));

document.querySelectorAll(".tab, .feature-topics button").forEach((el) => {
  el.addEventListener("click", () => {
    if (el.dataset.filter === "all") {
      featureFilter = "all";
      syncFeatureFilterUI();
      render();
      return;
    }
    setFeatureFilter(el.dataset.feature);
  });
});

prevDayBtn.addEventListener("click", () => shiftDay(-1));
nextDayBtn.addEventListener("click", () => shiftDay(1));
todayBtn.addEventListener("click", () => {
  selectedDate = startOfDay(new Date());
  render();
});

render();
