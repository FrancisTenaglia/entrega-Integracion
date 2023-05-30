import mongoose from 'mongoose';

const collection = 'carts';

const schema = new mongoose.Schema({
    products: {
      type: [
        {
          pid: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "products",
            required: true,
          },
          quantity: {
            type: Number || 1,
            required: true,
          },
        },
      ],
      default: [],
      required: true,
    },
  });

const cartsModel = mongoose.model(collection, schema);

export default cartsModel;