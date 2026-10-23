import { Injectable } from '@nestjs/common';

export interface ApiInfo {
  name: string;
  version: string;
  status: 'ok';
  endpoints: string[];
}

@Injectable()
export class AppService {
  getInfo(): ApiInfo {
    return {
      name: 'scraptest-api',
      version: '0.1.0',
      status: 'ok',
      endpoints: ['/api', '/api/health'],
    };
  }
}
