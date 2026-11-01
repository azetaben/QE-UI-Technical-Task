import * as winston from 'winston';
import colors from '@colors/colors';

import dotenv from 'dotenv';
dotenv.config({ path: './env/.env'});

//Define the custom format
const myFormat = winston.format.printf(({ level, message, timestamp }) => {
    let colorizedMessage = message;
    switch (level) {
        case 'error':
            if (typeof message === "string") {
                colorizedMessage = colors.red(message);
            }
            break;
        case 'warn':
            if (typeof message === "string") {
                colorizedMessage = colors.yellow(message);
            }
            break;
        case 'info':
            if (typeof message === "string") {
                colorizedMessage = colors.green(message);
            }
            break;
    }
    return `${timestamp} ${level}: ${colorizedMessage}`
});

//Create a logger instance
const logger = winston.createLogger({
    level: process.env.LOG_LEVEL || 'info',
    format: winston.format.combine(
        winston.format.timestamp(),
        myFormat
    ),
    transports: [
        new winston.transports.Console()
    ]
})

export default logger;