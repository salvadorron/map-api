import { Module } from "@nestjs/common";
import { AuthMiddleware } from "src/middlewares/auth.middleware";
import { AuthModule } from "./auth.module";
import { AlsModule } from "./als.module";

@Module({
    imports: [AuthModule, AlsModule],
    providers: [AuthMiddleware],
    exports: [AuthMiddleware],
})
export class AuthMiddlewareModule {}

