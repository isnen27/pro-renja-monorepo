// src/app.module.ts
// Main Application Module - Pro Renja Monorepo API

import { Module } from '@nestjs/common';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { ReferensiModule } from './modules/referensi/referensi.module.js';

@Module({
  imports: [
    ReferensiModule, // Referensi (Reference Data) Module - BAS, Pejabat, SBK, OPD
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
