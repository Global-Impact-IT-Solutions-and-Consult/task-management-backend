require("dotenv").config();
const bcrypt = require("bcryptjs");
const sequelize = require("./config/db");
const Role = require("./models/Role");
const User = require("./models/User");

const seed = async () => {
  try {
    // Test database connection first
    console.log("🔌 Testing database connection...");
    await sequelize.authenticate();
    console.log("✅ Database connection successful!");

    console.log("🔄 Syncing database schema...");
    await sequelize.sync({ force: true }); // Drop & recreate tables

    console.log("📦 Seeding roles...");
    const roles = await Role.bulkCreate([
      { name: "Admin" },
      { name: "Manager" },
      { name: "Developer" },
      { name: "Designer" },
    ]);

    console.log("📦 Seeding users...");
    const hashedPassword = await bcrypt.hash("password123", 10);

    await User.bulkCreate([
      {
        name: "Alice Admin",
        email: "admin@example.com",
        password: hashedPassword,
        role_id: roles.find((r) => r.name === "Admin").id,
      },
      {
        name: "Mike Manager",
        email: "manager@example.com",
        password: hashedPassword,
        role_id: roles.find((r) => r.name === "Manager").id,
      },
      {
        name: "Dave Developer",
        email: "developer@example.com",
        password: hashedPassword,
        role_id: roles.find((r) => r.name === "Developer").id,
      },
      {
        name: "Diana Designer",
        email: "designer@example.com",
        password: hashedPassword,
        role_id: roles.find((r) => r.name === "Designer").id,
      },
    ]);

    console.log("✅ Seeding completed!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Seeding failed:", error.message);

    if (
      error.message.includes("ETIMEDOUT") ||
      error.message.includes("ECONNREFUSED")
    ) {
      console.log("\n🔧 Troubleshooting steps:");
      console.log("1. Make sure your database server is running");
      console.log("2. Check your database connection settings");
      console.log("3. If using Docker: run 'docker-compose up -d'");
      console.log(
        "4. If using local PostgreSQL: ensure it's running on port 5432"
      );
      console.log("5. Create a .env file with your database credentials");
    }

    process.exit(1);
  }
};

seed();
