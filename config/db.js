const { Sequelize } = require("sequelize");

// Database configuration with fallback values
const dbConfig = {
  database: process.env.DB_NAME,
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  dialect: process.env.DB_DIALECT,
  logging: process.env.NODE_ENV === "development" ? console.log : false,
  dialectOptions: {
    ssl:
      process.env.POSTGRES_CERT === "true"
        ? {
            require: true,
            rejectUnauthorized: false,
          }
        : false,
  },
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000,
  },
  retry: {
    match: [
      /ETIMEDOUT/,
      /EHOSTUNREACH/,
      /ECONNRESET/,
      /ECONNREFUSED/,
      /ETIMEDOUT/,
      /ESOCKETTIMEDOUT/,
      /EHOSTUNREACH/,
      /EPIPE/,
      /EAI_AGAIN/,
      /SequelizeConnectionError/,
      /SequelizeConnectionRefusedError/,
      /SequelizeHostNotFoundError/,
      /SequelizeHostNotReachableError/,
      /SequelizeInvalidConnectionError/,
      /SequelizeConnectionTimedOutError/,
    ],
    max: 3,
  },
};

const sequelize = new Sequelize(dbConfig);

// Enhanced connection with retry logic
const connectWithRetry = async () => {
  try {
    await sequelize.authenticate();
    console.log("✅ Database connected successfully!");
    return true;
  } catch (error) {
    console.error("❌ Database connection failed:", error.message);

    if (
      error.message.includes("ETIMEDOUT") ||
      error.message.includes("ECONNREFUSED")
    ) {
      console.log(" Connection timeout/refused. Please check:");
      console.log("   1. Is your database server running?");
      console.log("   2. Are the connection details correct?");
      console.log("   3. Is the database accessible from this network?");
      console.log("   4. Try running: docker-compose up -d (if using Docker)");
    }

    return false;
  }
};

// Test connection on startup
connectWithRetry();

module.exports = sequelize;
