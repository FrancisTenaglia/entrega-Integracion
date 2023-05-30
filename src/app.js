import express from 'express';
import { engine } from 'express-handlebars';
import mongoose from 'mongoose';
import { Server } from "socket.io";
import viewsRouter from './routes/views.routes.js';
import cartsRouter from './routes/carts.routes.js';
import productsRouter from './routes/products.routes.js';
import messages from './api/dao/models/messages.model.js';
import { __dirname } from './utils.js';

const PORT = 8080;
const MONGOOSE_URL = 'mongodb://127.0.0.1:27017/ecommerce';

// Instancia del servidor express
const app = express();

// Parseo correcto de urls
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
//contenidos estaticos
app.use('/public', express.static(`${__dirname}/public`));

//Endpoints API REST
app.use('/', viewsRouter)
app.use('/api/products', productsRouter);
app.use('/api/carts', cartsRouter);


// Motor de plantillas
app.engine('handlebars', engine());
app.set('view engine', 'handlebars');
app.set('views', `${__dirname}/views`);

const httpServer = app.listen(PORT, () => {
    console.log(`Servidor iniciado en puerto ${PORT}`);
});

try {
    await mongoose.connect(MONGOOSE_URL);
} catch (err) {
    console.log('No se puede conectar con el servidor de bbdd: ', err);
}

// Socket.io
const io = new Server(httpServer);

const getLogs = async () => {
    return await messages.find();
}

io.on("connection", async (socket) => {
    console.log("Nuevo cliente conectado!");

    const logs = await getLogs();
    io.emit("log", { logs });

    socket.on("message", async (data) => {
        await messages.create({
            user: data.user,
            message: data.message,
            time: data.time,
        });
        const logs = await getLogs();
        io.emit("log", { logs });
    });
    socket.on("userAuth", (data) => {
        socket.broadcast.emit("newUser", data);
    });
});