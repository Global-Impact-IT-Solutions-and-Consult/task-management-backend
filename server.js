const express = require('express');
const cors = require('cors');
require('dotenv').config();

const sequelize = require('./config/db');
sequelize.sync({ force: false }).then(() => {
  console.log('Database synced');
});
const app = express();

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.send('Task Manager API running...');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/tasks", require("./routes/taskRoutes"));
