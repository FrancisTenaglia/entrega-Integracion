import fs from "fs";
import ProductManager from "./ProductManager.js";

const pManager = new ProductManager();

export default class CartsManager {
  constructor() {
    this.id = 0;
    this.path = "src/dao/fileManager/carts.json";
  }

  async addCart() {
    const carts = await this.getCarts();
    if (carts.error) {
      return carts;
    }
    const id = carts.length + 1;
    const newCart = { id, products: [] };
    carts.push(newCart);
    return await this.writeFile(carts);
  }

  async getCarts() {
    try {
      const document = await fs.promises.readFile(this.path);
      const carts = JSON.parse(document);
      return carts;
    } catch (err) {
      return {
        status: 500,
        error:
          `Ocurrió un error al intentar obtener los carritos: ${err}`,
      };
    }
  }

  async getCartById(id) {
    const carts = await this.getCarts();
    if (!carts.error) {
      const cart = carts.find((cart) => cart.id === id);
      if (cart) {
        const cartIndex = carts.findIndex((cart) => cart.id === id);
        return { cart, cartIndex };
      } else {
        return {
          status: 404,
          error: `No se encontró el carrito con ID [${id}]`,
        }
      }
    } else {
      return carts;
    }
  }

  async addProductToCart(cid, pid) {
    const carts = await this.getCarts();
    const { cart, cartIndex } = await this.getCartById(cid);
    if (!carts.error && !cart.error) {
      const product = cart.products.find(
        (product) => product.productId === pid
      );
      if (product) {
        const productIndex = cart.products.findIndex(
          (product) => product.productId === pid
        );
        product.quantity++;
        carts[cartIndex].products.splice(productIndex, 1, product);
        return await this.writeFile(carts);
      } else {
        const getProduct = await pManager.getProductById(pid);
        if (!getProduct.error) {
          carts[cartIndex].products.push({ productId: pid, quantity: 1 });
          return await this.writeFile(carts);
        } else {
          return getProduct;
        }
      }
    } else {
      return carts || cart;
    }
  }

  async removeToCart(cid, pid) {
    const carts = await this.getCarts();
    const { cart, cartIndex } = await this.getCartById(cid);
    if (!carts.error && !cart.error) {
      const product = cart.products.find(
        (product) => product.productId === pid
      );
      if (product) {
        const productIndex = cart.products.findIndex(
          (product) => product.productId === pid
        );
        carts[cartIndex].products.splice(productIndex, 1);
        await this.writeFile(carts);
        return {
          status: "success",
          message: `Producto con ID [${pid}] fue eliminado correctamente` };
      } else {
        return {
          status: 404,
          error: `No se encontró el producto con ID [${pid}] en el carrito con ID [${cid}]`,
        };
      }
    } else {
      return carts || cart;
    }
  }

  async writeFile(data) {
    try {
      await fs.promises.writeFile(this.path, JSON.stringify(data));
      return {
        status: "success",
        message: "Datos agregados correctamente" };
    } catch (err) {
      return {
        status: 500,
        error: `Ocurrió un error al intentar escribir en el archivo: ${err}`,
      };
    }
  }
}
