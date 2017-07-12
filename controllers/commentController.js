const mongoose = require('mongoose');
const Comment= mongoose.model('Comment');

exports.addComment= async(req, res) => {
    req.body.author = req.user._id;
    req.body.data = req.params.id;
    var newComment = new Comment(req.body);
    await newComment.save();
    res.redirect('back');
}