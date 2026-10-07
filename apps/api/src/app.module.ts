// src/app.module.ts
// Main Application Module - Pro Renja Monorepo API

import { Module } from '@nestjs/common';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { ReferensiModule } from './modules/referensi/referensi.module.js';
import { RenjaExtractorModule } from './modules/renja/renja-extractor.module.js';

@Module({
  imports: [
    ReferensiModule, // Referensi (Reference Data) Module - BAS, Pejabat, SBK, OPD
    RenjaExtractorModule, // Renja Eselon I Document Extractor Module (.docx / .pdf)
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
