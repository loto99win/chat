const express = require('express');
const bodyParser = require('body-parser');
const router = express();
const upload = require('../middlewares/multer');
const userControllers = require('../controllers/userControllers');
const session = require('express-session');
const { SESSION_SECRET } = process.env;

const auth = require('../middlewares/auth');
const authManager = require('../middlewares/authManager');

router.use(session({
    secret: SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: {
        secure: false,
        httpOnly: true,
        maxAge: 60*1000*60*24
    }
}));

router.use(bodyParser.json({ limit: '50mb' }));
router.use(bodyParser.urlencoded({ extended: true, limit: '50mb' }));
router.use(express.static('public'));
router.set('view engine', 'ejs');
router.set('views', './views');

// home page
router.get('/', userControllers.adminOrHomePage);

// signup with
router.get('/signup', auth.isSignout, userControllers.getSignupWith);

router.get('/signup-with-email', auth.isSignout, userControllers.getSignupWithEmail);
router.post('/signup-with-email', upload.single('avatar'), userControllers.signup);

router.get('/signin', auth.isSignout, userControllers.getSignin);
router.post('/signin', userControllers.signin);

// admin
router.get('/admin', auth.isSignin, userControllers.getAdmin);

// signout
router.get('/signout', auth.isSignin, userControllers.signout);
router.get('/signoutManager', authManager.isSignin, userControllers.signoutManager);

// verify email
router.get('/verify', userControllers.verifyMail);

// Forget Password
router.get('/forget', userControllers.getForgetPassword);
router.post('/forget', userControllers.forgetPassword);

// verify email forget password
router.get('/forget-password', userControllers.forgetPasswordLoad);
router.post('/forget-password', userControllers.resetPassword);

// manager 
router.get('/manager', authManager.isSignin, userControllers.getManager);

// update all documents in User
router.get('/update', userControllers.updateMany);


// please check email to reset your password
router.get('/check-email', userControllers.checkEmailToResetPassword);

// redirect to http://localhost:2000
// router.get('*', (req, res) => {
//     res.redirect('/');
// });

module.exports = router;