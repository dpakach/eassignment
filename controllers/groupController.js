const mongoose = require('mongoose');
const Group = mongoose.model('Group');
const User = mongoose.model('User');
const promisify = require('es6-promisify');


exports.register = async (req, res, next) => {
  req.body.author = req.user;
  const group = await (new Group(req.body)).save();
  req.flash('success', 'Group created sucessfully!');
  res.redirect('/groups');
};

exports.getGroups = async (req, res, next) => {
  const groups = await Group.find();
  res.render('groups', {title: 'Groups', groups});
}


exports.getGroupBySlug = async (req, res, next) => {
  const group = await Group.findOne({slug: req.params.slug});
  res.render('group', {tile: group.name, group});
}

exports.join = async(req, res, next) => {
  const group = await Group.findOne({slug: req.params.slug});
  const updates = {
    group: group._id
  }
  const user = await User.findOneAndUpdate(
    { _id: req.user._id },
    { $set: updates},
    { new: true, runValidators: true, context: 'query'}
  );
  req.flash('success' , 'Sucussfully joined the group');
  res.redirect('back');
}

exports.leave = async(req, res, next) => {
  const updates = {
    group: undefined
  }
  const user = await User.findOneAndUpdate(
    { _id: req.user._id },
    { $set: updates},
    { new: true, runValidators: true, context: 'query'}
  );
  req.flash('success' , 'Sucussfully left the group');
  res.redirect('back');
}

exports.regGroup = (req, res) => {
  res.render('regGroup', {title: 'Create Group'});
}
