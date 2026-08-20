import { Request, Response, NextFunction } from 'express';
import { AnyZodObject, ZodError } from 'zod';

/**
 * Middleware to validate incoming request body, query, and params using a Zod schema.
 * Throws ZodError which is automatically caught by the global error handler.
 */
export const validateRequest =
  (schema: AnyZodObject) =>
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const validatedData = await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });

      if (validatedData.body !== undefined) req.body = validatedData.body;
      if (validatedData.query !== undefined) req.query = validatedData.query as any;
      if (validatedData.params !== undefined) req.params = validatedData.params as any;

      next();
    } catch (error) {
      if (error instanceof ZodError) {
        next(error); // Global error handler formats ZodError as 422
      } else {
        next(error);
      }
    }
  };
