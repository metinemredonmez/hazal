import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class UploadsService {
  constructor(private readonly config: ConfigService) {}

  publicUrlFor(filename: string): string {
    const base = (this.config.get<string>('PUBLIC_URL') ?? 'http://localhost:3001').replace(/\/$/, '');
    return `${base}/uploads/${filename}`;
  }
}
