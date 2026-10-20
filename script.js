
const taskForm = document.getElementById("taskForm");
const taskList = document.getElementById("taskList");

let tasks = JSON.parse(localStorage.getItem("studyPlannerTasks")) || [];
let currentFilter = "all";
let sortByPriority = false;

const priorityOrder = {
    High: 1,
    Medium: 2,
    Low: 3
};

document.getElementById("todayDate").textContent =
    new Date().toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric"
    });

document.getElementById("taskDate").value =
    new Date().toLocaleDateString("en-CA");

function saveTasks() {
    localStorage.setItem("studyPlannerTasks", JSON.stringify(tasks));
}

function updateStats() {
    const completed = tasks.filter(task => task.completed).length;
    const pending = tasks.length - completed;
    const progress = tasks.length
        ? Math.round((completed / tasks.length) * 100)
        : 0;

    document.getElementById("totalTasks").textContent = tasks.length;
    document.getElementById("completedTasks").textContent = completed;
    document.getElementById("pendingTasks").textContent = pending;
    document.getElementById("progressText").textContent = progress + "%";
    document.getElementById("progressBar").style.width = progress + "%";
}

function renderTasks() {
    taskList.replaceChildren();

    let visibleTasks = tasks.filter(task => {
        if (currentFilter === "pending") return !task.completed;
        if (currentFilter === "completed") return task.completed;
        return true;
    });

    if (sortByPriority) {
        visibleTasks.sort((a, b) =>
            priorityOrder[a.priority] - priorityOrder[b.priority]
        );
    }

    if (visibleTasks.length === 0) {
        const empty = document.createElement("div");
        empty.className = "empty-state";
        empty.textContent = tasks.length === 0
            ? "📖 No tasks yet. Add your first study task!"
            : "No tasks found in this filter.";
        taskList.appendChild(empty);
    }

    visibleTasks.forEach(task => {
        const card = document.createElement("div");
        card.className = "task-card" + (task.completed ? " done" : "");

        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.className = "task-check";
        checkbox.checked = task.completed;
        checkbox.setAttribute("aria-label", "Mark task complete");
        checkbox.addEventListener("change", () => {
            task.completed = checkbox.checked;
            saveTasks();
            renderTasks();
        });

        const content = document.createElement("div");
        content.className = "task-content";

        const title = document.createElement("div");
        title.className = "task-title";
        title.textContent = task.title;

        const meta = document.createElement("div");
        meta.className = "task-meta";

        const subject = document.createElement("span");
        subject.textContent = "📚 " + (task.subject || "General");

        const deadline = document.createElement("span");
        deadline.textContent = "📅 " + task.date;

        const priority = document.createElement("span");
        priority.className = "priority " + task.priority;
        priority.textContent = task.priority + " Priority";

        meta.append(subject, deadline, priority);
        content.append(title, meta);

        const deleteButton = document.createElement("button");
        deleteButton.className = "delete-btn";
        deleteButton.textContent = "✕";
        deleteButton.setAttribute("aria-label", "Delete task");
        deleteButton.addEventListener("click", () => {
            tasks = tasks.filter(item => item.id !== task.id);
            saveTasks();
            renderTasks();
        });

        card.append(checkbox, content, deleteButton);
        taskList.appendChild(card);
    });

    updateStats();
}

taskForm.addEventListener("submit", event => {
    event.preventDefault();

    const title = document.getElementById("taskTitle").value.trim();
    const subject = document.getElementById("taskSubject").value.trim();
    const date = document.getElementById("taskDate").value;
    const priority = document.getElementById("taskPriority").value;

    if (!title || !date) {
        alert("Please enter a task name and deadline.");
        return;
    }

    tasks.push({
        id: Date.now() + Math.random(),
        title,
        subject,
        date,
        priority,
        completed: false
    });

    saveTasks();
    taskForm.reset();

    document.getElementById("taskDate").value =
        new Date().toLocaleDateString("en-CA");

    document.getElementById("taskPriority").value = "Medium";

    currentFilter = "all";
    document.querySelectorAll(".filter-btn").forEach(button => {
        button.classList.toggle("active", button.dataset.filter === "all");
    });

    renderTasks();
});

document.querySelectorAll(".filter-btn").forEach(button => {
    button.addEventListener("click", () => {
        currentFilter = button.dataset.filter;

        document.querySelectorAll(".filter-btn").forEach(item => {
            item.classList.toggle("active", item === button);
        });

        renderTasks();
    });
});

document.getElementById("sortBtn").addEventListener("click", () => {
    sortByPriority = !sortByPriority;
    document.getElementById("sortBtn").textContent = sortByPriority
        ? "Priority: High to Low ✓"
        : "Sort by Priority ↕";

    renderTasks();
});

renderTasks();
