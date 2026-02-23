import colors from 'colors';

const logger = (req,res,next) =>{
    const methodcolor = {
        GET:"green",
        POST:"blue"
    };

    const color = methodcolor[req.method] || white;
    console.log(`${req.method} ${req.protocol}:://${req.get('host')}${req.originalUrl}`[color]);
    next();
};


export default logger;