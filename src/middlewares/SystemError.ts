import { Request, Response, NextFunction } from 'express';

export class SystemError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'SystemError';

        Error.captureStackTrace(this, SystemError);
    }
}

export const systemErrorHandler = (
    error: Error,
    req: Request,
    res: Response,
    next: NextFunction
): void => {
    if (error instanceof SystemError) {
        res.status(400).json({ error: error.message });
        return;
    }
    next(error);
};