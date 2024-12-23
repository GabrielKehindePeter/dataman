const express = require("express");
const morgan = require("morgan");
const bodyParser = require("body-parser");
const mysql = require("mysql");

// import unique id library
const { v4: uuidv4 } = require('uuid');

const app = new express();
app.set("view engine","ejs");

app.use(express.static("views"));
app.use(bodyParser({extended:true}))

app.use(morgan("dev"));


    // connect to database
    const pool = mysql.createPool({
        connectionLimit:10,
        host:"localhost",
        user:"root",
        password:"",
        database:"dataman"
    })

app.get("/",(req,res)=>{

    pool.getConnection((err, connection)=>{
        if(err) throw err
        connection.query("SELECT * FROM blogs ORDER BY upload_date DESC",(err,rows)=>{
            if(!err){
                res.render("index",{"data":rows});
            }else{
                throw err;
            }
        });

     // release connection after query
     connection.release();
    });
})

// view post details
app.get("/post-detail/:id",(req,res)=>{
    var id = req.params.id;
    pool.getConnection((err, connection)=>{
        if(err) throw err
        connection.query("SELECT * FROM blogs WHERE id=? LIMIT 1",id,(err,rows)=>{
            if(!err){
                res.render("post-detail",{"data":rows});
            }else{
                throw err;
            }
        });
    })
            
})

// send add-post form
app.get("/add-post",(req,res)=>{
    res.render("add_post")
})

// process add-post form

app.post("/process-post",(req,res)=>{
    var title = req.body.title
    var body = req.body.body
    var author = req.body.author
    var id = uuidv4();
    pool.getConnection((err, connection)=>{
        if(err) throw err
        connection.query("INSERT INTO blogs (id,author,title,body) VALUES (?,?, ?, ?)",[id,author,title,body],(err,rows)=>{
            if(!err){
                res.render("add_post",{"message":"post succesfully added"});
            }else{
                throw err;
            }
        });
    })
            
})

// all post
app.get("/view",(req,res)=>{
    pool.getConnection((err, connection)=>{
        if(err) throw err
        connection.query("SELECT * FROM blogs ORDER BY upload_date DESC",(err,rows)=>{
            if(!err){
                res.render("posts",{"data":rows});
            }else{
                throw err;
            }
        });

     // release connection after query
     connection.release();
    });
})

// edit post
app.get("/edit/:id",(req,res)=>{
    pool.getConnection((err,connection)=>{
        var id = req.params.id;
        connection.query("SELECT * FROM blogs WHERE id=? LIMIT 1",id,(err,rows)=>{
            if(err){
                throw err;
            }
            const post = rows[0];
            res.render("edit",{"message":"Please kindly go through the form to update the content you wish to adjust.","data":{author:post.author,title:post.title,body:post.body,id:post.id}});
        });
        
    connection.release();
    })

    })

    // process post update form

app.post("/edit/:id",(req,res)=>{
    var title = req.body.title
    var body = req.body.body
    var author = req.body.author
    var id = req.params.id;
    console.log(id)
    pool.getConnection((err, connection)=>{
        if(err) throw err
        connection.query(
            "UPDATE blogs SET author=?, title=?, body=? WHERE id=?",
            [author, title, body, id],
            (err, rows) => {
              if (!err) {
                res.render("edit", { message: "Post successfully updated", "data":{author:author,title:title,body:body}});
              } else {
                throw err;
              }
            }
          );
          
    })
            
});

// delete a post
app.get("/delete/:id",(req,res)=>{
    pool.getConnection((err,connection)=>{
        if(err) throw err;
        var id = req.params.id;
        connection.query("DELETE FROM blogs WHERE id=? LIMIT 1",id,(err,rows)=>{
            if(!err){
                connection.query("SELECT * FROM blogs ORDER BY upload_date DESC",(err,rows)=>{
                    // res.render("index",{"data":rows});
                    res.render("posts",{"data":rows});
                })
            }else{
                res.send("sorry an error occured. error: "+err);
            }
            
        })
    })
})

app.listen(5000,()=>{
    console.log("äpp is listeninng on pot 5000")
})