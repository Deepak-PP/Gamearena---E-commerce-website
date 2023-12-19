require('text-encoding').encoding; 
require("dotenv").config();
const mongoose = require("mongoose");
mongoose.set("strictQuery", false);
mongoose.connect(process.env.MONGOOSE_LINK).then(() => {
  console.log('database connected');
}).catch((err) => {
  console.log(err);
})
const express = require("express");
const flash = require("connect-flash");

const app = express();

const bodyParser = require("body-parser");
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const path = require("path");
const session = require("express-session");
app.use(
  session({
    secret: "keyboard cat",
    saveUninitialized: true,
    cookie: { secure: false },
  })
);

app.use((req, res, next) => {
  res.set("cache-control", "no-store");
  next();
});




// app.use((req,res,next)=>{
//     res.set('cache-control','no-store')
//     next()
// })

//for user-route
app.set("view engine", "ejs");
app.set("views", "views");

const userRoute = require("./routes/userRoute");
app.use("/", userRoute);

app.use(express.static(path.join(__dirname, "public")));
app.use(express.static(path.join(__dirname, "jquery-ui-datepicker")));
app.use(express.static(path.join(__dirname, "js")));
app.use(express.static(path.join(__dirname, "img")));
app.use(express.static(path.join(__dirname, "webfonts")));
app.use(express.static(path.join(__dirname, "scss")));
app.use(express.static(path.join(__dirname, "mail")));
app.use(express.static(path.join(__dirname, "lib")));

//for admin-route
const adminRoute = require("./routes/adminRoute");
app.use("/admin", adminRoute);




app.use(function (req, res, next) {
  res.status(404);

  // respond with html page
  if (req.accepts("html")) {
    res.render("404", { url: req.url });
    return;
  }
});

app.use(function (err, req, res, next) {
  res.status(500);

  // respond with HTML page for 500 errors
  if (req.accepts("html")) {
    res.render("500", { error: err });
    return;
  }
});


app.listen(4000, () => {
  console.log("Server is running");
});
