const mongoose = require("mongoose");

// Define the Section Schema
const sectionSchema = new mongoose.Schema({
    sectionName:{
        type:String,
    },
    subSection:[
        {
            type:mongoose.Schema.Types.ObjectId,
            required:true,
            ref:"SubSection",
        }
    ],
});

// Export the Section Model
module.exports = mongoose.model("Section", sectionSchema);