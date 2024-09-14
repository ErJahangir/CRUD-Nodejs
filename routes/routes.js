const express = require("express");
const routes = express.Router();
const User = require("../models/users");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
// Setup multer storage configuration
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./uploads");
  },
  filename: function (req, file, cb) {
    const uniqueName =
      file.fieldname + "_" + Date.now() + path.extname(file.originalname);
    cb(null, uniqueName);
  },
});

const upload = multer({ storage: storage }).single("image");

// create user
routes.post("/add", upload, async (req, res) => {
  if (!req.file) {
    return res.status(400).send("No file uploaded.");
  }

  try {
    const user = new User({
      name: req.body.name,
      email: req.body.email,
      phone: req.body.phone,
      image: req.file.filename,
    });

    await user.save();

    req.session.message = {
      type: "success",
      message: "User added successfully",
    };

    res.redirect("/");
  } catch (err) {
    res.status(500).json({ message: err.message, type: "danger" });
  }
});

// Get all the user on home
routes.get("/", async (req, res) => {
  try {
    const users = await User.find();
    res.render("index", {
      title: "Home Page",
      users: users,
    });
  } catch (err) {
    res.json({ message: err.message });
  }
});

// Add user page routes
routes.get("/add", (req, res) => {
  res.render("add-user", { title: "Add new user" });
});

// Edit user details page routes
routes.get("/edit/:id", async (req, res) => {
  const id = req.params.id;
  console.log(id);

  try {
    const user = await User.findById(id);

    if (!user) {
      return res.redirect("/");
    }
    console.log(user);
    res.render("edit-user", {
      title: "Edit user",
      user: user,
    });
  } catch (err) {
    console.error(err);
    res.redirect("/");
  }
});

// update user post
routes.post("/update/:id", upload, async (req, res) => {
  let id = req.params.id;
  let new_image = "";

  if (req.file) {
    new_image = req.file.filename;
    try {
      fs.unlinkSync("./uploads/" + req.body.old_image);
    } catch (error) {
      console.log(error);
    }
  } else {
    new_image = req.body.old_image;
  }

  try {
    await User.findByIdAndUpdate(id, {
      name: req.body.name,
      email: req.body.email,
      phone: req.body.phone,
      image: new_image,
    });

    req.session.message = {
      type: "success",
      message: "User updated successfully!",
    };

    res.redirect("/");
  } catch (err) {
    res.json({ message: err.message, type: "danger" });
  }
});

// delete user
routes.get("/delete/:id", async (req, res) => {
  let id = req.params.id;
  console.log(id);

  try {
    const result = await User.findByIdAndDelete(id);

    if (result && result.image != "") {
      try {
        fs.unlinkSync("./uploads/" + result.image);
      } catch (error) {
        console.log(error);
      }
    }

    req.session.message = {
      type: "Success",
      message: "User deleted successfully",
    };
    res.redirect("/");
  } catch (err) {
    res.json({ message: err.message });
  }
});

// search functionality

routes.get("/search", async (req, res) => {
  const searchQuery = req.query.q;

  try {
    const users = await User.find({
      $or: [
        { name: { $regex: searchQuery, $options: "i" } },
        { email: { $regex: searchQuery, $options: "i" } },
        { phone: { $regex: searchQuery, $options: "i" } },
      ],
    });

    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = routes;
