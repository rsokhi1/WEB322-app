/*********************************************************************************
*  WEB322 – Assignment 03
*  I declare that this assignment is my own work in accordance with Seneca  Academic Policy.  No part *  of this assignment has been copied manually or electronically from any other source 
*  (including 3rd party web sites) or distributed to other students.
* 
*  Name: Rajbeer Sokhi Student ID: 124969205 Date: 20/02/2022
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
const multer = require("multer");
const cloudinary = require('cloudinary').v2
const streamifier = require('streamifier');
const { redirect } = require('express/lib/response');

cloudinary.config({
    cloud_name: 'dulnoenrv',
    api_key: '454579831321763',
    api_secret: 'lRuVvu1NQ5I4-q-hQwMIgOXfKVA',
    secure: true
});

const upload = multer();


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
    // dataFile.getAllPosts().then((data)=>{
    //     res.json(data);
    // });
    if(req.query.category){
        dataFile.getPostsByCategory(req.query.category)
        .then((data) =>{
            res.json(data);
        })
        .catch(function(err){
            res.json({message : err});
        })
    }
    else if(req.query.minDate){
        dataFile.getPostsByMinDate(req.query.minDate)
        .then((data)=>{
            res.json(data);
        })
        .catch(function(err){
            res.json({message : err});
        })
    }
    else{
        dataFile.getAllPosts().then((data)=>{
            res.json(data);
        })
        .catch((err)=>{
            res.json({message : err});
        })
    }
});

app.get('/post/:value',(req,res)=>{
    dataFile.getPostById(req.params.value)
    .then((data)=>{
        res.json(data);
    })
    .catch((err)=>{
        res.json({message : err});
    })
})

app.get('/categories',(req,res) =>{
    dataFile.getCategories().then((data)=>{
        res.json(data);
    });
});

app.get('/posts/add',(req,res) =>{
    res.sendFile(path.join(__dirname,'./views/addPost.html'));
    
});

app.post("/posts/add",upload.single("featureImage"),(req,res)=>{
    let streamUpload = (req) => {
        return new Promise((resolve, reject) => {
            let stream = cloudinary.uploader.upload_stream(
                (error, result) => {
                if (result) {
                    resolve(result);
                } else {
                    reject(error);
                }
                }
            );
    
            streamifier.createReadStream(req.file.buffer).pipe(stream);
        });
    };
    
    async function upload(req) {
        let result = await streamUpload(req);
        console.log(result);
        return result;
    }
    
    upload(req).then((uploaded)=>{
        req.body.featureImage = uploaded.url;
    
        // TODO: Process the req.body and add it as a new Blog Post before redirecting to /posts
        dataFile.addPost(req.body)
        .then(res.redirect('/posts'))
        .catch(function(err){
            res.json({message: err});
        });
    
    });
    
});

app.use(function(req,res){
    res.sendFile(path.join(__dirname,'./views/404.html'));
});

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