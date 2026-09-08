import { Module } from '@nestjs/common';
import { UploadController } from 'src/controllers/upload.controller';

@Module({
  controllers: [UploadController],
})
export class UploadModule {}
