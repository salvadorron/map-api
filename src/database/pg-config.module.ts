import { Global, Module } from '@nestjs/common';
import { PgService } from './pg-config.service';

@Global()
@Module({
  providers: [PgService],
  exports: [PgService],
})

export class PgConfigModule { }