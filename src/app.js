import {} from 'dotenv/config';
import http from 'http';
import express from 'express';
import mongoose from 'mongoose';
import { engine } from 'express-handlebars';
import session from 'express-session';
import MongoStore from 'connect-mongo';
import cookieParser from 'cookie-parser';
import passport from 'passport';
import initializePassport from './auth/passport.config';

// rutas
import userRoutes from './routes/users.routes.js';
import mainRoutes from './routes/main.routes.js';
import viewsRouter from './routes/views.routes.js';
import cartsRouter from './routes/carts.routes.js';
import productsRouter from './routes/products.routes.js';
import sessionsRouter from './routes/sessions.routes.js';
// import messages from './api/dao/models/messages.model.js';
import { __dirname } from './utils.js';

const PORT = parseInt(process.env.SERVER_PORT) || 3000;
const MONGOOSE_URL = process.env.MONGOOSE_URL || 'mongodb://127.0.0.1';
const SESSION_SECRET = process.env.SESSION_SECRET || 's3cr3tk3y';

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

initializePassport();
app.use(passport.initialize());
app.use(cookieParser());

// Gestion de sesiones
const store = MongoStore.create({ mongoUrl: MONGOOSE_URL, mongoOptions: {}, ttl: 30 });
app.use(session({
    store: store,
    secret: SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: { secure: true }
}));

initializePassport();
app.use(passport.initialize());
app.use(passport.session());

//Endpoints API REST
app.use('/', viewsRouter)
app.use('/', mainRoutes(io, store, `http://localhost:${PORT}`, 10));
app.use('/api', userRoutes(io));
app.use('/api/products', productsRouter);
app.use('/api/carts', cartsRouter);
app.use('/api/sessions', sessionsRouter);

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
