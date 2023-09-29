import imageModel from '../models/image.model.js';
import { usersService } from '../repositories/_index.js';

export const current = async (req, res, store) => {
  try {
    store.get(req.sessionID, async (err, data) => {
      if (err) console.log(`Error while trying to retrieve data session (${err})`);
      if (req.session.userValidated || req.sessionStore.userValidated) {
        const user = await usersService.getUserByEmail(req.sessionStore.email);
        req.sessionStore.user = user;
        
        res.redirect('/home/products');
      } else {
        res.redirect('/login');
      }
    });
  } catch (err) {
    res.status(500).send({ error: err.message });
  }
};

export const register = async (req, res, baseUrl) => {
  try {
    const { first_name, last_name, age, login_email, login_password } = req.body;
    await usersService.addUser({ firstName: first_name, lastName: last_name, age, email: login_email, password: login_password });
    req.session.userValidated = req.sessionStore.userValidated = true;
    req.sessionStore.email = login_email;
    res.redirect(baseUrl);
  } catch (err) {
    res.status(500).send({ error: err.message });
  }
};

export const login = async (req, res, baseUrl) => {
  try {
    if (!req.user) throw new Error({ message: 'Invalid credentials' });
    req.session.userValidated = req.sessionStore.userValidated = true;
    req.sessionStore.email = req.body.login_email;
    res.redirect(baseUrl);
  } catch (err) {
    res.status(500).send({ error: err.message });
  }
};

export const uploadContent= async(req, res) => {
    // Si hay un file en el objeto request, quiere decir que se subió un archivo correctamente.
    // Se lo lee desde disco, se lo codifica como cadena base64 y se lo almacena en MongoDB.
    // Por supuesto podría borrarse luego el archivo de disco.
    
    if (req.file) {
      const file = fs.readFileSync(req.file.path);
      const encodedFile = file.toString('base64');
      const finalFile = {
          contentType: req.file.mimetype,
          image: Buffer.from(encodedFile, 'base64')
      };

      await imageModel.create(finalFile);

      res.status(200).send({ status: 'OK', data: { text: req.body, file: req.file.originalname } })
  } else {
      res.status(200).send({ status: 'OK', data: { text: req.body } })
  }
}


