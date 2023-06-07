const express = require("express");
require("./db/mongoose");

const userRouter = require("./router/user") //user router
const taskRouter = require("./router/task") //task router

const app = express();

// const port = 3000;
const port = process.env.PORT //this port is configured in ./config/dev.env for security purposes

// WITHOUT MIDDLEWARE = route -> route handler
// WITH MIDDLEWARE = route -> process -> route handler

//THIS IS MIDDLEWARE
// app.use((req,res,next)=>{
//   if(req.method){
//     res.status(503).send('Maintenance is ongoing. Please comeback later') // do something
//   }else{
//     next() //prceed to route handler
//   }
// })



app.use(express.json()); //automatically transform received JSON data into object data
app.use(userRouter) //user router 
app.use(taskRouter) //task router

app.listen(port, () => {
  console.log("Server is up on port " + port);
});

// const Task = require('./models/task')
// const User = require('./models/user')

// const main = async () => {
  // const task = await Task.findById('647b26244283d631ccaa7921')
  // await task.populate('owner').execPopulate() //prints the list of tasks and its owner
  // console.log(task)

//   const user = await User.findById('647b1dd0aadd663ea8ad7fc1')
//   await user.populate('tasks').execPopulate()
//   console.log(user.tasks)
// }

// main();