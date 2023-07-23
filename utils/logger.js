import dotenv from 'dotenv';
import winston from 'winston';

dotenv.config();

const customLevelOptions = {
    levels: {
        debug: 5,
        http: 4,
        info: 3,
        warning: 2,
        error: 1,
        fatal: 0,
    },
    colors: {
        fatal: 'red',
        error: 'red',
        warning: 'yellow',
        info: 'blue',
        http: 'white',
        debug: 'white'
    }
}

// Implementacion logger para desarrollo:
const devLogger = winston.createLogger({
    levels: customLevelOptions.levels,
    transports: [
        new winston.transports.Console({
            level: 'debug',
            format: winston.format.combine(
                winston.format.colorize({colors: customLevelOptions.colors}),
                winston.format.simple()
            )
        }),
    ]
})

// Implementacion logger para produccion:
const prodLogger = winston.createLogger({
    levels: customLevelOptions.levels,
    transports: [
        
        // Logs productivos a partir de info
        new winston.transports.Console({
            level: 'info',
            format: winston.format.combine(
                winston.format.colorize({colors: customLevelOptions.colors}),
                winston.format.simple()
            )
        }),
        // Logs de error a archivo especifico
        new winston.transports.File({level: 'error', filename: '../src/logs/errors.log'}),
    ]
})

// Generamos un pequeño middleware que inyecta el logger en el objeto request,
// y por supuesto puede también llamar directamente al logger si se lo requiere.
export const addLogger = (req, res, next) => {
    // req.logger = process.env.development.MODE === 'DEVEL' ? devLogger : prodLogger
    req.logger = prodLogger;
    next();
}