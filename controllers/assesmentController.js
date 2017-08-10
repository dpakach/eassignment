const mongoose = require('mongoose');
const Assesment = mongoose.model('Assesment');
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
  },
  filename: function(req, file, cb){


    const extension = req.file.mimetype.split('/')[1];
    const p = `${uuid.v4()}.${extension}`;

    cb(null,p);
  }
};



exports.imgProcess = (req, res) => {
  convertImgs(req.files).then(exports.upload);

}


exports.homePage = (req, res) => {
  res.render('index');
};



exports.upload = multer(multerOptions).single('photos');









const convertImgs = (files) =>{

        let promises = [];

        _.forEach(files, (file)=>{

            //Create a new promise for each image processing
            let promise = new Promise((resolve, reject)=>{

              //Resolve image file type
              let type = fileType(file.buffer);

              //Create a jimp instance for this image
              new Jimp(file.buffer, (err, image)=>{

                //Resize this image
                image.resize(512, 512)
                    //lower the quality by 90%
                    .quality(10);
                    // .getBuffer(type.mime, (err, buffer)=>{
                    //     //Transfer image file buffer to base64 string
                    //     let base64Image = buffer.toString('base64');
                    //     let imgSrcString = "data:" + type.mime + ';base64, ' + base64Image;
                    //     //Resolve base94 string
                    //     resolve(imgSrcString);
                    // });
                  resolve(image);
                });
            });

            promises.push(promise);
        });

        //Return promise array
        return Promise.all(promises);
    }













const resize = async (req, res, next) => {
  // check if there is no new file to resize
  if (!req.file) {
    next(); // skip to the next middleware
    return;
  }
  // req.files.map(function  (file) {
  //   const ext = file.mimetype.split('/')[1];
  //   const p = `${uuid.v4()}.${ext}`;
  //   req.body.photos.push(p);
  //   const photo = await jimp.read(file.buffer);
  //   await photo.resize(800, jimp.AUTO).quality(20);
  //   await photo.write(`./public/uploads/${p}`);
  // });

    // const extension = req.file.mimetype.split('/')[1];
    // req.body.photo = `${uuid.v4()}.${extension}`;
    // now we resize
    // const photo = await jimp.read(req.file.buffer);
    jimp.read(req.files.buffer, function(err, image){
      image.resize(800, jimp.AUTO);
      image.write(`./public/uploads/${req.body.photo}`);
    })

    //await photo.resize(800, jimp.AUTO);
    //await photo.write(`./public/uploads/${req.body.photo}`);

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
  else assesments = null;
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
