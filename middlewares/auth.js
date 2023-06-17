const isSignin = async(req, res, next) => {

    try {
        if(req.session.user) {
            
        } else {
            res.redirect('/signin');
        }

        next();

    } catch(error) {
        console.log('Lỗi Rồi Ba Ơi: '+error);
    }
}

const isSignout = async(req, res, next) => {

    try {

        if(req.session.user) {

            res.redirect('/admin');
        }

        next();

    } catch(error) {
        console.log(error);
    }
}

module.exports = {
    isSignin, isSignout
}