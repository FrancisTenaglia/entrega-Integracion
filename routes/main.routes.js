import express from 'express';
import passport from 'passport';
import { current, login, register } from '../controllers/main.controllers.js';
import { uploadFiles } from '../controllers/users.controllers.js';
import uploader from '../services/uploader.service.js';

const router = express.Router();

const mainRouter = (store, baseUrl) => {
  router.get('/', (req, res) => current(req, res, store));
  router.post('/register', passport.authenticate('authRegistration', { failureRedirect: '/register' }), (req, res) => register(req, res, baseUrl));
  router.post('/login', passport.authenticate('login', { failureRedirect: '/login' }), (req, res) => login(req, res, baseUrl));
  router.post('/upload', uploader.single('imagen'), uploadFiles);
  return router;
};

export default mainRouter;