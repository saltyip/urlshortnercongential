import express from 'express';
import pool from '../db.js';
const router = express.Router();

/*let links = [
    {org: "original", short: "org" }
]; */

const shortner_logic = (id) =>{
    //const back_part_ind = org_link.lastIndexOf('/');
    //const back_part = org_link.slice(back_part_ind);
    //const front_part = org_link.slice(0,back_part_ind) + '/' ;

    /*
    let chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ_abcdefghijklmnopqrstuvwxyz-";
    let string = "";
    let num = count;
    if(num == 0){
        string = chars[num];
    }
    else{
        while(num>0){
            string = chars[num%64]+string;
            num = Math.floor(num/64);
        }
    }
    count++;
    return string;*/

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
router.post('/',async(req,res,next) =>{
    try{
        if(!req.body || !req.body.org){
            const err = new Error("title or req body not properly sent");
            err.status = 400; //400 is for bad request
            return next(err);
        }
        /*const exist = links.find((link) => link.org == req.body.org);  //exist is basically the object we get 
        if(exist){
            const err = new Error("the following link already exists");
            err.status = 404;
            return next(err);   
        }

        const exist_query = 'SELECT original_url FROM urls WHERE original_url = $1';
        const exist_val = req.body.org;
        const exists = await pool.query(exist_query,[exist_val]);*/

        /*if(exists.rows.length){
            const err = new Error("the following link already exists");
            err.status = 409; //409 is for conflict 
            return next(err);
        }*/
        const id_query = 'INSERT INTO urls (original_url) VALUES ($1) RETURNING id;';
        const result_logic = await pool.query(id_query,[req.body.org]); 
        const id = result_logic.rows[0].id;
        const newShort = shortner_logic(result_logic.rows[0].id);
        //const liob = {org: req.body.org, short:newShort};
        //links.push(liob);
        const insert_query = 'UPDATE urls SET short_code = $1 WHERE id = $2 RETURNING *;';
        const result_post = await pool.query(insert_query,[newShort,id]);
        res.status(201).json(result_post.rows[0]);
        }
    catch(err){
        if(err.code === '23505'){
            return res.status(409).json({msg:"already existss"});
        }
        next(err);
    }
}
);

//@desc TO SHOW THE LINK
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

//@desc REDIRECTS TO REAL LINK
//@route GET
router.get('/:code',async (req,res,next)=>{
    try{
    /*const real = links.find((link) => link.short == code);
    if(!real){
        const err = Error("link not found");
        err.status = 404;
        return next(err);
    }*/
    const code_query = 'SELECT original_url FROM urls WHERE short_code = $1';
    const result_code = await pool.query(code_query,[req.params.code]);
    if(!result_code.rows.length){
        const err = new Error("the following shor code couldnt be found")
        err.status = 404;
        return next(err);
    }
    res.redirect(result_code.rows[0].original_url); //redirects send 302 status by default
    }
    catch(err){
        next(err);
    }
});


export default router;
