import { IdentifyService } from './identify.service';
import { CreateIdentifyDto } from './dto/create-identify.dto';
import { Controller, Post, Body } from '@nestjs/common';

@Controller('identify')
export class IdentifyController {
  constructor(private readonly identifyService: IdentifyService) {}

  @Post()
  create(@Body() createIdentifyDto: CreateIdentifyDto) {
    return this.identifyService.create(createIdentifyDto);
  }
}
