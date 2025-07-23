import iziToast from "izitoast";
import "izitoast/dist/css/iziToast.min.css";

const taskInput = document.getElementById("taskInput");
const prioritySelect = document.getElementById("prioritySelect");
const categorySelect = document.getElementById("categorySelect");
const addTaskBtn = document.getElementById("addTaskBtn");
const taskList = document.getElementById("taskList");
const filterButtons = document.querySelectorAll(".filter-btn");
const categoryFilterButtons = document.querySelectorAll(".category-filter-btn");
const darkModeToggle = document.getElementById("darkModeToggle");

let tasks = JSON.parse(localStorage.getItem("tasks")) || [];
let currentFilter = "all";
let currentCategoryFilter = "all";

function formatDate(date) {
  const d = new Date(date);
  if (isNaN(d)) return "Invalid Date";
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  const hours = String(d.getHours()).padStart(2, "0");
  const minutes = String(d.getMinutes()).padStart(2, "0");
  return `${year}-${month}-${day} ${hours}:${minutes}`;
}

function renderTasks() {
  taskList.innerHTML = "";

  let filteredTasks = tasks;

  // Durum filtreleme
  if (currentFilter === "active") {
    filteredTasks = filteredTasks.filter((task) => !task.completed);
  } else if (currentFilter === "completed") {
    filteredTasks = filteredTasks.filter((task) => task.completed);
  }

  // Kategori filtreleme
  if (currentCategoryFilter !== "all") {
    filteredTasks = filteredTasks.filter(
      (task) => task.category === currentCategoryFilter
    );
  }

  filteredTasks.forEach((task, index) => {
    const li = document.createElement("li");

    li.classList.add(`priority-${task.priority}`);

    if (task.isEditing) {
      const input = document.createElement("input");
      input.type = "text";
      input.value = task.text;
      input.classList.add("edit-input");

      input.addEventListener("keypress", (e) => {
        if (e.key === "Enter") {
          finishEdit(index, input.value);
        }
      });

      input.addEventListener("blur", () => {
        finishEdit(index, input.value);
      });

      li.appendChild(input);
      input.focus();
    } else {
      const taskTextDiv = document.createElement("div");
      taskTextDiv.style.display = "flex";
      taskTextDiv.style.alignItems = "center";
      taskTextDiv.style.flex = "1";

      const textSpan = document.createElement("span");
      textSpan.textContent = task.text;
      if (task.completed) textSpan.classList.add("completed");

      const dateSpan = document.createElement("span");
      dateSpan.textContent = task.createdAt
        ? formatDate(task.createdAt)
        : "No date";
      dateSpan.classList.add("task-date");

      taskTextDiv.appendChild(textSpan);
      taskTextDiv.appendChild(dateSpan);

      li.appendChild(taskTextDiv);

      li.addEventListener("click", () => toggleTask(index));

      const editBtn = document.createElement("button");
      editBtn.textContent = "Edit";
      editBtn.classList.add("edit-btn");
      editBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        startEdit(index);
      });

      const deleteBtn = document.createElement("button");
      deleteBtn.textContent = "Delete";
      deleteBtn.classList.add("delete-btn");
      deleteBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        deleteTask(index);
      });

      li.appendChild(editBtn);
      li.appendChild(deleteBtn);
    }

    taskList.appendChild(li);
  });
}

function addTask() {
  const text = taskInput.value.trim();
  const priority = prioritySelect.value;
  const category = categorySelect.value;

  if (text === "") {
    iziToast.warning({
      title: "Warning",
      message: "Task cannot be empty!",
      position: "topRight",
    });
    return;
  }

  tasks.push({
    text,
    completed: false,
    isEditing: false,
    priority,
    category,
    createdAt: new Date().toISOString(),
  });
  taskInput.value = "";
  prioritySelect.value = "low";
  categorySelect.value = "work";
  saveTasks();
  renderTasks();

  iziToast.success({
    title: "Success",
    message: "Task added successfully!",
    position: "topRight",
  });
}

function toggleTask(index) {
  tasks[index].completed = !tasks[index].completed;
  saveTasks();
  renderTasks();

  iziToast.show({
    title: "Updated",
    message: tasks[index].completed
      ? "Task marked as completed."
      : "Task marked as active.",
    position: "topRight",
    color: tasks[index].completed ? "green" : "blue",
  });
}

function deleteTask(index) {
  tasks.splice(index, 1);
  saveTasks();
  renderTasks();

  iziToast.info({
    title: "Deleted",
    message: "Task deleted.",
    position: "topRight",
  });
}

function saveTasks() {
  localStorage.setItem("tasks", JSON.stringify(tasks));
}

function startEdit(index) {
  tasks[index].isEditing = true;
  renderTasks();
}

function finishEdit(index, newText) {
  newText = newText.trim();
  if (newText === "") {
    iziToast.warning({
      title: "Warning",
      message: "Task cannot be empty!",
      position: "topRight",
    });
    return;
  }
  tasks[index].text = newText;
  tasks[index].isEditing = false;
  saveTasks();
  renderTasks();

  iziToast.success({
    title: "Success",
    message: "Task updated!",
    position: "topRight",
  });
}

// Durum filtre butonları
filterButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    filterButtons.forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    currentFilter = btn.dataset.filter;
    renderTasks();
  });
});

// Kategori filtre butonları
categoryFilterButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    categoryFilterButtons.forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    currentCategoryFilter = btn.dataset.category;
    renderTasks();
  });
});

addTaskBtn.addEventListener("click", addTask);

taskInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") addTask();
});

if (localStorage.getItem("darkMode") === "enabled") {
  document.body.classList.add("dark-mode");
}

darkModeToggle.addEventListener("click", () => {
  document.body.classList.toggle("dark-mode");

  if (document.body.classList.contains("dark-mode")) {
    localStorage.setItem("darkMode", "enabled");
  } else {
    localStorage.setItem("darkMode", "disabled");
  }
});

renderTasks();
