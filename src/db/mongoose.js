const mongoose = require('mongoose')

mongoose.connect(process.env.MONGODB_URL, {
    //useNewURLParser: true,
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true
})

//==================

// const Tasks = mongoose.model('Tasks', {
//     description: {
//         type: String,
//         trim: true,
//         required: true
//     },
//     completed: {
//         type: Boolean,
//         required: false,
//         default: false
//     }
// })

// const task = new Tasks({description: 'Learn Mongoose Library Further'})

// task.save().then(()=>{
//     console.log(task)
// }).catch((error)=>{
//     console.log(error)
// })

