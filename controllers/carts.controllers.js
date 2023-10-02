import { cartsService, productsService, ticketsService, usersService } from '../repositories/_index.js';

export const createCart = async (req, res) => {
  try {
    const response = await cartsService.createCart();
    if (!response) {
      return res.status(404).send();
    }
    await usersService.addCartId(req.body.email, response.id);
    res.status(200).send(response);
  } catch (err) {
    res.status(500).send({ error: err.message });
  }
};

export const getCartById = async (req, res) => {
  try {
    const cart = await cartsService.getCartById(req.params.cid);
    if (!cart) {
      return res.status(404).send();
    }
    res.status(200).send(JSON.stringify(cart));
  } catch (err) {
    res.status(500).send({ error: err.message });
  }
};

export const addProductToCart = async (req, res) => {
  try {
    const response = await cartsService.addProductToCart(req.params.cid, req.params.pid);
    res.status(200).send(response);
  } catch (err) {
    res.status(500).send({ error: err.message });
  }
};
// export const addProductToCart = async (req, res) => { 
//   const { cid, pid } = req.params;
  
  
  // if (currentUser.role === 'premium' && currentUser.email === product.owner) { 
  //   return res.status(403).json({ message: 'Premium users cannot add their own products to the cart' });
  // }
// };

export const deleteProductFromCart = async (req, res) => {
  try {
    const response = await cartsService.deleteProductFromCart(parseInt(req.params.cid), parseInt(req.params.pid));
    res.status(200).send(response);
  } catch (err) {
    res.status(500).send({ error: err.message });
  }
};

export const updateCart = async (req, res) => {
  try {
    const response = await cartsService.updateCart(parseInt(req.params.cid), req.body);
    res.status(200).send(response);
  } catch (err) {
    res.status(500).send({ error: err.message });
  }
};

export const updateProductQuantityFromCart = async (req, res) => {
  try {
    const response = await cartsService.updateProductQuantityFromCart(parseInt(req.params.cid), parseInt(req.params.pid), req.body);
    res.status(200).send(response);
  } catch (err) {
    res.status(500).send({ error: err.message });
  }
};

export const deleteAllProductsFromCart = async (req, res) => {
  try {
    const response = await cartsService.deleteAllProductsFromCart(req.params.cid);
    res.status(200).send(response);
  } catch (err) {
    res.status(500).send({ error: err.message });
  }
};

export const purchase = async (req, res) => {
  try {
    const cid = req.params.cid;
    // const user = await usersService.getUserByCart(cid);
    const cart = await cartsService.getCartById(cid);
    let unavailableProducts = [];
    const amount = await cart.products.reduce(async (accPromise, cv) => {
      const acc = await accPromise;
      const product = await productsService.getProductById(cv._id);
      if (product.stock < cv.quantity) {
        unavailableProducts.push({ ...product, quantity: cv.quantity });
        return acc;
      }
      const newStock = product.stock - cv.quantity;
      // await cartsService.deleteProductFromCart(cid, product._id);
      // await productsService.updateProduct(product._id, {stock: newStock });
      const unitPrice = product.price;
      const totalPrice = cv.quantity * unitPrice;
      return acc + totalPrice;
    }, Promise.resolve(0));
    const response = { ...(await ticketsService.createTicket({ amount })), unavailableProducts };
    console.log('COMPRANDO? ', response)
    res.status(200).send(response);
  } catch (err) {
    res.status(500).send({ error: err.message });
  }

};
