const express = require("express");
const { createTask, getTasks, updateTask, deleteTask, getTask, getUserTasks } = require("../controllers/taskController");
const { protect, checkRole } = require("../middleware/authMiddleware");
const router = express.Router();

router.post("/", protect, createTask);
router.get("/", protect, getTasks);
router.get("/my", protect, getUserTasks);
router.get("/:id", protect, getTask);
router.put("/:id", protect, updateTask);
router.delete("/:id", protect, checkRole(["Admin", "Manager"]), deleteTask);

module.exports = router;
