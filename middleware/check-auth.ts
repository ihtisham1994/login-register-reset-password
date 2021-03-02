import jwt from 'jsonwebtoken';

var jwt_key:string = process.env.JWT_KEY || 'secret123';

const auth = (req:any, res:any, next:any) => {
    try {
        const token:string = req.headers.authorization.split(' ')[1];
        const decoded = jwt.verify(token, jwt_key );
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
