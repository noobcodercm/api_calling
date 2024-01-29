const express = require("express");
const userModel = require("./models/user")
const userDetailModel = require("./models/userDetailsModel")
const bcrypt = require("bcrypt");
const app = express();
const port = 8000;
const saltRound = 10;
const jwt = require("jsonwebtoken");
const key = "ab1234567890cd"
const expiry = "30d"

app.use(express.json())
app.use(express.urlencoded({extended: true}))



app.get("/",(req,res)=>{
    res.send("Welcome to Server ");
    res.send("use /reg for register user(sign up)");
    res.send("use /login for login user(sign in)");
    res.send("use /users to see all user in database");
})

const auth = (req,res,next) =>{
    const headers = req.headers;
    if(!headers.hasOwnProperty('authorization') || 
        headers.authorization === undefined || 
        headers.authorization === "") return res.status(401).send("Auth not found");
    let token = headers.authorization.split("Bearer ")
    if(token.length < 2) return res.status(401).send("Invalid Token");
    token = token[1];
    // console.log(token);
    jwt.verify(token,key, async(err,decode)=>{
        if(err) next(err);
        const user = await userModel.findOne({_id:decode.id},["name","email","mobile"]);
        req.user = user.toJSON();
        next(); 
    })
}

app.post("/reg", (req,res)=>{
    const userData = req.body;
    userData.password = bcrypt.hashSync(userData.password,saltRound)
    userModel.create(userData).then(async (doc,err)=>{
        if(err) throw(err);
        const userDetail = { 
        address : userData.address,
        city : userData.city,
        state : userData.state,
        pincode : userData.pincode,
        };
        const userDetailDoc = await userDetailModel.create(userDetail)
        doc.Details = userDetailDoc;
        await doc.save();
        res.send(`user Created with this ${doc._id}`)
    }).catch((error)=>{
        throw(error);
        res.send("Something went wrong")
    })
})

app.post("/login",async (req,res)=>{
    const {email,password} = req.body;
    const user = await userModel.findOne({email}).populate("Details");
    if(!user) return res.send("User Not Found");
    const isMatch = bcrypt.compareSync(password,user.password);
    if(!isMatch) return res.send("Password is wrong!!!");
    const accessTime = await jwt.sign({id:user._id},key,{expiresIn:expiry});
    const userData = user.toJSON();
    delete userData.password;
    return res.json({user:userData,accessTime});
})

app.get("/users",auth, async (req,res)=>{
    const users = await userModel.find({},["name","email","mobile"]);
    res.json(users);
})

app.listen(port,() => {
    console.log(`Server is running at http://localhost:${port}`);
});
