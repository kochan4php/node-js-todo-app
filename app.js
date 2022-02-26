const { ObjectID } = require("bson");
const express = require("express");
const expressLayouts = require("express-ejs-layouts");
const methodOverride = require("method-override");
require("./database/database");
const Todo = require("./model/todos");

const app = express();
const port = 8080;

// Set ejs
app.set("views", __dirname + "/views");
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

// Halaman tambah todo
app.get("/add-todo", function (req, res) {
  res.render("add-todo", {
    title: "Add Todo",
    layout: "layouts/mainLayout",
  });
});

// Menambahkan todo
app.post("/", async function (req, res) {
  const todos = await Todo.find({});
  const duplicateTodos = todos.find(
    (todo) => todo.kegiatan.toLowerCase() === req.body.kegiatan.toLowerCase()
  );

  if (duplicateTodos) {
    res.render("add-todo", {
      title: "Add Todo",
      layout: "layouts/mainLayout",
      error: "Nama todo tidak boleh sama!",
    });
    return false;
  } else {
    Todo.insertMany(req.body, function (err, result) {
      res.redirect("/");
    });
  }
});

// Halaman edit todo
app.get("/edit-todo/:id", async function (req, res) {
  const todo = await Todo.findOne({ _id: ObjectID(req.params.id) });
  res.render("edit-todo", {
    title: "Edit Todo",
    layout: "layouts/mainLayout",
    todo,
  });
});

// Memperbarui todo
app.put("/", async function (req, res) {
  const todos = await Todo.find({});
  const duplicateTodos = todos.find(
    (todo) => todo.kegiatan.toLowerCase() === req.body.kegiatan.toLowerCase()
  );

  if (duplicateTodos) {
    // console.log(req.body)
    res.render("edit-todo", {
      title: "Edit Todo",
      layout: "layouts/mainLayout",
      error: "Nama todo tidak boleh sama!",
      todo: req.body,
    });
    return false;
  } else {
    Todo.updateOne(
      { _id: ObjectID(req.body._id) },
      { kegiatan: req.body.kegiatan },
      function (err, result) {
        res.redirect("/");
      }
    );
  }
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
