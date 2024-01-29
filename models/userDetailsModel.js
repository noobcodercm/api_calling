const mongoose = require("../config/db")
const userDetailSchema = new mongoose.Schema({
    address : String,
    city : String,
    state : String,
    pincode : Number,
    created_at : {
        type: Date,
        default : new Date(),
    }
})
module.exports = mongoose.model("userDetail",userDetailSchema)