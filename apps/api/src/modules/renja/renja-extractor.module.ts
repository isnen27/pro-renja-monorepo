import { Module } from '@nestjs/common';
import { RenjaExtractorController } from './renja-extractor.controller.js';
import { RenjaExtractorService } from './renja-extractor.service.js';

@Module({
  controllers: [RenjaExtractorController],
  providers: [RenjaExtractorService],
  exports: [RenjaExtractorService],
})
export class RenjaExtractorModule {}
