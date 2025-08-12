const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Role = require("../models/Role");

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "7d" });
};

// Register
const registerUser = async (req, res) => {
  const { name, email, password, role_id } = req.body;

  try {
    const userExists = await User.findOne({ where: { email } });
    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role_id
    });

    return res.status(201).json({
      id: user.id,
      name: user.name,
      email: user.email,
      role_id: user.role_id,
      token: generateToken(user.id)
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// Login
const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ where: { email }, include: Role });
    if (!user) return res.status(400).json({ message: "Invalid credentials" });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(400).json({ message: "Invalid credentials" });

    return res.json({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.Role.name,
      token: generateToken(user.id)
    });
  } catch (error) {
    // return res.status(500).json({ message: error.message });
    return res.status(500).json({ message: "Something went wrong" });
  }
};

module.exports = { registerUser, loginUser };
