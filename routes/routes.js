const express = require('express');
const router = express.Router();
const User = require('../models/users');
const multer = require('multer');
const { render } = require('ejs');
const fs = require('fs');
const path = require('path');
const users = require('../models/users');

//immage upload
var storage = multer.diskStorage({
    destination: function(req,file,cb){
    cb(null,'./uploads')
    },
    filename:function(req,file,cb){
        cb(null,file.fieldname+"_"+Date.now()+"_"+file.originalname);
    },
})
var upload = multer({
     storage: storage,
}).single("image");

//insert an user into db route
router.post('/add',upload,async (req,res)=>{
    const user = new User({
        name: req.body.name,
        email: req.body.email,
        phone: req.body.phone,
        image: req.file.filename,
    });
    try {
        await user.save();
        req.session.message = {
          type: 'success',
          message: 'User added Successfully!'
        };
        res.redirect('/');
      } catch (err) {
        res.json({ message: err.message, type: 'danger' });
      }
      
});
//get all users route


router.get("/",async (req,res) =>{
    try {
        const users = await User.find().exec();
        res.render('index', {
          title: 'Home Page',
          users: users,
        });
      } catch (err) {
        res.json({ message: err.message });
      }
      
    
});

router.get("/add",(req,res) =>{
    res.render('add_users',{title:'Add Users'});
} );
//edit user route
router.get("/edit/:id", async (req, res) => {
    try {
        const id = req.params.id;
        const user = await User.findById(id);

        if (!user) {
            return res.redirect('/');
        }

        res.render('edit_users', {
            title: "Edit User",
            user: user,
        });
    } catch (err) {
        console.error(err);
        res.redirect('/');
    }
});

//updating user route
router.post('/update/:id',upload,async (req,res)=>{
 let id = req.params.id;
 let new_image = '';
 if(req.file){
    new_image = req.file.filename;
    try{
        (require('fs')).unlinkSync('./uploads/'+req.body.old_image);
    }
    catch(err){
        console.log(err)
    }
 }
 else{
    new_image = req.body.old_image;
 }
 try {
    const id = req.params.id;
    const newImage = req.body.image; // Assuming you have the new image data

    const updatedUser = await User.findByIdAndUpdate(id, {
        name: req.body.name,
        email: req.body.email,
        phone: req.body.phone,
        image: newImage,
    });
    if (req.file) {
        const oldImagePath = path.join(__dirname, './uploads/', req.body.old_image);
    
        try {
            fs.unlinkSync(oldImagePath);
            console.log('Old image deleted successfully');
        } catch (unlinkError) {
            console.error('Error deleting old image:', unlinkError);
        }
    }
    
    if (!updatedUser) {
        return res.json({ message: 'User not found', type: 'danger' });
    }

    req.session.message = {
        type: 'success',
        message: 'User updated successfully',
    };
    res.redirect('/');
} catch (error) {
    res.json({ message: error.message, type: 'danger' });
}
});
//delete 

router.get('/delete/:id', async (req, res) => {
    try {
        const id = req.params.id;
        const user = await users.findByIdAndRemove(id);

        if (!user) {
            return res.json({ message: 'User not found' });
        }

        if (user.image) {
            const imagePath = path.join(__dirname, 'uploads', user.image);

            try {
                fs.unlinkSync(imagePath);
                console.log('Image deleted successfully');
            } catch (unlinkError) {
                console.error('Error deleting image:', unlinkError);
            }
        }

        req.session.message = {
            type: 'info',
            message: 'User deleted successfully',
        };
        res.redirect('/');
    } catch (error) {
        res.json({ message: error.message });
    }
});

//about
router.get('/about', (req, res) => {
    res.render('about', { title: 'About Us' });
});
//Contact
router.get('/contact', (req, res) => {
    res.render('contact', { title: 'Contact' });
});

module.exports = router;

