import { Injectable, NestMiddleware, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { AsyncLocalStorage } from "async_hooks";
import { NextFunction } from "express";
import { AlsStore } from "src/modules/app.module";
import { JwtService } from "@nestjs/jwt";

@Injectable()
export class AuthMiddleware implements NestMiddleware {
    constructor(
        private readonly als: AsyncLocalStorage<AlsStore>,
        private readonly configService: ConfigService,
        private readonly jwtService: JwtService,
    ) { }

    use(req: Request, res: Response, next: NextFunction) {
        const token = req.headers?.['authorization']?.split(' ')[1];

        if(token) {
            const decoded = this.getPayloadFromToken(token);
            if (!decoded) {
                throw new UnauthorizedException('Invalid token');
            }
            this.als.enterWith({ 
                userId: decoded.sub,
                username: decoded.username,
                email: decoded.email,
                role: decoded.role,
                institutionId: decoded.institution_id,
             });
             this.validateExpiration(decoded?.exp ?? 0);
        }

        next();
    }

    private validateExpiration(expiration: number) {
        if (expiration < Date.now() / 1000) {
            throw new UnauthorizedException('Token expired');
        }
    }

    private getPayloadFromToken(token: string) {
        try {
            const decoded = this.jwtService.verify(token);
            return decoded;
        } catch (error) {
            throw new UnauthorizedException('Invalid token');
        }
    }

}