// cli
// To add a task: node index.js add --description="Water plants"
// To remove a task by ID: node index.js remove --id=1
// To list tasks: node index.js list
// To clear tasks: node index.js clear

const fs = require("fs");
const yargs = require("yargs");

// Function to load tasks from tasks.json
function loadTasks() {
  try {
    const data = fs.readFileSync("tasks.json", "utf8"); // Read file synchronously
    return JSON.parse(data); // Parse the JSON data into a JavaScript array
  } catch (error) {
    if (error.code === "ENOENT") {
      // If the file doesn't exist, return an empty array
      console.log("No tasks found, starting fresh.");
      return [];
    } else {
      // If there's another error (like invalid JSON), throw an error
      console.error("Error reading tasks.json:", error);
      return [];
    }
  }
}

// Function to save tasks to tasks.json
function saveTasks(tasks) {
  try {
    const data = JSON.stringify(tasks, null, 2); // Convert the task array to a JSON string
    fs.writeFileSync("tasks.json", data); // Write the JSON string to tasks.json (overwrites the file)
    console.log("Tasks saved successfully.");
  } catch (error) {
    console.error("Error saving tasks:", error);
  }
}

// Add a task
function addTask(description) {
  const tasks = loadTasks(); // Load the existing tasks

  // Prevent adding tasks with only whitespace
  if (!description.trim()) {
    console.log("Task description cannot be empty or just whitespace.");
    return;
  }

  // Check for duplicate descriptions
  const duplicateTask = tasks.find(
    (task) => task.description === description.trim()
  );
  if (duplicateTask) {
    console.log("Task with this description already exists.");
    return;
  }

  // Generate a new unique ID (can be the last ID + 1)
  const newId = tasks.length > 0 ? tasks[tasks.length - 1].id + 1 : 1;

  // Create the new task
  const newTask = {
    id: newId,
    description: description,
    completed: false,
  };

  // Add the new task to the array
  tasks.push(newTask);

  // Save the updated tasks array back to the file
  saveTasks(tasks);

  console.log(`Task added: "${description}"`);
}

// Remove a task
function removeTask(id) {
  const tasks = loadTasks(); // Load existing tasks

  // Filter out the task with the given ID
  const updatedTasks = tasks.filter((task) => task.id !== id);

  // Validate that the id is a positive number
  if (id <= 0) {
    console.log("Please provide a valid positive task ID.");
    return;
  }

  if (tasks.length === updatedTasks.length) {
    console.log(`Task with ID ${id} not found.`);
  } else {
    const reindexedTasks = updatedTasks.map((task, index) => ({
      ...task,
      id: index + 1,
    }));

    saveTasks(reindexedTasks); // Save the updated task list
    console.log(`Task with ID ${id} removed.`);
  }
}

// List all tasks
function listTasks() {
  const tasks = loadTasks(); // Load the tasks

  if (tasks.length === 0) {
    console.log("No tasks to show.");
  } else {
    console.log("Your tasks:");
    tasks.forEach((task) => {
      const status = task.completed ? "[✓]" : "[x]"; // Display checkmark for completed tasks
      console.log(`${task.id}. ${status} ${task.description}`);
    });
  }
}

function completeTask(id) {
  const tasks = loadTasks(); // Load existing tasks

  // Validate that the id is a positive number
  if (id <= 0) {
    console.log("Please provide a valid positive task ID.");
    return;
  }

  // Find the task by ID
  const task = tasks.find((task) => task.id === id);

  if (!task) {
    console.log(`Task with ID ${id} not found.`);
    return;
  }

  // Mark the task as completed
  task.completed = true;

  // Save the updated task list
  saveTasks(tasks);

  console.log(`Task with ID ${id} marked as completed.`);
}

function clearTasks() {
  try {
    fs.writeFileSync("tasks.json", JSON.stringify([], null, 2)); // Overwrite with an empty array
    console.log("All tasks have been cleared.");
  } catch (error) {
    console.error("Error clearing tasks:", error);
  }
}

// Yargs command setup for add, remove, and list
yargs
  .command({
    command: "add",
    describe: "Add a new task",
    builder: {
      description: {
        describe: "Task description",
        demandOption: true,
        type: "string",
      },
    },
    handler(argv) {
      addTask(argv.description);
    },
  })
  .command({
    command: "remove",
    describe: "Remove a task by id",
    builder: {
      id: {
        describe: "Task id",
        demandOption: true,
        type: "number",
      },
    },
    handler(argv) {
      removeTask(argv.id);
    },
  })
  .command({
    command: "list",
    describe: "List all tasks",
    handler() {
      listTasks();
    },
  })
  .command({
    command: "clear",
    describe: "Clear all tasks",
    handler() {
      clearTasks();
    },
  })
  .command({
    command: "complete",
    describe: "Mark a task as completed",
    builder: {
      id: {
        describe: "Task id",
        demandOption: true,
        type: "number",
      },
    },
    handler(argv) {
      completeTask(argv.id);
    },
  })
  .demandCommand(1, "You need to specify at least one command") // Ensure at least one command is provided
  .help() // Show help information for available commands
  .parse();
