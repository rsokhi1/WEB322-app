const Sequelize = require('sequelize');

var sequelize = new Sequelize('d6seki2ndmbdn4', 'ztjcmscltfhnfe', '98501d4e43c514e35305d83d04ff71e68b2676312024d350977ebeebd57d2b62', {
    host: 'ec2-52-201-124-168.compute-1.amazonaws.com',
    dialect: 'postgres',
    port: 5432,
    dialectOptions: {
        ssl: { rejectUnauthorized: false }
    },
    formatDate: function(dateObj){
        let year = dateObj.getFullYear();
        let month = (dateObj.getMonth() + 1).toString();
        let day = dateObj.getDate().toString();
        return `${year}-${month.padStart(2, '0')}-${day.padStart(2,'0')}`;
    },   
    query: { raw: true }
});

var Post = sequelize.define('Post',{
    body: Sequelize.TEXT,
    title: Sequelize.STRING,
    postDate: Sequelize.DATE,
    featureImage: Sequelize.STRING,
    published: Sequelize.BOOLEAN
});

var Category = sequelize.define('Category',{
    category: Sequelize.STRING
});

Post.belongsTo(Category,{foreignKey: 'category'});


module.exports.initialize = function(){
    return new Promise((resolve,reject)=>{
        sequelize
        .sync()
        .then((Post) =>{
            resolve();
        })
        .then((Category) =>{
            resolve();
        })
        .catch((err) =>{
            reject("Unable to sync the database");
        });        
    });
};

module.exports.getAllPosts = function(){
    return new Promise((resolve,reject) =>{
        Post.findAll()
        .then((data) =>{
            resolve(data);
        })
        .catch(()=>{
            reject('No results returned!');
        });
    });
};

module.exports.getPostsByCategory = function(m_category){
    return new Promise((resolve,reject)=>{
        Post.findAll({
            where:{
                category: m_category,
            },
        })
        .then((data) =>{
            resolve(data);
        })
        .catch(()=>{
            reject('No results returned');
        });
    });
};

module.exports.getPostsByMinDate = function(minDateStr){
    return new Promise((resolve,reject)=>{
        const { gte } = Sequelize.Op;
        Post.findAll({
            where: {
                postDate: {
                    [gte]: new Date(minDateStr)
                }
            }
        })
        .then((data)=>{
            resolve(data);
        })
        .catch(()=>{
            reject('No results returned');
        });
    });
};

module.exports.getPostById = function(m_id){
    return new Promise((resolve,reject)=>{
        Post.findAll({
            where:{
                id: m_id
            }
        })
        .then((data) =>{
            resolve(data[0]);
        })
        .catch(()=>{
            reject('No results returned');
        })
    });
};

module.exports.addPost = function(postData){
    return new Promise((resolve,reject)=>{
        postData.published = (postData.published) ? true : false;
        for(const index in postData){
            if(postData[index] === ""){
                postData[index] = null;
            }
        }
        postData.postDate = new Date();
        Post.create(postData)
        .then(resolve())
        .catch(reject('unbale to create post'));
    });
};




module.exports.getPublishedPosts = function(){
    return new Promise((resolve,reject)=>{
        Post.findAll({
            where:{
                published: true
            }
        })
        .then((data)=>{
            resolve(data);
        })
        .catch(()=>{
            reject('no results returned')
        })
    });
};


module.exports.getPublishedPostsByCategory = function(m_category){
    return new Promise((resolve,reject)=>{
        Post.findAll({
            where:{
                published: true,
                category: m_category
            }
        })
        .then((data) =>{
            resolve(data);
        })
        .catch(()=>{
            reject('no results returned');
        })
    });
};


module.exports.getCategories = function(){
    return new Promise((resolve,reject) =>{
        Category.findAll()
        .then((data)=>{
            resolve(data);
        })
        .catch(()=>{
            reject("no results returned");
        })
    });
};

 module.exports.addCategory = function(categoryData){
    return new Promise((resolve,reject)=>{
        for(var id in categoryData){
            if(categoryData[id] === ""){
                categoryData[id] = null;
            }
        }
        Category.create(categoryData)
        .then(resolve())
        .catch(reject('unable to create category'))
    });
 };

 module.exports.deleteCategoryById = function(m_id){
    return new Promise((resolve,reject)=>{
        Category.destroy({
            where: {
                id: m_id
            }
        })
        .then(resolve())
        .catch(reject('unable to delete category'));
    });
 };

module.exports.deletePostById = function(m_id){
    return new Promise((resolve,reject)=>{
        Post.destroy({
            where: {
                id: m_id
            }
        })
        .then(resolve())
        .catch(reject('unable to delete post'));
    });
};

