import { Module } from '@nestjs/common';
import { IdentifyService } from './identify.service';
import { IdentifyController } from './identify.controller';
import { PrismaService } from 'src/database/db';

@Module({
  controllers: [IdentifyController],
  providers: [IdentifyService, PrismaService],
})
export class IdentifyModule {}
