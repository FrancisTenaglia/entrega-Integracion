import mongoose from 'mongoose';

const collection = 'users';

const schema = new mongoose.Schema({
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    userName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    age: { type: Number, required: true },
    password: { type: String, required: true },
    cartId: { type: [ mongoose.Schema.Types.ObjectId ], ref: 'products' },
    role: { type: String, default: 'user'},
});

const userModel = mongoose.model(collection, schema);

export default userModel;
