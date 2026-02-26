
import express, { urlencoded } from 'express';
import router from './routes/router.js';
import logger from './middleware/logger.js';
import errorhandler from './middleware/errorhandler.js';
const app = express();

app.use(express.json());
app.use(express.urlencoded({extended:false}));

app.use(logger);
app.use('/',router);
app.use((req,res,next)=>{
    const err = new Error("Not Found");
    err.status = 404;
    next(err);
});
app.use(errorhandler);

app.listen(8000, ()=>{
    console.log('Server started on port 8000');
});