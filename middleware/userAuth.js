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
           
            if(userData.is_verified==1){
            
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