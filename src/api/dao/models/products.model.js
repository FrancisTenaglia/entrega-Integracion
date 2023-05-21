import mongoose from 'mongoose';

const collection = 'products';

const schema = new mongoose.Schema({
    id: Number,
    status: Boolean,
    title: String,
    description: { type: String, required: true },
    code: String,
    price: Number,
    stock: Number,
    category: String,
});

const productModel = mongoose.model(collection, schema);

export default productModel;