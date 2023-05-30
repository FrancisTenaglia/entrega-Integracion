import ProductManager from "./ProductManagerDB.js";
import cartModel from "../models/carts.model.js";

const pManager = new ProductManager();

export default class CartsManager {
  constructor() { }

  async getCarts() {
    try {
      const carts = await cartModel.find().populate("products.pid");
      return !carts.length
        ? {
          status: 404,
          error: "No se encontraron carritos",
        }
        : carts;
    } catch (err) {
      return {
        status: 500,
        error: `Ocurrió un error al intentar obtener los carritos: ${err}`,
      };
    }
  }

  async getCartById(id) {
    try {
      const cart = await cartModel.findById(id).lean().populate("products.pid");
      return cart === null
        ? {
          status: 404,
          error: `No se encontró el carrito con ID [${id}]`,
        }
        : cart.products;
    } catch (err) {
      return {
        status: 500,
        error: `Ocurrió un error al intentar obtener el carrito con ID [${id}]: ${err}`,
      };
    }
  }

  async addCart() {
    try {
      return await cartModel.create({ products: [] });
    } catch (err) {
      return {
        status: 500,
        error: `Ocurrió un error al intentar crear el carrito: ${err}`,
      };
    }
  }

  async addProductToCart(cid, pid) {
    try {
      const cartFinded = await this.getCartById(cid);
      if (cartFinded.error)
        return {
          status: 404,
          error: `No se encontró el carrito con ID [${cid}]`,
        };

      const productFinded = await pManager.getProductById(pid);
      if (productFinded.error)
        return {
          status: 404,
          error: `No se encontró el producto con ID [${pid}]`,
        };

      const productInCart = cartFinded.find(
        (product) => product.id == pid
      );
      // el producto existe en el carrito, entonces incremento su cantidad en 1
      if (productInCart) {
        const productIndex = cartFinded.findIndex(
          (product) => product.id == pid
        );
        const newCart = cartFinded;
        newCart[productIndex].quantity++;
        return await cartModel.findByIdAndUpdate(cid, { products: newCart });
      }

      // agrego el nuevo producto, con cantidad 1
      return await cartModel.findByIdAndUpdate(cid, {
        $push: { products: { pid, quantity: 1 } },
      });
    } catch (err) {
      return {
        status: 500,
        error: `Ocurrió un error al intentar agregar un producto al carrito: ${err}`,
      };
    }
  }

  async updateProducts(cid, products) {
    try {
      const cartFinded = await this.getCartById(cid);
      if (cartFinded.error)
        return {
          status: 404,
          error: `No se encontró el carrito con ID [${cid}]`,
        };

      const dbProducts = (await pManager.getProducts()).payload.map((product) =>
        product._id.toString()
      );

      const productsExist = products.map((product) => {
        const result = dbProducts.find((dbProduct) => dbProduct == product.pid);
        return result ? true : false;
      });

      if (productsExist.includes(false))
        return {
          status: 404,
          error: 'Error al intentar actualizar un producto no existente en el carrito',
        };

      await this.removeAllProductsToCart(cid);
      await cartModel.findByIdAndUpdate(cid, { products: products });
      return { status: 'success', message: 'Carrito actualizado correctamente' };
    } catch (err) {
      return {
        status: 500,
        error: `Ocurrió un error al intentar actualizar los productos del carrito: ${err}`,
      };
    }
  }

  async updateQuantity(cid, pid, quantity) {
    try {
      if (typeof quantity !== 'number')
        return { status: 400, error: 'La cantidad a actualizar debe ser un numero' };

      const cartFinded = await this.getCartById(cid);
      if (cartFinded.error)
        return {
          status: 404,
          error: `No se encontró el carrito con ID [${cid}]`,
        };

      const productFinded = await pManager.getProductById(pid);
      if (productFinded.error)
        return {
          status: 404,
          error: `No se encontró el producto con ID [${pid}]`
        };

      const productInCart = cartFinded.find(
        (product) => product.pid._id == pid
      );
      if (productInCart) {
        const productIndex = cartFinded.findIndex(
          (product) => product.pid._id == pid
        );
        const newCart = [...cartFinded];
        newCart[productIndex].quantity = quantity;

        await cartModel.findByIdAndUpdate(cid, { products: newCart });
        return {
          status: 'success',
          message: 'La cantidad fue actualizada correctamente',
        };
      }
      return {
        status: 404,
        error: `No se encontró el producto con ID [${pid}] en el carrito con ID [${cid}]`,
      };
    } catch (err) {
      return {
        status: 500,
        error: `Ocurrió un error al intentar actualizar la cantidad de producto del carrito: ${err}`,
      };
    }
  }

  async removeToCart(cid, pid) {
    try {
      const cartFinded = await this.getCartById(cid);
      if (cartFinded.error)
        return {
          status: 404,
          error: `No se encontró el carrito con ID [${cid}]`,
        };

      const productInCart = cartFinded.find(
        (product) => product.pid._id == pid
      );

      if (productInCart) {
        await cartModel.findByIdAndUpdate(cid, { $pull: { products: { pid } } });
        return { status: "success", message: `Producto con ID [${pid}] fue eliminado correctamente` };
      }
      return {
        status: 404,
        error:  `No se encontró el producto con ID [${pid}] en el carrito con ID [${cid}]`,
      };
    } catch (err) {
      return {
        status: 500,
        error: `Ocurrió un error al intentar eliminar el producto con ID [${pid}] del carrito: ${err}`,
      };
    }
  }

  async removeAllProductsToCart(cid) {
    try {
      const cartFinded = await this.getCartById(cid);
      if (cartFinded.error)
        return {
          status: 404,
          error: `No se encontró el carrito con ID [${cid}]`,
        };

      await cartModel.findByIdAndUpdate(cid, { products: [] });
      return { status: "success", message: "Productos eliminados correctamente" };
    } catch (err) {
      return {
        status: 500,
        error: `Ocurrió un error al intentar eliminar los productos del carrito: ${err}`,
      };
    }
  }
}
