const mongoose = require("mongoose");

const todoSchema = new mongoose.Schema(
    {
        text:{
            type:String,
            required:true,
            trim:true,
        },
        completed:{
            type:Boolean,
            default:false
        },
        dueDate: {
            type: Date,
            default: null
        },
        priority: {
            type: String,
            enum: ['Low', 'Medium', 'High', ''],
            default: ''
        },
        category: {
            type: String,
            default: ''
        },
        tags: {
            type: [String],
            default: []
        },
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },
        attachments: {
            type: [
                {
                    publicId:   { type: String, required: true },
                    url:        { type: String, required: true },
                    filename:   { type: String, required: true },
                    mimetype:   { type: String, required: true },
                    size:       { type: Number, required: true },
                    uploadedAt: { type: Date,   default: Date.now },
                }
            ],
            default: [],
        },
    },
    {
            timestamps :true
    }
);

module.exports = mongoose.model("Todo",todoSchema);
