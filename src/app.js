import {} from 'dotenv/config';
import http from 'http';
import express from 'express';
import mongoose from 'mongoose';
import { Server } from "socket.io";
import { engine } from 'express-handlebars';
import session from 'express-session';
import MongoStore from 'connect-mongo';

// rutas
import userRoutes from './routes/users.routes.js';
import mainRoutes from './routes/main.routes.js';
import viewsRouter from './routes/views.routes.js';
import cartsRouter from './routes/carts.routes.js';
import productsRouter from './routes/products.routes.js';
// import messages from './api/dao/models/messages.model.js';
import { __dirname } from './utils.js';

const PORT = parseInt(process.env.SERVER_PORT) || 3000;
const MONGOOSE_URL = process.env.MONGOOSE_URL || 'mongodb://127.0.0.1';
const SESSION_SECRET = process.env.SESSION_SECRET;

// Instancia del servidor express y socket.io
const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["PUT", "GET", "POST", "DELETE", "OPTIONS"],
        credentials: false
    }
});

// Parseo correcto de urls
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Gestion de sesiones
const store = MongoStore.create({ mongoUrl: MONGOOSE_URL, mongoOptions: {}, ttl: 30 });
app.use(session({
    store: store,
    secret: SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
}));

//Endpoints API REST
app.use('/', viewsRouter)
app.use('/', mainRoutes(io, store, `http://localhost:${PORT}`, 10));
app.use('/api', userRoutes(io));
app.use('/api/products', productsRouter);
app.use('/api/carts', cartsRouter);

// Contenidos estáticos
app.use('/public', express.static(`${__dirname}/public`));

// Motor de plantillas
app.engine('handlebars', engine());
app.set('view engine', 'handlebars');
app.set('views', `${__dirname}/views`);

//  SOCKET.IO
io.on('connection', (socket) => { 
    console.log(`Cliente conectado (${socket.id})`);
    
    socket.emit('server_confirm', 'Conexión recibida');
    
    socket.on('new_product_in_cart', (data) => {
        io.emit('product_added_to_cart', data);
    });
    
    socket.on("disconnect", (reason) => {
        console.log(`Cliente desconectado (${socket.id}): ${reason}`);
    });
});

try {
    await mongoose.connect(MONGOOSE_URL);
    server.listen(PORT, () => {
        console.log(`Servidor iniciado en puerto ${PORT}`);
    });
} catch(err) {
    console.log(`No se puede conectar con el servidor de bbdd (${err.message})`);
}

/* ENTREGA ANTERIOR !
const httpServer = app.listen(PORT, () => {
    console.log(`Servidor iniciado en puerto ${PORT}`);
});

try {
    await mongoose.connect(MONGOOSE_URL);
} catch (err) {
    console.log('No se puede conectar con el servidor de bbdd: ', err);
}

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
*/