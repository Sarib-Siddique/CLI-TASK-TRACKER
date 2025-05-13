const fs = require("fs");
const path = require("path");
const { v4: uuidv4 } = require("uuid");
const filePath = path.join(__dirname, "tasks.json");

// Function to load tasks from JSON file
const loadTasks = () => {
  try {
    const data = fs.readFileSync(filePath, "utf-8");
    const tasks = JSON.parse(data);
    // Ensure serial numbers are assigned
    tasks.forEach((task, index) => {
      task.serialNumber = index + 1;
    });
    return tasks;
  } catch (error) {
    if (error.code === "ENOENT") {
      console.error("⚠️ tasks.json file not found. Creating a new one.");
      fs.writeFileSync(filePath, JSON.stringify([], null, 2));
      return [];
    } else {
      console.error("⚠️ Error loading tasks:", error.message);
      return [];
    }
  }
};

// Function to save tasks to JSON file
const saveTasks = (tasks) => {
  fs.writeFileSync(filePath, JSON.stringify(tasks, null, 2));
};

// Function to add a new task
const addTask = (description) => {
  const tasks = loadTasks();
  const newTask = {
    id: uuidv4(),
    description,
    status: "todo",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    serialNumber: tasks.length + 1, // Assign serial number
  };
  tasks.push(newTask);
  saveTasks(tasks);
  console.log(`✅ Task added: "${description}"`);
};

// Function to list all tasks
const listTasks = () => {
  const tasks = loadTasks();
  if (tasks.length === 0) {
    console.log("📌 No tasks found.");
  } else {
    console.log("\n📋 Your Tasks:");
    tasks.forEach((t, index) => {
      console.log(
        `${index + 1}. [${t.status.toUpperCase()}] ${t.description} (ID: ${
          t.id
        }, Created: ${t.createdAt})`
      );
    });
  }
};

// Function to mark a task as completed
const completeTask = (input) => {
  const tasks = loadTasks();
  const task = tasks.find(
    (t, index) => t.id === input || index + 1 === parseInt(input)
  );
  if (!task) {
    console.log("⚠️   Task not found.");
    return;
  }
  task.status = "done";
  task.updatedAt = new Date().toISOString();
  saveTasks(tasks);
  console.log(`✅ Task marked as completed: "${task.description}"`);
};

// Function to update a task's description
const updateTask = (taskId, newDescription) => {
  const tasks = loadTasks();
  const task = tasks.find((t) => t.id === taskId);
  if (!task) {
    console.log("⚠️  Task not found.");
    return;
  }
  task.description = newDescription;
  task.updatedAt = new Date().toISOString();
  saveTasks(tasks);
  console.log(`✅ Task updated: "${newDescription}"`);
};

// Function to delete a task
const deleteTask = (input) => {
  let tasks = loadTasks();
  const initialLength = tasks.length;
  tasks = tasks.filter(
    (t, index) => t.id !== input && index + 1 !== parseInt(input)
  );
  if (tasks.length === initialLength) {
    console.log("⚠️  Task not found.");
    return;
  }
  saveTasks(tasks);
  console.log(`✅ Task deleted.`);
};

// Function to mark a task as in-progress
const markInProgress = (input) => {
  const tasks = loadTasks();
  const task = tasks.find(
    (t, index) => t.id === input || index + 1 === parseInt(input)
  );
  if (!task) {
    console.log("⚠️ Task not found.");
    return;
  }
  task.status = "in-progress";
  task.updatedAt = new Date().toISOString();
  saveTasks(tasks);
  console.log(`✅ Task marked as in-progress: "${task.description}"`);
};

// Function to list tasks by status
const listTasksByStatus = (status) => {
  const tasks = loadTasks();
  const filteredTasks = tasks.filter((t) => t.status === status);
  if (filteredTasks.length === 0) {
    console.log(`📌 No tasks found with status: ${status}`);
  } else {
    console.log(`\n📋 Tasks with status: ${status}`);
    filteredTasks.forEach((t, index) => {
      console.log(
        `${index + 1}. [${t.status.toUpperCase()}] ${t.description} (ID: ${
          t.id
        }, Created: ${t.createdAt})`
      );
    });
  }
};

// Handle CLI commands
const command = process.argv[2];
const argument = process.argv.slice(3).join(" ");

switch (command) {
  case "add":
    addTask(argument);
    break;
  case "list":
    if (argument) {
      listTasksByStatus(argument);
    } else {
      listTasks();
    }
    break;
  case "done":
    completeTask(argument);
    break;
  case "update":
    const [updateId, ...newDescriptionParts] = process.argv.slice(3);
    updateTask(updateId, newDescriptionParts.join(" "));
    break;
  case "delete":
    deleteTask(argument);
    break;
  case "in-progress":
    markInProgress(argument);
    break;
  default:
    console.log(`⚡ Usage:
    task-cli add "Task Name"  ➝ Add a task
    task-cli list             ➝ List tasks
    task-cli list <status>    ➝ List tasks by status
    task-cli done <task_id>   ➝ Mark task as completed
    task-cli update <id> "New Description" ➝ Update a task
    task-cli delete <id>      ➝ Delete a task
    task-cli in-progress <id> ➝ Mark task as in-progress`);
}
