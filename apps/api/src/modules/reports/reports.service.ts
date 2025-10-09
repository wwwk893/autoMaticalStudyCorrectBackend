import { Injectable } from '@nestjs/common';
import { createHash } from 'crypto';

@Injectable()
export class ReportsService {
  generateGradeReport(format: 'pdf' | 'excel') {
    const key = createHash('sha1').update(`${format}-${Date.now()}`).digest('hex');
    return {
      downloadUrl: `https://storage.local/reports/${key}.${format === 'pdf' ? 'pdf' : 'xlsx'}`,
      meta: {
        topMistakes: [
          { questionId: 'q1', rate: 0.32 },
          { questionId: 'q2', rate: 0.28 }
        ],
        radar: [
          { dimension: '阅读理解', score: 0.7 },
          { dimension: '计算', score: 0.85 }
        ],
        distribution: [
          { bucket: '0-60', count: 5 },
          { bucket: '60-80', count: 12 },
          { bucket: '80-100', count: 8 }
        ]
      }
    };
  }
}
