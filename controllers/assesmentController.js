const mongoose = require('mongoose');
const Assesment = mongoose.model('Assesment');
const Assignment = mongoose.model('Assignment');
const multer = require('multer');
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



// exports.resize = async(req, res, next) => {
//   if(!req.files){
//     return next();
//   }
//   convertImages(req.files);
//   // _.forEach(req.files, (file) => {
//   //   const extension = file.mimetype.split('/')[1];
//   //   const photoName = `${uuid.v4()}.${extension}`
//   //   req.body.photos.push(photoName);
//   //
//   //   new jimp(file.buffer, (err, image) => {
//   //     await image.resize(800, jimp.AUTO);
//   //     await photo.write(`./public/uploads/${photoName}`);
//   //   });
//   //
//   //   //
//   //   //
//   //   // const photo = await jimp.read(file.buffer);
//   //   // await photo.resize(800, jimp.AUTO);
//   //   // await photo.write(`./public/uploads/${req.body.photo}`);
//   // })
//   next();
// }


// var convertImages = (files) => {
//   let promises = [];
//   _.forEach(files, file => {
//     const extension = file.mimetype.split('/')[1];
//     const photoName = `${uuid.v4()}.${extension}`
//     req.body.photos.push(photoName);
//     let promise = new Promise((resolve, reject) => {
//         let type = fileType(file.buffer);
//         new jimp(file.buffer, (err, image) => {
//           image.resize(800, jimp.AUTO)
//                .write(`./public/uploads/${photoName}`);
//         });
//     });
//   });
// }


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

exports.addAssesment = (req, res) => {
  res.render('editAssesment', { title: 'Add Assesment' });
};


exports.createAssesment = async (req, res) => {
  req.body.author = req.user._id;
  req.body.group = req.user.group;
  const assesment = await (new Assesment(req.body)).save();
  req.flash('success', `Successfully Created assesment of ${assesment.name}`);
  res.redirect('/');
  //res.redirect(`/assesment/${assesment.slug}`);
};


exports.getAssesments = async (req, res) => {
  // 1. Query the database for a list of all assesments
  var assesments;
  if(req.user && req.user.group){
     assesments =await Assesment.find({onDate: { $gt: Date.now() }, group: req.user.group}).sort({onDate : 'asc'}) ;
  }
  else
     assesments = null;
  //res.json(assesments);
  res.render('assesments', { title: 'Assesments', assesments});
};


const confirmOwner = (assesment, user) => {
  if(!assesment.author.equals(user._id)) {
    throw Error('You must be the author inorder to edit it!');
  }
};


exports.editAssesment = async (req, res) => {

  // 1. Find the store given the ID
  const assesment = await Assesment.findOne({_id : req.params.id });
  //res.json(assesment);
  // 2. confirm they are the owner of the store
  confirmOwner(assesment, req.user);
  // 3. Render out the edit form so the user can update their store
  res.render('editAssesment', { title: `Edit ${assesment.name}`, assesment });
};



exports.updateAssesment = async (req, res) => {
  // find and update the assesment
  const assesment = await Assesment.findOneAndUpdate({ _id: req.params.id }, req.body, {
    new: true, // return the new assesment instead of the old one
    runValidators: true
  }).exec();
  // Redriect them the assesment and tell them it worked
  req.flash('success', `Successfully updated <strong>${assesment.name}</strong>. <a href="/assesment/${assesment.slug}">View Assesment →</a>`);
  res.redirect(`/assesments/${assesment._id}/edit`);
};



exports.getAssesmentBySlug = async (req, res, next) => {

  const assesment = await Assesment.findOne({ slug: req.params.slug }).populate('author comments');
  if (!assesment) return next();
  res.render('assesment', { assesment, title: assesment.name });
};



exports.searchAssesments = async (req, res) => {
  const assesments = await Assesment.find({
    $text : {
      $search: req.query.q
    }
  }, {
    score: {$meta: 'textScore'}
  })
  .sort({
    score: {$meta: 'textScore'}
  })
  .limit(5);
  res.json(assesments);
}



// exports.searchAssesments = async (req, res) => {
//   let results;
//   const assignments = await Assignment.find({
//     $text : {
//       $search: req.query.q
//     }
//   },{
//       score: {$meta:'textScore'}
//     })
//   .limit(5);
//   const assesments = await Assesment.find({
//     $text : {
//       $search: req.query.q
//     }
//   }, {
//     score: {$meta: 'textScore'}
//   })
//   .limit(5);
//   results.push(assignments);
//   results.push(assesments);
//   results.sort({
//     score: {$meta: 'textScore'}
//   });
//   res.json(results);
// }
