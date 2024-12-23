const express = require("express");
const morgan = require("morgan");
const bodyParser = require("body-parser");

const app = new express();
app.set("view engine","ejs");

app.use(express.static("views"));

app.use(morgan("dev"));

app.get("/",(req,res)=>{
    res.render("index");
})

app.listen(5000,()=>{
    console.log("äpp is listeninng on pot 5000")
})