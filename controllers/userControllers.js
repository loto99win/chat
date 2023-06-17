const User = require('../models/userModel');
const bcrypt = require('bcrypt');
const randomString = require('randomstring');

const nodemailer = require('nodemailer');
const { render } = require('../routes/userRoute');

const userControllers = {

    // manager page
    getManager: async(req, res) => {

        try {

            const allUsers = await User.find();

            res.render('manager', { users: allUsers });

        } catch(error) {
            console.log(error.message);
        }
    },

    // home page
    getHomePage: async(req, res, next) => {
        try {
            res.render('home');
        } catch(error) {
            console.log(error);
        }
    },

    // Signup With (ex: facebook, gmail, twitter, github)
    getSignupWith: async(req, res, next) => {

        try {
            res.render('signupwith');
        } catch(error) {
            console.log(error);
        }
    },
    getSignupWithEmail: async(req, res, next) => {
        try {
            res.render('signupwithemail', {
                message: ''
            });
        } catch(err) {
            console.log(err);
        }
    },
    signup: async(req, res, next) => {
        
        try {

            // find email exists
            const email = req.body.email;
            const result = await User.findOne({ email: email });
            if(result) {

                // return message email exists
                res.render('signupwithemail', { message: 'Email already in use'});

            } else {

                const hashPassword = await bcrypt.hash(req.body.password, 10);
                const user = new User({
                    name: req.body.name,
                    email: req.body.email,
                    avatar: '/images/'+req.file.filename,
                    password: hashPassword
                });

                const userData = await user.save();

                if(userData) {

                    sendVerifyMail(req.body.name, req.body.email, userData._id);
                    res.render('signupwithemail', { message: 'Signup Success, Please! Verify Email.'});
                } else {

                    res.render('signupwithemail', { message: 'Signup Failed'});
                }

            }
        } catch(error) {
            console.log(error);
            res.render('signupwithemail', { message: 'Something went wrong!'});
        }

    },

    verifyMail: async(req, res) => {
        try {
            const updateInfo = await User.updateOne({ _id: req.query.id}, { $set: { isVerified: 1 }});
            console.log(updateInfo);
            res.render('email-verified');
        } catch(error) {
            console.log(error);
        }
    },

    getSignin: async (req, res, next) => {
        res.render('signin');
    },

    signin: async (req, res, next) => {
        // try {
        //     const email = req.body.email;
        //     const password = req.body.password;

        //     const resultUserByEmail = await User.findOne({ email: email });

        //     // I. Nếu tồn tại email
        //     if(resultUserByEmail) {

        //         // compare password with password has hash
        //         const passwordMatch = bcrypt.compareSync(password, resultUserByEmail.password);

        //         // II. Nếu Khớp Password
        //         if(passwordMatch) {
        //             // res.render('signin', {
        //             //     ss: 'Singin Success...'
        //             // });
                    
        //             if(resultUserByEmail.isVerified == 1) {

        //                 if(resultUserByEmail.isBlocked == 0) {
        //                     req.session.user = resultUserByEmail;
        //                     // console.log(req.session.user);
        //                     const userActive = await User.findOneAndUpdate(
        //                         { _id: resultUserByEmail._id},
        //                         { $set: { isActive: 1 }},
        //                         { returnOriginal: false }
        //                     );
        //                     console.log('User already online ' + userActive.isActive);
        //                     res.redirect('/admin');
        //                 } else {
        //                     res.render('signin', {
        //                         sf: 'Tài khoản đã bị khóa.'
        //                     });
        //                 }
        //             } else {
        //                 res.render('signin', {
        //                     sf: 'Please! verify email.'
        //                 });
        //             }

        //         }
        //         // II. Nếu Không Khớp Password
        //         else {

        //             const times = resultUserByEmail.times;

        //             console.log('Số lần signin failed: ' + times);

        //             if(times < 5) {
        //                 const result = await User.findOneAndUpdate(
        //                     { _id: resultUserByEmail._id },
        //                     { $inc: { 'times': 1 }},
        //                     { returnOriginal: false }
        //                 );


    
        //                 console.log(result);
        //                 res.render('signin', {
        //                     sf: 'Singin Failed...'+ result.times
        //                 });
        //             } else {
        //                 const result = await User.findOneAndUpdate(
        //                     { _id: resultUserByEmail._id },
        //                     { $set: { isBlocked: 1 }},
        //                     { returnOriginal: false }
        //                 );

        //                 console.log('Tài khoản đã bị khóa: ' + result.isBlocked);
        //                 res.render('signin', {
        //                     sf: 'Tài khoản đã bị khóa.'
        //                 });
        //             }

        //         }
                
        //     } 
        //     //I. Nếu không tồn tại email
        //     else {
        //         res.render('signin', {
        //             error1: 'Email or password invalid'
        //         });
        //     }


        // } catch(error) {
        //     console.log(error);
        // }

        try {

            // get email input
            const emailInput = req.body.email;

            // tìm user by email
            const findUserByEmail = await User.findOne({ email: emailInput });

            // I. Email Tồn Tại
            if(findUserByEmail){

                // kiểm tra xem email đã xác thực hay chưa
                const isVerified = findUserByEmail.isVerified;

                // II. Email đã xác thực
                if(isVerified) {
                    
                    // kiểm tra xem tài khoản có bị khóa hay không
                    const isBlocked = findUserByEmail.isBlocked;

                    // III. Tài Khoản Không Bị Khóa
                    if(isBlocked == 0) {
                        
                        // get password input
                        const passwordInput = req.body.password;
                        
                        // compare password with hash password
                        const isPasswordMatched = await bcrypt.compare(passwordInput, findUserByEmail.password);

                        // IV. Password Matched
                        if(isPasswordMatched) {

                            // reset biến times về 0
                            await User.findOneAndUpdate(
                                { _id: findUserByEmail._id },
                                { $set: { times: 0 }},
                                { returnOriginal: false }
                            );

                            // set isActive is 1
                            // await User.findOneAndUpdate(
                            //     { _id: findUserByEmail._id },
                            //     { $set: { isActive: 1 }},
                            //     { returnOriginal: false }
                            // );

                            // V. Là admin
                            if(findUserByEmail.isAdmin == 1) {
                                // set session
                                req.session.manager = findUserByEmail;
                                res.redirect('/manager');
                            }
                            // V. Không là admin
                            else {
                                // set session
                                req.session.user = findUserByEmail;
                                res.redirect('/admin');
                            }

                        }
                        // IV. Password Not Matched
                        else {

                            // mỗi lần mật khẩu sai thì tăng biến times 1 đơn vị
                            const user = await User.findOneAndUpdate(
                                { _id: findUserByEmail._id },
                                { $inc: { 'times': 1 }},
                                { returnOriginal: false }
                            );

                            const times = user.times;

                            // kiểm tra số lần signin failed times
                            if(times < 5) {
                                res.render('signin', { sf: 'Email or Password invalid: '+ times });
                            } else {
                                
                                const user = await User.findOneAndUpdate(
                                    { _id: findUserByEmail._id },
                                    { $set: { isBlocked: 1 }},
                                    { returnOriginal: false }
                                );

                                res.render('signin', { sf: 'Tài Khoản Đã Bị Khóa'});
                            }

                        }
                    }
                    // III. Tài Khoản Đã Bị Khóa
                    else {
                        res.render('signin', { sf: 'Tài Khoản Đã Bị Khóa' });
                    }
                }
                // II. Email chưa xác thực
                else {
                    res.render('signin', { sf: 'Email need to verified.' });
                }
            }
            // I. Email Không Tồn Tại
            else {
                res.render('signin', { sf: 'Email or Password invalid' });
            }

        } catch(error) {
            console.log(error.message);
            res.render('signin', { message: 'Something went wrong.'});
        }
    },

    getAdmin: async(req, res) => {
        // res.render('admin');
        try {
            const users = await User.find({
                _id: {
                    $nin:[req.session.user._id]
                }
            });
            res.render('admin', {
                users: users,
                user: req.session.user
            });
        } catch (error) {
            console.log(error);
        }
    },

    admin: async(req, res) => {
        res.redirect('/admin');
    },

    // User Signout
    signout: async(req, res) => {

        try {
            
                // tìm user để đưa isActive về 0
                const userActive = await User.findOneAndUpdate(
                    { _id: req.session.user._id },
                    { $set: { isActive: 0 }},
                    { returnOriginal: false }
                );

                req.session.destroy();
                res.redirect('/signin');
        } catch(error) {
            console.log('Lỗi Rồi Ba Ơi: '+error.message);
        }
    },

    // Manager Signout
    signoutManager: async(req, res) => {

        try {
            
                // tìm manager để đưa isActive về 0
                const managerActive = await User.findOneAndUpdate(
                    { _id: req.session.manager._id },
                    { $set: { isActive: 0 }},
                    { returnOriginal: false }
                );

                req.session.destroy();
                res.redirect('/signin');
        } catch(error) {
            console.log('Lỗi Rồi Ba Ơi: '+error.message);
        }
    },

    // get admin or home page
    adminOrHomePage: async (req, res) => {

        // nếu tồn tại req.session.user
        if(req.session.user) {
            res.redirect('/admin');
        }
        // nếu không tồn tại req.session.user
        else {
            res.render('home');
        }
    },

    // Get Form Forget Password
    getForgetPassword: async (req, res) => {
        res.render('forget');
    },
    
    // Xử Lý Forget Password
    forgetPassword: async (req, res) => {
         try {

            const email = req.body.email;
            console.log(email);

            // Tìm email có tồn tại hay không ?
            const result = await User.findOne({ email: email });

            // I. Email Tồn Tại
            if(result) {
                
                // II. Email not is verified
                if(result.isVerified === 0) {
                    res.render('forget', { message: 'Email not is verified.' });
                }
                // II. Email is verified
                else {

                    const ranString = randomString.generate();

                    const updateData = await User.updateOne({email:email}, {$set:{token:ranString}});

                    sendResetPasswordSendMail(result.name,result.email,ranString);

                    // res.render('forget',
                    // {
                    //     message: 'Please check your email to reset password.'
                    // });

                    res.redirect('/check-email');
                }
            }
            // II. Email Không Tồn Tại
            else {
                res.render('forget', { message: 'Email không hợp lệ.'});
            }

         } catch(error) {
            console.log(error.message);
         }
    },

    // please check email to reset your password
    checkEmailToResetPassword: async(req, res) => {
        try {

            res.render('check-email-to-reset-password');
        } catch(error) {
            console.log(error.message);
        }
    },

    // Reset Password
    resetPassword: async(req, res) => {

        try {

            const password = req.body.password;
            const user_id = req.body.user_id;

            console.log(user_id);

            const hashPassword = await bcrypt.hash(password, 10);

            const result = await User.findOneAndUpdate(
                { _id: user_id },
                { $set: { password: hashPassword, token:'' }}
            );

            console.log(result);
            res.redirect('/signin');

        } catch(error) {
            console.log(error.message);
        }
    },

    // update all documents
    updateMany: async(req, res) => {
        const result = await User.updateMany({ $set: { token: '' }});
        res.send(result);
    },

    forgetPasswordLoad: async(req, res) => {

        try {

            const token = req.query.token;
            const tokenData = await User.findOne({token: token});

            //I. tìm thấy token
            if(tokenData) {
                res.render('forget-password', {user_id:tokenData._id});
            }
            //I. Không tìm thấy token
            else {
                res.render('404', { message: 'Token invalid.'});
            }

        } catch(error) {
            console.log(error.message);
        }
    }
}

// veryfy mail
const sendVerifyMail = async(name, mail, userId) => {

    try {

        const transporter = nodemailer.createTransport({
            
            host: 'smtp.gmail.com',
            port: 587,
            secure: false,
            requireTLS: true,
            auth: {
                user: 'phamhongbinh19950306@gmail.com',
                pass: 'tmvltyiovejwkwwk'
            }
        });

        const mailOptions = {
            from: 'phamhongbinh19950306@gmail.com',
            to: mail,
            subject: 'For Verification Mail',
            html: '<p>Hii '+name+', please click here to <a href="http://localhost:2000/verify?id='+userId+'">Verify</a> your mail.</p>'
        };

        transporter.sendMail(mailOptions, function(error, info) {
            if(error){
                console.log(error);
            } else {
                console.log('Email has been sent: -', info.response);
            }
        });
    } catch(error) {
        console.log(error);
    }
}

// for reset password send mail
const sendResetPasswordSendMail = async(name, mail, token) => {

    try {

        const transporter = nodemailer.createTransport({
            
            host: 'smtp.gmail.com',
            port: 465,
            secure: false,
            requireTLS: true,
            auth: {
                user: 'phamhongbinh19950306@gmail.com',
                pass: 'tmvltyiovejwkwwk'
            }
        });

        const mailOptions = {
            from: 'phamhongbinh19950306@gmail.com',
            to: mail,
            subject: 'For Reset Password',
            html: '<p>Hii '+name+', please click here to <a href="http://localhost:2000/forget-password?token='+token+'">Reset</a> your password.</p>'
        };

        transporter.sendMail(mailOptions, function(error, info) {
            if(error){
                console.log(error);
            } else {
                console.log('Email has been sent: -', info.response);
            }
        });
    } catch(error) {
        console.log(error);
    }
}

module.exports = userControllers;
