import { Router } from 'express';
import ProductManager from '../api/dao/dbManager/ProductManagerDB.js';
import CartsManager from '../api/dao/dbManager/CartsManagerDB.js';

const router = Router();
const pManager = new ProductManager();
const cManager = new CartsManager();

// Vista chat
router.get("/chat", async (req, res) => {
  res.render("chat", {});
});

// Vista productos
router.get("/products?", async (req, res) => {
  const { query, limit, page, sort } = req.query;
  let {
    payload,
    hasNextPage,
    hasPrevPage,
    nextLink,
    prevLink,
    page: resPage,
  } = await pManager.getProducts(query, limit, page, sort);
  if (hasNextPage)
    nextLink = `http://localhost:8080/products/?${
      query ? "query=" + query + "&" : ""
    }${"limit=" + limit}${"&page=" + (+resPage + 1)}${
      sort ? "&sort=" + sort : ""
    }`;
  if (hasPrevPage)
    prevLink = `http://localhost:8080/products/?${
      query ? "query=" + query + "&" : ""
    }${"limit=" + limit}${"&page=" + (+resPage - 1)}${
      sort ? "&sort=" + sort : ""
    }`;
  res.render("products", {
    payload,
    hasNextPage,
    hasPrevPage,
    nextLink,
    prevLink,
    resPage,
  });
});

// Vista carritos
router.get("/carts/:cid", async (req, res) => {
  const id = req.params.cid;
  const cart = await cManager.getCartById(id);
  cart.error ? res.render("404", {}) : res.render("cart", { cart });
});

export default router;
