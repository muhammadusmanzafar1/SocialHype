const app = require("./app");
const connectDB = require("./config/db");
global.ApiError = require('./utils/ApiError');
const http = require('http');
const { Server } = require('socket.io');
const setupLiveSocket = require('./src/socket/index');

const PORT = process.env.PORT || 5000;

// const server = http.createServer(app);

// setupLiveSocket(server); 

connectDB();
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
