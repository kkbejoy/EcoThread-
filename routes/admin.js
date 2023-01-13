
const { query } = require("express");
var express=require("express");
const producthelpers = require("../helpers/producthelpers");
var router=express.Router();
var userHelpers=require('../helpers/userHelpers')
var producthelper=require('../helpers/producthelpers')
const session_check = require('../middleware/sessionHandling');



router.get('/',(req,res)=>{

    if (req.session.admin && req.cookies.user_sid) {
         res.end("Admin dashboard")
    }
    
    else{
        res.render('admin/adminlogin')
    }
    
})

//authentication
router.post('/login',(req,res)=>{
    userHelpers.adminLogin(req.body).then((response)=>{  
        let adminstatus=response.status;
            // console.log(response)
        
        if(adminstatus){   
            req.session.adminloggedIn=true
            req.session.admin=response.validadmin
           //console.log(req.session.admin)
            console.log(req.cookies.user_sid)
            res.redirect('/admin/viewproducts') // put admin dashboard here

        }
        else{
            res.render('admin/adminlogin',{invalid:true,admin:true})
        }
    })
})

router.get('/viewproducts', session_check.checkingAdmin,function(req,res,next)
{
    producthelper.getAllProducts().then((product)=>
        {
            
            res.render('admin/productsList',{product});
            
    }) });



router.get('/deleteproduct/:id', session_check.checkingAdmin,(req,res,next)=>
    { 
        // if(req.session.adminloggedIn)
        // {
        let productid=req.params.id
        console.log(productid);
        
        producthelpers.deleteProducts(productid).then((response)=>
        {
            console.log(response)
            res.redirect('/admin/viewproducts');
        
        })
    }) 


router.get('/updateproduct/:id', session_check.checkingAdmin,(async(req,res)=>{    
        console.log(req.body);
        let product= await producthelpers.getProductdetails(req.params.id).then((product)=>{
            console.log(product)
           res.render('admin/updateProducts',{product,admin:true,adminin:true})
            })
    }))
router.post('/updateproduct/:id',(async(req,res)=>{   
        await userHelpers.updateUser(req.params.id,req.body).then((data)=>{
            console.log(data)
            res.redirect('/admin/viewusers')
         })
     }))




router.get('/viewusers', session_check.checkingAdmin,function(req,res)
{
    userHelpers.getAllUsers().then((users)=>
    {
    
       //res.send(users);
        res.render('admin/usersList',{admin:true,users,adminin:true});
    }) });



router.route('/adduser', session_check.checkingAdmin)
    .get((req,res)=>{
        
        res.render('admin/adduser',{admin:true,adminin:true})

            })

    .post((req,res)=>{
        userHelpers.addUsers(req.body).then((user)=>
            {
                let existingUser = user.status
                if(existingUser) 
                    { 
                    res.render('admin/adduser',{admin:true,existingUser,adminin:true})
                    }
                else{
                res.redirect('/admin/adduser')

                }
            })
    });

    
router.get('/logout',(req,res,next)=>{
    req.session.loggedInad=false
    req.session.admin=null
    res.redirect('/admin');
}),

module.exports=router;