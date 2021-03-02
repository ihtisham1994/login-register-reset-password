import express from 'express';
const app: express.Application = express();
import dotenv from 'dotenv';
import bodyParser from 'body-parser';
import routes from './routes/routes';
import { db } from './models';
import auth from './middleware/check-auth';

db.sequelize.sync({ force: true }).then(() => {
    console.log("Drop and re-sync db.");
}).catch((err:any) => {
    console.log(err);
});

/*db.sequelize.sync()
    .then(() => {
        console.log('DB connection esatblished !');
    })
    .catch((err:any) => {
        console.log('Error : ' + err );
    });*/

app.use(bodyParser.urlencoded({ extended: true }));

import cors from 'cors';
app.use(cors());

dotenv.config();

const port = process.env.PORT || 8000;

app.use('/api/v1', routes );

app.post('/dashboard', auth, (req:any,res:any) => {
    res.status(200).send({
        message: 'This is dashboard'
    })
});

app.listen( port, () => console.log(`Server is running on http://localhost:${port}`));
