import { Router } from 'express';
import CustomError from '../services/customError.js';
import errorsDict from '../utils/dictionary.js';
import { FactoryUsers } from '../dao/factory.js';
import { apiValidate } from '../middlewares/validation.js';
import { adminAuthorization } from '../middlewares/authorization.js';

const userManager = new FactoryUsers();

export const userRoutes = ()  => {
    const router = Router();

    router.get('/custom/:id', async (req, res, next) => {
        try {
            // A partir de ahora, en lugar de utilizar la clase Error standard, utilizamos
            // nuestra propia instancia de CustomError, pasándole el objeto de error que
            // corresponda desde el diccionario
            if (isNaN(req.params.id)) { throw new CustomError(errorsDict.INVALID_TYPE_ERROR) }
            res.status(200).send({ status: 'OK', payload: { id: req.params.id } });
        } catch(err) {
            next(err);
            // Como tenemos un middleware más que hemos activado para captura de errores
            // (ver app.js), ya no necesitamos enviar las respuestas fallidas desde el
            // endpoint, simplemente lo delegamos al middleware con next(err)
            // res.status(400).send({ status: 'ERR', payload: { msg: 'todo mal' } });
        }
    });

    // Este endpoint es solo para probar el módulo de compresión
    router.get('/string', async (req, res) => {
        let string = ''
        for (let i = 0; i < 100000; i++) { string += 'francisTenaglia'; }
        res.status(200).send({ status: 'OK', payload: string });
    });

    router.post('/premium/:uid', apiValidate, adminAuthorization, changeUserRole);

    return router;
};

 
export const changeUserRole = async (req, res) => {
    const { uid } = req.params;
    const user = await userManager.getUserById(uid); 
    if (!user) { 
        return res.status(404).json({ message: 'User not found' });
    }
    user.role = user.role === 'user' ? 'premium' : 'user';
    await user.save();
    return res.status(200).json({ message: 'User role updated successfully' });
};
