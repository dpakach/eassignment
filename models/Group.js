const mongoose = require('mongoose');
mongoose.Promise = global.Promise;
const slug = require('slugs');

const groupSchema = new mongoose.Schema({
    dataModel:{
        type: String,
        default: 'groups'
    },
    name: {
        type: String,
        trim: true,
        required: 'Please enter a subject name'
    },
    slug: String,
    description: {
        type: String,
        trim: true,
        required: 'You must supply some discripiton about the assignment'
    },
    author: {
        type: mongoose.Schema.ObjectId,
        ref: 'User'
    }
});



groupSchema.pre('save',  async function(next) {
    if(!this.isModified('name')){
        return next();
    };
    this.slug = slug(this.name);
    const slugRegEx = new RegExp(`^(${this.slug})((-[0-9]*$)?)$`, 'i');
    const groupWithSlug = await this.constructor.find({slug: slugRegEx});
    if(groupWithSlug.length){
        this.slug= `${this.slug}-${groupWithSlug.length + 1}`;
    }
    next();
});
groupSchema.virtual('users', {
    ref: 'User',
    localField: '_id',
    foreignField: 'group'
});

function autoPopulate(next) {
    this.populate('users author');
    next();
}

groupSchema.pre('find', autoPopulate);
groupSchema.pre('findOne',autoPopulate );


module.exports = mongoose.model('Group', groupSchema);
