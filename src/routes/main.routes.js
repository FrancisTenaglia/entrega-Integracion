import { Router } from "express";
import Users from '../api/dao/dbManager/UsersManagerDB.js';
import Products from '../api/dao/dbManager/ProductManagerDB.js';

const users = new Users();
const manager = new Products();

const mainRoutes = (io, store, baseUrl, productsPerPage) => {
    const router = Router();

    router.get('/', async (req, res) => {
        store.get(req.sessionID, async (err, data) => {
            if (err) console.log(`Error al recuperar datos de sesión (${err})`);

            if (data !== null && (req.session.userValidated || req.sessionStore.userValidated)) {
                if (req.query.page === undefined) req.query.page = 0;
    
                
                const result = await manager.getProducts(req.query.page * productsPerPage, productsPerPage);
                const pagesArray = [];
                for (let i = 0; i < result.totalPages; i++) pagesArray.push({ index: i, indexPgBar: i + 1 });
    
                const pagination = {
                    baseUrl: baseUrl,
                    limit: result.limit,
                    offset: result.offset,
                    totalPages: result.totalPages,
                    totalDocs: result.totalDocs,
                    page: result.page - 1,
                    nextPageUrl: `${baseUrl}?page=${result.nextPage - 1}`,
                    prevPageUrl: `${baseUrl}?page=${result.prevPage - 1}`,
                    hasPrevPage: result.hasPrevPage,
                    hasNextPage: result.hasNextPage,
                    pagesArray: pagesArray
                }
                res.render('products', { products: result.docs, pagination: pagination });
            } else {
                res.render('login', {
                    sessionInfo: req.session.userValidated !== undefined ? req.session : req.sessionStore
                });
            }
        }); 
    });

    router.get('/logout', async (req, res) => {
        req.session.userValidated = req.sessionStore.userValidated = false;

        req.session.destroy((err) => {
            req.sessionStore.destroy(req.sessionID, (err) => {
                if (err) console.log(`Error al destruir sesión (${err})`);
                console.log('Sesión destruída');
                res.redirect(baseUrl);
            });
        })
    });

    router.post('/login', async (req, res) => {
        const { login_email, login_password } = req.body; 
        const user = await users.validateUser(login_email, login_password);

        if (user === null) {
            req.session.userValidated = req.sessionStore.userValidated = false;
            req.session.errorMessage = req.sessionStore.errorMessage = 'Usuario o clave no válidos';
        } else {
            req.session.userValidated = req.sessionStore.userValidated = true;
            req.session.errorMessage = req.sessionStore.errorMessage = '';
        }

        res.redirect(baseUrl);
    });

    return router;
}

export default mainRoutes;