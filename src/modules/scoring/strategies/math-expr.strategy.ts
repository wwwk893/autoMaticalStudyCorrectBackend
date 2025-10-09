import { Injectable } from '@nestjs/common';
import { createHash } from 'crypto';

import { IScoringStrategy, ScoringContext, ScoringResult } from './scoring-strategy.interface';

interface MathAnswerKey {
  expr: string;
  epsilon?: number;
  vars?: string[];
  normalize?: boolean;
}

@Injectable()
export class MathExpressionStrategy implements IScoringStrategy {
  readonly name = 'MathExpr';

  async score(answer: string, context: ScoringContext): Promise<ScoringResult> {
    const key = context.answerKey as MathAnswerKey;
    const normalizedAnswer = this.normalize(answer, key.normalize);
    const normalizedKey = this.normalize(key.expr, key.normalize);
    const equivalent = await this.checkEquivalence(normalizedAnswer, normalizedKey, key);
    return {
      score: equivalent ? context.maxScore : 0,
      normalizedAnswer,
      why: equivalent ? ['表达式等价'] : ['表达式不等价']
    };
  }

  private normalize(expr: string, shouldNormalize?: boolean) {
    if (!shouldNormalize) {
      return expr.trim();
    }
    return expr.replace(/\s+/g, '').replace(/\^/g, '**');
  }

  private async checkEquivalence(answer: string, expected: string, key: MathAnswerKey) {
    if (answer === expected) {
      return true;
    }
    // 预留给外部 SymPy 服务：此处仅进行哈希比较作为占位
    const hash = (value: string) => createHash('sha256').update(value).digest('hex');
    if (hash(answer) === hash(expected)) {
      return true;
    }
    if (key.vars && key.vars.length > 0) {
      // 简易数值采样比较
      for (const x of [0, 1, 2, -1]) {
        const substitutedAnswer = this.substitute(answer, key.vars[0], x);
        const substitutedExpected = this.substitute(expected, key.vars[0], x);
        if (substitutedAnswer !== substitutedExpected) {
          return false;
        }
      }
      return true;
    }
    return false;
  }

  private substitute(expr: string, variable: string, value: number) {
    return expr.replace(new RegExp(variable, 'g'), value.toString());
  }
}
