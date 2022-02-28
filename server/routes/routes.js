const express = require("express");
const {
  findAllTodo,
  addTodoRoutes,
  addTodo,
  editTodoRoutes,
  editTodo,
  deleteTodo,
} = require("../controller/controller");
const router = express.Router();
const Todo = require("../model/todos");

// Halaman Home & Menampilkan todo
router.get("/", findAllTodo);

// Halaman tambah todo
router.get("/add-todo", addTodoRoutes);

// Menambahkan todo
router.post("/", addTodo);

// Halaman edit todo
router.get("/edit-todo/:id", editTodoRoutes);

// Memperbarui todo
router.put("/", editTodo);

// Menghapus todo
router.delete("/", deleteTodo);

// 404
router.use(function (req, res) {
  res.render("404", {
    title: "404 Not Found Page :(",
    layout: "layouts/mainLayout",
  });
});

module.exports = router;
