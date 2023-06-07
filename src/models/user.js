const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const Task = require('./task')

const userSchema = new mongoose.Schema({ //use schema to take advantage of middleware
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        unique: true,
        required: true,
        trim: true,
        lowercase: true,
        validate(value){
            if(!validator.isEmail(value)){
                throw new Error('Email is invalid')
            }
        }
    },
    age: {
        type: Number,
        default: 0,
        validate(value){
            if(value<0){
                throw new Error('Age must be a positive number')
            }
        }
    },
    password: {
        type: String,
        required: true,
        minlength: 7,
        trim: true,
        validate(value){
            if(value.toLowerCase().includes("password")){
                throw new Error('Password must not contain the word "password"')
            }
        }
    },
    tokens: [{
        token: {
            type: String,
            required: true
        }
    }],
    avatar: {
        type: Buffer,
        required: false
    }
}, {
    timestamps: true, // EVERYTIME A NEW USER IS CREATED, createdAt and updatedAt fields will be added
})

//USE VIRTUAL TO JOIN 2 COLLECTIONS
userSchema.virtual('tasks', {
    ref: 'Task',
    localField: '_id',
    foreignField: 'owner'
})

//HIDE PRIVATE DATA SUCH AS PASSWORD AND TOKENS
userSchema.methods.toJSON = function () {
    //'this' means user document
    const user = this.toObject()
    delete user.password
    delete user.tokens
    delete user.avatar

    return user
}

//LOGIN
userSchema.statics.findByCredentials = async (email, password) => {
    const user = await User.findOne({email: email})
    if(!user){
        throw new Error("Unable to login")
    }

    const isMatch = await bcrypt.compare(password, user.password)
    if(!isMatch){
        throw new Error("Unable to login")
    }

    return user
}

//GENERATE JSON WEB TOKEN
 userSchema.methods.generateAuthToken = async function () {
    //'this' means a user document
    const token = jwt.sign({ id: this._id.toString() },process.env.JWT_SECRET)

    this.tokens = this.tokens.concat({token: token})
    await this.save()
    return token
 }

//HASH PASSWORD BEFORE SAVING TO DATABASE
userSchema.pre('save', async function(next){
    //const user = this //NOTE : use THIS to point in a document thats why i am not using arrow function
    if(this.isModified('password')){
        this.password = await bcrypt.hash(this.password, 8)
    }

    next() // call function when running code is done
})

//DELETE USER TASKS WHEN USER IS REMOVED
userSchema.pre('remove', async function (next) {
    const user = this
    await Task.deleteMany({owner: user._id})
    next();
})

const User = mongoose.model('User', userSchema)

module.exports = User
