const router = require('express').Router()
const {User, Channel, Pix} = require('../db/models')
const {needsSuperAdmin, needsAdmin, needsloggedIn} = require('./middlewareValidation')
const nodemailer = require('nodemailer');
const smtpTransport = nodemailer.createTransport({
  service: 'SendGrid',
  auth: {
    user: process.env.SENDGRID_API_USER,
    pass: process.env.SENDGRID_API_KEY
  }
});
module.exports = router

router.get('/', async (req, res, next) => {
  try {
    const users = await User.findAll({
      attributes: ['id', 'email']
    })
    res.json(users)
  } catch (err) {
    next(err)
  }
})

.get('/all', (req, res, next)=>{
  User.findAll({
    order: [['createdAt', 'DESC']],
  })
  .then((items)=>{
    res.status(200).json(items)
  })
})

.get('/:id', async (req, res, next) => {
  try {
    const user = await User.findByPk(req.params.id, {include: [{model:Channel}, {model:Pix, as:'profilePix'}, {model:Pix, as:'creations'}]})
    res.json(user)
  } catch (err) {
    next(err)
  }
})


.post('/profilePix', async (req, res, next) => {
  try {
    var pix = await Pix.findByPk(req.body.id)
    await req.user.setProfilePix(pix)
    res.json(pix)
  } catch (err) {
    next(err)
  }
})

.post('/forgot', function(req, res, next) {
  async.waterfall([
    function(done) {
      crypto.randomBytes(20, function(err, buf) {
        var token = buf.toString('hex');
        done(err, token);
      });
    },
    function(token, done) {
      User.findOne({ email: req.body.email }, function(err, user) {
        if (!user) {
          req.flash('error', 'No account with that email address exists.');
          return res.redirect('/forgot');
        }

        user.resetPasswordToken = token;
        user.resetPasswordExpires = Date.now() + 3600000; // 1 hour

        user.save(function(err) {
          done(err, token, user);
        });
      });
    },
    function(token, user, done) {
      var mailOptions = {
        to: user.email,
        from: 'admin@tvee2.com',
        subject: 'TVee2 Password Reset',
        text: 'You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n' +
          'Please click on the following link, or paste this into your browser to complete the process:\n\n' +
          'http://' + req.headers.host + '/reset/' + token + '\n\n' +
          'If you did not request this, please ignore this email and your password will remain unchanged.\n'
      };
      smtpTransport.sendMail(mailOptions, function(err) {
        req.flash('info', 'An e-mail has been sent to ' + user.email + ' with further instructions.');
        done(err, 'done');
      });
    }
  ], function(err) {
    if (err) return next(err);
    res.redirect('/forgot');
  });
})

.get('/reset/:token', function(req, res) {
  User.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, function(err, user) {
    if (!user) {
      req.flash('error', 'Password reset token is invalid or has expired.');
      return res.redirect('/forgot');
    }
    res.json(user)
  });
})

.post('/reset/:token', function(req, res) {
  async.waterfall([
    function(done) {
      User.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, function(err, user) {
        if (!user) {
          req.flash('error', 'Password reset token is invalid or has expired.');
          return res.redirect('back');
        }

        user.password = req.body.password;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;

        user.save(function(err) {
          req.logIn(user, function(err) {
            done(err, user);
          });
        });
      });
    },
    function(user, done) {
      var mailOptions = {
        to: user.email,
        from: 'admin@tvee2.com',
        subject: 'TVee2 Password Reset',
        text: 'Hello,\n\n' +
          'This is a confirmation that the password for your account ' + user.email + ' has just been changed.\n'
      };
      smtpTransport.sendMail(mailOptions, function(err) {
        req.flash('success', 'Success! Your password has been changed.');
        done(err);
      });
    }
  ], function(err) {
    res.redirect('/');
  });
})

.post('/resetme', function(req, res) {
  var user = req.user
  user.password = req.body.password
  user.save()
  .then((res)=>{
    res.flash("updated password")
  })
  .catch((err) => {
    res.flash(err)
  })
})

.put('/password', (req, res, next) => {
  User.findOne({where:{id:req.user.id}})
  .then((user)=>{
    user.password = req.body.password;
    user.save()
  })
  .then((out)=>{res.sendStatus(200)})
  .catch(next)
})



.put('/lock/:id', needsAdmin, async (req, res, next) => {
  User.findByPk(req.params.id)
  .then((user) => {
      user.locked = true
      user.save()
  })
})

.put('/unlock/:id', needsAdmin, async (req, res, next) => {
  User.findByPk(req.params.id)
  .then((user) => {
      user.locked = false
      user.save()
  })
})

.put('/elevate/:id', needsSuperAdmin, async (req, res, next) => {
  if(!req.user.superAdmin){
    return res.json({message:"operation disallowed"})
  }else{
    User.findByPk(req.params.id)
    .then((user) => {
      user.admin = true
      user.save()
    })
  }
})

.put('/demote/:id', needsSuperAdmin, async (req, res, next) => {
  if(!req.user.superAdmin){
    return res.json({message:"operation disallowed"})
  }else{
    User.findByPk(req.params.id)
    .then((user) => {
      user.admin = false
      user.save()
    })
  }
})

.delete('/:id', needsSuperAdmin, (req, res, next) => {
  User.findOne({
    where: {id: req.params.id}
  })
  .then((user) => {
    if(!req.user.superAdmin || user.id != req.user.id){
      throw new Error("forbidden")
    }
    if (user) {
      return user.destroy()
    } else {
      throw new Error('No user found with matching id.')
    }
  })
  .then((ret) => {
    res.status(200).json(ret)
    return
  })
  .catch((err) => {
    console.log(err)
    res.status(500).json(err);
  })
})
