import { NextFunction, Request, Response } from "express";

type AsyncController = (req: Request, res: Response, next: NextFunction) => Promise<unknown>;

// Envuelve un controller async: si algo lanza un error (throw), lo reenvía
// a next(err), y de ahí lo recibe errorHandler.ts. Sin esto, un throw dentro
// de una función async no llega automáticamente al errorHandler de Express.
export function asyncHandler(fn: AsyncController) {
  return (req: Request, res: Response, next: NextFunction) => {
    fn(req, res, next).catch(next);
  };
}
