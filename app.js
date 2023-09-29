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
import sessionRoutes from './routes/session.routes.js';
import viewsRouter from './routes/views.routes.js';
import initializePassport from './auth/passport.config.js';
import mockRoutes from './routes/mockProducts.routes.js';
//PARA ENTREGA 32
import cors from 'cors';
import compression from 'express-compression';
import { userRoutes } from './routes/users.routes.js';
import CustomError from './services/customError.js';
import errorsDict from './utils/dictionary.js';

import { addLogger } from './utils/logger.js';

//IMPORTO MODULOS PARA DOCUMENTACION
import swaggerJSDoc from 'swagger-jsdoc';
import swaggerUiExpress from 'swagger-ui-express';

const swaggerOptions ={
  definition: {
    openapi: '3.0.1',
    info: {
      title: 'Documentacion sistema App-eCommerce',
      description: 'Esta documentacion cubre toda la API habilitada para App-eCommerce'
    }
  },
  apis: ['./docs/**/*.yaml']

}
const specs = swaggerJSDoc(swaggerOptions)




const PORTT = 3031;
const PORT = process.env.PORT || 3030;
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
// Activación y escucha del servidor
try {
  MongoSingleton.getInstance();
  server.listen(PORT, () => {
    console.log(`Server active in port ${PORT}`);
  });
} catch (err) {
  console.log(`Couldn't connect to DB server`);
};

// Persistencia de sesiones
const store = MongoStore.create({
  mongoUrl: MONGOOSE_URL,
  mongoOptions: {
    useNewUrlParser: true,
    useUnifiedTopology: true
  },
  ttl: 30
});


//ENTREGA 32 

// Con solo importar el módulo compression y aplicarlo con el middleware use()
// dispondremos de compresión GZIP en cualquier endpoint
server.use(compression()); // En este caso, sin indicar config, utilizamos GZIP por defecto
// Alternativamente podemos utilizar Brotli y otras configs
// app.use(compression({ brotli: {enabled: true, zlib: {}} })); // En este caso, habilitamos BROTLI
// Importante!: cotejar siempre el nivel de ahorro de tráfico vs el consumo de recursos de compresión
// para definir según el tipo de contenido a enviar, si vale la pena activarlo.
server.use(express.json());
server.use(express.urlencoded({ extended: true }));
server.use(cors({ origin: '*', methods: 'GET,PUT,POST', allowedHeaders: 'Content-Type,Authorization' }));
server.use('/api/users', userRoutes());
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
server.use('/api/carts', cartsRouter());
server.use('/api/messages', messagesRouter(wss));
server.use('/mockingproducts', mockRoutes());
server.use("/api/sessions", sessionRoutes());

// Motor de plantillas
server.engine('handlebars', handlebars.engine());
server.set('view engine', 'handlebars');
server.set('views', `${__dirname}/views`);

// Endpoint views
server.use('/', viewsRouter(BASE_URL, WS_URL));

// Contenidos estáticos
server.use('/public', express.static(`${__dirname}/public`));

//FIN ENTREGA 32

server.get('/', async(req, res) => {
  res.status(200).send({ status: 'OK', data: 'Endpoint activo' });
})

//ENTREGA 34

server.get('/loggerTest', addLogger, async(req, res) => {
  res.status(200).send({ status: 'OK', data: 'Endpoint prueba logger activo' });
  
  req.logger.debug(`${req.method} --> prueba debug${new Date().toLocaleTimeString()}`)
  req.logger.http(`${req.method} --> prueba http ${new Date().toLocaleTimeString()}`)
  req.logger.info(`${req.method} --> prueba info ${new Date().toLocaleTimeString()}`)
  req.logger.warning(`${req.method} --> prueba warning ${new Date().toLocaleTimeString()}`)
  req.logger.error(`${req.method} --> prueba error ${new Date().toLocaleTimeString()}`)
  req.logger.fatal(`${req.method} --> prueba fatal ${new Date().toLocaleTimeString()}`)
})

//FIN ENTREGA 34

//MIDDLEWARE PARA DOCUMENTACION

server.use('/apidocs', swaggerUiExpress.serve, swaggerUiExpress.setup(specs))

server.listen(PORTT, () => {console.log(`Listening on ${PORTT}`)})




// Este middleware nos permite capturar cualquier solicitud a endpoint no habilitado y gestionar
// un error y demás procesos que deseemos realizar (registro de logueo, etc)
server.all('*', (req, res, next) => {
    throw new CustomError(errorsDict.ROUTING_ERROR);
});

// Agregando un primer parámetro para un objeto de error, podemos generar un middleware para capturar
// cualquier error y unificar el formato con el cual notificamos por ejemplo.
server.use((err, req, res, next) => {
    const statusCode = err.statusCode || 500;
    res.status(statusCode).send({ status: 'ERR', payload: { msg: err.message } });
});


// Parseo
server.use(express.json());
server.use(express.urlencoded({ extended: true }));

// Eventos socket.io
wss.on('connection', (socket) => {
  console.log(`Client connected (${socket.id})`);
  socket.emit('server_confirm', 'Client connection received');
  socket.on('disconnect', (reason) => {
    console.log(`Client disconnected (${socket.id}): ${reason}`);
  });
});


