import jwt from 'jsonwebtoken';


const authHandler = (req,res,next)=>{
try{
    const header = req.header.authorization;

    if(!header){
        return res.status(404).json({msg:"missing token"});
    }
    const token = header.split(" ")[1];
    
    const decoded = jwt.verify(token,process.env.JWT_SECRET);
    
    req.user_id = decoded.user_id;

    next();
}
catch(err){
    next(err);
}
};

export default authHandler;