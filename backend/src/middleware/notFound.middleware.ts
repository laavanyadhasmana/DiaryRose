  // src/middleware/notFound.middleware.ts
  export const notFoundHandler = (req: Request, res: Response) => {
    res.status(404).json({
      status: 'error',
      message: `Route ${req.originalUrl} not found`
    });
  };
  
