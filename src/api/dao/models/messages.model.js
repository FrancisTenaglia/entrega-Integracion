import mongoose from 'mongoose';

const collection = 'messages';

const schema = new mongoose.Schema({
    user: {
        type: String,
        required: true,
    },
    message: {
        type: String,
        required: true,
    },
    time: {
        type: String,
        required: true,
    },
});

const messages = mongoose.model(collection, schema);

export default messages;