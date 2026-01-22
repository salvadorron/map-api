import { Module } from '@nestjs/common';
import { LogController } from 'src/controllers/log.controller';
import { LogService } from 'src/services/log.service';
import { LoggingInterceptor } from 'src/interceptors/logging.interceptor';
import { AlsModule } from './als.module';

@Module({
  imports: [AlsModule],
  controllers: [LogController],
  providers: [LogService, LoggingInterceptor],
  exports: [LogService, LoggingInterceptor],
})
export class LogModule {}

