import mongoose from 'mongoose';

const collection = 'messages';

const schema = new mongoose.Schema({
    id: Number,
    user: String, 
    message: String,
});

const messages = mongoose.model(collection, schema);

export default messages;