const express = require("express");
const User = require("../models/user");
const auth = require("../middleware/auth");
const sharp = require('sharp')
const multer = require("multer");
const {sendWelcomeEmail} = require('../email/account')

const upload = multer({
  //dest: "avatars", //file upload destination
  limits: { fileSize: 1000000 }, //file size limit
  fileFilter(req, file, cb) { // file filter
      if(!file.originalname.match(/\.(jpe?g|png)$/i)){
          return  cb(new Error('File must be a JPG, JPEG , PNG'))
      }

      cb(undefined, true)
    
      // cb(new Error('File must be a PDF'))
      // cb(undefined, true)
      // cb(undefined, false)
   },
}); 
const router = express.Router();

router.post("/users", async (req, res) => {
  const user = new User(req.body);

  try {
    await user.save();
    sendWelcomeEmail(user.email, user.name)
    const token = await user.generateAuthToken();
    res.status(201).send({ user, token });
  } catch (error) {
    res.status(400).send(error);
    console.log(error)
  }

  // user.save().then(()=>{
  //     res.status(201).send(user)
  // }).catch((error)=>{
  //     res.status(400).send(error)
  // })
});

router.post("/users/login", async (req, res) => {
  try {
    const user = await User.findByCredentials(
      req.body.email,
      req.body.password
    );
    const token = await user.generateAuthToken();
    res.send({ user, token });
  } catch (error) {
    res.status(400).send();
  }
});

router.post("/users/logout", auth, async (req, res) => {
  try {
    req.user.tokens = req.user.tokens.filter((token) => {
      return token.token !== req.token;
    });

    await req.user.save();
    res.send();
  } catch (error) {
    res.status(500).send();
  }
});

router.post("/users/logoutAll", auth, async (req, res) => {
  try {
    req.user.tokens.splice(0, req.user.tokens.length);
    await req.user.save();
    res.send();
  } catch (error) {
    res.status(500).send();
  }
});

// router.get("/users", auth, async (req, res) => {
//   try {
//     const users = await User.find({});
//     res.send(users);
//   } catch (error) {
//     res.status(500).send(e);
//   }

//   // User.find({}).then((users)=>{
//   //     res.send(users)
//   // }).catch((e)=>{
//   //     res.status(500).send(e)
//   // })
// });

router.get("/users/me", auth, async (req, res) => {
  res.send(req.user);
});

// router.get("/users/:id", async (req, res) => {
//   const _id = req.params.id;

//   try {
//     const user = await User.findById(_id);
//     if (!user) {
//       return res.status(404).send();
//     }
//     res.send(user);
//   } catch (error) {
//     res.status(500).send(error);
//   }

// User.findById(_id).then((user)=>{
//     if(!user){
//         return res.status(404).send()
//     }

//     res.send(user)
// }).catch((e)=>{
//     res.status(500).send(e)
// })
// });

router.patch("/users/me", auth, async (req, res) => {
  const updates = Object.keys(req.body);
  const allowedUpdates = ["name", "email", "age", "password"];
  const isAllowed = updates.every((update) => allowedUpdates.includes(update));

  if (!isAllowed) {
    return res.status(400).send();
  }

  try {
    //Use this way to run middleware when updating data
    const user = await req.user;
    updates.forEach((update) => (user[update] = req.body[update]));
    await user.save();

    //This method is bypassed in middleware
    //const user = await User.findByIdAndUpdate(req.params.id, req.body, {
    //     new: true,
    //     runValidators: true,
    //   });
    res.send(user);
  } catch (error) {
    res.status(500).send(error);
  }
});

router.delete("/users/me", auth, async (req, res) => {
  try {
    await req.user.remove();
    res.send(req.user);
  } catch (error) {
    res.status(500).send();
  }
});

//UPLOAD IMAGE
router.post("/users/me/avatar",auth, upload.single("avatar"), async (req, res) => {
  // req.user.avatar = req.file.buffer
  const buffer = await sharp(req.file.buffer).resize({width: 250, height: 250}).png().toBuffer() //convert all images uploaded to become png and resize
  req.user.avatar = buffer //instead of req.file.buffer
  await req.user.save()
  res.status(200).send();
}, (error, req, res, next)=>{ //use this callback to send the error thrown from multer 
  res.status(400).send({error: error.message})
});

//DELETE IMAGE AVATAR
router.delete("/users/me/avatar", auth, upload.single("avatar"), async (req,res)=>{
  req.user.avatar = undefined
  await req.user.save()
  res.status(200).send()
}, (error, req, res, next)=>{
  res.status(400).send({error: error.message})
})

//GET IMAGE AVATAR
router.get("/users/:id/avatar", async (req,res) => {
  try {
    const user = await User.findById(req.params.id)

    if(!user || !user.avatar){
      throw new Error()
    }

    res.set('Content-Type', 'image/png')
    res.send(user.avatar)
  } catch (e) {
    res.status(400).send()
  }
})

module.exports = router;
