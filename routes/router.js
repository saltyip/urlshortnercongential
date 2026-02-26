import express from 'express';
import pool from '../db.js';
const router = express.Router();

let links = [
    {org: "original", short: "org" }
];

let count = 0;

const shortner_logic = () =>{
    //const back_part_ind = org_link.lastIndexOf('/');
    //const back_part = org_link.slice(back_part_ind);
    //const front_part = org_link.slice(0,back_part_ind) + '/' ;

    
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
    return string;
};


// @desc TO CREATE LINK OR GET LINK 
// @route POST
router.post('/',(req,res,next) =>{
    if(!req.body || !req.body.org){
        const err = Error("title or req body not properly sent");
        err.status = 404;
        return next(err);
    }
    const exist = links.find((link) => link.org == req.body.org);  //exist is basically the object we get 
    if(exist){
        const err = Error("the following link already exists");
        err.status = 404;
        return next(err);   
    }
    const newShort = shortner_logic();
    const liob = {org: req.body.org, short:newShort};
    links.push(liob);
    res.status(201).json(liob);
    }   
);

//@desc TO SHOW THE LINK
//@route GET 
router.get('/',(req,res)=>{
    res.status(200).json(links);

});

//@desc REDIRECTS TO REAL LINK
//@route GET
router.get('/:code',(req,res,next)=>{
    const code = req.params.code;
    const real = links.find((link) => link.short == code);
    if(!real){
        const err = Error("link not found");
        err.status = 404;
        return next(err);
    }
    res.redirect(real.org); //redirects send 302 status by default

});


export default router;
