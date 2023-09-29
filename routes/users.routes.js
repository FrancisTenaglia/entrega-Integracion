import { Router } from 'express';
import CustomError from '../services/customError.js';
import errorsDict from '../utils/dictionary.js';
import { FactoryUsers } from '../dao/factory.js';
//import { apiValidate } from '../middlewares/validation.js';
//import { adminAuthorization } from '../middlewares/authorization.js';
import { changeUserRole, getUsers, uploadFiles } from '../controllers/users.controllers.js';

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

    // hay que separar el get de todos para chequear la conexion de los usuarios en el delete o ver de implementar el get total
    // en el delete y en funcion al campo ultima conexion definir si se borra o no el usuario

    // chequear envio de mails para agregar
    router.get('/principalUser', getUsers)
    
    router.post('/premium/:uid', changeUserRole);
    
    //endpoint para subir documento
    router.post('/:uid/documents', uploadFiles);
    return router;
};