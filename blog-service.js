// const { reject('No results returned'); } = require("assert");
// const { captureRejections } = require("events");
const fs = require("fs");
// resolve(categories);
// const { resolve } = require("path");
;
let posts = [];
let categories = [];

module.exports.initialize = function(){
    return new Promise((resolve,reject)=>{
        fs.readFile('./data/posts.json','utf-8',(err,data) =>{
            if(err){
                reject("Unable to read file");
            }
            else{
                posts = JSON.parse(data);
                resolve(posts);
            }
        });
        fs.readFile('./data/categories.json','utf-8',(err,data)=>{
            if(err){
                reject("Unable to read file");
            }
            else{
                categories = JSON.parse(data);
                resolve(data);
            }
        });

    });
};

module.exports.getAllPosts = function(){
    return new Promise((resolve,reject) =>{
        if(posts.length == 0){
            reject("No results returned");
        }
        resolve(posts);
    });
};

module.exports.getPublishedPosts = function(){
    return new Promise((resolve,reject)=>{
        var post = [];
        for(let i = 0;i<posts.length;i++){
            if(posts[i].published == true){
                post.push(posts[i]);
            }
        }
        if(post.length == 0){
            reject("No results returned");
        }
        resolve(post);
    });
};

module.exports.getCategories = function(){
    return new Promise((resolve,reject) =>{
        if(categories.length == 0){
            reject('No results returned');
        }
        resolve(categories);
    });
};