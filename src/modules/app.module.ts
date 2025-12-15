import { Module, ValidationPipe } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { PgConfigModule } from "src/database/pg-config.module";
import { ShapeModule } from "./shape.module";
import { CategoryModule } from "./category.module";
import { FormModule } from "./form.module";
import { FilledFormModule } from "./filled_form.module";
import { MunicipalityModule } from "./municipality.module";
import { ParrishModule } from "./parrish.module";
import { AppController } from "src/controllers/app.controller";
import { AppService } from "src/services/app.service";
import { APP_PIPE } from "@nestjs/core";
import { UsersModule } from './users.module';
import { AuthModule } from './auth.module';
import { RoleModule } from './role.module';
import { InstitutionModule } from './institution.module';


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
    RoleModule,
    InstitutionModule
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_PIPE,
      useClass: ValidationPipe
    }
  ],
})
export class AppModule { }
