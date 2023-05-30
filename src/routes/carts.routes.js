import { Router } from "express";
import CartsManagerDB from '../api/dao/dbManager/CartsManagerDB.js';

const router = Router();

const manager = new CartsManagerDB();

// Obtener todos los carritos
router.get("/", async (req, res) => {
  const getResponse = await manager.getCarts();

  !getResponse.error
    ? res.send(getResponse)
    : res.status(getResponse.status).send(getResponse);
});

// Obtener un determinado carrito por ID
router.get("/:cid", async (req, res) => {
  const id = req.params.cid;
  const getResponse = await manager.getCartById(id);

  !getResponse.error
    ? res.send(getResponse)
    : res.status(getResponse.status).send(getResponse);
});

// Agregar un nuevo carrito
router.post("/", async (req, res) => {
  const addResponse = await manager.addCart();
  !addResponse.error
    ? res.send(addResponse)
    : res.status(addResponse.status).send(addResponse);
});

// Agregar un determinado producto a un determinado carrito
router.post("/:cid/products/:pid", async (req, res) => {
  const {cid, pid} = req.params;
  const addResponse = await manager.addProductToCart(cid, pid);

  !addResponse.error
    ? res.send(addResponse)
    : res.status(addResponse.status).send(addResponse);
});

// Actualizar productos para un determinado carrito
router.put("/:cid/products", async (req, res) => {
  const cid = req.params.cid;
  const products = req.body;
  const updateResponse = await manager.updateProducts(cid, products);

  !updateResponse.error
    ? res.send(updateResponse)
    : res.status(updateResponse.status).send(updateResponse);
});

// Actualizar la cantidad de un determinado producto en un determinado carrito
router.put("/:cid/products/:pid", async (req, res) => {
  const {cid, pid} = req.params;
  const quantity = req.body;
  const updateResponse = await manager.updateQuantity(cid, pid, quantity);

  !updateResponse.error
    ? res.send(updateResponse)
    : res.status(updateResponse.status).send(updateResponse);
});

// Eliminar un determinado producto de un determinado carrito
router.delete("/:cid/products/:pid", async (req, res) => {
  const cid = req.params.cid;
  const pid = req.params.pid;
  const deleteResponse = await manager.removeToCart(cid, pid);

  !deleteResponse.error
    ? res.send(deleteResponse)
    : res.status(deleteResponse.status).send(deleteResponse);
});

// Eliminar todos los productos de un determinado carrito
router.delete("/:cid/products", async (req, res) => {
  const cid = req.params.cid;
  const deleteResponse = await manager.removeAllProductsToCart(cid);

  !deleteResponse.error
    ? res.send(deleteResponse)
    : res.status(deleteResponse.status).send(deleteResponse);
});

export default router;
