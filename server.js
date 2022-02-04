/*********************************************************************************
*  WEB322 – Assignment 02
*  I declare that this assignment is my own work in accordance with Seneca  Academic Policy.  No part *  of this assignment has been copied manually or electronically from any other source 
*  (including 3rd party web sites) or distributed to other students.
* 
*  Name: Rajbeer Sokhi Student ID: 124969205 Date: 04/02/2022
*
*  Online (Heroku) URL: https://rocky-earth-69844.herokuapp.com/
*
*  GitHub Repository URL: https://github.com/rsokhi1/WEB322-app
*
********************************************************************************/ 

var express = require('express');
var app = express();
var path = require("path");
var dataFile = require("./blog-service");
const HTTP_PORT = process.env.PORT || 8080;

app.get('/about',(req,res)=>{
    res.sendFile(path.join(__dirname,"/views/about.html"));
});

app.get('/',(req,res)=>{
    res.redirect('/about');
}); 

app.get('/blog',(req,res)=>{
    dataFile.getPublishedPosts().then((data)=>{
        res.json(data);
    });
});

app.get('/posts',(req,res) =>{
    dataFile.getAllPosts().then((data)=>{
        res.json(data);
    });
});

app.get('/categories',(req,res) =>{
    dataFile.getCategories().then((data)=>{
        res.json(data);
    });
});

app.use(function(req,res){
    res.sendFile(path.join(__dirname,'./views/404.html'));
})

app.use(express.static('public'));

function onHttpStart() {
    console.log("Express http server listening on: " + HTTP_PORT);
}

dataFile.initialize()
    .then(function(){
        app.listen(HTTP_PORT,onHttpStart);
    })
    .catch(function(err){
        console.log('Failed to start!' + err);
    })