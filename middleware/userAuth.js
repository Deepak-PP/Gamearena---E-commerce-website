const User = require('../model/userModel')

const isLogout=async(req,res,next)=>{
    try {
        if(req.session.user_id){
           
            res.redirect('/home')
            
        }else{
            next()
            
            console.log("sessionout");
            
        }
        
    } catch (error) {
        console.log(error.message);
        
    }
}

const isLogin = async (req,res,next)=>{
    try {
            const userData = await User.findOne({})
            console.log('987987987',userData,'987987');
            if(userData.is_verified==1){
                console.log('987987987','ivideeeeeeeee','987987')
                next()
            }else{
                console.log("nosessionhome");
                req.session.destroy()
                res.redirect('/login')
            }

    } catch (error) {
        console.log(error.message);
        
    }
}

module.exports={
    isLogout,
    isLogin
}