
const taskForm = document.getElementById("taskForm");
const taskList = document.getElementById("taskList");

let tasks = JSON.parse(localStorage.getItem("studyPlannerTasks")) || [];
let currentFilter = "all";
let sortByPriority = false;
let editingTaskId = null;

const priorityOrder = { High: 1, Medium: 2, Low: 3 };

const today = new Date();
today.setMinutes(today.getMinutes() - today.getTimezoneOffset());

document.getElementById("todayDate").textContent =
    new Date().toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric"
    });

document.getElementById("taskDate").value =
    today.toISOString().slice(0, 10);

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

        const actions = document.createElement("div");
        actions.style.display = "flex";
        actions.style.gap = "6px";

        const editButton = document.createElement("button");
        editButton.className = "secondary-btn";
        editButton.type = "button";
        editButton.textContent = "✏️";
        editButton.title = "Edit task";

        editButton.addEventListener("click", () => {
            document.getElementById("taskTitle").value = task.title;
            document.getElementById("taskSubject").value = task.subject || "";
            document.getElementById("taskDate").value = task.date;
            document.getElementById("taskPriority").value = task.priority;

            editingTaskId = task.id;

            const submitButton = taskForm.querySelector(
                'button[type="submit"]'
            );
            submitButton.textContent = "Save Changes";

            document.getElementById("taskTitle").focus();
            document.getElementById("taskTitle").scrollIntoView({
                behavior: "smooth",
                block: "center"
            });
        });

        const deleteButton = document.createElement("button");
        deleteButton.className = "delete-btn";
        deleteButton.type = "button";
        deleteButton.textContent = "✕";
        deleteButton.title = "Delete task";

        deleteButton.addEventListener("click", () => {
            tasks = tasks.filter(item => item.id !== task.id);

            if (editingTaskId === task.id) {
                resetForm();
            }

            saveTasks();
            renderTasks();
        });

        actions.append(editButton, deleteButton);
        card.append(checkbox, content, actions);
        taskList.appendChild(card);
    });

    updateStats();
}

function resetForm() {
    taskForm.reset();
    editingTaskId = null;

    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());

    document.getElementById("taskDate").value =
        now.toISOString().slice(0, 10);

    document.getElementById("taskPriority").value = "Medium";

    taskForm.querySelector('button[type="submit"]').textContent =
        "+ Add Task";
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

    const selectedDate = new Date(date + "T00:00:00");
    const currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);

    if (selectedDate < currentDate) {
        alert("Deadline cannot be in the past. Please select today or a future date.");
        return;
    }

    if (editingTaskId !== null) {
        const task = tasks.find(item => item.id === editingTaskId);

        if (task) {
            task.title = title;
            task.subject = subject;
            task.date = date;
            task.priority = priority;
        }
    } else {
        tasks.push({
            id: Date.now() + Math.random(),
            title,
            subject,
            date,
            priority,
            completed: false
        });
    }

    saveTasks();
    resetForm();

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
