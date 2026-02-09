import { Module } from '@nestjs/common';
import { ReportsController } from 'src/controllers/reports.controller';
import { ReportService } from 'src/services/report.service';
import { CategoryModule } from './category.module';
import { UsersModule } from './users.module';
import { LogModule } from './log.module';

@Module({
  imports: [CategoryModule, UsersModule, LogModule],
  controllers: [ReportsController],
  providers: [ReportService],
})
export class ReportsModule {}
