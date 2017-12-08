const mongoose = require('mongoose');
mongoose.Promise = global.Promise;
const slug = require('slugs');


const assignmentSchema = new mongoose.Schema({
    dataModel:{
        type: String,
        default: 'assignment'
    },
    name: {
        type: String,
        trim: true,
        required: 'Please enter a subject name'
    },
    slug: String,
    group: {
        type: mongoose.Schema.ObjectId,
        ref: 'Group',
        required : true
    },
    description: {
        type: String,
        trim: true,
        required: 'You must supply some discripiton about the assignment'
    },
    chapters : {
        type: [String],
        trim: true
    },
    photo: [String],
    created: {
        type: Date,
        default: Date.now
    },
    onDate: {
        type: Date,
        required: true
    },
    author: {
        type: mongoose.Schema.ObjectId,
        ref:  'User',
        required: 'You must define an author'
    }
}, {
    toJSON: {virtuals: true},
    toObject: {virtuals: true}
});

assignmentSchema.pre('save',  async function(next) {
    if(!this.isModified('name')){
        return next();
    };
    this.slug = slug(this.name);
    const slugRegEx = new RegExp(`^(${this.slug})((-[0-9]*$)?)$`, 'i');
    const assignmentsWithSlug = await this.constructor.find({slug: slugRegEx});
    if(assignmentsWithSlug.length){
        this.slug= `${this.slug}-${assignmentsWithSlug.length + 1}`;
    }
    next();
});


assignmentSchema.virtual('comments', {
    ref: 'Comment',
    localField: '_id',
    foreignField: 'data'
});


module.exports = mongoose.model('Assignment', assignmentSchema);
