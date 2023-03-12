const isLogin=async(req,res,next)=>{
    try {
        if(req.session.admin_id){
           
            next()
            
        }else{
           res.redirect('/admin/loginadmin')
            
        }
        
    } catch (error) {
        console.log(error.message);
        
    }
}


const isLogout=async(req,res,next)=>{
    try {
        if(req.session.admin_id){
           
            res.redirect('/admin/dash')
            
        }else{
            next()
            
            console.log("sessionout");
            
        }
        
    } catch (error) {
        console.log(error.message);
        
    }
}

module.exports={
    isLogout,
    isLogin
}