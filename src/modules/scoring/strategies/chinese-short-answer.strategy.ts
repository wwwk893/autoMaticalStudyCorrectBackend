import { Injectable } from '@nestjs/common';

import { IScoringStrategy, ScoringContext, ScoringResult } from './scoring-strategy.interface';

interface ChineseAnswerKey {
  normalize?: {
    stripPunct?: boolean;
    simp?: boolean;
    z2h?: boolean;
  };
  lines: { text: string; maxTypos?: number }[];
}

@Injectable()
export class ChineseShortAnswerStrategy implements IScoringStrategy {
  readonly name = 'ChineseShortAnswer';

  async score(answer: string, context: ScoringContext): Promise<ScoringResult> {
    const key = context.answerKey as ChineseAnswerKey;
    const normalized = this.normalize(answer, key.normalize);
    const matched = key.lines.some((line) => this.fuzzyMatch(normalized, this.normalize(line.text, key.normalize), line.maxTypos));
    return {
      score: matched ? context.maxScore : 0,
      normalizedAnswer: normalized,
      why: matched ? ['完全匹配或在容错范围内'] : ['与答案不匹配']
    };
  }

  private normalize(text: string, options?: ChineseAnswerKey['normalize']) {
    let result = text.trim();
    if (options?.stripPunct) {
      result = result.replace(/[，。！？、\s]/g, '');
    }
    if (options?.simp) {
      // 简化版：不做真正的简繁转换
      result = result.normalize('NFKC');
    }
    if (options?.z2h) {
      result = result.replace(/[\uFF10-\uFF5A]/g, (ch) => String.fromCharCode(ch.charCodeAt(0) - 0xfee0));
    }
    return result;
  }

  private fuzzyMatch(answer: string, expected: string, maxTypos = 0) {
    if (answer === expected) {
      return true;
    }
    if (maxTypos === 0) {
      return false;
    }
    const distance = this.levenshtein(answer, expected);
    return distance <= maxTypos;
  }

  private levenshtein(a: string, b: string) {
    const dp = Array.from({ length: a.length + 1 }, () => Array(b.length + 1).fill(0));
    for (let i = 0; i <= a.length; i++) dp[i][0] = i;
    for (let j = 0; j <= b.length; j++) dp[0][j] = j;
    for (let i = 1; i <= a.length; i++) {
      for (let j = 1; j <= b.length; j++) {
        const cost = a[i - 1] === b[j - 1] ? 0 : 1;
        dp[i][j] = Math.min(dp[i - 1][j] + 1, dp[i][j - 1] + 1, dp[i - 1][j - 1] + cost);
      }
    }
    return dp[a.length][b.length];
  }
}
