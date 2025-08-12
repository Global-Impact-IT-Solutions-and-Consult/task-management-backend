const express = require("express");
const { createTask, getTasks, updateTask, deleteTask, getTask } = require("../controllers/taskController");
const { protect, checkRole } = require("../middleware/authMiddleware");
const router = express.Router();

router.post("/", protect, createTask);
router.get("/", protect, getTasks);
router.get("/:id", protect, getTask);
router.put("/:id", protect, checkRole(["Admin", "Manager"]), updateTask);
router.delete("/:id", protect, checkRole(["Admin", "Manager"]), deleteTask);

module.exports = router;
