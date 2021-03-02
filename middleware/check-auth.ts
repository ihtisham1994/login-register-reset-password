import jwt from 'jsonwebtoken';

const JWT_KEY:string = process.env.JWT_KEY ;

const auth = (req:any, res:any, next:any) => {

    try {

        const token:string = req.headers.authorization.split(' ')[1];
        const decoded = jwt.verify(token, JWT_KEY )
        req.userData = decoded;
        next();

    } catch (err) {
        console.log('Error : ' + err);
        res.status(200).send({
            message: 'Auth Failed!',
        })
    }
}

export default auth;
