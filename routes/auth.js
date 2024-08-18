
const express = require('express');
const router= express.Router();
const User = require('../models/Users');
const {body,validationResult}=require('express-validator');
const bcrypt= require ('bcryptjs');
const jwt = require('jsonwebtoken');
var fetchuser=require('../middleware/fetchuser')

const JWT_SECRET=process.env.JWT_SECRET;

//Route:1
//Create a User using : POST "/api/auth/createUser".No login required
router.post('/createUser',[
    body('name','Enter a valid name:').isLength({min:3}),
    body('email','Enter a valid email:').isEmail(),
    body('password','Password must be atleat 5 characters:').isLength({min:5})
],async (req,res)=>{
    let success = false
const error=validationResult(req);
if(!error.isEmpty()){
    return res.status(400).json({success, error: error.array()});
}

try {
 // check whether the user email  exist already   
let user = await User.findOne({email:req.body.email});
if(user){
    return res.status(400).json({success, error: "Email already exist"});
}

const salt= await bcrypt.genSalt(10)
secPass = await bcrypt.hash(req.body.password,salt);

//create a new user 
user = await User.create({
    name: req.body.name,
    password:secPass,
    email:req.body.email
})
const data={
    user:{
        id:user.id,
    }
}
const authtoken= jwt.sign(data,JWT_SECRET);

success=true;
res.json({success, authtoken})
} catch (error) {
    console.error(error.message);
    res.status(500).send("Internal server error");
}

})

//Route:2
//Authenticate a User using : POST "/api/auth/login".No login required
router.post('/login',[
        body('email','Enter a valid email:').isEmail(),
        body('password','Password cannot be blank').exists(),
    ],async (req,res)=>{
       let success = false
    //if there are errors return Bad request and the errors
        const error=validationResult(req);
        if(!error.isEmpty()){
        return res.status(400).json({error: error.array()});
        }
        const{email,password}=req.body;
        try {
        // check whether the user exist
        let user = await User.findOne({email});
        if(!user){
            success = false
        return res.status(400).json({error: "Please try logging in with credentials"});
    }
    const passwordCompare= await bcrypt.compare(password,user.password)
    if(!passwordCompare){
      success = false
      return res.status(400).json({ success, error: "Please try to login with correct credentials" });
        }
        const data={
            user:{
                id:user.id,
            }
        };
        const authtoken = jwt.sign(data,JWT_SECRET);
    success = true;
    res.json({ success, authtoken })
        } catch (error) {
            console.error(error.message);
            res.status(500).send("Internal server error")
        }
})

//Route:3
//Get logged in User details using : POST "/api/auth/getuser".Login required
router.post('/getuser',fetchuser,async(req,res)=>{
try {
    
    userId= req.user.id;
    const user =await User.findById(userId).select("-password")
    res.send(user);
} catch (error) {
    console.error(error.message);
    res.status(500).send("Internal server error")
}
})

module.exports=router