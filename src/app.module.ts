import { Module, ValidationPipe } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ShapeModule } from './shape/shape.module';
import { ConfigModule } from '@nestjs/config';
import { APP_PIPE } from '@nestjs/core';
import { CategoryModule } from './category/category.module';
import { FormModule } from './form/form.module';
import { FilledFormModule } from './filled_form/filled_form.module';
import { MunicipalityModule } from './municipality/municipality.module';
import { ParrishModule } from './parrish/parrish.module';
import { PgConfigModule } from './database/pg-config.module';

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
    ParrishModule
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
