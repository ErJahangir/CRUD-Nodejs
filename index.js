require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const session = require("express-session");
const userRoutes = require("./routes/routes");
const app = express();
const PORT = process.env.PORT || 8000;

// Database connection
mongoose
  .connect(process.env.MONGODB_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 30000, // 30 seconds timeout
  })
  .then(() => {
    console.log("Mongodb connected");
  })
  .catch((err) => {
    console.error("Database connection error: ", err);
  });

// Mongoose event logging
mongoose.connection.on("connected", () => {
  console.log("Mongoose connected to DB");
});

mongoose.connection.on("error", (err) => {
  console.log("Mongoose connection error:", err);
});

mongoose.connection.on("disconnected", () => {
  console.log("Mongoose disconnected from DB");
});

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use("/uploads", express.static("uploads"));

app.use(
  session({
    secret: "my secret key",
    saveUninitialized: true,
    resave: false,
  })
);

app.use((req, res, next) => {
  res.locals.message = req.session.message;
  delete req.session.message;
  next();
});

// Set template engine
app.set("view engine", "ejs");

// Routes
app.use("", userRoutes);

// Start server
app.listen(PORT, () => {
  console.log(`Server started at PORT ${PORT}`);
});

// require("dotenv").config();
// const express = require("express");
// const mongoose = require("mongoose");
// const session = require("express-session");
// const app = express();
// const PORT = process.env.PORT || 8000;
// const userRoutes = require("./routes/routes");
// // Database connection
// mongoose
//   .connect(process.env.MONGODB_URL)
//   .then((e) => {
//     console.log("Mongodb connected");
//   })
//   .catch((err) => {
//     console.log(err);
//   });

// //   middleware
// app.use(express.urlencoded({ extended: true }));
// app.use(express.json());
// app.use("/uploads", express.static("uploads"));

// app.use(
//   session({
//     secret: "my secret key",
//     saveUninitialized: true,
//     resave: false,
//   })
// );
// app.use((req, res, next) => {
//   res.locals.message = req.session.message;
//   delete req.session.message;
//   next();
// });

// // set tamplate engines
// app.set("view engine", "ejs");

// // routes
// app.use("", userRoutes);

// app.listen(PORT, () => {
//   console.log(`server started at PORT ${PORT}`);
// });
