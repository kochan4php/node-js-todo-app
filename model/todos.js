const mongoose = require("mongoose");

const Todo = mongoose.model("Todo", {
  kegiatan: {
    type: String,
    required: true,
  },
});

module.exports = Todo;
