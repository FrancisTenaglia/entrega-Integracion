import mongoose from 'mongoose';

const collection = 'carts';

const schema = new mongoose.Schema({
    id: Number,
    products: Array({
        id: Number,
        name: String,
    })
});

const cartsModel = mongoose.model(collection, schema);

export default cartsModel;