/*
import {} from 'dotenv/config';
import http from 'http';
import express from 'express';
import mongoose from 'mongoose';
import { engine } from 'express-handlebars';
import session from 'express-session';
import MongoStore from 'connect-mongo';
import cookieParser from 'cookie-parser';
import passport from 'passport';
import initializePassport from './auth/passport.config.js';

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
app.use('/api/products', productsRouter);
app.use('/api/carts', cartsRouter);
app.use('/api/sessions', sessionsRouter);

// Contenidos estáticos
app.use('/public', express.static(`${__dirname}/public`));

// Motor de plantillas
app.engine('handlebars', engine());
app.set('view engine', 'handlebars');
app.set('views', `${__dirname}/views`);

try {
    await mongoose.connect(MONGOOSE_URL);
    server.listen(PORT, () => {
        console.log(`Servidor iniciado en puerto ${PORT}`);
    });
} catch(err) {
    console.log(`No se puede conectar con el servidor de bbdd (${err.message})`);
}
*/

//PARTE NUEVA 

// Environment variables
import config from './utils/config.js';
// Project route path
import { __dirname } from './utils/fileUtils.js';
// Services
import express from 'express';
import { Server } from 'socket.io';
import session from 'express-session';
import handlebars from 'express-handlebars';
import MongoStore from 'connect-mongo';
import passport from 'passport';
// Persistence service
import MongoSingleton from './dao/mongo.js';
// Routes
import mainRouter from './routes/main.routes.js';
import productsRouter from './routes/products.routes.js';
import cartsRouter from './routes/carts.routes.js';
import messagesRouter from './routes/messages.routes.js';
import viewsRouter from './routes/views.routes.js';
import initializePassport from './auth/passport.config.js';

const PORT = 3030;
const WS_PORT = 3000;
const MONGOOSE_URL = 'mongodb+srv://fgtenaglia96:MARIQUENA123@cluster0.m2c4it6.mongodb.net/?retryWrites=true&w=majority';
const SESSION_SECRET = 'mf';
const BASE_URL = `mongodb+srv://fgtenaglia96:MARIQUENA123@cluster0.m2c4it6.mongodb.net/?retryWrites=true&w=majority`;
const WS_URL = `mongodb+srv://fgtenaglia96:MARIQUENA123@cluster0.m2c4it6.mongodb.net/?retryWrites=true&w=majority`;

// Creación de servidores
const server = express();
const httpServer = server.listen(WS_PORT, () => {
  console.log(`Socketio server active in port ${WS_PORT}`);
});
const wss = new Server(httpServer, {
  cors: {
    origin: BASE_URL,
    methods: ['GET', 'POST']
  }
});

// Parseo
server.use(express.json());
server.use(express.urlencoded({ extended: true }));

// Persistencia de sesiones
const store = MongoStore.create({
  mongoUrl: MONGOOSE_URL,
  mongoOptions: {
    useNewUrlParser: true,
    useUnifiedTopology: true
  },
  ttl: 30
});
server.use(
  session({
    store,
    secret: SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 1000 * 1500 } // 600 segundos / 10 minutes
  })
);
server.use(passport.initialize());
initializePassport();

// Entry point
server.use('/', mainRouter(store, BASE_URL));

// Enpoints API REST
server.use('/api/products', productsRouter(wss));
server.use('/api/carts', cartsRouter);
server.use('/api/messages', messagesRouter(wss));

// Motor de plantillas
server.engine('handlebars', handlebars.engine());
server.set('view engine', 'handlebars');
server.set('views', `${__dirname}/views`);

// Endpoint views
server.use('/', viewsRouter(BASE_URL, WS_URL));

// Contenidos estáticos
server.use('/public', express.static(`${__dirname}/public`));

// Eventos socket.io
wss.on('connection', (socket) => {
  console.log(`Client connected (${socket.id})`);
  socket.emit('server_confirm', 'Client connection received');
  socket.on('disconnect', (reason) => {
    console.log(`Client disconnected (${socket.id}): ${reason}`);
  });
});

// Activación y escucha del servidor
try {
  MongoSingleton.getInstance();
  server.listen(PORT, () => {
    console.log(`Server active in port ${PORT}`);
  });
} catch (err) {
  console.log(`Couldn't connect to DB server`);
}
