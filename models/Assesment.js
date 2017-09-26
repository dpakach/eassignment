const mongoose = require('mongoose');
mongoose.Promise = global.Promise;
const slug = require('slugs');

const assesmentSchema = new mongoose.Schema({
    dataModel:{
        type: String,
        default: 'assesment'
    },
    name: {
        type: String,
        trim: true,
        required: 'Please enter a subject name'
    },
    slug: String,
    marks: Number,
    group: {
        type: mongoose.Schema.ObjectId,
        ref: 'Group',
        required : true,
    },
    description: {
        type: String,
        trim: true,
        required: 'You must supply the discription about the assesment'
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
    },
    completed: {
        type: Boolean,
        default: false,
        required: true
    }
}, {
    toJSON: {virtuals: true},
    toObject: {virtuals: true}
});
assesmentSchema.index({
    name: 'text',
    description: 'text',
});

assesmentSchema.pre('save',  async function(next) {
    if(!this.isModified('name')){
        return next();
    };
    this.slug = slug(this.name);
    const slugRegEx = new RegExp(`^(${this.slug})((-[0-9]*$)?)$`, 'i');
    const assesmentsWithSlug = await this.constructor.find({slug: slugRegEx});
    if(assesmentsWithSlug.length){
        this.slug= `${this.slug}-${assesmentsWithSlug.length + 1}`;
    }
    next();
});


assesmentSchema.virtual('comments', {
    ref: 'Comment',
    localField: '_id',
    foreignField: 'data'
});

module.exports = mongoose.model('Assesment', assesmentSchema);
