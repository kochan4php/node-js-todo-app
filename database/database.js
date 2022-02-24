const mongoose = require("mongoose");
mongoose.connect("mongodb://localhost:27017/belajar-mongodb", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
