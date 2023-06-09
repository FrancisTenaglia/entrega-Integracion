import { Router } from "express";
import userModel from '../api/dao/models/users.model.js';
import { createHash, isValidPassword } from "../utils.js";
import passport from '../auth/passport.strategies.js';

const mainRoutes = (store) => {    
    const router = Router();

    router.get('/', async (req, res) => {
        store.get(req.sessionID, async (err, data) => {
            if (err) console.log(`Error al recuperar datos de sesión (${err})`);

            if (data !== null && req.sessionStore.userValidated) {
                if (req.sessionStore.userAdmin) {
                    res.render('private_admin', {});
                } else {
                    res.render('private_general', { user: req.sessionStore });
                }
            } else {
                res.render('login', { sessionInfo: req.sessionStore });
            }

        });
    });

    router.get('/ae', async (req, res) => {
        res.render('authentication_err', {});
    });

    router.get('/register', async (req, res) => {
        res.render('registration', {});
    });

    router.post('/login', async (req, res) => {
        req.sessionStore.userValidated = false;
        const { login_email, login_password } = req.body;

        const user = await userModel.findOne({ userName: login_email });

        if (!user) {
            req.sessionStore.errorMessage = 'No se encuentra el usuario';
            res.redirect('http://localhost:3000');
        } else if (!isValidPassword(user, login_password)) {
            req.sessionStore.errorMessage = 'Clave incorrecta';
            res.redirect('http://localhost:3000');
        } else {
            req.sessionStore.userValidated = true;
            req.sessionStore.errorMessage = '';
            req.sessionStore.firstName = user.firstName;
            req.sessionStore.lastName = user.lastName;
            res.redirect('http://localhost:3000');
        }
    });

    router.get('/logout', async (req, res) => {
        req.sessionStore.userValidated = false;

        req.session.destroy((err) => {
            req.sessionStore.destroy(req.sessionID, (err) => {
                if (err) console.log(`Error al destruir sesión (${err})`);
                console.log('Sesión destruída');
                res.redirect('http://localhost:3000');
            });
        })
    });

    router.get('/regfail', async (req, res) => {
        res.render('registration_err', {});
    });

    router.post('/register', passport.authenticate('authRegistration', { failureRedirect: '/regfail' }), async (req, res) => {
        const { firstName, lastName, userName, password } = req.body; 
        if (!firstName || !lastName || !userName || !password ) res.status(400).send('Faltan campos obligatorios en el body');
        const newUser = { firstName: firstName, lastName: lastName, userName: userName, password: createHash(password)};
        
        res.status(200).send({ message: 'Todo ok para cargar el usuario', data: newUser });
    });

    return router;
}

export default mainRoutes;