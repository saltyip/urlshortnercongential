import express from 'express';
import pool from '../db.js';
import hashing_logic from '../servicehandler/bcrypthandler.js'
import jwt from 'jsonwebtoken'; 
import authHandler from '../middleware/authHandler.js'; 
import bcrypt from 'bcrypt';
import loginlimiter from '../middleware/rateLimiter.js';



const router = express.Router();

const shortner_logic = (id) =>{
    
    const char = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
    let string ="";
    while(id > 0){  
        string = char[id%62] + string;
        id = Math.floor(id/62);
    }
    return string || "0";

};

// @desc TO CREATE LINK OR GET LINK 
// @route POST
router.post('/',authHandler,async(req,res,next) =>{
    const client = await pool.connect();
    try{
        let userps = req.user.user_id;  

        if(!req.body || !req.body.org){
            const err = new Error("title or req body not properly sent");
            err.status = 400; //400 is for bad request
            return next(err);
        }
        await client.query("BEGIN")
        const query = 'INSERT INTO urls (user_id,original_url) VALUES ($1,$2) ON CONFLICT (user_id,original_url) DO NOTHING RETURNING id;';
        const query_result = await client.query(query,[userps,req.body.org]);

        if(query_result.rows.length === 0){
            const b_result = await client.query('SELECT * FROM urls WHERE original_url = $1 AND user_id = $2',[req.body.org,userps]);
            await client.query('COMMIT');
            return res.status(201).json({msg:b_result.rows[0]});
        }
        const id = query_result.rows[0].id;
        const newShort = shortner_logic(id);
        const result_query = await client.query('UPDATE urls SET short_code =  $1 WHERE id = $2 RETURNING*;',[newShort,id]);
        await client.query('COMMIT');
        res.status(201).json({msg: result_query.rows[0]});
    }
    catch(err){
        await client.query('ROLLBACK');
        if(err.code === '23505'){
            return res.status(409).json({msg:"already existss"});
        }
        next(err);
    }
    finally{
        client.release();
    }
}
);

//@desc TO SHOW ALL THE LINK
//@route GET 
router.get('/',async(req,res,next)=>{
    //res.status(200).json(links);
    try{
    const result_get = await pool.query('SELECT * FROM urls;');
    res.status(200).json(result_get.rows);
    }
    catch(err){
        next(err);
    }
});

//@desc to get clicks values 
//@route GET
router.get('/stats/:code', async(req,res,next) =>{

try {
    const clickonly_query = 'SELECT clicks FROM urls WHERE short_code = $1';
    const result_clickonly = await pool.query(clickonly_query,[req.params.code]);

    if(result_clickonly.rows.length == 0){
        const err = new Error("the following code doesnt exist");
        err.status = 404;
        return next(err);
    }
    res.status(200).json({msg : result_clickonly.rows[0].clicks});

} catch (err) {
    next(err);
}

});

//@desc REDIRECTS TO REAL LINK
//@route GET
router.get('/:code',async (req,res,next)=>{
    try{
    const code_query = 'SELECT original_url FROM urls WHERE short_code = $1';
    const result_code = await pool.query(code_query,[req.params.code]);
    if(!result_code.rows.length){
        const err = new Error("the following short code couldnt be found")
        err.status = 404;
        return next(err);
    }
    const click_query = 'UPDATE urls SET clicks = clicks + 1 WHERE short_code = $1 '
    await pool.query(click_query,[req.params.code]);
    console.log(`redirected to ${result_code.rows[0].original_url} end`);
    res.redirect(result_code.rows[0].original_url); //redirects send 302 status by default
    }
    catch(err){
        next(err);
    }
});


//@desc to register users
//@route POST
router.post('/users/register',async (req,res,next)=>{
    try{
        if(!req.body || !req.body.username || !req.body.password){
            const err = new Error("body or username or password is not correct");
            err.status = 400;
            return next(err);
        }
        const hashedpass = await hashing_logic(req.body.password);
        const user_result = await pool.query('INSERT INTO users (username,password_hash) VALUES ($1,$2) RETURNING*;',[req.body.username,hashedpass]);
        res.status(201).json({msg: `username with ${req.body.username} created`});
    }
    catch(err){
        if(err.code === '23505'){
            return res.status(409).json({msg : "username already exist"});
        }
        next(err);
    }
});

//@desc login users
//@route post
router.post('/users/login',loginlimiter,async(req,res,next) =>{
    try{
    if(!req.body || !req.body.username || !req.body.password){
        const err = new Error("body or username or password is not correct");
        err.status = 400;
        return next(err);
    }

    const check_result = await pool.query('SELECT * FROM users WHERE username = $1',[req.body.username]);
    if(!check_result.rows.length){
        return res.status(200).json({msg:"the usernaem doesnt exist"});
    }
    const valid = await bcrypt.compare(req.body.password,check_result.rows[0].password_hash);
    if(!valid){
        return res.status(401).json({msg:"incorrect password"});
    }
    const token = jwt.sign(             //this makes the token a decrypted jwt of user_id and secret key;
        {user_id: check_result.rows[0].id},
        process.env.JWT_SECRET,
        {expiresIn: "15m"}
    );

    res.status(200).json({msg: "login succesfull",token}); 

    }
    catch(err){
        next(err);  
    }
});

//@desc SHOW LINKS DONE BY USER
//@route GET  and USERAUTh
router.get('/userlinks',authHandler, async (req,res,next)=>{
    try {
        const curuserid = req.user.user_id;
        const resultuser = await pool.query('SELECT * FROM urls WHERE user_id = $1',[curuserid]);
        return res.status(200).json(resultuser.rows);
    }
    catch(err){
        next(err);
    }
    
});


export default router;