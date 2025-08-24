const Task = require("../models/Task");
const User = require("../models/User");
const Role = require("../models/Role");

// Create Task
const createTask = async (req, res) => {
  const { title, description, due_date, priority, assigned_to_id, role_nature_id } = req.body;

  try {
    const assignedUser = await User.findByPk(assigned_to_id);
    console.log("Assigned User:", assignedUser);
    if (!assignedUser) {
      return res.status(404).json({ message: "Assigned user not found" });
    }

    // Optional: Role-based assignment check here
    // Example: Developers get coding tasks, etc.

    const task = await Task.create({
      title,
      description,
      due_date,
      priority,
      assigned_to_id,
      created_by_id: req.user.id,
      percentage_completed: 0, // Default percentage
      role_nature_id
    });

    return res.status(201).json(task);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// Get single task
const getTask = async (req, res) => {
  try {
    const task = await Task.findOne({ _id: req.params.id, user: req.user.id });
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }
    res.json(task);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get All Tasks
const getTasks = async (req, res) => {
  try {
    const tasks = await Task.findAll({
    //   include: [
    //     { model: User, as: "assigned_to_id", attributes: ["id", "name"] },
    //     // { model: User, as: "created_by_id", attributes: ["id", "name"] }
    //   ]
    });
    return res.json(tasks);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// Get All Tasks
const getUserTasks = async (req, res) => {
  try {
    const tasks = await Task.findAll({
      where: { assigned_to_id: req.user.id }
    });
    return res.json(tasks);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};


// Update task
const updateTask = async (req, res) => {
  try {
    const task = await Task.findByPk(req.params.id);
    if (!task) return res.status(404).json({ message: 'Task not found' });

    // If assignment changes, validate role-based assignment
    if (req.body.assigned_to_id && req.body.assigned_to_id !== task.assigned_to_id) {
      const newAssigned = await User.findByPk(req.body.assigned_to_id, { include: { model: Role, as: 'role' } });
      if (!newAssigned) return res.status(404).json({ message: 'New assigned user not found' });

      // const assignedRole = newAssigned.Role && newAssigned.Role.name;
      // if (roleTaskMapping[assignedRole] && roleTaskMapping[assignedRole].length > 0) {
      //   const taskText = `${req.body.title || task.title} ${req.body.description || task.description}`.toLowerCase();
      //   if (!matchesAllowed) {
      //     return res.status(403).json({
      //       message: `Cannot assign this task to a ${assignedRole}. Allowed keywords: ${allowedKeywords.join(', ')}`
      //     });
      //   }
      // }
    }

    // update allowed fields
    const fields = ['title', 'description', 'due_date', 'priority', 'assigned_to_id', 'status', 'percentage_completed'];
    if (req.body.status == 'Todo'){
      req.body.percentage_completed = 0;
    }
    if (req.body.status == 'Done'){
      req.body.percentage_completed = 100;
    }
    const updates = {};
    fields.forEach(f => { if (req.body[f] !== undefined) updates[f] = req.body[f]; });

    await task.update(updates);

    // fetch fresh record with includes
    const updated = await Task.findByPk(task.id, {
      include: [
        { model: User, as: 'assigned_to', attributes: ['id', 'name', 'email'] },
        { model: User, as: 'created_by', attributes: ['id', 'name', 'email'] }
      ]
    });

    return res.json(updated);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: error.message });
  }
};

// Delete Task (Admins & Managers)
const deleteTask = async (req, res) => {
  try {
    const task = await Task.findByPk(req.params.id);
    if (!task) return res.status(404).json({ message: "Task not found" });

    await task.destroy();
    return res.json({ message: "Task deleted" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

module.exports = { createTask, getTask, getTasks, updateTask, deleteTask, getUserTasks };
