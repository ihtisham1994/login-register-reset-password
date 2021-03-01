import { Router } from 'express';
const router = Router();
import dotenv from 'dotenv';
dotenv.config();

const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

import { User } from '../models';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
const reset_password_link:string = process.env.RESET_PASSWORD_KEY || 'secretpasswordcheck1234@Dmin';
const jwt_key:string = process.env.JWT_KEY || 'secret1234567@Dmin';


/**
 * @api {post} /api/v1/register Register User
 * @apiName RegisterUser
 * @apiGroup Auth
 *
 * @apiParam {string} email User e-mail.
 * @apiParam {string} password User Password.
 * @apiParam {string} name User Name.
 * @apiParam {string} dob User date of birth.
 * @apiParam {file} profilepic User Profile Picture.
 *
 * @apiSuccess {string} message "User Has been created Successfully."
 *
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "message": "User has been created successfully".
 *     }
 */

router.post('/register', async (req:any, res:any) => {

    try {

        const check = await User.findOne({
            where: {
                email: req.body.email,
            }
        });

        if (check === null) {

            const user = {
                name: req.body.email,
                email: req.body.email,
                password: await bcrypt.hash(req.body.password, 10 ),
                dob: req.body.dob
            };

            const saveUser = User.create(user).then((result:any) => {
                res.status(200).send({
                    message: 'User created successfully',
                    data: result,
                });
            }).catch((err:any) => {
                res.status(500).send({
                    error: err,
                });
            });

        } else {
            res.status(409).send({
                message: 'Mail exists !!',
            })
        }

    } catch (err) {
        console.log('Error : ' + err);
    }

});

/**
 * @api {post} /api/v1/login Login User
 * @apiName LoginUser
 * @apiGroup Auth
 *
 *
 * @apiParam {string} email User e-mail.
 * @apiParam {string} password User Password.
 *
 * @apiSuccess {string} message "User Has been logged in Successfully."
 *
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "message": "User has been logged in successfully".
 *     }
 */

router.post('/login', async (req:any, res:any) => {
    try {

        const email = req.body.email;
        const password = req.body.password;

        const user = await User.findOne({
            where: {
                email: email,
            }
        });

        if( !user ) {
            res.status(401).send({
                message: 'Auth Failed!',
            });
        } else {

            const passwordVerify = await bcrypt.compare( password, user.password);

            if ( passwordVerify ) {

                const token = await jwt.sign({id: user.id, email: email}, jwt_key, {expiresIn: "1h"});

                res.status(200).send({
                    message: 'Auth successful',
                    token: token,
                })

            } else {
                res.status(500).send({
                    error: 'Auth Failed!',
                })
            }
        }

    } catch (err) {
        console.log('Error : ' + err);
        res.status(500).send({
            message: 'Auth Failed!',
        })
    }
});

/**
 * @api {post} /api/v1/forgot-password Forgot Password User
 * @apiName ForgotPasswordUser
 * @apiGroup Auth
 *
 *
 * @apiParam {string} email User e-mail.
 *
 * @apiSuccess {string} message "Email Sent Successfully, Please follow the instructions"
 *
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "message": "Email Sent Successfully, Please follow the instructions".
 *     }
 */

router.post('/forgot-password', async( req:any, res:any) => {

    try {

        const email = req.body.email;

        const user = await User.findOne({
            where: {
                email: email
            }
        });

        if ( user === null ) {

            res.status(400).send({
                message: 'User does not exist',
            });

        } else {

            const email = req.body.email;

            const token = await jwt.sign({ id: user.id }, reset_password_link , {expiresIn: '20m'});

            const msg = {
                to: email,
                from: 'ihtisham.anwar@invozone.com',
                subject: 'SendGrid is fun',
                text: 'This is easy',
                html: '<h2>Please click on given link to activate your account</h2>'+
                    '<p>'+ process.env.CLIENT_URL+'/api/v1/auth/reset-password/'+ token +'</p>',
            };

            const userUpdated = await User.update({ resetLink: token},{
                where: {
                    id: user.id,
                }
            });

            if ( userUpdated ){

                const check = await sgMail.send(msg)
                    .then((success:any) => {
                        res.send({
                            message:'Email Sent Successfully, Please follow the instructions',
                        });
                    })
                    .catch((err:any) => {
                        res.send({
                            message: err,
                        })
                    });

            } else {
                res.status(400).send({
                    message: 'Reset password link error !'
                });
            }

        }

    } catch ( err ) {
        console.log( 'Error  : ' + err );
    }

});

/**
 * @api {post} /api/v1/reset-password Reset Password User
 * @apiName ResetPasswordUser
 * @apiGroup Auth
 *
 *
 * @apiParam {string} resetLink User token from resetLink sent in the email.
 * @apiParam {string} newPass New password user want to set.
 *
 * @apiSuccess {string} message "Your password has been changed !"
 *
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "message": "Your password has been changed !".
 *     }
 */

router.post('/reset-password', async (req:any,res:any) => {
    try{

        const {resetLink, newPass } = req.body;

        if ( resetLink ) {

            const token  = jwt.verify(resetLink,reset_password_link , async (err:any, decoded:any) => {
                if (err) {
                    res.status(401).send({
                        error: 'Incorrect token or it is expired',
                    });
                } else {

                    const userr = await User.findOne({
                        where: {
                            resetLink: resetLink,
                        }
                    });

                    if ( userr ) {

                        const newPassword = await bcrypt.hash(newPass, 10);

                        if( newPassword ) {

                            const updateUser = await User.update({ resetLink: '', password: newPassword }, {
                                where: {
                                    resetLink: resetLink,
                                }
                            });

                            if( updateUser ) {
                                res.status(200).send({
                                    message: 'Your password has been changed !',
                                });
                            }

                        } else {
                            res.status(401).send({
                                error: 'Incorrect token or it is expired',
                            });
                        }

                    } else {

                        res.status(401).send({
                            error: 'Incorrect token or it is expired',
                        });

                    }

                }
            });

        } else {
            res.status(401).send({
                error: 'Authentication error !',
            })
        }

    } catch(err) {
        console.log('Error : ' + err );
    }
});


export default router;