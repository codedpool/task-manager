require("dotenv").config();
const http = require("http");
const connectDB = require("./config/db");
const { initSocket } = require("./socket");
const app = require("./app");

const server = http.createServer(app);
const PORT = process.env.PORT || 5000;

// Initialize Socket.io
initSocket(server);

// Start server
const startServer = async () => {
  await connectDB();
  server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
};

startServer();

module.exports = app;
