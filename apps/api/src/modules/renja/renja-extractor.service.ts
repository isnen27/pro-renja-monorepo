import { Injectable, BadRequestException } from '@nestjs/common';
import { spawn } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

@Injectable()
export class RenjaExtractorService {
  async extractDocument(file: any): Promise<any> {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    const origExt = path.extname(file.originalname).toLowerCase();
    if (!['.pdf', '.docx', '.doc'].includes(origExt)) {
      throw new BadRequestException('Format file harus berupa .pdf atau .docx');
    }

    // Buat file temporary untuk dibaca script python
    const tempDir = os.tmpdir();
    const tempFilePath = path.join(
      tempDir,
      `renja_upload_${Date.now()}_${Math.random().toString(36).substring(2, 8)}${origExt}`
    );

    await fs.promises.writeFile(tempFilePath, file.buffer);

    try {
      const scriptPath = path.resolve(
        process.cwd(),
        'src/scripts/extract_renja.py'
      );

      const parsedData = await new Promise((resolve, reject) => {
        const proc = spawn('python3', [scriptPath, tempFilePath]);
        let stdoutData = '';
        let stderrData = '';

        proc.stdout.on('data', (chunk) => {
          stdoutData += chunk.toString();
        });

        proc.stderr.on('data', (chunk) => {
          stderrData += chunk.toString();
        });

        proc.on('close', (code) => {
          if (code !== 0) {
            reject(
              new Error(
                stderrData || `Ekstraksi gagal dengan kode keluar ${code}`
              )
            );
          } else {
            try {
              const json = JSON.parse(stdoutData);
              resolve(json);
            } catch (err) {
              reject(
                new Error(
                  `Gagal mem-parsing keluaran JSON: ${stdoutData.substring(0, 200)}`
                )
              );
            }
          }
        });
      });

      return {
        success: true,
        filename: file.originalname,
        data: parsedData,
      };
    } finally {
      // Bersihkan file temporer
      if (fs.existsSync(tempFilePath)) {
        await fs.promises.unlink(tempFilePath).catch(() => {});
      }
    }
  }
}
