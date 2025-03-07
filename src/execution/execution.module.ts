import { Module } from '@nestjs/common';
import { ContainerManagerService } from './container-manager/container-manager.service';
import { ExecutionController } from './execution.controller';

@Module({
  providers: [ContainerManagerService],
  controllers: [ExecutionController]
})
export class ExecutionModule {}
