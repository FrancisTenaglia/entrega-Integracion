import { productsService } from '../repositories/_index.js';

export const getProducts = async (req, res) => {
  try {
    const products = await productsService.getProducts(req.query);
    res.status(200).send(JSON.stringify(products));
  } catch (err) {
    res.status(500).send({ error: err.message });
  }
};

export const getProductById = async (req, res) => {
  try {
    const product = await productsService.getProductById(parseInt(req.params.pid));
    if (!product) {
      return res.status(404).send();
    }
    res.status(200).send(JSON.stringify(product));
  } catch (err) {
    res.status(500).send({ error: err.message });
  }
};

export const addProduct = async (req, res, wss) => {
  try {
    const newProduct = req.body;
    const response = await productsService.addProduct(newProduct);
    const newId = response.id;
    res.status(200).send(response);
    wss.emit('new_product', { response, newProduct, newId });
  } catch (err) {
    res.status(500).send({ error: err.message });
  }
};

// export const updateProduct = async (req, res) => {
//   try {
//     const response = await productsService.updateProduct({ id: parseInt(req.params.pid), ...req.body });
//     res.status(200).send(response);
//   } catch (err) {
//     res.status(500).send({ error: err.message });
//   }
// };

// export const deleteProduct = async (req, res) => {
//   try {
//     const {response} = await productsService.deleteProduct(parseInt(req.params.pid));
//     res.status(200).send(response);
//     wss.emit('deleted_product', { response, deletedId });
//   } catch (err) {
//     res.status(500).send({ error: err.message });
//   }
// };

export const updateProduct = async (req, res) => { const { pid } = req.params; const { title, description, price, stock, category } = req.body;

  const product = await getProductById(pid); 
  if (!product) {
    return res.status(404).json({ message: 'Product not found' });
  }

  const currentUser = req.user;

  if (currentUser.role === 'premium' && currentUser.email !== product.owner) { 
    return res.status(403).json({ message: 'You can only update your own products' });
  }
  await product.save();

  return res.status(200).json({ message: 'Product updated successfully', product }); 

};

export const deleteProduct = async (req, res) => { 
  const { pid } = req.params;

  const product = await getProductById(pid);
  if (!product) { 
    return res.status(404).json({ message: 'Product not found' });
  }

  const currentUser = req.user;

  if (currentUser.role === 'premium' && currentUser.email !== product.owner) { 
    return res.status(403).json({ message: 'You can only delete your own products' }); 
  }

  await deleteProductById(pid);

  return res.status(200).json({ message: 'Product deleted successfully' });

};





