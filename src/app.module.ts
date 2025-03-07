import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ExecutionModule } from './execution/execution.module';
import { HealthModule } from './health/health.module';

@Module({
  imports: [ExecutionModule, HealthModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
