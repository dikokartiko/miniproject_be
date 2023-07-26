const express = require("express");
const cors = require("cors");
const sequelize = require("./config/database");
const userRoutes = require("./routes/userRoutes");
const blogRoutes = require("./routes/blogRoutes");

const app = express();
app.use(express.json());
app.use(cors());

// Sync models with database
sequelize.sync({ alter: true });

// Set up routes
app.use("/api/users", userRoutes);
app.use(blogRoutes);

// Start server
app.listen(3000, () => {
  console.log("Server started on port 3000");
});
