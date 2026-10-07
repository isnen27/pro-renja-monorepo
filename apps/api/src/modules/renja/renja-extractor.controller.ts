import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { RenjaExtractorService } from './renja-extractor.service.js';

@Controller('api/renja-eselon1')
export class RenjaExtractorController {
  constructor(private readonly extractorService: RenjaExtractorService) {}

  @Post('extract-document')
  @UseInterceptors(FileInterceptor('file'))
  async extractDocument(@UploadedFile() file: any) {
    if (!file) {
      throw new BadRequestException('File tidak ditemukan. Silakan upload file .docx atau .pdf.');
    }
    return this.extractorService.extractDocument(file);
  }
}
