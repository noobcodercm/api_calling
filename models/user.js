const mongoose = require("../config/db")

const userSchema = new mongoose.Schema({
    name : String,
    password : String,
    age : Number,
    email : {
        type : String,
        unique : true
    },
    mobile : Number,
    Details : {
        type: mongoose.Types.ObjectId,
        ref : "userDetail",
    },
    create_On: {
        type: Date,
        default:new Date()
    }
})

const userCollection = mongoose.model("user",userSchema)

module.exports = userCollection;
