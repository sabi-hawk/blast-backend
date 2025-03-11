
import { Request, Response } from "express";
import _ from "lodash";
import { __DEBUG__ } from "../../config/app";
import winston from 'winston';
import path from 'path';

export class HttpError extends Error {
  status: number;
  data?: Record<string, unknown>;

  constructor(status: number, message: string, data?: Record<string, unknown>) {
    super(message);
    this.status = status;
    this.data = data;
    Object.setPrototypeOf(this, HttpError.prototype); // Maintain prototype chain
  }
}

const Logger = winston.createLogger({
  level: 'debug', // Set the log level as needed
  format: winston.format.json(),
  transports: [
    new winston.transports.Console(), // Log to the console
    new winston.transports.File({ filename: path.join(__dirname, '..', '..', "..", 'logs', 'index.txt') }),
    // Add more transports as needed (e.g., file transport)
  ],
});

// console.log("PATH IS:", path.join(__dirname, '..', '..', "..", 'logs', 'index.txt'))
type HttpMethod = (req: Request, res: Response) => Promise<void>;

export function httpMethod(method: HttpMethod): HttpMethod {
  return async (req: Request, res: Response) => {
    const methodName = `${req.method} : ${req.originalUrl}`;
    try {
      Logger.debug(
        `Http Request | Start: ${methodName}`,
        JSON.stringify(_.merge(req.body, req.params, req.query), null, 2)
      );
      const resp = await method(req, res);

      Logger.debug(`Http Request | Complete: ${methodName}`, JSON.stringify(resp, null, 2));
    } catch (e: unknown) {
      const error = e instanceof HttpError ? e : new HttpError(500, "Internal Server Error");
      Logger.debug(
        `Http Request | Error: ${methodName}`,
        error.message,
        JSON.stringify(error.data || {}, null, 2)
      );
      res.status(error.status).json({
        ...error.data,
        message: error.message,
        stack: __DEBUG__ ? error.stack : undefined,
        error: e
      });
    }
  };
}