import { Injectable } from '@nestjs/common';

import { IScoringStrategy, ScoringContext, ScoringResult } from './scoring-strategy.interface';

interface EnglishAnswerPolicy {
  caseSensitive?: boolean;
  ignorePunct?: boolean;
  allowBritish?: boolean;
}

interface EnglishAnswerKey {
  policy?: EnglishAnswerPolicy;
  lines: string[];
}

@Injectable()
export class EnglishFillBlankStrategy implements IScoringStrategy {
  readonly name = 'EnglishFillBlank';

  async score(answer: string, context: ScoringContext): Promise<ScoringResult> {
    const key = context.answerKey as EnglishAnswerKey;
    const normalized = this.normalize(answer, key.policy);
    const match = key.lines.some((line) => this.normalize(line, key.policy) === normalized);
    return {
      score: match ? context.maxScore : 0,
      normalizedAnswer: normalized,
      why: match ? ['匹配标准答案'] : ['未匹配任何标准答案']
    };
  }

  private normalize(text: string, policy?: EnglishAnswerPolicy) {
    let value = text.trim();
    if (policy?.ignorePunct) {
      value = value.replace(/[.,!?;:'"\s]/g, '');
    }
    if (!policy?.caseSensitive) {
      value = value.toLowerCase();
    }
    if (policy?.allowBritish) {
      value = value.replace(/colour/g, 'color').replace(/favour/g, 'favor');
    }
    return value;
  }
}
