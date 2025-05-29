require("dotenv").config();
const express = require("express");
const cors = require("cors");
const multer = require("multer");
const { errorConverter, errorHandler } = require('./middlewares/error');
const mongoSanitize = require('express-mongo-sanitize');
const cookieParser = require('cookie-parser');
const upload = multer({ storage: multer.memoryStorage() });
const helmet = require("helmet");
const compression = require("compression");
const apiRouter = require('./src/routes/index')

const app = express();

// app.use(function (err, req, res, next) {
//     if (err) {
//         (res.log).error(err.stack);
//         if (req.xhr) {
//             res.send(500, { error: 'Something went wrong!' });
//         } else {
//             next(err);
//         }

//         return;
//     }
//     res.header("Access-Control-Allow-Origin", "*");
//     res.header("Access-Control-Allow-Methods", "POST, GET, OPTIONS, PUT, PATCH, DELETE");
//     res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
//     next();
// });

// Middleware
app.use((req, res, next) => {
    const originalSend = res.send;
    res.send = function (body) {
      console.log(`Response for ${req.method} ${req.originalUrl} [Status: ${res.statusCode}]:`, body);
      originalSend.call(this, body);
    };
    next();
  });

// sanitize request data
app.use(mongoSanitize());

// enable cors
const allowedOrigins = [
    'http://localhost:5173',
    'https://socialhype.netlify.app'
  ];
  
  app.use(cors({
      origin: function (origin, callback) {
          if (!origin || allowedOrigins.includes(origin)) {
              callback(null, true);
          } else {
              callback(new Error('Not allowed by CORS'));
          }
      },
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
      credentials: true
  }));
  
  app.options('*', cors({
      origin: function (origin, callback) {
          if (!origin || allowedOrigins.includes(origin)) {
              callback(null, true);
          } else {
              callback(new Error('Not allowed by CORS'));
          }
      },
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
      credentials: true
  }));

//media Uploads
// app.use(upload.any());

// parse json request body
app.use(express.json({ limit: '50mb' }));

// parse urlencoded request body
app.use(express.urlencoded({ limit: '50mb', extended: true }));

app.use(helmet());

// cookie parser
app.use(cookieParser());

app.use(compression());

// Routes
app.use("/api", apiRouter);

// convert error to CustomError, if needed
app.use(errorConverter);

// handle error
app.use(errorHandler);

app.get("/", (req, res) => {
    res.send("Welcome to SocialHype!");
});

module.exports = app;
