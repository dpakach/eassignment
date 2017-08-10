const mongoose = require('mongoose');
mongoose.Promise = global.Promise;

const commentSchema = new mongoose.Schema({
    created:{
        type: Date,
        default: Date.now
    },
    author : {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: 'You must supply an user for this'
    },
    data : {
         type: mongoose.Schema.ObjectId,
         required: 'Cannot post your comment. Make sure your data is correct !'
    },
    text:{ 
        type: String, 
        required:'You must supply an text!'
    }
});


function autoPopulate(next) {
    this.populate('author');
    next();
}

commentSchema.pre('find', autoPopulate);
commentSchema.pre('findOne',autoPopulate );
module.exports = mongoose.model('Comment', commentSchema);
