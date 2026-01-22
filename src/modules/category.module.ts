import { Module } from '@nestjs/common';
import { CategoryController } from 'src/controllers/category.controller';
import { CategoryService } from 'src/services/category.service';
import { AlsModule } from './als.module';

@Module({
  imports: [AlsModule],
  controllers: [CategoryController],
  providers: [CategoryService],
})
export class CategoryModule {}
