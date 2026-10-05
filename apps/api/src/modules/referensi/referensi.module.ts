// src/modules/referensi/referensi.module.ts
// Module for Referensi (Reference Data) Feature

import { Module } from '@nestjs/common';
import { ReferensiController } from './referensi.controller.js';
import {
  BaganAkunService,
  PejabatService,
  SbkService,
  OpdService,
  baganAkunService,
  pejabatService,
  sbkService,
  opdService,
} from './referensi.service.js';

@Module({
  controllers: [ReferensiController],
  providers: [
    BaganAkunService,
    PejabatService,
    SbkService,
    OpdService,
    { provide: 'BaganAkunService', useValue: baganAkunService },
    { provide: 'PejabatService', useValue: pejabatService },
    { provide: 'SbkService', useValue: sbkService },
    { provide: 'OpdService', useValue: opdService },
  ],
  exports: [BaganAkunService, PejabatService, SbkService, OpdService],
})
export class ReferensiModule {}
