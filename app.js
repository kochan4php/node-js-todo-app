const { ObjectID } = require("bson");
const express = require("express");
const expressLayouts = require("express-ejs-layouts");
const methodOverride = require("method-override");
require("./database/database");
const Todo = require("./model/todos");

const app = express();
const port = 8080;

// Set ejs
app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(expressLayouts);

// Middleware
app.use(methodOverride("_method"));
app.use(express.urlencoded({ extended: true }));

// Halaman Home & Menampilkan todo
app.get("/", async function (req, res) {
  const todos = await Todo.find({});
  res.render("index", {
    title: "Node JS Todo App",
    layout: "layouts/mainLayout",
    todos,
  });
});

// Menambahkan todo
app.post("/", function (req, res) {
  Todo.insertMany(req.body, function (err, result) {
    res.redirect("/");
  });
});

// Menghapus todo
app.delete("/", function (req, res) {
  Todo.deleteOne({ _id: ObjectID(req.body._id) }, function (err, result) {
    res.redirect("/");
  });
});

app.listen(port, function () {
  console.log(`Server is listening on http://localhost:${port}`);
});
