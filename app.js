const express = require("express");
const expressLayouts = require("express-ejs-layouts");
const dotenv = require("dotenv").config({ path: "config.env" });
const methodOverride = require("method-override");
const connectDB = require("./server/database/database");

const app = express();
const port = process.env.PORT || 8080;

// Set ejs
app.set("views", __dirname + "/views");
app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(expressLayouts);

// Middleware
app.use(methodOverride("_method"));
app.use(express.urlencoded({ extended: true }));

// Connect db
connectDB();

// router
app.use(require("./server/routes/routes"));

app.listen(port, function () {
  console.log(`Server is listening on http://localhost:${port}`);
});
