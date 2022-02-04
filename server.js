var express = require('express');
var app = express();
var path = require("path");
var dataFile = require("./blog-service");
const HTTP_PORT = process.env.PORT || 8080;

app.get('/about',(req,res)=>{
    res.sendFile(path.join(__dirname,"/views/about.html"));
    // res.send("Hello");
});

app.get('/',(req,res)=>{
    res.redirect('/about');
}); 

app.get('/blog',(req,res)=>{
    dataFile.getPublishedPosts().then((data)=>{
        res.json(data);
    });
    // res.send("Hello MFS!!");
});

app.get('/posts',(req,res) =>{
    dataFile.getAllPosts().then((data)=>{
        res.json(data);
    });
    // res.send("Hello Guys!!");
});

app.get('/categories',(req,res) =>{
    dataFile.getCategories().then((data)=>{
        res.json(data);
    });
    // res.send("Helloooo");
});

app.use(function(req,res){
    // res.send("SORRY");
    res.sendFile(path.join(__dirname,'./views/404.html'));
})

app.use(express.static('public'));

function onHttpStart() {
    console.log("Express http server listening on: " + HTTP_PORT);
}

// app.listen(HTTP_PORT,onHttpStart); 
dataFile.initialize()
    .then(function(){
        app.listen(HTTP_PORT,onHttpStart);
    })
    .catch(function(err){
        console.log('Failed to start!' + err);
    })