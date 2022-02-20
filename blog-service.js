const fs = require("fs");
const { resolve } = require("path");
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

module.exports.addPost = function(postData){
    return new Promise((resolve,reject)=>{
        if(postData.published == undefined){
            postData.published = false;
        }
        else{
            postData.published = true;
        }
        postData.id = posts.length + 1;
        posts.push(postData);
        resolve('The newly added blog post'+ postData.featureImage);
    });
};

module.exports.getPostsByCategory = function(category){
    return new Promise((resolve,reject)=>{
        let postByCat =[];
        postByCat = posts.filter(post => post.category == category); // check
        if(postByCat.length > 0){
            resolve(postByCat);
        }
        else{
            reject("No results returned");
        }
    });
};

module.exports.getPostsByMinDate = function(minDateStr){
    return new Promise((resolve,reject)=>{
        let postByDate = [];
        postByDate = posts.filter((post)=>{
            return new Date(post.postDate) >= new Date(minDateStr)            
        })
        if(postByDate.length > 0){
            resolve(postByDate);
        }
        else{
            reject("No results returned");
        }
    });
};

module.exports.getPostById = function(id){
    return new Promise((resolve,reject)=>{
        let postById = posts.filter((post) =>{
            return post.id == id;
        });
        if(postById == null){
            reject("No results returned");
        }
        else{
            resolve(postById);
        }
    });
};