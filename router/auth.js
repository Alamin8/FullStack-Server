const jwt = require('jsonwebtoken');
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const authenticate =require('../middleware/authenticate')

require('../db/connection')
const User = require('../model/userSchema')



//User Registration Route
router.post('/register', async (req, res) => {
    const { name, email, phone, work, password, cpassword } = req.body;

    if (!name || !email || !phone || !work || !password || !cpassword) {
        return res.status(422).json({ error: "Plz complete all the fields" })
    };

    try {
        const userExist = await User.findOne({ email: email })
        if (userExist) {
            return res.status(422).json({ error: "Email already Exist" })
        } else if (password != cpassword) {
            return res.status(422).json({ error: "Password are not matched" })
        } else {
            const user = new User({ name, email, phone, work, password, cpassword })
            const userResister = await user.save()
            if (userResister) {
                res.status(201).json({ message: "User registration Successfull" })
            } else {
                res.status(500).json({ error: "Failed to resistered" })
            }
        }

    } catch (err) {
        console.log(err);
    }


    // Without async await function
    // const { name, email, phone, work, password, cpassword } = req.body
    // if (!name || !email || !phone || !work || !password || !cpassword) {
    //     return res.status(422).json({ error: "Plz complete all the fields" })
    // }
    // User.findOne({ email: email })
    //     .then((userExist) => {
    //         if (userExist) {
    //             return res.status(422).json({ error: "Email already Exist" })
    //         }

    //         const user = new User({name:name, email:email, phone:phone, work:work, password:password, cpassword:cpassword})
    //         user.save().then(()=>{
    //             res.status(201).json({message: "User registration Successfull"})
    //         }).catch((err)=>res.status(500).json({error: "Failed to resistered"}))
    // }).catch(err =>{console.log(err)})


});


//User Login Route
router.post('/signin', async (req, res) => {
    try {
        // receive email and password form ui
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ error: "Plz Filled the data" })
        }
        //then check it from database
        const userLogin = await User.findOne({ email: email })
        if (userLogin) {
            //hash password compare
            const isMatch = await bcrypt.compare(password, userLogin.password)
            //jwt token store in local storege
            const token = await userLogin.generateAuthToken();
            console.log(token);
            res.cookie("jwtoken", token, {
                expires: new Date(Date.now() + 2592000000), //set miliseconds by converts days
                httpOnly: true
            })

            if (!isMatch) {
                res.status(400).json({ error: "Invalid Credientials" })
            } else {
                res.json({ message: "User Signin Successfully" })
            }
        } else {
            res.status(400).json({ error: "Invalid Credientials" })
        }
    } catch (err) {
        console.log(err)
    }
})


// about us route
router.get('/about', authenticate, (req, res)=>{
    res.send(req.rootUser)
})


//Data collect route for home and contact us 
router.get('/getdata', authenticate, (req, res)=>{
    res.send(req.rootUser)
})

//Contact us message route
router.post('/contact', authenticate, async (req, res)=>{
    try{
        const {name, email, phone, message} = req.body;
        if(!name || !email || !phone || !message){
            console.log("error contact form");
            return res.json({error:'Plz filled the contact form'})
        }
        // req.userID get this form athenticate.js
        const userContact = await User.findOne({_id:req.userID})
        if(userContact){
            const userMessage = await userContact.addMessage(name, email, phone, message)
            await userContact.save()
            res.status(201).json("User Message Store Successfully")
        }else{
            console.log("cant match user id");
        }

    }catch(err){
        console.log(err);
    }
})


// logout route
router.get('/logout', (req, res)=>{
    console.log(`Hello my log out page`);
    res.clearCookie('jwtoken', {path:'/'})
    res.status(200).send("User Logout Successfull")
})



module.exports = router;