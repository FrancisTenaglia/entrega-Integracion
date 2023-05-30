import { Router } from "express";
import ProductManagerDB from "../api/dao/dbManager/ProductManagerDB.js";

const router = Router();

const manager = new ProductManagerDB();

// Agregar un producto
router.post('/', async (req, res) => {
    const {
        title,
        description,
        code,
        price,
        status = true,
        stock,
        category,
        thumbnails,
    } = req.body;
    const product = {
        title,
        description,
        code,
        price,
        status,
        stock,
        category,
        thumbnails,
    };
    await manager.addProduct(product);

    if (manager.checkStatus() === 1) {
        res.status(200).send({ status: 'OK', msg: manager.showStatusMsg() });
    } else {
        res.status(400).send({ status: 'ERR', error: manager.showStatusMsg() });
    }
});

// Obtener todos los productos
router.get('/?', async (req, res) => {
    try {
        const { query, limit, page, sort } = req.query;
        const products = await manager.getProducts(query, limit, page, sort);
        res.status(200).send({ data: products });
    } catch (err) {
        res.status(500).send({ error: err });
    }
});

// Obtener un determinado producto por ID
router.get('/:pid', async (req, res) => {
    try {
        const id = req.params.pid;
        const product = await manager.getProductById(id);
        res.status(200).send({ status: 'OK', data: product });
    } catch (err) {
        res.status(500).send({ status: 'ERR', error: err });
    }
});

// Actualizar un determinado producto por ID
router.put('/:pid', async (req, res) => {
    await manager.updateProduct(req.params.pid, req.body);

    if (manager.checkStatus() === 1) {
        res.status(200).send({ status: 'OK', msg: manager.showStatusMsg() });
    } else {
        res.status(400).send({ status: 'ERR', error: manager.showStatusMsg() });
    }
});

// Eliminar un producto por ID
router.delete('/:pid', async (req, res) => {
    await manager.deleteProduct(req.params.pid);

    if (manager.checkStatus() === 1) {
        res.status(200).send({ status: 'OK', msg: manager.showStatusMsg() });
    } else {
        res.status(400).send({ status: 'ERR', error: manager.showStatusMsg() });
    }
});

export default router;