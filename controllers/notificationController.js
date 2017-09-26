const mongoose = require('mongoose');
const Group = mongoose.model('Group');
const moment = require('moment');
const User = mongoose.model('User');
const Assesment = mongoose.model('Assesment');
const Assignment = mongoose.model('Assignment');

exports.getNotifications = async (req, res) => {
    var events = [];
    var i = 0;
    assesments =await Assesment.find({onDate: { $gt: Date.now()}, group: req.user.group}).sort({onDate : 'asc'}) ;
    assignments =await Assignment.find({onDate: { $gt: Date.now()}, group: req.user.group}).sort({onDate : 'asc'}) ;
    assesments.map(assesment => events.push(assesment));
    assignments.map(assignment => events.push(assignment));
    events.sort({onDate : 'asc'})
    res.render('notifications', {title: "Notifications" ,events});
}
