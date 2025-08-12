require("dotenv").config();
const bcrypt = require("bcryptjs");
const sequelize = require("./config/db");
const Role = require("./models/Role");
const User = require("./models/User");

const seed = async () => {
  try {
    await sequelize.sync({ force: true }); // Drop & recreate tables

    console.log("📦 Seeding roles...");
    const roles = await Role.bulkCreate([
      { name: "Admin" },
      { name: "Manager" },
      { name: "Developer" },
      { name: "Designer" }
    ]);

    console.log("📦 Seeding users...");
    const hashedPassword = await bcrypt.hash("password123", 10);

    await User.bulkCreate([
      {
        name: "Alice Admin",
        email: "admin@example.com",
        password: hashedPassword,
        role_id: roles.find(r => r.name === "Admin").id
      },
      {
        name: "Mike Manager",
        email: "manager@example.com",
        password: hashedPassword,
        role_id: roles.find(r => r.name === "Manager").id
      },
      {
        name: "Dave Developer",
        email: "developer@example.com",
        password: hashedPassword,
        role_id: roles.find(r => r.name === "Developer").id
      },
      {
        name: "Diana Designer",
        email: "designer@example.com",
        password: hashedPassword,
        role_id: roles.find(r => r.name === "Designer").id
      }
    ]);

    console.log("✅ Seeding completed!");
    process.exit();
  } catch (error) {
    console.error("❌ Seeding failed:", error);
    process.exit(1);
  }
};

seed();
