import rateLimit from "express-rate-limit";
import RedisStore from "rate-limit-redis";
import redisClient from "../redisClient.js";

const loginlimiter = rateLimit({
    windowMs: 15*60*1000,  //sets the minutes
    limit: 5,              //limit per ip counter
    standardHeaders:true,   //use the new headers
    legacyHeaders:false,    // igonore old hwaders 


    store: new RedisStore({ //connects the redis with the rate limit so that it stores this like increment and all that in the redis instead of the memmory
        sendCommand: (...args) => redisClient.sendCommand(args),
    }),

    message: {
        msg: "Too many login attempts. Try again later."
    }

});




export default loginlimiter;