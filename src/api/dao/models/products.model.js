import mongoose from 'mongoose';
import mongoosePaginate from "mongoose-paginate-v2";

const collection = 'products';

const schema = new mongoose.Schema({
    category: {
        type: String,
        required: true,
    },
    code: {
        type: String,
        required: true,
        unique: true,
    },
    description: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true,
    },
    status: {
        type: Boolean,
        required: true,
    },
    stock: {
        type: Number,
        required: true,
    },
    thumbnails: {
      type: Array,
      required: true,
    },
    title: {
        type: String,
        required: true,
    },
});

schema.plugin(mongoosePaginate);

export const productModel = mongoose.model(collection, schema);