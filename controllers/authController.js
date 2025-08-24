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
    const user = await User.findOne({ where: { email }, include: [{ model: Role, as: 'role' }] });
    if (!user) return res.status(400).json({ message: "Invalid credentials" });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(400).json({ message: "Invalid credentials" });

    return res.json({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user.id)
    });
  } catch (error) {
    // return res.status(500).json({ message: error.message });
    return res.status(500).json({ message: error });
  }
};

// 🆕 Get all users
const getUsers = async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: { exclude: ['password'] },
      include: { model: Role, as: 'role' }
    });
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 🆕 Get single user by ID
const getUser = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id, {
      attributes: { exclude: ['password'] },
      include: { model: Role, as: 'role' }
    });
    if (!user) return res.status(404).json({ message: 'User not found' });

    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 🆕 Update user
const updateUser = async (req, res) => {
  try {
    const { name, email, roleId } = req.body;
    console.log('user to be updated',req.params.id);

    const userToBeUpdated = await User.findByPk(req.params.id);
    if (!userToBeUpdated) return res.status(404).json({ message: 'User not found' });


    // save req.body since it is not a complete user object
    userToBeUpdated.name = name || userToBeUpdated.name;
    userToBeUpdated.email = email || userToBeUpdated.email;
    userToBeUpdated.role_id = roleId || userToBeUpdated.role_id;

    await userToBeUpdated.save();
    const savedUser = await User.findByPk( userToBeUpdated.id ,{include: [{ model: Role, as: 'role' }] })

    res.status(200).json({ message: 'User updated successfully', user:savedUser });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 🆕 Update me
const updateMe = async (req, res) => {
  try {
    const { name, email, password, roleId } = req.body;
    console.log('req.user.id');

    const user = await User.findByPk(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.name = name || user.name;
    user.email = email || user.email;
    user.roleId = roleId || user.roleId;

    await user.save();

    const savedUser = await User.findOne({ where: { email }, include: [{ model: Role, as: 'role' }] })

    //fetch the role from the database
    // const role = await Role.findByPk(roleId);
    // console.log(role);
    // if (!role) return res.status(404).json({ message: 'Role not found' });
    // user.role = role;

    res.status(200).json({ message: 'Profile updated successfully', user:savedUser });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updatePassword = async (req, res) => {
  try {
    const { newPassword } = req.body;
    console.log(req.user.id);

    const user = await User.findByPk(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (newPassword) {
      // check if password is same as current password
      const isMatch = await bcrypt.compare(newPassword, user.password);
      if (isMatch) {
        return res.status(400).json({ message: 'New password cannot be the same as current password' });
      }
      // hash the new password
      user.password = await bcrypt.hash(newPassword, 10);
    }

    await user.save();

    const savedUser = await User.findByPk( req.user.id , {include: [{ model: Role, as: 'role' }]})

    //fetch the role from the database
    // const role = await Role.findByPk(roleId);
    // console.log(role);
    // if (!role) return res.status(404).json({ message: 'Role not found' });
    // user.role = role;

    res.status(200).json({ message: 'Password updated successfully', user:savedUser });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 🆕 Delete user
const deleteUser = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    await user.destroy();
    res.status(200).json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { registerUser, loginUser, getUsers, getUser, updateUser, updateMe, updatePassword, deleteUser };
