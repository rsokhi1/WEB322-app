/*********************************************************************************
 *  WEB322 – Assignment 06
 *  I declare that this assignment is my own work in accordance with Seneca  Academic Policy.  No part *  of this assignment has been copied manually or electronically from any other source 
 *  (including 3rd party web sites) or distributed to other students.
 * 
 *  Name: Rajbeer Sokhi Student ID: 124969205 Date: 16/04/2022
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
const authData = require("./auth-service.js");
const clientSessions = require("client-sessions");

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

app.use(express.static('public'));
app.use(express.urlencoded({extended: true}));



app.set('view engine', '.hbs');

cloudinary.config({
    cloud_name: 'dulnoenrv',
    api_key: '454579831321763',
    api_secret: 'lRuVvu1NQ5I4-q-hQwMIgOXfKVA',
    secure: true
});


app.use(clientSessions({
    cookieName: "session",
    secret: "web322_assignment6",
    duration: 2 * 60 * 1000,
    activeDuration: 1000 * 60
}));

function ensureLogin(req,res,next){
    if(!req.session.user){
        res.redirect("/login");
    }else{
        next();
    }
}

app.use(function(req, res, next) {
    res.locals.session = req.session;
    next();
  });
  

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

app.get('/posts',ensureLogin,(req,res) =>{
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



app.get('/categories',ensureLogin,(req,res) =>{
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

app.get('/blog',ensureLogin , async (req, res) => {

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

app.get('/posts/add',ensureLogin,(req,res) =>{

    dataFile.getCategories()
    .then(data => res.render("addPost",{categories: data}))
    .catch(err =>{
        res.render("addPost",{categories: []})
    });
});

app.post("/posts/add",ensureLogin,upload.single("featureImage"),(req,res)=>{
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

app.get('/post/:value',ensureLogin,(req,res)=>{
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

app.get("/posts/:category", ensureLogin, (req, res) => {
    blogData.getAllPosts()
    .then((data) => {
        return res.json({data});
    })
    .catch((err) => {
        return {"message": err.message};
    })
})

app.get('/categories/add',ensureLogin,(req,res)=>{
    res.render(path.join(__dirname,'/views/addCategory.hbs'));
});

app.post('/categories/add',ensureLogin,(req,res)=>{
    dataFile.addCategory(req.body)
    .then(()=>{
        res.redirect("/categories");
    });
});

app.get('/categories/delete/:id',ensureLogin,(req,res)=>{
    dataFile.deleteCategoryById(req.params.id)
    .then(()=>{
        res.redirect("/categories");
    })
    .catch(err => {
        res.status(500).send("Unable to Remove Category / Category not found");
    });
});


app.get('/posts/delete/:id',ensureLogin,(req,res)=>{
    dataFile.deletePostById(req.params.id)
    .then(()=>{
        res.redirect("/posts");
    })
    .catch(err=>{
        res.status(500).send("Unable to Remove Post / Post not found");
    });
});

app.get('/login',(req,res)=>{
    res.render("login");
});

app.get('/register',(req,res)=>{
    res.render("register");
});

app.post('/register',(req,res)=>{
    authData.registerUser(req.body)
    .then((user)=>{
        res.render('register',{successMessae: "User created successfully"});
    })
    .catch((err)=>{
        res.render('register',{errorMessage: err, userName: req.body.userName});
    })
});

app.post('/login',(req,res)=>{
    req.body.userAgent = req.get('User-Agent');
    authData.checkUser(req.body)
    .then((user)=>{
        req.session.user ={
            userName: user.userName,
            email: user.email,
            loginHistory: user.loginHistory
        }
        res.redirect('/posts');
    })
    .catch((err)=>{
        res.render("login", {errorMessage: err, userName: req.body.userName});
    })
});

app.get('/logout',(req,res)=>{
    req.session.reset();
    res.redirect("/");
});

app.get('/userHistory',(req,res)=>{
    res.render("userHistory");
});

app.use(function(req,res){
    res.sendFile(path.join(__dirname,'./views/404.html'));
});


function onHttpStart() {
    console.log("Express http server listening on: " + HTTP_PORT);
}

dataFile.initialize()
    .then(authData.initialize)
    .then(function(){
        app.listen(HTTP_PORT,onHttpStart);
    })
    .catch(function(err){
        console.log('Failed to start!' + err);
    });

