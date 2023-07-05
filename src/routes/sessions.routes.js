import { } from 'dotenv/config';
import { Router } from 'express';
import passport from 'passport';
import jwt from 'jsonwebtoken';
import userModel from './users/users.model.js'
import { isValidPassword } from '../utils.js';

const COOKIE = process.env.COOKIE || 'mySpecialCookie';
const SECRET_TOKEN = process.env.SECRET_TOKEN || 'francisToken';

const router = Router();

router.get('/session_home', async (req, res) => {
  if (req.sessionStore.userValidated) { // El usuario está autenticado
    res.status(200).send('OK, usuario autenticado!');
    // Redireccionar a la plantilla que corresponda
  } else {
    res.status(200).send('ERROR, usuario no autenticado');
    // Redireccionar a la plantilla de login, por ejemplo
    // res.render('login', { sessionInfo: sessionInfo });
  }
});

// Endpoint al que redirecciona passport de forma automática si no se puede completar el registro
router.get('/failedRegister', (req, res) => {
  res.send('No se pudo completar el proceso, el usuario ya se encuentra registrado');
});

// Endpoint al que redirecciona passport de forma automática si falla el login
router.get('/failedLogin', (req, res) => {
  res.send('No se pudo completar el login, la clave es incorrecta');
});

// Ejemplo de autenticación de endpoint mediante estrategia tipo JWT vía passport
router.get('/current', passport.authenticate('current', { session: false }), async (req, res) => {
  res.send({ status: 'OK', data: req.user });
});

router.get('/private', async (req, res) => {
  res.status(200).send({ status: 'OK', data: 'Credenciales autorizadas para visualizar contenido privado' });
});

// Limpieza de sessión
router.get('/session_logout', async (req, res) => {
  req.sessionStore.userValidated = false;

  req.logout((err) => {
    if (err) { return next(err); }
    res.redirect('/api/sessions/session_home');
  });
});

// Limpieza de token
router.get('/token_logout', async (req, res) => {
  res.clearCookie(COOKIE);
  res.redirect('/token_login');
});

// Proceso de registro verificado por passport
router.post('/register', passport.authenticate('register', {
  session: false,
  passReqToCallback: true,
  failureRedirect: 'api/sessions/failedRegister',
  failureMessage: true
}), (req, res) => {
  res.send({ status: 'OK', message: 'Usuario registrado', payload: req.user._id });
});

router.post('/session_login', async (req, res) => {
  req.sessionStore.userValidated = false;
  const { userName, password } = req.body;

  const user = await userModel.findOne({ userName: userName });

  if (!user) {
    req.sessionStore.errorMessage = 'No se encuentra el usuario';
  } else if (!isValidPassword(user.password, password)) {
    req.sessionStore.errorMessage = 'Clave incorrecta';
  } else {
    req.sessionStore.userValidated = true;
    req.sessionStore.errorMessage = '';
    req.sessionStore.firstName = user.firstName;
    req.sessionStore.lastName = user.lastName;
  }

  // Se redirecciona al endpoint session_home
  res.redirect('/api/sessions/session_home');
});

// Ejemplo de Login utilizando tokens (enviados en este caso vía cookies)
router.post('/token_login', passport.authenticate('login', {
  session: false,
  failureRedirect: '/api/sessions/failedLogin'
}), (req, res) => {
  const serializedUser = {
    id: req.user._id,
    name: `${req.user.firstName} ${req.user.lastName}`,
    role: req.user.role,
    email: req.user.userName
  }
  const token = jwt.sign(serializedUser, SECRET_TOKEN, { expiresIn: '24h' });
  res.cookie(COOKIE, token, { maxAge: 3600000, httpOnly: true }).send({ status: 'OK', payload: serializedUser });
});

export default router;