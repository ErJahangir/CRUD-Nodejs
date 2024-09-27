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
    serverSelectionTimeoutMS: 30000,
  })
  .then(() => {
    console.log("Mongodb connected");
  })
  .catch((err) => {
    console.error("Database connection error: ", err);
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
