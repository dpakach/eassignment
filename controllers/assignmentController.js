const mongoose = require('mongoose');
const Assignment = mongoose.model('Assignment');
const multer = require('multer');
const sharp = require('sharp');
const jimp = require('jimp');
const uuid = require('uuid');
const User = mongoose.model('User');
const _ = require('lodash');


const multerOptions = {
  storage: multer.memoryStorage(),
  fileFilter(req, file, next) {
    const isPhoto = file.mimetype.startsWith('image/');
    if(isPhoto) {
      next(null, true);
    } else {
      next({ message: 'That filetype isn\'t allowed!' }, false);
    }
  }
};




exports.upload = multer(multerOptions).single('photo');

exports.resize = async (req, res, next) => {
  // check if there is no new file to resize
  if (!req.file) {
    next(); // skip to the next middleware
    return;
  }
  console.log(req.file);
  const extension = req.file.mimetype.split('/')[1];
  req.body.photo = `${uuid.v4()}.${extension}`;
  // now we resize
  const photo = await jimp.read(req.file.buffer);
  await photo.resize(800, jimp.AUTO);
  await photo.write(`./public/uploads/${req.body.photo}`);
  // once we have written the photo to our filesystem, keep going!
  next();
};


exports.addAssignment = (req, res) => {
  res.render('editAssignment', { title: 'Add Assignments' });
};


exports.createAssignment = async (req, res) => {
  req.body.author = req.user._id;
  req.body.group = req.user.group;
  const assignment = await (new Assignment(req.body)).save();
  req.flash('success', `Successfully Created assignment of ${assignment.name}`);
  //res.redirect('/');
  res.redirect(`/assignment/${assignment.slug}`);
};


exports.getAssignments = async (req, res) => {
  // 1. Query the database for a list of all assesments
  var assignments;
  if(req.user && req.user.group){
     assignments =await Assignment.find({onDate: { $gt: Date.now() }, group: req.user.group}).sort({onDate : 'asc'}) ;
  }else{
     assignments = null;
  }
  //res.json(assesments);
  res.render('assignments', { title: 'Assignments', assignments});
};


const confirmOwner = (assignmet, user) => {
  if(!assignmet.author.equals(user._id)) {
    throw Error('You must be the author inorder to edit it!');
  }
};


exports.editAssignment = async (req, res) => {

  // 1. Find the store given the ID
  const assignment = await Assignment.findOne({_id : req.params.id });
  //res.json(assesment);
  // 2. confirm they are the owner of the store
  confirmOwner(assignment, req.user);
  // 3. Render out the edit form so the user can update their store
  res.render('editAssignment', { title: `Edit ${assignment.name}`, assignment });
};


exports.updateAssignment = async (req, res) => {
  // find and update the assesment
  const assignment = await Assignment.findOneAndUpdate({ _id: req.params.id }, req.body, {
    new: true, // return the new assesment instead of the old one
    runValidators: true
  }).exec();
  // Redriect them the assesment and tell them it worked
  req.flash('success', `Successfully updated <strong>${assignment.name}</strong>. <a href="/assignment/${assignment.slug}">View Assignment →</a>`);
  res.redirect(`/assignments/${assignment._id}/edit`);
};

exports.getAssignmentBySlug = async (req, res, next) => {

  const assignment = await Assignment.findOne({ slug: req.params.slug }).populate('author comments');
  if (!assignment) return next();
  res.render('assignment', { assignment, title: assignment.name });
};
