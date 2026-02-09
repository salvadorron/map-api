import { MiddlewareConsumer, Module, RequestMethod, ValidationPipe } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { PgConfigModule } from "src/database/pg-config.module";
import { ShapeModule } from "./shape.module";
import { CategoryModule } from "./category.module";
import { FormModule } from "./form.module";
import { FilledFormModule } from "./filled_form.module";
import { MunicipalityModule } from "./municipality.module";
import { ParrishModule } from "./parrish.module";
import { APP_PIPE, APP_INTERCEPTOR } from "@nestjs/core";
import { UsersModule } from './users.module';
import { AuthModule } from './auth.module';
import { InstitutionModule } from './institution.module';
import { LogModule } from './log.module';
import { AsyncLocalStorage } from "async_hooks";
import { AuthMiddleware } from "src/middlewares/auth.middleware";
import { AlsModule } from "./als.module";
import { AuthMiddlewareModule } from "./auth-middleware.module";
import { ModuleRef } from "@nestjs/core";
import { ReportsModule } from './reports.module';
import { LoggingInterceptor } from "src/interceptors/logging.interceptor";
import { HealthModule } from "./health.module";


@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true
    }),
    PgConfigModule,
    ShapeModule,
    CategoryModule,
    FormModule,
    FilledFormModule,
    MunicipalityModule,
    ParrishModule,
    UsersModule,
    AuthModule,
    InstitutionModule,
    LogModule,
    HealthModule,
    AlsModule,
    AuthMiddlewareModule,
    ReportsModule,
  ],
  controllers: [],
  providers: [
    {
      provide: APP_PIPE,
      useClass: ValidationPipe
    },
    {
      provide: APP_INTERCEPTOR,
      useFactory: (moduleRef: ModuleRef) => {
        const als = moduleRef.get(AsyncLocalStorage<AlsStore>, { strict: false });
        return new LoggingInterceptor(moduleRef, als);
      },
      inject: [ModuleRef],
    }
  ],
})
export class AppModule {
  constructor(
    private readonly als: AsyncLocalStorage<AlsStore>,
    private readonly moduleRef: ModuleRef,
  ) { }

  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply((req, res, next) => {
        const store = {
          userId: null,
          role: null,
          institutionId: null,
          username: null,
          email: null,
        };

        this.als.run(store, () => next());
      })
      .forRoutes({ path: '*', method: RequestMethod.ALL });
    
    consumer
      .apply(async (req, res, next) => {
        const authMiddleware = this.moduleRef.get(AuthMiddleware, { strict: false });
        return authMiddleware.use(req, res, next);
      })
      .exclude(
        { path: 'auth/login', method: RequestMethod.POST },
        { path: 'auth/register', method: RequestMethod.POST },
        { path: 'auth/refresh-token', method: RequestMethod.POST },
        { path: 'auth/logout', method: RequestMethod.POST },
        { path: 'auth/forgot-password', method: RequestMethod.POST },
        { path: 'auth/reset-password', method: RequestMethod.POST },
        { path: 'users', method: RequestMethod.POST },
      )
      .forRoutes({ path: '*', method: RequestMethod.ALL });
  }
}

export interface AlsStore {
  userId: string | null;
  role: string | null;
  institutionId: string | null;
  username: string | null;
  email: string | null;
}