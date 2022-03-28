/*********************************************************************************
 *  WEB322 – Assignment 04
 *  I declare that this assignment is my own work in accordance with Seneca  Academic Policy.  No part *  of this assignment has been copied manually or electronically from any other source 
 *  (including 3rd party web sites) or distributed to other students.
 * 
 *  Name: Rajbeer Sokhi Student ID: 124969205 Date: 14/03/2022
 *
 *  Online (Heroku) URL: https://rocky-earth-69844.herokuapp.com/
 *
 *  GitHub Repository URL: https://github.com/rsokhi1/WEB322-app
 *
 ********************************************************************************/ 

var express = require('express');
var app = express();
var path = require("path");
const dataFile = require("./blog-service");
const HTTP_PORT = process.env.PORT || 8080;
const multer = require("multer");
const cloudinary = require('cloudinary').v2
const streamifier = require('streamifier');
const { redirect } = require('express/lib/response');
const exphbs = require('express-handlebars');
const stripJs = require('strip-js');
const upload = multer();



app.use(express.static('public'));
app.use(express.urlencoded({extended: true}));

app.engine('.hbs', exphbs.engine({ 
    extname: '.hbs',
    helpers: {
        navLink: function(url, options){
        return '<li' + 
            ((url == app.locals.activeRoute) ? ' class="active" ' : '') + 
            '><a href="' + url + '">' + options.fn(this) + '</a></li>';
        },
        equal: function (lvalue, rvalue, options) {
            if (arguments.length < 3)
                throw new Error("Handlebars Helper equal needs 2 parameters");
            if (lvalue != rvalue) {
                return options.inverse(this);
            } else {
                return options.fn(this);
            }
        },
        safeHTML: function(context){
            return stripJs(context);
        },
        formatDate: function(dateObj){
            let year = dateObj.getFullYear();
            let month = (dateObj.getMonth() + 1).toString();
            let day = dateObj.getDate().toString();
            return `${year}-${month.padStart(2, '0')}-${day.padStart(2,'0')}`;
        }        
        
    }
    

}));


app.set('view engine', '.hbs');

app.use(function(req,res,next){
    let route = req.path.substring(1);
    app.locals.activeRoute = (route == "/") ? "/" : "/" + route.replace(/\/(.*)/, "");
    app.locals.viewingCategory = req.query.category;
    next();
});

app.get('/',(req,res)=>{
    res.redirect('/blog');
}); 

app.get('/about',(req,res)=>{
    res.render(path.join(__dirname,"/views/about.hbs"));
});

app.get('/posts/add',(req,res) =>{

    dataFile.getCategories()
    .then(data => res.render("addPost",{categories: data}))
    .catch(err =>{
        res.render("addPost",{categories: []})
    });
});

app.get('/categories/add',(req,res)=>{
    res.render(path.join(__dirname,'/views/addCategory.hbs'));
});

app.post('/categories/add',(req,res)=>{
    dataFile.addCategory(req.body)
    .then(()=>{
        res.redirect("/categories");
    });
});

app.get('/categories/delete/:id',(req,res)=>{
    dataFile.deleteCategoryById(req.params.id)
    .then(()=>{
        res.redirect("/categories");
    })
    .catch(err => {
        res.status(500).send("Unable to Remove Category / Category not found");
    });
});


app.get('/posts/delete/:id',(req,res)=>{
    dataFile.deletePostById(req.params.id)
    .then(()=>{
        res.redirect("/posts");
    })
    .catch(err=>{
        res.status(500).send("Unable to Remove Post / Post not found");
    });
});







cloudinary.config({
    cloud_name: 'dulnoenrv',
    api_key: '454579831321763',
    api_secret: 'lRuVvu1NQ5I4-q-hQwMIgOXfKVA',
    secure: true
});

app.get('/blog', async (req, res) => {

    // Declare an object to store properties for the view
    let viewData = {};

    try{

        // declare empty array to hold "post" objects
        let posts = [];

        // if there's a "category" query, filter the returned posts by category
        if(req.query.category){
            // Obtain the published "posts" by category
            posts = await dataFile.getPublishedPostsByCategory(req.query.category);
        }else{
            // Obtain the published "posts"
            posts = await dataFile.getPublishedPosts();
        }

        // sort the published posts by postDate
        posts.sort((a,b) => new Date(b.postDate) - new Date(a.postDate));

        // get the latest post from the front of the list (element 0)
        let post = posts[0]; 

        // store the "posts" and "post" data in the viewData object (to be passed to the view)
        viewData.posts = posts;
        viewData.post = post;

    }catch(err){
        viewData.message = "no results";
    }

    try{
        // Obtain the full list of "categories"
        let categories = await dataFile.getCategories();

        // store the "categories" data in the viewData object (to be passed to the view)
        viewData.categories = categories;
    }catch(err){
        viewData.categoriesMessage = "no results"
    }

    // render the "blog" view with all of the data (viewData)
    res.render("blog", {data: viewData})

});

app.get('/posts',(req,res) =>{
    if(req.query.category){
        dataFile.getPostsByCategory(req.query.category)
        .then((data) =>{
            if(data.length > 0){
                res.render("posts",{posts:data});
            }
            else{
                res.render("posts",{ message: "no results" });
            }
        })
        .catch(function(err){
            res.render("posts", {message: "no results"});
        })
    }
    else if(req.query.minDate){
        dataFile.getPostsByMinDate(req.query.minDate)
        .then((data)=>{
            if(data.length > 0){
                res.render("posts",{posts:data});
            }
            else{
                res.render("posts",{ message: "no results" });
            }
        })
        .catch(function(err){
            res.render("posts", {message: "no results"});
        })
    }
    else{
        dataFile.getAllPosts().then((data)=>{
            if(data.length > 0){
                res.render("posts",{posts:data});
            }
            else{
                res.render("posts",{ message: "no results" });
            }
        })
        .catch((err)=>{
            res.render("posts", {message: "no results"});
        })
    }
});

app.get('/categories',(req,res) =>{
    dataFile.getCategories().then((data)=>{
        if(data.length> 0 ){
            res.render("categories", {categories: data});
        }
        else{
            res.render("categories", {message: "no results"});
        }
    })
    .catch((err)=>{
        res.render("categories", {message: "no results"});
    })
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
        // console.log(result);
        return result;
    }
    
    upload(req).then((uploaded)=>{
        req.body.featureImage = uploaded.url;
        dataFile.addPost(req.body)
        .then(res.redirect('/posts'))
        .catch(function(err){
            res.json({message: err});
        });
    
    });
    
});


app.get('/post/:value',(req,res)=>{
    dataFile.getPostById(req.params.value)
    .then((data)=>{
        // res.json(data);
        res.render("post",{post: data})
    })
    .catch((err)=>{
        // res.json({message : err});
        res.render("post",{message: "no results"})
    });
})

app.get('/blog/:id', async (req, res) => {

    let viewData = {};

    try{

        let posts = [];

        if(req.query.category){
            posts = await dataFile.getPublishedPostsByCategory(req.query.category);
        }else{
            posts = await dataFile.getPublishedPosts();
        }
        posts.sort((a,b) => new Date(b.postDate) - new Date(a.postDate));
        viewData.posts = posts;

    }catch(err){
        viewData.message = "no results";
    }

    try{
        // Obtain the post by "id"
        viewData.post = await dataFile.getPostById(req.params.id);
    }catch(err){
        viewData.message = "no results"; 
    }

    try{
        // Obtain the full list of "categories"
        let categories = await dataFile.getCategories();

        // store the "categories" data in the viewData object (to be passed to the view)
        viewData.categories = categories;
    }catch(err){
        viewData.categoriesMessage = "no results"
    }

    // render the "blog" view with all of the data (viewData)
    res.render("blog", {data: viewData})
});





app.use(function(req,res){
    res.sendFile(path.join(__dirname,'./views/404.html'));
});


function onHttpStart() {
    console.log("Express http server listening on: " + HTTP_PORT);
}

dataFile.initialize()
    .then(function(){
        app.listen(HTTP_PORT,onHttpStart);
    })
    .catch(function(err){
        console.log('Failed to start!' + err);
    });

