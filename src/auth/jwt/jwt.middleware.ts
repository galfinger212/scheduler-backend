import {
  Injectable,
  NestMiddleware,
  UnauthorizedException,
} from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class JwtMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const authHeader = req.headers['authorization'];
    if (!authHeader) {
      throw new UnauthorizedException('Authorization header is missing');
    }

    const token = authHeader.split(' ')[1]; // Extract token
    if (!token) {
      throw new UnauthorizedException('Token is missing');
    }

    try {
      // Verify the token using your secret key
      const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);

      // Attach user data to the request object
      req.user = decoded as { userId: number; role: string };

      next(); // Proceed to the next middleware or controller
    } catch (error) {
      throw new UnauthorizedException('Invalid or expired token', error);
    }
  }
}
