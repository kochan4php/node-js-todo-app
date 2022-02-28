const express = require("express");
const expressLayouts = require("express-ejs-layouts");
const methodOverride = require("method-override");
require("./server/database/database");

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

// router
app.use(require("./server/routes/routes"));

app.listen(port, function () {
  console.log(`Server is listening on http://localhost:${port}`);
});
