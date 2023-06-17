const isSignin = async(req, res, next) => {

    try {
        if(req.session.manager) {
            
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

        if(req.session.manager) {

            res.redirect('/manager');
        }

        next();

    } catch(error) {
        console.log(error);
    }
}

module.exports = {
    isSignin, isSignout
}