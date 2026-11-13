'use client';

import { useState, useRef, useEffect } from 'react';

interface HistoryDetail {
  date?: string;
  race_name: string;
  distance?: string;
  rank: string;
  time: string;
  up: string;
  passing: string;
  pci?: string;
}

interface HorseData {
  wakuban: number;
  umaban: number;
  bamei: string;
  kishu: string;
  odds: number;
  kinryou: number;
  bataijuu: number;
  weight_change: number;
  condition_override: string;
  condition_reason?: string;
  training_rank?: string;
  training_4f?: string;
  training_1f?: string;
  rotation_mult?: number;
  rotation_label?: string;
  zenso_chakujun: number;
  avg_agari: number;
  kyakushitsu: number;
  shussou_kaisuu: number;
  pci?: number;
  pci_type?: string;
  early_3f_sec?: number;
  history_details?: HistoryDetail[];
}

interface DiagnosisResult {
  wakuban?: number;
  umaban: number;
  bamei: string;
  odds: number;
  stage1_shisu: number;
  stage1_rank: number;
  shisu: number;
  stage2_rank: number;
  shisu_diff: number;
  myoumi: number;
  norm_win_prob?: number;
  time_diff: number;
  pci: number;
  pci_type: string;
  early_3f_sec?: number;
  bataijuu: number;
  weight_change: number;
  training_rank?: string;
  rotation_label?: string;
  pedigree_label?: string;
  tactical_badges?: string[];
  box_in_risk_level?: string;
  lap_gear_label?: string;
  time_limit_mult?: number;
  bias_mult?: number;
  pace_mult?: number;
  condition_mult?: number;
  tactical_mult?: number;
  role_code?: string;
  role_label?: string;
  is_bias_victim_rescued?: boolean;
  is_jiriki_time_warn?: boolean;
  rescue_type?: string;
  history_details: HistoryDetail[];
}

interface BenchmarkTop3Item {
  rank: number;
  umaban: number;
  bamei: string;
  time: string;
  up: string;
  passing: string;
}

interface SingleBenchmark {
  label: string;
  year_label: string;
  winner_time: string;
  winner_bamei: string;
  winner_umaban: number;
  top3: BenchmarkTop3Item[];
}

interface ReferenceBenchmarks {
  is_finished_race: boolean;
  primary: SingleBenchmark;
  current_year: SingleBenchmark | null;
  prev_year: SingleBenchmark | null;
}

interface AutoStatusInfo {
  odds_status?: string;
  odds_message?: string;
  pace_status: string;
  pace_message: string;
  bias_status: string;
  bias_message: string;
  weight_status: string;
  weight_message: string;
}

interface BettingTickets {
  formation_groups: {
    axis_1st: {
      umaban: number;
      bamei: string;
      shisu: number;
      stage1_shisu: number;
      odds: number;
    }[];
    main_2nd: {
      umaban: number;
      bamei: string;
      shisu: number;
      stage1_shisu: number;
      myoumi: number;
      odds: number;
    }[];
    saver_3rd: {
      umaban: number;
      bamei: string;
      shisu: number;
      stage1_shisu: number;
      stage1_rank: number;
      odds: number;
      rescued: boolean;
      rescue_type?: string;
      role_label?: string;
    }[];
    eliminated: { umaban: number; bamei: string; reason: string; odds: number }[];
  };
  tansho: {
    picks: { umaban: number; bamei: string; type: string; odds: number }[];
    count: number;
  };
  fukusho: {
    picks: { umaban: number; bamei: string; type: string; odds: number }[];
    count: number;
  };
  wide: {
    axis: number;
    targets: number[];
    combos: string[];
    count: number;
  };
  sanrenpuku_nagashi: {
    axis: number;
    targets: number[];
    combos: string[];
    count: number;
  };
  sanrenpuku_formation: {
    row1: number[];
    row2: number[];
    row3: number[];
    combos: string[];
    count: number;
  };
  sanrentan_nagashi: {
    first: number;
    targets: number[];
    combos: string[];
    count: number;
  };
  sanrentan_formation: {
    first: number[];
    second: number[];
    third: number[];
    combos: string[];
    count: number;
  };
}

interface Win5Candidate {
  priority: number;
  umaban: number;
  bamei: string;
  shisu: number;
  stage1_rank: number;
  myoumi: number;
  odds: number;
  role_label: string;
  badges: string[];
}

interface Win5Profile {
  difficulty: 'BANKER' | 'STANDARD' | 'CHAOS';
  badge_label: string;
  shisu_gap: number;
  recommended_count: number;
  candidates: Win5Candidate[];
}

interface Win5SlotData {
  slotIndex: number;
  raceId: string;
  placeName: string;
  raceNumLabel: string;
  raceName: string;
  courseType: string;
  distance: number;
  win5Profile: Win5Profile;
  selectedUmabans: number[];
}

interface SavedRaceHistoryItem {
  raceId: string;
  savedAt: string;
  targetRaceName: string;
  targetPlace: string;
  courseRailMessage: string;
  courseRpci: number | null;
  courseRpciType: string;
  referenceBenchmarks: ReferenceBenchmarks | null;
  courseType: string;
  distance: number;
  weather: string;
  trackCondition: string;
  expectedPace: string;
  trackBias: string;
  biasStrength: string;
  cushionValue: number;
  autoStatus: AutoStatusInfo | null;
  horses: HorseData[];
  diagnosisResults: DiagnosisResult[] | null;
  bettingTickets: BettingTickets | null;
  win5Profile: Win5Profile | null;
  raceInfo: {
    req_up: number;
    pace_f: number;
    pace_l: number;
    rpci?: number;
    rpci_type?: string;
  } | null;
}

interface AllocatedComboItem {
  combo: string;
  estOdds: number;
  aiProb: number;
  ev: number;
  stakeYen: number;
  expectedReturnYen: number;
  isTrigamiWarn: boolean;
  isValuePick: boolean;
}

interface PatternTicketItem {
  id: string;
  ticketType: 'WIDE' | 'PUKU' | 'TAN';
  title: string;
  badge: string;
  structureText: string;
  subNote: string;
  combos: string[];
  count: number;
  syntheticOdds: number;
  totalStakeYen: number;
  allocations: AllocatedComboItem[];
}

interface AxisDefensePlan {
  level: 'HIGH' | 'MEDIUM' | 'RISK';
  badgeText: string;
  headline: string;
  reason: string;
  widePatterns: PatternTicketItem[];
  sanrenpukuPatterns: PatternTicketItem[];
  sanrentanPatterns: PatternTicketItem[];
}

interface HorseMarksSummary {
  markMap: Record<number, '◎' | '〇' | '▲' | '☆' | '△'>;
  honmei: DiagnosisResult | null;
  taikou: DiagnosisResult | null;
  tanana: DiagnosisResult | null;
  tokuchu: DiagnosisResult | null;
  renshita: DiagnosisResult[];
  postText: string;
}

interface RaceResult {
  umaban: number;
  bamei: string;
  shisu: number;
  time_diff: number;
  rank: number;
}

type StartModeType =
  | 'AUTO'
  | 'POCKET_1C'
  | 'POCKET_2C'
  | 'BACK_STRETCH'
  | 'HOME_STRETCH'
  | 'CORNER_3_4';

interface VenueProfile {
  dir: 'LEFT' | 'RIGHT';
  straightMeter: number;
  elevationDiff: number;
  lapMeter: number;
  hasOuterLoop: boolean;
  has1CPocket: boolean;
  has2CPocket: boolean;
  slopeTitle: string;
  featureText: string;
  getElevationAtLapPos: (lapPos: number) => number;
  slopeZones: { startLap: number; endLap: number; label: string; type: 'UP' | 'DOWN' }[];
}

const VENUE_PROFILES: Record<string, VenueProfile> = {
  東京: {
    dir: 'LEFT',
    straightMeter: 525.9,
    elevationDiff: 2.7,
    lapMeter: 2083,
    hasOuterLoop: false,
    has1CPocket: true,
    has2CPocket: true,
    slopeTitle: '直線だんだん坂 (高低差2.1m)',
    featureText:
      '左回り・直線525.9m。2000mは1角奥ポケット、1800mは2角奥ポケットから発走。直線半ばに高低差2.1mの「だんだん坂」を上るロングスパートコース。',
    getElevationAtLapPos: (p) => {
      if (p < 0.25) return 1.2;
      if (p < 0.48) return 1.2 + Math.sin(((p - 0.25) / 0.23) * Math.PI) * 0.8;
      if (p < 0.72) return Math.max(0, 1.2 - ((p - 0.48) / 0.24) * 1.2);
      if (p < 0.86) return ((p - 0.72) / 0.14) * 2.3;
      return 2.3;
    },
    slopeZones: [
      { startLap: 0.52, endLap: 0.68, label: '3角手前下り', type: 'DOWN' },
      { startLap: 0.75, endLap: 0.86, label: 'だんだん坂(上り2.1m)', type: 'UP' },
    ],
  },
  中山: {
    dir: 'RIGHT',
    straightMeter: 310.0,
    elevationDiff: 5.3,
    lapMeter: 1667,
    hasOuterLoop: true,
    has1CPocket: false,
    has2CPocket: true,
    slopeTitle: 'ゴール前急坂 (高低差2.2m・勾配2.24%)',
    featureText:
      '右回り・内回り/外回り分岐（直線310m）。1600mは1・2角中間ポケット、2500mは外回り3角手前から発走し、ゴール前にJRA最大勾配の急坂が待つタフコース。',
    getElevationAtLapPos: (p) => {
      if (p < 0.22) return 3.2 + (p / 0.22) * 2.1;
      if (p < 0.68) return 5.3 - ((p - 0.22) / 0.46) * 5.3;
      if (p < 0.86) return 0.2;
      return 0.2 + ((p - 0.86) / 0.14) * 2.4;
    },
    slopeZones: [
      { startLap: 0.3, endLap: 0.65, label: '向正面〜3角長い下り', type: 'DOWN' },
      { startLap: 0.86, endLap: 0.98, label: '名物・直線急坂(2.2m)', type: 'UP' },
    ],
  },
  京都: {
    dir: 'RIGHT',
    straightMeter: 403.7,
    elevationDiff: 4.3,
    lapMeter: 1894,
    hasOuterLoop: true,
    has1CPocket: false,
    has2CPocket: true,
    slopeTitle: '3角「淀の坂」上り下り (高低差4.3m)',
    featureText:
      '右回り・内回り/外回り分岐（外回り直線404m）。向正面から3角にかけて高低差4.3mの「淀の坂」を上り、4角へ一気に駆け下りるスピード持続コース。',
    getElevationAtLapPos: (p) => {
      if (p < 0.35) return 0.3;
      if (p < 0.56) return 0.3 + ((p - 0.35) / 0.21) * 4.0;
      if (p < 0.74) return 4.3 - ((p - 0.56) / 0.18) * 4.0;
      return 0.3;
    },
    slopeZones: [
      { startLap: 0.38, endLap: 0.56, label: '淀の坂(上り4.3m)', type: 'UP' },
      { startLap: 0.56, endLap: 0.73, label: '3〜4角急下り', type: 'DOWN' },
    ],
  },
  阪神: {
    dir: 'RIGHT',
    straightMeter: 473.6,
    elevationDiff: 2.4,
    lapMeter: 2089,
    hasOuterLoop: true,
    has1CPocket: false,
    has2CPocket: true,
    slopeTitle: '直線急坂 (高低差1.8m・勾配1.5%)',
    featureText:
      '右回り・内回り/外回り分岐（外回り直線473.6m）。3〜4角から直線半ばまで緩やかに下り、残り200mで高低差1.8mの急坂を一気に駆け上がる総合力コース。',
    getElevationAtLapPos: (p) => {
      if (p < 0.55) return 1.8;
      if (p < 0.85) return 1.8 - ((p - 0.55) / 0.3) * 1.8;
      return ((p - 0.85) / 0.15) * 1.9;
    },
    slopeZones: [
      { startLap: 0.58, endLap: 0.83, label: '3〜4角ロング下り', type: 'DOWN' },
      { startLap: 0.86, endLap: 0.98, label: 'ゴール前急坂(1.8m)', type: 'UP' },
    ],
  },
  中京: {
    dir: 'LEFT',
    straightMeter: 412.5,
    elevationDiff: 3.5,
    lapMeter: 1705,
    hasOuterLoop: false,
    has1CPocket: false,
    has2CPocket: true,
    slopeTitle: 'スパイラルカーブ＆直線急坂 (高低差2.0m)',
    featureText:
      '左回り・直線412.5m。芝2000mは2角奥ポケットから発走。向正面半ばから3〜4角まで下り続け、直線入り口に高低差2.0mの急坂がそびえるタフコース。',
    getElevationAtLapPos: (p) => {
      if (p < 0.42) return 1.8 + (p / 0.42) * 1.7;
      if (p < 0.74) return 3.5 - ((p - 0.42) / 0.32) * 3.5;
      if (p < 0.88) return ((p - 0.74) / 0.14) * 2.0;
      return 2.0;
    },
    slopeZones: [
      { startLap: 0.45, endLap: 0.73, label: '3〜4角スパイラル下り', type: 'DOWN' },
      { startLap: 0.75, endLap: 0.88, label: '直線入り口急坂(2.0m)', type: 'UP' },
    ],
  },
};

function normalizeToSupportedVenue(placeName: string): string {
  const safeName = String(placeName || '');
  for (const key of Object.keys(VENUE_PROFILES)) {
    if (safeName.includes(key)) return key;
  }
  if (safeName.includes('新潟')) return '東京';
  return '京都';
}

function getVenueProfile(placeName: string): VenueProfile {
  const norm = normalizeToSupportedVenue(placeName);
  return VENUE_PROFILES[norm] || VENUE_PROFILES['東京'];
}

function evaluateTrainingRankFromClock(t4fStr?: string, t1fStr?: string): string | null {
  const t4f = parseFloat(t4fStr || '');
  const t1f = parseFloat(t1fStr || '');
  if (isNaN(t4f) && isNaN(t1f)) return null;

  if (!isNaN(t1f) && !isNaN(t4f)) {
    if ((t4f <= 51.5 && t1f <= 11.5) || (t4f <= 52.5 && t1f <= 11.2)) return 'S';
    if ((t4f <= 53.2 && t1f <= 11.7) || t1f <= 11.4 || t4f <= 50.8) return 'A';
    if (t1f >= 12.7 || (t4f >= 56.0 && t1f >= 12.4)) return 'C';
    return 'B';
  }
  if (!isNaN(t1f)) {
    if (t1f <= 11.2) return 'S';
    if (t1f <= 11.6) return 'A';
    if (t1f >= 12.7) return 'C';
    return 'B';
  }
  if (!isNaN(t4f)) {
    if (t4f <= 50.5) return 'S';
    if (t4f <= 52.0) return 'A';
    if (t4f >= 56.5) return 'C';
    return 'B';
  }
  return null;
}

function buildFallbackWin5Profile(
  diagnosis?: DiagnosisResult[] | null,
  tickets?: BettingTickets | null
): Win5Profile {
  const safeDiag = Array.isArray(diagnosis) ? diagnosis : [];
  if (safeDiag.length === 0) {
    return {
      difficulty: 'STANDARD',
      badge_label: 'データなし',
      shisu_gap: 0,
      recommended_count: 1,
      candidates: [],
    };
  }

  const byStage2 = [...safeDiag].sort((a, b) => (b.shisu || 0) - (a.shisu || 0));
  const byStage1 = [...safeDiag].sort((a, b) => (b.stage1_shisu || 0) - (a.stage1_shisu || 0));

  const axisGroup = tickets?.formation_groups?.axis_1st?.[0];
  const axisH = safeDiag.find((d) => d.umaban === axisGroup?.umaban) || byStage2[0];
  const secondH = byStage2.find((d) => d.umaban !== axisH.umaban) || byStage2[1] || axisH;

  const shisuGap = Number(((axisH.shisu || 50) - (secondH.shisu || 50)).toFixed(1));
  const hasBoxRisk =
    axisH.box_in_risk_level === 'HIGH_BOX_RISK' || axisH.box_in_risk_level === 'MOD_BOX_RISK';

  let difficulty: 'BANKER' | 'STANDARD' | 'CHAOS' = 'STANDARD';
  let badge_label = '⚡ 標準・上位決着（推奨2〜3頭）';
  let recommended_count = 2;

  if (shisuGap >= 3.2 && axisH.stage1_rank === 1 && !hasBoxRisk) {
    difficulty = 'BANKER';
    badge_label = '👑 1強バンク候補（推奨1〜2頭）';
    recommended_count = 1;
  } else if (shisuGap < 1.5 || hasBoxRisk || axisH.stage1_rank >= 3) {
    difficulty = 'CHAOS';
    badge_label = '💣 波乱・広め推奨（推奨3〜5頭）';
    recommended_count = 4;
  }

  const orderedUmabans: number[] = [axisH.umaban];
  const main2ndList = Array.isArray(tickets?.formation_groups?.main_2nd)
    ? tickets!.formation_groups.main_2nd
    : [];
  const saver3rdList = Array.isArray(tickets?.formation_groups?.saver_3rd)
    ? tickets!.formation_groups.saver_3rd
    : [];

  for (const m of main2ndList) {
    if (m && !orderedUmabans.includes(m.umaban)) orderedUmabans.push(m.umaban);
  }
  for (const s1 of byStage1.slice(0, 2)) {
    if (s1 && !orderedUmabans.includes(s1.umaban)) orderedUmabans.push(s1.umaban);
  }
  for (const s3 of saver3rdList) {
    if (s3 && !orderedUmabans.includes(s3.umaban)) orderedUmabans.push(s3.umaban);
  }
  for (const d of byStage2) {
    if (d && !orderedUmabans.includes(d.umaban)) orderedUmabans.push(d.umaban);
  }

  const candidates: Win5Candidate[] = orderedUmabans.slice(0, 6).map((u, idx) => {
    const h = safeDiag.find((d) => d.umaban === u) || byStage2[0];
    const safeBadges = Array.isArray(h?.tactical_badges) ? h.tactical_badges : [];
    return {
      priority: idx + 1,
      umaban: h.umaban,
      bamei: h.bamei,
      shisu: h.shisu,
      stage1_rank: h.stage1_rank,
      myoumi: h.myoumi,
      odds: h.odds,
      role_label: h.role_label || '',
      badges: safeBadges.slice(0, 2),
    };
  });

  return {
    difficulty,
    badge_label,
    shisu_gap: shisuGap,
    recommended_count,
    candidates,
  };
}

function ensureValidWin5Profile(
  rawProf: any,
  diagnosis?: DiagnosisResult[] | null,
  tickets?: BettingTickets | null
): Win5Profile {
  if (
    rawProf &&
    typeof rawProf === 'object' &&
    Array.isArray(rawProf.candidates) &&
    rawProf.candidates.length > 0
  ) {
    return {
      difficulty: rawProf.difficulty || 'STANDARD',
      badge_label: rawProf.badge_label || '⚡ 標準（推奨2〜3頭）',
      shisu_gap: Number(rawProf.shisu_gap ?? 1.5),
      recommended_count: Number(rawProf.recommended_count ?? 2),
      candidates: rawProf.candidates.map((c: any, idx: number) => ({
        priority: Number(c?.priority ?? idx + 1),
        umaban: Number(c?.umaban ?? idx + 1),
        bamei: String(c?.bamei ?? ''),
        shisu: Number(c?.shisu ?? 50),
        stage1_rank: Number(c?.stage1_rank ?? idx + 1),
        myoumi: Number(c?.myoumi ?? 50),
        odds: Number(c?.odds ?? 10),
        role_label: String(c?.role_label ?? ''),
        badges: Array.isArray(c?.badges) ? c.badges.slice(0, 2) : [],
      })),
    };
  }
  return buildFallbackWin5Profile(diagnosis, tickets);
}

function computeOptimalWin5Counts(
  slots: (Win5SlotData | null)[],
  maxPoints: number
): number[] {
  const counts = [1, 1, 1, 1, 1];
  const maxPerLeg = slots.map((s) => {
    const cands = Array.isArray(s?.win5Profile?.candidates) ? s!.win5Profile.candidates : [];
    if (!s || cands.length === 0) return 1;
    const prof = s.win5Profile;
    if (prof.difficulty === 'BANKER' && prof.shisu_gap >= 3.8 && maxPoints <= 48) {
      return Math.min(2, cands.length);
    }
    return Math.min(6, cands.length);
  });

  const weights = slots.map((s) => {
    if (!s || !s.win5Profile) return 0;
    const prof = s.win5Profile;
    if (prof.difficulty === 'CHAOS') return 1.75;
    if (prof.difficulty === 'STANDARD') return 1.15;
    return prof.shisu_gap >= 3.8 ? 0.45 : 0.72;
  });

  let guard = 0;
  while (guard < 50) {
    guard++;
    const currentProduct = counts.reduce((acc, c) => acc * c, 1);
    let bestLeg = -1;
    let bestScore = -1;

    for (let i = 0; i < 5; i++) {
      if (!slots[i] || counts[i] >= maxPerLeg[i]) continue;
      const nextProduct = (currentProduct / counts[i]) * (counts[i] + 1);
      if (nextProduct <= maxPoints) {
        const gainScore = weights[i] / Math.pow(counts[i], 0.85);
        if (gainScore > bestScore) {
          bestScore = gainScore;
          bestLeg = i;
        }
      }
    }

    if (bestLeg === -1) break;
    counts[bestLeg] += 1;
  }

  return counts;
}

function buildWin5PostText(slots: (Win5SlotData | null)[]): string {
  const activeSlots = slots.filter((s): s is Win5SlotData => Boolean(s));
  if (activeSlots.length === 0) return '';

  const totalCombos = slots.reduce((acc, s) => {
    const selLen = Array.isArray(s?.selectedUmabans) ? s!.selectedUmabans.length : 0;
    return acc * (selLen > 0 ? selLen : 1);
  }, 1);

  const circleNums = ['①', '②', '③', '④', '⑤'];
  const lines: string[] = [];
  lines.push(`【本日のWIN5 AI予想🎯】（計${totalCombos}点）`);

  slots.forEach((slot, idx) => {
    if (!slot || !slot.win5Profile) {
      lines.push(`${circleNums[idx]} 未設定`);
      return;
    }
    const cleanTitle = String(slot.raceName || '')
      .replace(/出馬表.*$/, '')
      .replace(/\(.*?\)/g, '')
      .trim();
    const sel = Array.isArray(slot.selectedUmabans) ? slot.selectedUmabans : [];
    const cands = Array.isArray(slot.win5Profile.candidates) ? slot.win5Profile.candidates : [];
    const diffIcon =
      slot.win5Profile.difficulty === 'BANKER'
        ? '👑1強'
        : slot.win5Profile.difficulty === 'CHAOS'
          ? '💣波乱'
          : '⚡標準';

    if (sel.length === 1) {
      const hObj = cands.find((c) => c.umaban === sel[0]);
      const hName = hObj ? ` ${hObj.bamei}` : '';
      lines.push(
        `${circleNums[idx]} ${slot.placeName}${slot.raceNumLabel} ${cleanTitle}: ${sel[0]}${hName} (1頭固定👑)`
      );
    } else {
      lines.push(
        `${circleNums[idx]} ${slot.placeName}${slot.raceNumLabel} ${cleanTitle}: ${sel.join(', ')} (${sel.length}頭・${diffIcon})`
      );
    }
  });

  lines.push('#競馬予想 #WIN5 #AI競馬');
  return lines.join('\n');
}

function computePatternAllocations(
  combos: string[],
  ticketType: 'WIDE' | 'PUKU' | 'TAN',
  diagnosis: DiagnosisResult[],
  budgetYen: number,
  allocMode: 'EV_FOCUS' | 'EQUAL_RETURN'
): {
  syntheticOdds: number;
  totalStakeYen: number;
  allocations: AllocatedComboItem[];
} {
  if (
    !Array.isArray(combos) ||
    combos.length === 0 ||
    !Array.isArray(diagnosis) ||
    diagnosis.length === 0
  ) {
    return { syntheticOdds: 0, totalStakeYen: 0, allocations: [] };
  }

  const mktProbs: Record<number, number> = {};
  const aiProbs: Record<number, number> = {};
  let sumMkt = 0;
  let sumAi = 0;

  for (const d of diagnosis) {
    // ★新機能⑤: JRAの連勝馬券における本命過剰人気バイアス(Favorite-Longshot Bias)を補正(γ=0.90)
    const rawMkt = d.odds > 1.0 ? Math.pow(0.8 / d.odds, 0.90) : 0.05;
    mktProbs[d.umaban] = rawMkt;
    sumMkt += rawMkt;

    const rawAi =
      d.norm_win_prob && d.norm_win_prob > 0
        ? d.norm_win_prob
        : Math.exp((d.shisu - 50) / 6.5);
    aiProbs[d.umaban] = rawAi;
    sumAi += rawAi;
  }

  for (const d of diagnosis) {
    mktProbs[d.umaban] = sumMkt > 0 ? mktProbs[d.umaban] / sumMkt : 1 / diagnosis.length;
    aiProbs[d.umaban] = sumAi > 0 ? aiProbs[d.umaban] / sumAi : 1 / diagnosis.length;
  }

  const calcExactOrderProb = (pMap: Record<number, number>, a: number, b: number, c: number) => {
    const pa = pMap[a] || 0.01;
    const pb = pMap[b] || 0.01;
    const pc = pMap[c] || 0.01;
    const denom1 = Math.max(0.01, 1.0 - pa);
    const denom2 = Math.max(0.01, 1.0 - pa - pb);
    return pa * (pb / denom1) * (pc / denom2);
  };

  const calcTrioUnorderedProb = (
    pMap: Record<number, number>,
    a: number,
    b: number,
    c: number
  ) => {
    return (
      calcExactOrderProb(pMap, a, b, c) +
      calcExactOrderProb(pMap, a, c, b) +
      calcExactOrderProb(pMap, b, a, c) +
      calcExactOrderProb(pMap, b, c, a) +
      calcExactOrderProb(pMap, c, a, b) +
      calcExactOrderProb(pMap, c, b, a)
    );
  };

  const calcWideApproxProb = (pMap: Record<number, number>, a: number, b: number) => {
    const pa = pMap[a] || 0.01;
    const pb = pMap[b] || 0.01;
    const quinellaProb =
      (pa * pb) / Math.max(0.01, 1.0 - pa) + (pb * pa) / Math.max(0.01, 1.0 - pb);
    return Math.min(0.65, quinellaProb * 2.65);
  };

  const rawItems = combos.map((comboStr) => {
    const nums = String(comboStr || '')
      .split(/[-→]/)
      .map((s) => parseInt(s.trim(), 10))
      .filter((n) => !isNaN(n));

    let mktP = 0.005;
    let aiP = 0.005;
    let estOdds = 10.0;

    if (ticketType === 'WIDE' && nums.length >= 2) {
      mktP = calcWideApproxProb(mktProbs, nums[0], nums[1]);
      aiP = calcWideApproxProb(aiProbs, nums[0], nums[1]);
      estOdds = Math.max(1.2, Math.min(250.0, (0.775 / Math.max(0.0005, mktP)) * 0.85));
    } else if (ticketType === 'PUKU' && nums.length >= 3) {
      mktP = calcTrioUnorderedProb(mktProbs, nums[0], nums[1], nums[2]);
      aiP = calcTrioUnorderedProb(aiProbs, nums[0], nums[1], nums[2]);
      estOdds = Math.max(2.0, Math.min(3000.0, 0.75 / Math.max(0.0001, mktP)));
    } else if (ticketType === 'TAN' && nums.length >= 3) {
      mktP = calcExactOrderProb(mktProbs, nums[0], nums[1], nums[2]);
      aiP = calcExactOrderProb(aiProbs, nums[0], nums[1], nums[2]);
      estOdds = Math.max(3.5, Math.min(9999.0, 0.725 / Math.max(0.00003, mktP)));
    }

    estOdds = Number(estOdds.toFixed(1));
    const ev = Number((aiP * estOdds).toFixed(2));
    return {
      combo: comboStr,
      estOdds,
      aiProb: aiP,
      ev,
    };
  });

  const invSum = rawItems.reduce((acc, item) => acc + 1.0 / Math.max(1.0, item.estOdds), 0);
  const syntheticOdds = invSum > 0 ? Number((1.0 / invSum).toFixed(2)) : 0;

  const safeBudget = Math.max(combos.length * 100, Math.round(budgetYen / 100) * 100);
  const weights = rawItems.map((item) => {
    const baseEqualWeight = 1.0 / Math.max(1.1, item.estOdds);
    if (allocMode === 'EQUAL_RETURN') {
      return baseEqualWeight;
    }
    const evBoost = Math.max(0.65, Math.min(1.85, Math.pow(Math.max(0.4, item.ev), 0.55)));
    return baseEqualWeight * evBoost;
  });

  const weightSum = weights.reduce((a, b) => a + b, 0) || 1.0;
  const stakes = weights.map((w) =>
    Math.max(100, Math.round((safeBudget * (w / weightSum)) / 100) * 100)
  );

  let currentTotal = stakes.reduce((a, b) => a + b, 0);
  let guard = 0;
  while (currentTotal > safeBudget && guard < 100) {
    let maxIdx = -1;
    let maxVal = 100;
    for (let i = 0; i < stakes.length; i++) {
      if (stakes[i] > maxVal) {
        maxVal = stakes[i];
        maxIdx = i;
      }
    }
    if (maxIdx === -1) break;
    stakes[maxIdx] -= 100;
    currentTotal -= 100;
    guard++;
  }
  while (currentTotal < safeBudget && guard < 100) {
    let bestIdx = 0;
    let bestScore = -1;
    for (let i = 0; i < rawItems.length; i++) {
      const sc = allocMode === 'EV_FOCUS' ? rawItems[i].ev : 1.0 / rawItems[i].estOdds;
      if (sc > bestScore) {
        bestScore = sc;
        bestIdx = i;
      }
    }
    stakes[bestIdx] += 100;
    currentTotal += 100;
    guard++;
  }

  const finalTotalStake = stakes.reduce((a, b) => a + b, 0);

  const allocations: AllocatedComboItem[] = rawItems.map((item, idx) => {
    const stakeYen = stakes[idx];
    const expectedReturnYen = Math.round(stakeYen * item.estOdds);
    return {
      combo: item.combo,
      estOdds: item.estOdds,
      aiProb: item.aiProb,
      ev: item.ev,
      stakeYen,
      expectedReturnYen,
      isTrigamiWarn: expectedReturnYen < finalTotalStake,
      isValuePick: item.ev >= 1.15,
    };
  });

  return {
    syntheticOdds,
    totalStakeYen: finalTotalStake,
    allocations,
  };
}

function resolveStartConfig(
  placeName: string,
  courseType: string,
  distance: number,
  overrideMode: StartModeType
): {
  resolvedMode: Exclude<StartModeType, 'AUTO'>;
  startLabel: string;
  startLapPos: number;
  totalLaps: number;
} {
  let mode: Exclude<StartModeType, 'AUTO'> = 'BACK_STRETCH';
  const venue = normalizeToSupportedVenue(placeName);

  if (overrideMode !== 'AUTO') {
    mode = overrideMode;
  } else {
    if (venue === '東京' && courseType === '芝' && distance === 2000) {
      mode = 'POCKET_1C';
    } else if (
      (venue === '東京' && courseType === '芝' && distance === 1800) ||
      (venue === '中京' && courseType === '芝' && distance === 2000) ||
      (venue === '京都' && courseType === '芝' && (distance === 1800 || distance === 1600)) ||
      (venue === '阪神' && courseType === '芝' && (distance === 1800 || distance === 1600)) ||
      (venue === '中山' && courseType === '芝' && distance === 1600)
    ) {
      mode = 'POCKET_2C';
    } else if (
      (distance >= 2100 && distance <= 2300) ||
      (venue === '中山' && distance === 2500) ||
      (venue === '阪神' && distance === 2600)
    ) {
      mode = 'CORNER_3_4';
    } else if (
      (distance >= 1900 && distance <= 2000) ||
      (distance >= 2400 && distance <= 2600) ||
      distance >= 3400
    ) {
      mode = 'HOME_STRETCH';
    } else {
      mode = 'BACK_STRETCH';
    }
  }

  if (mode === 'POCKET_1C') {
    return {
      resolvedMode: 'POCKET_1C',
      startLabel: '1角奥ポケット発走 (2角合流)',
      startLapPos: 0.29,
      totalLaps: 0.71,
    };
  }
  if (mode === 'POCKET_2C') {
    return {
      resolvedMode: 'POCKET_2C',
      startLabel: '2角奥ポケット発走 (向正面合流)',
      startLapPos: 0.31,
      totalLaps: 0.69,
    };
  }
  if (mode === 'HOME_STRETCH') {
    const isLong = distance >= 2300;
    return {
      resolvedMode: 'HOME_STRETCH',
      startLabel: 'スタンド前直線発走',
      startLapPos: isLong ? 0.88 : 0.82,
      totalLaps: isLong ? 1.12 : 1.18,
    };
  }
  if (mode === 'CORNER_3_4') {
    const isArima = distance >= 2500;
    return {
      resolvedMode: 'CORNER_3_4',
      startLabel: isArima ? '3角外回り発走 (1周半)' : '4角奥ポケット発走',
      startLapPos: isArima ? 0.62 : 0.75,
      totalLaps: isArima ? 1.38 : 1.25,
    };
  }

  if (distance >= 2800) {
    const startU = distance >= 3100 ? 0.36 : 0.44;
    return {
      resolvedMode: 'BACK_STRETCH',
      startLabel: '向正面発走 (1周半)',
      startLapPos: startU,
      totalLaps: 1.0 + (1.0 - startU),
    };
  }
  const shortStartU = distance <= 1200 ? 0.48 : distance <= 1400 ? 0.39 : 0.31;
  return {
    resolvedMode: 'BACK_STRETCH',
    startLabel: '向正面発走 (ワンターン)',
    startLapPos: shortStartU,
    totalLaps: 1.0 - shortStartU,
  };
}

function getTrackPointAndNormal(
  lapPosRaw: number,
  dir: 'LEFT' | 'RIGHT',
  laneOffsetPx: number
): { x: number; y: number } {
  const u = ((lapPosRaw % 1) + 1) % 1;

  const L = 380;
  const R = 84;
  const arcLen = Math.PI * R;
  const totalPerim = 2 * L + 2 * arcLen;

  const sGoal = L * 0.84;
  const s = (sGoal + u * totalPerim) % totalPerim;

  let baseX = 400;
  let baseY = 236;
  let outNx = 0;
  let outNy = 1;

  if (dir === 'LEFT') {
    if (s < L) {
      baseX = 210 + s;
      baseY = 236;
      outNx = 0;
      outNy = 1;
    } else if (s < L + arcLen) {
      const ratio = (s - L) / arcLen;
      const theta = Math.PI / 2 - ratio * Math.PI;
      baseX = 590 + R * Math.cos(theta);
      baseY = 152 + R * Math.sin(theta);
      outNx = Math.cos(theta);
      outNy = Math.sin(theta);
    } else if (s < 2 * L + arcLen) {
      const d = s - (L + arcLen);
      baseX = 590 - d;
      baseY = 68;
      outNx = 0;
      outNy = -1;
    } else {
      const ratio = (s - (2 * L + arcLen)) / arcLen;
      const theta = -Math.PI / 2 - ratio * Math.PI;
      baseX = 210 + R * Math.cos(theta);
      baseY = 152 + R * Math.sin(theta);
      outNx = Math.cos(theta);
      outNy = Math.sin(theta);
    }
  } else {
    if (s < L) {
      baseX = 590 - s;
      baseY = 236;
      outNx = 0;
      outNy = 1;
    } else if (s < L + arcLen) {
      const ratio = (s - L) / arcLen;
      const theta = Math.PI / 2 + ratio * Math.PI;
      baseX = 210 + R * Math.cos(theta);
      baseY = 152 + R * Math.sin(theta);
      outNx = Math.cos(theta);
      outNy = Math.sin(theta);
    } else if (s < 2 * L + arcLen) {
      const d = s - (L + arcLen);
      baseX = 210 + d;
      baseY = 68;
      outNx = 0;
      outNy = -1;
    } else {
      const ratio = (s - (2 * L + arcLen)) / arcLen;
      const theta = -Math.PI / 2 + ratio * Math.PI;
      baseX = 590 + R * Math.cos(theta);
      baseY = 152 + R * Math.sin(theta);
      outNx = Math.cos(theta);
      outNy = Math.sin(theta);
    }
  }

  return {
    x: baseX + outNx * laneOffsetPx,
    y: baseY + outNy * laneOffsetPx,
  };
}

function getHorseSimPosition(
  progress: number,
  dir: 'LEFT' | 'RIGHT',
  startMode: Exclude<StartModeType, 'AUTO'>,
  startLapPos: number,
  totalLaps: number,
  laneOffsetPx: number
): { x: number; y: number; lapPosForElev: number } {
  const p = Math.max(0, Math.min(1.05, progress));

  if (startMode === 'POCKET_1C') {
    const pocketPhase = 0.13;
    const mergePt = getTrackPointAndNormal(startLapPos, dir, laneOffsetPx);
    const startX = dir === 'LEFT' ? 738 : 62;
    const startY = 205 + (laneOffsetPx - 10) * 0.7;

    if (p < pocketPhase) {
      const r = p / pocketPhase;
      return {
        x: startX + (mergePt.x - startX) * r,
        y: startY + (mergePt.y - startY) * r,
        lapPosForElev: startLapPos * r,
      };
    }
    const mainRatio = (p - pocketPhase) / (1.0 - pocketPhase);
    const lapPos = startLapPos + mainRatio * totalLaps;
    const pt = getTrackPointAndNormal(lapPos, dir, laneOffsetPx);
    return { x: pt.x, y: pt.y, lapPosForElev: lapPos };
  }

  if (startMode === 'POCKET_2C') {
    const pocketPhase = 0.11;
    const mergePt = getTrackPointAndNormal(startLapPos, dir, laneOffsetPx);
    const startX = dir === 'LEFT' ? 725 : 75;
    const startY = 38 - (laneOffsetPx - 10) * 0.6;

    if (p < pocketPhase) {
      const r = p / pocketPhase;
      return {
        x: startX + (mergePt.x - startX) * r,
        y: startY + (mergePt.y - startY) * r,
        lapPosForElev: startLapPos * r,
      };
    }
    const mainRatio = (p - pocketPhase) / (1.0 - pocketPhase);
    const lapPos = startLapPos + mainRatio * totalLaps;
    const pt = getTrackPointAndNormal(lapPos, dir, laneOffsetPx);
    return { x: pt.x, y: pt.y, lapPosForElev: lapPos };
  }

  const lapPos = startLapPos + p * totalLaps;
  const pt = getTrackPointAndNormal(lapPos, dir, laneOffsetPx);
  return { x: pt.x, y: pt.y, lapPosForElev: lapPos };
}

interface SimHorseTrackState {
  umaban: number;
  bamei: string;
  rank: number;
  kyakushitsu: number;
  isMakuriHorse: boolean;
  x: number;
  y: number;
  currentProgress: number;
  isMakuriActiveNow: boolean;
  isSpurtActiveNow: boolean;
}

const PACE_SCENARIOS: Record<
  string,
  {
    category: string;
    shortTitle: string;
    headline: string;
    flow: string;
    advantage: string;
    feature: string;
  }
> = {
  S_YOIDON: {
    category: 'スローペース想定',
    shortTitle: 'スロー ① 直線ヨーイドン (残り400mキレ味勝負)',
    headline: '緩い流れからの速い上がり（瞬発力）勝負',
    flow: '① 直線ヨーイドン（仕掛け遅い・直線までじっくり我慢）',
    advantage: '上がり3F上位の瞬発力馬(PCI:C) / 先行馬',
    feature:
      '前半の追走負荷が軽いため、後方一手からの追い込みは届かないケースが増加。上がり時計の速いキレ味勝負に強いタイプが台頭。',
  },
  S_LONSPA: {
    category: 'スローペース想定',
    shortTitle: 'スロー ② ロンスパ・マクリ (残り800m持続戦)',
    headline: '道中緩い流れからの早め仕掛け・ロングスパート戦',
    flow: '② ロンスパ・マクリ（向正面〜3角から早めペースアップ）',
    advantage: 'スタミナ型先行馬 / 道中押し上げ可能なマクリ・差し馬',
    feature:
      '前半はスローでも3コーナー手前から一気にペースが上がる残り800mの持続力勝負。一瞬のキレより長くいい脚を使える馬が有利。',
  },
  M_JIRIKI: {
    category: 'ミドルペース想定',
    shortTitle: 'ミドル ① 地力・総合力勝負 (好位抜け出し王道戦)',
    headline: '平均的な流れでの総合力・実力勝負',
    flow: '① 地力・総合力勝負（淀みなく進行・淡々とした流れ持続）',
    advantage: '好位抜け出し王道スタイルの先行馬 / 好位差し馬(PCI:B)',
    feature:
      '道中・後半ともに適正なペースで流れ、誤魔化しが効かず能力通りの結果になりやすい。位置取りの器用さと総合力を兼ね備えた王道馬が有利。',
  },
  M_LONSPA: {
    category: 'ミドルペース想定',
    shortTitle: 'ミドル ② ロンスパ戦 (早め仕掛けタフ持続戦)',
    headline: '淀みない流れからさらに仕掛けが早まるタフ持続戦',
    flow: '② ロンスパ戦（向正面〜3角から後続が早めに動く消耗持続戦）',
    advantage: 'タフな持続力を持つ好位〜中団差し馬(PCI:B〜A)',
    feature:
      '道中から息が入らず、さらに勝負所からペースが上がるタフな展開。逃げ馬には厳しくなり、スタミナと持続力に優れた差し馬が台頭。',
  },
  H_MAEKUZURE: {
    category: 'ハイペース想定',
    shortTitle: 'ハイ ① 前崩れのバテ合い消耗戦 (後方待機・追込強襲)',
    headline: '先行激化による前崩れ・バテ合い消耗戦',
    flow: '① 前崩れのバテ合い消耗戦（ハナ争い激化・前半から息が入らない）',
    advantage: '無欲の後方待機・追い込み馬 / 消耗戦に強い差し馬(PCI:A)',
    feature:
      '前半の競り合いで逃げ・先行馬が直線で総崩れ。ラストの上がりがかかる大消耗戦になり、後方で脚を溜めた伏兵・追込馬の強襲が警戒される。',
  },
};

function getPciLabelText(pciType?: string): string {
  if (pciType === 'A') return 'A:消耗戦';
  if (pciType === 'C') return 'C:瞬発力';
  return 'B:万能';
}

function getPciBadgeStyle(pciType?: string): string {
  if (pciType === 'A') return 'bg-red-900/70 text-red-200 border-red-600';
  if (pciType === 'C') return 'bg-blue-900/70 text-blue-200 border-blue-600';
  return 'bg-green-900/70 text-green-200 border-green-600';
}

function getTacticalBadgeStyle(badgeText: string): string {
  const s = String(badgeText || '');
  if (s.includes('🚨') || s.includes('イン包まれ警戒')) {
    return 'bg-red-950/90 text-red-200 border-red-500 font-extrabold shadow-[0_0_6px_rgba(239,68,68,0.5)]';
  }
  if (
    s.includes('⚠️') ||
    s.includes('注意') ||
    s.includes('劣勢') ||
    s.includes('忙し') ||
    s.includes('過信禁物')
  ) {
    return 'bg-amber-950/90 text-amber-200 border-amber-500 font-extrabold';
  }
  if (s.includes('☔') || s.includes('🌧️') || s.includes('道悪')) {
    return 'bg-blue-950/90 text-blue-200 border-blue-400 font-extrabold shadow-[0_0_6px_rgba(59,130,246,0.4)]';
  }
  if (s.includes('🌊') || s.includes('脚抜き') || s.includes('湿ダート')) {
    return 'bg-cyan-950/90 text-cyan-200 border-cyan-400 font-extrabold shadow-[0_0_6px_rgba(6,182,212,0.4)]';
  }
  if (
    s.includes('🎯') ||
    s.includes('ベスト距離') ||
    s.includes('🏟️') ||
    s.includes('リピーター') ||
    s.includes('⛰️') ||
    s.includes('💪')
  ) {
    return 'bg-emerald-950/90 text-emerald-200 border-emerald-400 font-extrabold';
  }
  if (
    s.includes('🔄') ||
    s.includes('巻き返し') ||
    s.includes('脚余し') ||
    s.includes('見直し') ||
    s.includes('サウスポー') ||
    s.includes('右回り巧者')
  ) {
    return 'bg-purple-950/90 text-purple-200 border-purple-400 font-extrabold';
  }
  if (s.includes('🛡️') || s.includes('1強地力') || s.includes('重賞僅差')) {
    return 'bg-emerald-950/90 text-yellow-300 border-emerald-400 font-extrabold';
  }
  if (s.includes('⚡') || s.includes('瞬発ギア') || s.includes('鋭伸ギア')) {
    return 'bg-sky-950/90 text-sky-200 border-sky-400 font-extrabold';
  }
  if (s.includes('🚀') || s.includes('単騎ハナ')) {
    return 'bg-fuchsia-950/90 text-pink-200 border-pink-400 font-extrabold';
  }
  if (s.includes('🟢') || s.includes('スムーズ加速')) {
    return 'bg-teal-950/90 text-teal-200 border-teal-400 font-bold';
  }
  if (
    s.includes('🔥') ||
    s.includes('前残り') ||
    s.includes('ロンスパ') ||
    s.includes('早仕掛け')
  ) {
    return 'bg-orange-950/90 text-orange-200 border-orange-500 font-extrabold';
  }
  return 'bg-indigo-950/80 text-indigo-200 border-indigo-500 font-bold';
}

function getHorseColor(umaban: number): string {
  const colors = [
    'bg-white text-gray-900 border-gray-300',
    'bg-gray-900 text-white border-gray-700',
    'bg-red-600 text-white border-red-800',
    'bg-blue-600 text-white border-blue-800',
    'bg-yellow-400 text-gray-900 border-yellow-600',
    'bg-green-600 text-white border-green-800',
    'bg-orange-500 text-white border-orange-700',
    'bg-pink-400 text-gray-900 border-pink-600',
  ];
  return colors[(umaban - 1) % 8] || 'bg-gray-500 text-white';
}

function getHorseSvgColors(umaban: number): { bg: string; text: string; border: string } {
  const colors = [
    { bg: '#ffffff', text: '#111827', border: '#d1d5db' },
    { bg: '#111827', text: '#ffffff', border: '#374151' },
    { bg: '#dc2626', text: '#ffffff', border: '#991b1b' },
    { bg: '#2563eb', text: '#ffffff', border: '#1e40af' },
    { bg: '#facc15', text: '#111827', border: '#ca8a04' },
    { bg: '#16a34a', text: '#ffffff', border: '#166534' },
    { bg: '#f97316', text: '#ffffff', border: '#c2410c' },
    { bg: '#f472b6', text: '#111827', border: '#db2777' },
  ];
  return colors[(umaban - 1) % 8] || { bg: '#6b7280', text: '#ffffff', border: '#374151' };
}

function getMarkBadgeStyle(mark?: '◎' | '〇' | '▲' | '☆' | '△'): string {
  switch (mark) {
    case '◎':
      return 'bg-red-600 text-yellow-200 border-yellow-400 shadow-[0_0_8px_rgba(220,38,38,0.8)]';
    case '〇':
      return 'bg-blue-600 text-white border-blue-300';
    case '▲':
      return 'bg-emerald-600 text-white border-emerald-300';
    case '☆':
      return 'bg-pink-600 text-yellow-200 border-pink-300';
    case '△':
      return 'bg-gray-700 text-gray-100 border-gray-400';
    default:
      return '';
  }
}

function getRankTextStyle(rankStr: string): string {
  if (rankStr === '1着') return 'text-yellow-400 font-extrabold';
  if (rankStr === '2着') return 'text-gray-200 font-bold';
  if (rankStr === '3着') return 'text-amber-500 font-bold';
  return 'text-gray-400';
}

function generateWideCombos(axes: number[], targets: number[]): string[] {
  const set = new Set<string>();
  const combos: string[] = [];
  for (const a of axes || []) {
    for (const b of targets || []) {
      if (a !== b) {
        const pair = [a, b].sort((x, y) => x - y);
        const key = `${pair[0]} - ${pair[1]}`;
        if (!set.has(key)) {
          set.add(key);
          combos.push(key);
        }
      }
    }
  }
  return combos;
}

function generateSanrenpukuFormCombos(row1: number[], row2: number[], row3: number[]): string[] {
  const set = new Set<string>();
  for (const a of row1 || []) {
    for (const b of row2 || []) {
      for (const c of row3 || []) {
        if (a !== b && b !== c && a !== c) {
          const sorted = [a, b, c].sort((x, y) => x - y);
          set.add(`${sorted[0]} - ${sorted[1]} - ${sorted[2]}`);
        }
      }
    }
  }
  return Array.from(set).sort();
}

function generateSanrentanFormCombos(first: number[], second: number[], third: number[]): string[] {
  const combos: string[] = [];
  const seen = new Set<string>();
  for (const f of first || []) {
    for (const s of second || []) {
      for (const t of third || []) {
        if (f !== s && s !== t && f !== t) {
          const key = `${f} → ${s} → ${t}`;
          if (!seen.has(key)) {
            seen.add(key);
            combos.push(key);
          }
        }
      }
    }
  }
  return combos;
}

function buildHorseMarksAndPostText(
  diagnosis: DiagnosisResult[] | null,
  tickets: BettingTickets | null,
  raceName: string,
  placeName: string,
  raceId: string
): HorseMarksSummary | null {
  if (!Array.isArray(diagnosis) || diagnosis.length === 0 || !tickets?.formation_groups) {
    return null;
  }

  const markMap: Record<number, '◎' | '〇' | '▲' | '☆' | '△'> = {};

  const axisGroup = tickets.formation_groups.axis_1st?.[0];
  const honmei =
    diagnosis.find((d) => d.umaban === axisGroup?.umaban) ||
    [...diagnosis].sort((a, b) => b.shisu - a.shisu)[0] ||
    null;

  if (honmei) {
    markMap[honmei.umaban] = '◎';
  }

  const targetUmabans: number[] = [];
  for (const m of tickets.formation_groups.main_2nd || []) {
    if (m.umaban !== honmei?.umaban && !targetUmabans.includes(m.umaban)) {
      targetUmabans.push(m.umaban);
    }
  }
  for (const s of tickets.formation_groups.saver_3rd || []) {
    if (s.umaban !== honmei?.umaban && !targetUmabans.includes(s.umaban)) {
      targetUmabans.push(s.umaban);
    }
  }

  const targetPool: DiagnosisResult[] = targetUmabans
    .map((u) => diagnosis.find((d) => d.umaban === u))
    .filter((d): d is DiagnosisResult => Boolean(d));

  const taikou = targetPool.length >= 1 ? targetPool[0] : null;
  if (taikou) {
    markMap[taikou.umaban] = '〇';
  }

  const tanana = targetPool.length >= 2 ? targetPool[1] : null;
  if (tanana) {
    markMap[tanana.umaban] = '▲';
  }

  const remainingPool = targetPool.slice(2);
  let tokuchu: DiagnosisResult | null = null;
  if (remainingPool.length > 0) {
    tokuchu = [...remainingPool].sort((a, b) => b.myoumi - a.myoumi || b.shisu - a.shisu)[0];
    markMap[tokuchu.umaban] = '☆';
  }

  const renshita: DiagnosisResult[] = [];
  for (const h of remainingPool) {
    if (h.umaban !== tokuchu?.umaban) {
      markMap[h.umaban] = '△';
      renshita.push(h);
    }
  }

  let raceNumLabel = '11R';
  if (raceId && raceId.length >= 2) {
    const rNum = parseInt(raceId.slice(-2), 10);
    if (!isNaN(rNum) && rNum >= 1 && rNum <= 12) {
      raceNumLabel = `${rNum}R`;
    }
  }

  const venueStr = placeName || '東京';
  const cleanTitle = (raceName || '本日のレース')
    .replace(/出馬表.*$/, '')
    .replace(/\(.*?\)/g, '')
    .trim();
  const headerTitle = placeName ? `${placeName} ${cleanTitle}` : cleanTitle;

  const lines: string[] = [];
  lines.push(`${venueStr} ${raceNumLabel}`);
  lines.push(`【${headerTitle}】AI予想🎯`);
  if (honmei) lines.push(`◎ ${honmei.umaban} ${honmei.bamei}`);
  if (taikou) lines.push(`〇 ${taikou.umaban} ${taikou.bamei}`);
  if (tanana) lines.push(`▲ ${tanana.umaban} ${tanana.bamei}`);
  if (tokuchu) lines.push(`☆ ${tokuchu.umaban} ${tokuchu.bamei}`);
  for (const r of renshita) {
    lines.push(`△ ${r.umaban} ${r.bamei}`);
  }

  return {
    markMap,
    honmei,
    taikou,
    tanana,
    tokuchu,
    renshita,
    postText: lines.join('\n'),
  };
}

function buildAxisDefensePlan(
  diagnosis: DiagnosisResult[] | null,
  tickets: BettingTickets | null,
  budgetYen: number,
  allocMode: 'EV_FOCUS' | 'EQUAL_RETURN'
): AxisDefensePlan | null {
  if (!Array.isArray(diagnosis) || diagnosis.length < 3 || !tickets?.formation_groups) {
    return null;
  }

  const byStage2 = [...diagnosis].sort((a, b) => b.shisu - a.shisu);
  const byStage1 = [...diagnosis].sort((a, b) => b.stage1_shisu - a.stage1_shisu);
  const byOdds = [...diagnosis].filter((d) => d.odds > 0).sort((a, b) => a.odds - b.odds);

  const axisGroup = tickets.formation_groups.axis_1st?.[0];
  const axisHorse = diagnosis.find((d) => d.umaban === axisGroup?.umaban) || byStage2[0];
  const secondHorse = byStage2.find((d) => d.umaban !== axisHorse.umaban) || byStage2[1];
  const fav1Horse = byOdds.length > 0 ? byOdds[0] : axisHorse;

  const shisuGap = Number((axisHorse.shisu - secondHorse.shisu).toFixed(1));
  const axisHasBoxRisk =
    axisHorse.box_in_risk_level === 'HIGH_BOX_RISK' ||
    axisHorse.box_in_risk_level === 'MOD_BOX_RISK';

  let level: 'HIGH' | 'MEDIUM' | 'RISK' = 'HIGH';
  let badgeText = '👑 軸信頼度: S（王道パターン①中心推奨）';
  let headline = `${axisHorse.umaban}番 ${axisHorse.bamei} の1着固定が本線（2位と+${shisuGap}pt差）`;
  let reason = `『①素の地力(${axisHorse.stage1_rank}位)』と『②最終指数(1位)』がともにトップクラスで安定。各券種の『パターン①・②』を主軸にしつつ、高配当狙いなら2・3列目ワイドを併用。`;

  const fav1IsVulnerable =
    fav1Horse.odds <= 2.8 && (fav1Horse.stage2_rank >= 3 || fav1Horse.stage1_rank >= 3);
  const axisNotPureTop = axisHorse.stage1_rank >= 3 || shisuGap < 1.8;

  if (
    fav1IsVulnerable ||
    axisHasBoxRisk ||
    (axisHorse.odds <= 2.5 && axisHorse.stage1_rank >= 2) ||
    shisuGap < 1.5
  ) {
    level = 'RISK';
    badgeText = '🚨 軸信頼度: B（波乱・包まれ警戒・2列目×3列目パターン推奨）';
    if (axisHasBoxRisk) {
      headline = `⚠️ 1着軸候補(${axisHorse.umaban}番${axisHorse.bamei})に多頭数の内枠包まれ注意印！2・3列目頭逆転＆タテ目ケア推奨`;
      reason = `能力上位の${axisHorse.bamei}ですが、外から先行勢が被せる隊列のため直線で進路が詰まるリスクがあります。2・3列目ワイドや3連単『パターン③・④（2列目・3列目1着固定）』の併用が極めて有効です。`;
    } else if (fav1IsVulnerable && fav1Horse.umaban !== axisHorse.umaban) {
      headline = `⚠️ 1番人気(${fav1Horse.umaban}番${fav1Horse.bamei}:${fav1Horse.odds}倍)に波乱リスク！2・3列目中心のパターン②〜④推奨`;
      reason = `単勝${fav1Horse.odds}倍の1番人気${fav1Horse.bamei}が素の地力${fav1Horse.stage1_rank}位・最終${fav1Horse.stage2_rank}位に留まっています。2列目×3列目ワイドや、3連複・3連単の『パターン②〜④（対抗・地力救済・穴頭）』の期待値が極めて高いレースです。`;
    } else {
      headline = `⚠️ 1位(${axisHorse.umaban}番)と2位(${secondHorse.umaban}番)の指数差が${shisuGap}ptと僅差！逆転＆2・3列目勝負推奨`;
      reason = `1着軸(${axisHorse.bamei})が素の地力${axisHorse.stage1_rank}位、または上位陣の能力差が僅少です。内枠包まれ等で軸が飛ぶケースも想定し、2・3列目ワイドや3連単『パターン③・④（2列目・3列目頭固定）』の併用を強く推奨します。`;
    }
  } else if (axisNotPureTop || shisuGap < 3.5) {
    level = 'MEDIUM';
    badgeText = '⚡ 軸信頼度: A（王道＋2・3列目逆転ケア推奨）';
    headline = `本線は${axisHorse.umaban}番${axisHorse.bamei}も、2列目(${secondHorse.umaban}番)や3列目地力馬の突き抜けに注意`;
    reason = `2位馬との指数差は+${shisuGap}pt（地力1位は${byStage1[0].umaban}番${byStage1[0].bamei}）です。パターン①をメインにしつつ、2・3列目ワイドやパターン③・④を押さえると高配当の取りこぼしを防げます。`;
  }

  const row1Umabans = [axisHorse.umaban];
  const main2ndUmabans = (tickets.formation_groups.main_2nd || []).map((m) => m.umaban);
  const saver3rdUmabans = [...(tickets.formation_groups.saver_3rd || []).map((s) => s.umaban)];

  if (saver3rdUmabans.length < 2) {
    for (const d of byStage2) {
      if (
        d.umaban !== axisHorse.umaban &&
        !main2ndUmabans.includes(d.umaban) &&
        !saver3rdUmabans.includes(d.umaban) &&
        (d.time_limit_mult ?? 1.0) > 0.88
      ) {
        saver3rdUmabans.push(d.umaban);
      }
      if (saver3rdUmabans.length >= 3) break;
    }
  }

  const allRow2Row3 = Array.from(new Set([...main2ndUmabans, ...saver3rdUmabans]));
  const allRow1Row2Row3 = Array.from(new Set([axisHorse.umaban, ...allRow2Row3]));

  const jirikiTopInRow23 = byStage1
    .filter((d) => d.umaban !== axisHorse.umaban && allRow2Row3.includes(d.umaban))
    .slice(0, 2)
    .map((d) => d.umaban);

  const saverJirikiAxes = saver3rdUmabans.filter((u) => {
    const h = diagnosis.find((d) => d.umaban === u);
    return h && h.stage1_rank <= 4;
  });
  const row3JirikiAxis =
    saverJirikiAxes.length > 0
      ? saverJirikiAxes.slice(0, 2)
      : jirikiTopInRow23.length > 0
        ? jirikiTopInRow23.slice(0, 2)
        : saver3rdUmabans.slice(0, 1);

  const myoumiSortedRow23 = allRow2Row3
    .map((u) => diagnosis.find((d) => d.umaban === u))
    .filter((d): d is DiagnosisResult => Boolean(d))
    .sort((a, b) => b.myoumi - a.myoumi || b.shisu - a.shisu);

  const tokuchuAxis =
    myoumiSortedRow23.find((d) => saver3rdUmabans.includes(d.umaban))?.umaban ||
    myoumiSortedRow23[0]?.umaban ||
    main2ndUmabans[0];

  const makeItem = (
    id: string,
    ticketType: 'WIDE' | 'PUKU' | 'TAN',
    title: string,
    badge: string,
    structureText: string,
    subNote: string,
    combos: string[]
  ): PatternTicketItem => {
    const allocInfo = computePatternAllocations(
      combos,
      ticketType,
      diagnosis,
      budgetYen,
      allocMode
    );
    return {
      id,
      ticketType,
      title,
      badge,
      structureText,
      subNote,
      combos,
      count: combos.length,
      syntheticOdds: allocInfo.syntheticOdds,
      totalStakeYen: allocInfo.totalStakeYen,
      allocations: allocInfo.allocations,
    };
  };

  const wide1Combos = generateWideCombos(
    main2ndUmabans,
    saver3rdUmabans.length > 0 ? saver3rdUmabans : main2ndUmabans
  );
  const wide2Targets = allRow2Row3.filter((u) => !row3JirikiAxis.includes(u)).slice(0, 5);
  const wide2Combos = generateWideCombos(row3JirikiAxis, wide2Targets);
  const wide3Targets = allRow2Row3.filter((u) => u !== tokuchuAxis).slice(0, 5);
  const wide3Combos = generateWideCombos([tokuchuAxis], wide3Targets);
  const wide4BoxPool = Array.from(
    new Set([...main2ndUmabans.slice(0, 2), ...saver3rdUmabans.slice(0, 2), ...allRow2Row3])
  ).slice(0, 4);
  const wide4Combos = generateWideCombos(wide4BoxPool, wide4BoxPool);

  const widePatterns: PatternTicketItem[] = [
    makeItem(
      'W1',
      'WIDE',
      'パターン①【王道タテ目】2列目本線 ➔ 3列目 クロス流し',
      '2列目×3列目本線',
      `2列目(${main2ndUmabans.join(', ')}) ➔ 3列目(${saver3rdUmabans.join(', ')})`,
      '1着軸(◎)が飛んでも、2列目本線と3列目救済馬のペアで確実に拾う基本形',
      wide1Combos
    ),
    makeItem(
      'W2',
      'WIDE',
      'パターン②【地力逆襲】3列目(地力上位)軸 ➔ 2・3列目流し',
      '地力救済軸',
      `軸: ${row3JirikiAxis.join(', ')}番 ➔ 相手: ${wide2Targets.join(', ')}番`,
      '外枠等で3列目に回った「素の地力上位馬」から2・3列目へ流す勝負手',
      wide2Combos
    ),
    makeItem(
      'W3',
      'WIDE',
      'パターン③【一撃回収】特注穴(☆妙味トップ)軸 ➔ 2・3列目流し',
      '妙味特注軸',
      `特注軸: ${tokuchuAxis}番 ➔ 相手: ${wide3Targets.join(', ')}番`,
      '妙味指数トップの伏兵から2・3列目の実力馬へぶつける高配当ワイド',
      wide3Combos
    ),
    makeItem(
      'W4',
      'WIDE',
      'パターン④【タテ目凝縮】2列目＋3列目 厳選4頭BOX',
      '2・3列目BOX',
      `BOX対象(4頭): ${wide4BoxPool.join(', ')}番`,
      '2列目上位2頭＋3列目上位2頭の計4頭で組む、ダブル・トリプル的中狙いの6点BOX',
      wide4Combos
    ),
  ];

  const puku1Combos = tickets.sanrenpuku_formation?.combos || [];
  const puku2Row1 = Array.from(
    new Set([main2ndUmabans[0], ...row3JirikiAxis, tokuchuAxis].filter(Boolean))
  ).slice(0, 3);
  const puku2Row2 = Array.from(
    new Set([...main2ndUmabans, ...row3JirikiAxis, tokuchuAxis].filter(Boolean))
  ).slice(0, 5);
  const puku2Row3 = allRow1Row2Row3;
  const puku2Combos = generateSanrenpukuFormCombos(puku2Row1, puku2Row2, puku2Row3);

  const puku3BoxPool = allRow2Row3.slice(0, 5);
  const puku3Combos = generateSanrenpukuFormCombos(puku3BoxPool, puku3BoxPool, puku3BoxPool);

  const puku4Axis = [row3JirikiAxis[0] || tokuchuAxis];
  const puku4Targets = allRow1Row2Row3.filter((u) => u !== puku4Axis[0]).slice(0, 6);
  const puku4Combos = generateSanrenpukuFormCombos(puku4Axis, puku4Targets, puku4Targets);

  const sanrenpukuPatterns: PatternTicketItem[] = [
    makeItem(
      'P1',
      'PUKU',
      'パターン①【王道本線】1着軸(◎) ー 2列目 ー 2・3列目F',
      '本命軸・王道',
      `${row1Umabans.join(',')} ー ${main2ndUmabans.join(',')} ー ${allRow2Row3.join(',')}`,
      '1着軸(◎)を信頼し、2列目本線と3列目救済馬へ流す最も資金効率の良い基本形',
      puku1Combos
    ),
    makeItem(
      'P2',
      'PUKU',
      'パターン②【対抗・3列目軸】2・3列目代表 ー 2・3列目 ー 全相手F',
      '2・3列目主役',
      `${puku2Row1.join(',')} ー ${puku2Row2.join(',')} ー ${puku2Row3.join(',')}`,
      '2列目筆頭と3列目の地力・特注馬を1列目に据え、本命(◎)が3着でも飛んでも獲れる攻めの形',
      puku2Combos
    ),
    makeItem(
      'P3',
      'PUKU',
      'パターン③【軸飛びタテ目】2列目＋3列目上位 5頭BOX',
      '軸抜きBOX',
      `BOX対象(5頭): ${puku3BoxPool.join(', ')}番`,
      '1着軸(◎)が馬群に沈んだ際、2列目と3列目の実力・穴馬同士で高配当を抜く10点BOX',
      puku3Combos
    ),
    makeItem(
      'P4',
      'PUKU',
      'パターン④【3列目一撃】3列目(地力・特注筆頭) 1頭軸流し',
      '3列目1頭軸',
      `軸: ${puku4Axis.join(',')}番 ー 相手: ${puku4Targets.join(', ')}番`,
      '3列目の最有力馬(地力救済/特注☆)が馬券に絡めば、相手どこでも高配当になる1頭軸流し',
      puku4Combos
    ),
  ];

  const tan1Combos = tickets.sanrentan_formation?.combos || [];
  const tan2Second = saver3rdUmabans.length > 0 ? saver3rdUmabans : main2ndUmabans;
  const tan2Combos = generateSanrentanFormCombos(row1Umabans, tan2Second, allRow2Row3);

  const tan3First = main2ndUmabans.slice(0, 2);
  const tan3Second = Array.from(
    new Set([axisHorse.umaban, ...main2ndUmabans, tokuchuAxis])
  ).slice(0, 4);
  const tan3Third = allRow1Row2Row3.slice(0, 7);
  const tan3Combos = generateSanrentanFormCombos(tan3First, tan3Second, tan3Third);

  const tan4First = Array.from(new Set([...row3JirikiAxis, tokuchuAxis])).slice(0, 2);
  const tan4Second = Array.from(
    new Set([...main2ndUmabans, ...saver3rdUmabans.slice(0, 2), axisHorse.umaban])
  ).slice(0, 5);
  const tan4Third = allRow1Row2Row3.slice(0, 7);
  const tan4Combos = generateSanrentanFormCombos(tan4First, tan4Second, tan4Third);

  const sanrentanPatterns: PatternTicketItem[] = [
    makeItem(
      'T1',
      'TAN',
      'パターン①【王道・本命頭】1列目(◎)1着固定 ➔ 2列目 ➔ 2・3列目',
      '本命1着固定',
      `${row1Umabans.join(',')} → ${main2ndUmabans.join(',')} → ${allRow2Row3.join(',')}`,
      '不動の本命(◎)を1着に固定し、2着に2列目本線、3着に3列目まで広げる王道勝負馬券',
      tan1Combos
    ),
    makeItem(
      'T2',
      'TAN',
      'パターン②【2着ヒモ荒れ】1列目(◎)1着固定 ➔ 3列目2着 ➔ 2・3列目',
      '3列目2着抜擢',
      `${row1Umabans.join(',')} → ${tan2Second.join(',')} → ${allRow2Row3.join(',')}`,
      '本命(◎)が勝ち、2着に3列目の地力馬・穴馬が突っ込む高配当1着固定',
      tan2Combos
    ),
    makeItem(
      'T3',
      'TAN',
      'パターン③【2列目頭固定】2列目本線(〇▲)1着 ➔ 本命・相手 ➔ 全相手',
      '2列目1着固定',
      `${tan3First.join(',')} → ${tan3Second.join(',')} → ${tan3Third.join(',')}`,
      'バイアス合致の2列目本線が勝ち切り、2・3着に本命や3列目が入る頭逆転フォーメーション',
      tan3Combos
    ),
    makeItem(
      'T4',
      'TAN',
      'パターン④【3列目頭・大波乱】3列目(地力・特注)1着 ➔ 2・3列目 ➔ 全相手',
      '3列目1着固定',
      `${tan4First.join(',')} → ${tan4Second.join(',')} → ${tan4Third.join(',')}`,
      '3列目の地力上位馬・特注穴が1着で突き抜け、2・3列目で決まる大波乱仕様',
      tan4Combos
    ),
  ];

  return {
    level,
    badgeText,
    headline,
    reason,
    widePatterns,
    sanrenpukuPatterns,
    sanrentanPatterns,
  };
}

export default function Home() {
  const [raceId, setRaceId] = useState('202605041111');
  const [fetching, setFetching] = useState(false);

  const [targetRaceName, setTargetRaceName] = useState('');
  const [targetPlace, setTargetPlace] = useState('東京');
  const [courseRailMessage, setCourseRailMessage] = useState('');
  const [courseRpci, setCourseRpci] = useState<number | null>(null);
  const [courseRpciType, setCourseRpciType] = useState<string>('');
  const [referenceBenchmarks, setReferenceBenchmarks] = useState<ReferenceBenchmarks | null>(null);

  const [courseType, setCourseType] = useState('芝');
  const [distance, setDistance] = useState(2000);
  const [weather, setWeather] = useState('晴');
  const [trackCondition, setTrackCondition] = useState('良');
  const [expectedPace, setExpectedPace] = useState('M_JIRIKI');

  const [trackBias, setTrackBias] = useState('フラット');
  const [biasStrength, setBiasStrength] = useState('中');

  const [cushionValue, setCushionValue] = useState<number>(9.5);
  const [autoStatus, setAutoStatus] = useState<AutoStatusInfo | null>(null);

  const [customDirOverride, setCustomDirOverride] = useState<'AUTO' | 'LEFT' | 'RIGHT'>('AUTO');
  const [customStartMode, setCustomStartMode] = useState<StartModeType>('AUTO');

  const [budgetYen, setBudgetYen] = useState<number>(3000);
  const [allocMode, setAllocMode] = useState<'EV_FOCUS' | 'EQUAL_RETURN'>('EV_FOCUS');

  const [horses, setHorses] = useState<HorseData[]>([
    {
      wakuban: 1,
      umaban: 1,
      bamei: '馬名を入力',
      kishu: '騎手',
      odds: 0.0,
      kinryou: 55,
      bataijuu: 480,
      weight_change: 0,
      condition_override: '1.00',
      condition_reason: '',
      training_rank: 'B',
      training_4f: '',
      training_1f: '',
      rotation_mult: 1.0,
      rotation_label: '',
      zenso_chakujun: 9,
      avg_agari: 35.0,
      kyakushitsu: 2,
      shussou_kaisuu: 0,
      pci: 50.0,
      pci_type: 'B',
      early_3f_sec: 35.5,
      history_details: [],
    },
  ]);

  const [diagnosisResults, setDiagnosisResults] = useState<DiagnosisResult[] | null>(null);
  const [bettingTickets, setBettingTickets] = useState<BettingTickets | null>(null);
  const [currentWin5Profile, setCurrentWin5Profile] = useState<Win5Profile | null>(null);
  const [activeStageView, setActiveStageView] = useState<'STAGE1' | 'STAGE2'>('STAGE2');
  const [activePatternTab, setActivePatternTab] = useState<'WIDE' | 'PUKU' | 'TAN' | 'ALL'>('ALL');
  const [isDiagnosing, setIsDiagnosing] = useState(false);

  const [xPostText, setXPostText] = useState('');
  const [copiedFlag, setCopiedFlag] = useState(false);

  const [savedRacesHistory, setSavedRacesHistory] = useState<SavedRaceHistoryItem[]>([]);

  const [showWin5Panel, setShowWin5Panel] = useState<boolean>(false);
  const [win5InputIds, setWin5InputIds] = useState<string[]>([
    '202608040410',
    '202605040410',
    '202603030411',
    '202608040411',
    '202605040411',
  ]);
  const [win5Slots, setWin5Slots] = useState<(Win5SlotData | null)[]>([
    null,
    null,
    null,
    null,
    null,
  ]);
  const [win5TargetPoints, setWin5TargetPoints] = useState<number>(36);
  const [win5BatchLoading, setWin5BatchLoading] = useState<boolean>(false);
  const [win5BatchProgressText, setWin5BatchProgressText] = useState<string>('');
  const [win5PostText, setWin5PostText] = useState<string>('');
  const [win5CopiedFlag, setWin5CopiedFlag] = useState<boolean>(false);

  const [results, setResults] = useState<RaceResult[] | null>(null);
  const [raceInfo, setRaceInfo] = useState<{
    req_up: number;
    pace_f: number;
    pace_l: number;
    rpci?: number;
    rpci_type?: string;
  } | null>(null);

  const [loading, setLoading] = useState(false);
  const [isRacing, setIsRacing] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [simProgress, setSimProgress] = useState(0);
  const [simHorseStates, setSimHorseStates] = useState<SimHorseTrackState[]>([]);
  const [simPhaseLabel, setSimPhaseLabel] = useState('');

  const [simRunId, setSimRunId] = useState(0);
  const animFrameRef = useRef<number | null>(null);
  const resultTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    try {
      const savedHistStr = localStorage.getItem('keiba_pro_saved_races_v1');
      if (savedHistStr) {
        const parsed = JSON.parse(savedHistStr);
        if (Array.isArray(parsed)) setSavedRacesHistory(parsed);
      }
      const savedWin5Str = localStorage.getItem('keiba_pro_win5_slots_v1');
      if (savedWin5Str) {
        const parsedW5 = JSON.parse(savedWin5Str);
        if (Array.isArray(parsedW5) && parsedW5.length === 5) setWin5Slots(parsedW5);
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  const marksSummary = buildHorseMarksAndPostText(
    diagnosisResults,
    bettingTickets,
    targetRaceName,
    targetPlace,
    raceId
  );

  useEffect(() => {
    if (marksSummary?.postText) {
      setXPostText(marksSummary.postText);
    }
  }, [marksSummary?.postText]);

  useEffect(() => {
    const txt = buildWin5PostText(win5Slots);
    setWin5PostText(txt);
    try {
      localStorage.setItem('keiba_pro_win5_slots_v1', JSON.stringify(win5Slots));
    } catch (e) {
      console.error(e);
    }
  }, [win5Slots]);

  const saveRaceToHistory = (item: SavedRaceHistoryItem) => {
    setSavedRacesHistory((prev) => {
      const filtered = prev.filter((x) => x.raceId !== item.raceId);
      const next = [item, ...filtered].slice(0, 10);
      try {
        localStorage.setItem('keiba_pro_saved_races_v1', JSON.stringify(next));
      } catch (e) {
        console.error(e);
      }
      return next;
    });
  };

  const handleDeleteHistoryItem = (targetRaceId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSavedRacesHistory((prev) => {
      const next = prev.filter((x) => x.raceId !== targetRaceId);
      try {
        localStorage.setItem('keiba_pro_saved_races_v1', JSON.stringify(next));
      } catch (err) {
        console.error(err);
      }
      return next;
    });
  };

  const handleClearAllHistory = () => {
    setSavedRacesHistory([]);
    try {
      localStorage.removeItem('keiba_pro_saved_races_v1');
    } catch (err) {
      console.error(err);
    }
  };

  const handleClearSingleWin5Slot = (slotIdx: number) => {
    setWin5Slots((prev) => prev.map((s, idx) => (idx === slotIdx ? null : s)));
  };

  const handleClearAllWin5Slots = () => {
    const empty: (Win5SlotData | null)[] = [null, null, null, null, null];
    setWin5Slots(empty);
    setWin5BatchProgressText('');
    try {
      localStorage.removeItem('keiba_pro_win5_slots_v1');
    } catch (err) {
      console.error(err);
    }
  };

  const handleLoadFromHistory = (item: SavedRaceHistoryItem) => {
    setRaceId(item.raceId);
    setTargetRaceName(item.targetRaceName);
    setTargetPlace(item.targetPlace);
    setCourseRailMessage(item.courseRailMessage);
    setCourseRpci(item.courseRpci);
    setCourseRpciType(item.courseRpciType);
    setReferenceBenchmarks(item.referenceBenchmarks);
    setCourseType(item.courseType);
    setDistance(item.distance);
    setWeather(item.weather);
    setTrackCondition(item.trackCondition);
    setExpectedPace(item.expectedPace);
    setTrackBias(item.trackBias);
    setBiasStrength(item.biasStrength);
    setCushionValue(item.cushionValue);
    setAutoStatus(item.autoStatus);
    setHorses(item.horses || []);
    setDiagnosisResults(item.diagnosisResults);
    setBettingTickets(item.bettingTickets);
    setCurrentWin5Profile(item.win5Profile);
    setRaceInfo(item.raceInfo);
    setResults(null);
    setIsRacing(false);
    setShowResults(false);
  };

  const handleApplyWin5TargetPoints = (
    targetPts: number,
    customSlots?: (Win5SlotData | null)[]
  ) => {
    setWin5TargetPoints(targetPts);
    const baseSlots = customSlots || win5Slots;
    const optCounts = computeOptimalWin5Counts(baseSlots, targetPts);
    const updated = baseSlots.map((slot, idx) => {
      if (!slot || !slot.win5Profile) return null;
      const cnt = optCounts[idx] || 1;
      const cands = Array.isArray(slot.win5Profile.candidates) ? slot.win5Profile.candidates : [];
      const topUmabans = cands.slice(0, cnt).map((c) => c.umaban);
      return {
        ...slot,
        selectedUmabans: topUmabans,
      };
    });
    setWin5Slots(updated);
  };

  const handleRegisterCurrentToWin5 = (slotIdx: number) => {
    if (!diagnosisResults || !bettingTickets) {
      alert('先にSTEP 2の下部ボタンから「最終診断」を実行してください。');
      return;
    }
    const prof = ensureValidWin5Profile(currentWin5Profile, diagnosisResults, bettingTickets);
    const cands = Array.isArray(prof.candidates) ? prof.candidates : [];
    if (cands.length === 0) {
      alert('有効な候補馬データがありません。');
      return;
    }

    let rNumLabel = '11R';
    if (raceId && raceId.length >= 2) {
      const rn = parseInt(raceId.slice(-2), 10);
      if (!isNaN(rn)) rNumLabel = `${rn}R`;
    }

    const newSlot: Win5SlotData = {
      slotIndex: slotIdx,
      raceId,
      placeName: targetPlace || '東京',
      raceNumLabel: rNumLabel,
      raceName: targetRaceName || `レース${slotIdx + 1}`,
      courseType,
      distance,
      win5Profile: prof,
      selectedUmabans: cands.slice(0, prof.recommended_count || 2).map((c) => c.umaban),
    };

    const nextSlots = [...win5Slots];
    nextSlots[slotIdx] = newSlot;
    const nextIds = [...win5InputIds];
    nextIds[slotIdx] = raceId;
    setWin5InputIds(nextIds);

    handleApplyWin5TargetPoints(win5TargetPoints, nextSlots);
    setShowWin5Panel(true);
  };

  const handleToggleWin5Horse = (slotIdx: number, umaban: number) => {
    setWin5Slots((prev) =>
      prev.map((slot, i) => {
        if (i !== slotIdx || !slot) return slot;
        const currentSel = Array.isArray(slot.selectedUmabans) ? slot.selectedUmabans : [];
        const exists = currentSel.includes(umaban);
        let nextSel: number[];
        if (exists) {
          if (currentSel.length <= 1) return slot;
          nextSel = currentSel.filter((u) => u !== umaban);
        } else {
          nextSel = [...currentSel, umaban];
        }
        return { ...slot, selectedUmabans: nextSel };
      })
    );
  };

  const handleBatchFetchWin5 = async () => {
    const validIds = win5InputIds.map((x) => x.trim());
    if (validIds.some((x) => x.length < 10)) {
      alert('WIN5対象の5つのレースID（12桁）をすべて入力してください。');
      return;
    }

    setWin5BatchLoading(true);
    const nextSlots: (Win5SlotData | null)[] = [...win5Slots];
    const skippedNotes: string[] = [];

    try {
      for (let i = 0; i < 5; i++) {
        const rid = validIds[i];
        setWin5BatchProgressText(`⏳ WIN5自動解析中 (${i + 1}/5レース目: ID ${rid})...`);

        const resFetch = await fetch(`https://keiba-api-hybt.onrender.com/fetch_race/${rid}`);
        if (!resFetch.ok) {
          skippedNotes.push(`第${i + 1}戦(${rid}): 通信エラー`);
          continue;
        }
        const fetchJson = await resFetch.json();
        const fetchedHorses = Array.isArray(fetchJson?.horses) ? fetchJson.horses : [];
        if (fetchJson.status !== 'success' || fetchedHorses.length < 2) {
          skippedNotes.push(`第${i + 1}戦(${rid}): 出馬表未発表または0頭のためスキップ`);
          continue;
        }

        const cType = fetchJson.course_type || '芝';
        const dist = Number(fetchJson.distance || 2000);
        const wthr = fetchJson.weather || '晴';
        const tCond = fetchJson.track_condition || '良';
        const ePace = fetchJson.recommended_pace || 'M_JIRIKI';
        const tBias = fetchJson.auto_track_bias || 'フラット';
        const bStr = fetchJson.auto_bias_strength || '中';
        const cVal = cType === '芝' && ['稍', '重', '不'].includes(tCond) ? 8.6 : 9.5;

        const resDiag = await fetch('https://keiba-api-hybt.onrender.com/diagnose_race', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            race_id: rid,
            horses: fetchedHorses,
            course_type: cType,
            distance: dist,
            weather: wthr,
            track_condition: tCond,
            expected_pace: ePace,
            track_bias: tBias,
            bias_strength: bStr,
            cushion_value: cVal,
          }),
        });
        if (!resDiag.ok) {
          skippedNotes.push(`第${i + 1}戦(${rid}): 診断エラー`);
          continue;
        }
        const diagJson = await resDiag.json();
        const diagList: DiagnosisResult[] = Array.isArray(diagJson?.diagnosis)
          ? diagJson.diagnosis
          : [];
        if (diagList.length === 0) {
          skippedNotes.push(`第${i + 1}戦(${rid}): 診断結果が空のためスキップ`);
          continue;
        }

        const prof: Win5Profile = ensureValidWin5Profile(
          diagJson.win5_profile,
          diagList,
          diagJson.betting_tickets
        );
        const cands = Array.isArray(prof.candidates) ? prof.candidates : [];

        let rNumLabel = '11R';
        if (rid.length >= 2) {
          const rn = parseInt(rid.slice(-2), 10);
          if (!isNaN(rn)) rNumLabel = `${rn}R`;
        }

        const pName = normalizeToSupportedVenue(fetchJson.place_name || '東京');
        nextSlots[i] = {
          slotIndex: i,
          raceId: rid,
          placeName: pName,
          raceNumLabel: rNumLabel,
          raceName: fetchJson.race_name || `WIN5 第${i + 1}戦`,
          courseType: cType,
          distance: dist,
          win5Profile: prof,
          selectedUmabans: cands.slice(0, prof.recommended_count || 2).map((c) => c.umaban),
        };

        saveRaceToHistory({
          raceId: rid,
          savedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          targetRaceName: fetchJson.race_name || '',
          targetPlace: pName,
          courseRailMessage: fetchJson.course_rail_message || '',
          courseRpci: fetchJson.rpci || 50.0,
          courseRpciType: fetchJson.rpci_type || 'B',
          referenceBenchmarks: fetchJson.reference_benchmarks || null,
          courseType: cType,
          distance: dist,
          weather: wthr,
          trackCondition: tCond,
          expectedPace: ePace,
          trackBias: tBias,
          biasStrength: bStr,
          cushionValue: cVal,
          autoStatus: fetchJson.auto_status || null,
          horses: fetchedHorses,
          diagnosisResults: diagList,
          bettingTickets: diagJson.betting_tickets || null,
          win5Profile: prof,
          raceInfo: {
            req_up: diagJson.req_up,
            pace_f: diagJson.pace_f,
            pace_l: diagJson.pace_l,
            rpci: diagJson.rpci,
            rpci_type: diagJson.rpci_type,
          },
        });
      }

      handleApplyWin5TargetPoints(win5TargetPoints, nextSlots);
      if (skippedNotes.length > 0) {
        setWin5BatchProgressText(
          `⚠️ 一部スキップ完了: ${skippedNotes.join(' / ')}（取得できたレースは反映済みです）`
        );
      } else {
        setWin5BatchProgressText('✅ WIN5 全5レースのAI解析＆最適点数配分が完了しました！');
      }
    } catch (err: any) {
      console.error(err);
      alert(err?.message || 'WIN5連続解析中にエラーが発生しました。');
      setWin5BatchProgressText('');
    } finally {
      setWin5BatchLoading(false);
    }
  };

  const activeVenueKey = normalizeToSupportedVenue(targetPlace || '東京');
  const venueProfile = getVenueProfile(activeVenueKey);
  const effectiveDir: 'LEFT' | 'RIGHT' =
    customDirOverride === 'AUTO' ? venueProfile.dir : customDirOverride;
  const startConfig = resolveStartConfig(activeVenueKey, courseType, distance, customStartMode);

  useEffect(() => {
    if (!isRacing || !results || results.length === 0) {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      if (resultTimerRef.current) clearTimeout(resultTimerRef.current);
      return;
    }

    const vProf = getVenueProfile(activeVenueKey);
    const sConf = resolveStartConfig(activeVenueKey, courseType, distance, customStartMode);
    const { resolvedMode, startLabel, startLapPos, totalLaps } = sConf;
    const totalH = results.length;

    const horseProfiles = results.map((r) => {
      const hInput = horses.find((h) => h.umaban === r.umaban);
      const kyaku = hInput ? Math.round(Number(hInput.kyakushitsu)) : 2;
      const waku = hInput ? Number(hInput.wakuban || r.umaban) : r.umaban;

      let hasMakuriHistory = false;
      const hist = hInput?.history_details || [];
      for (const hd of hist) {
        const pNums = String(hd.passing || '')
          .split('-')
          .map((x) => parseInt(x, 10))
          .filter((n) => !isNaN(n));
        if (pNums.length >= 2 && pNums[0] - pNums[pNums.length - 1] >= 3) {
          hasMakuriHistory = true;
          break;
        }
      }

      const isMakuriHorse =
        (hasMakuriHistory && kyaku >= 2 && r.rank <= 7) ||
        ((expectedPace === 'S_LONSPA' || expectedPace === 'M_LONSPA') &&
          kyaku === 3 &&
          r.rank <= 4) ||
        (kyaku === 4 && r.rank <= 2);

      const seed = ((r.umaban * 17) % 10) / 1000;
      const earlyLag =
        kyaku === 1
          ? 0.002 + seed * 1.5
          : kyaku === 2
            ? 0.025 + seed * 2.5
            : kyaku === 3
              ? 0.062 + seed * 3.0
              : 0.098 + seed * 3.0;

      const midLag = isMakuriHorse
        ? Math.max(0.008, earlyLag * 0.22)
        : kyaku === 1
          ? 0.002 + seed
          : kyaku === 2
            ? 0.022 + seed * 2.0
            : kyaku === 3
              ? 0.052 + seed * 2.5
              : 0.082 + seed * 2.5;

      const finishLag = (r.rank - 1) * 0.0052 + (r.rank > 5 ? (r.rank - 5) * 0.002 : 0);

      const wakuRatio = Math.max(0, Math.min(1, (waku - 1) / Math.max(1, totalH - 1)));
      const startLane = 2 + wakuRatio * 20;
      const cruiseLane =
        kyaku === 1
          ? 1.5 + (r.umaban % 2) * 3.0
          : kyaku === 2
            ? 3.5 + wakuRatio * 9.0
            : kyaku === 3
              ? 5.5 + wakuRatio * 12.0
              : 4.5 + wakuRatio * 13.0;

      const makuriLane = isMakuriHorse ? Math.min(25, cruiseLane + 11.0) : cruiseLane;
      const straightLane =
        r.rank <= 5 && kyaku >= 3
          ? Math.min(26, Math.max(14, cruiseLane + 9.0))
          : kyaku === 1
            ? 2.0
            : Math.min(22, cruiseLane + (r.rank % 3) * 2.5);

      return {
        umaban: r.umaban,
        bamei: r.bamei,
        rank: r.rank,
        kyakushitsu: kyaku,
        isMakuriHorse,
        earlyLag,
        midLag,
        finishLag,
        startLane,
        cruiseLane,
        makuriLane,
        straightLane,
      };
    });

    const totalDurationMs = 13500;
    const startTime = performance.now();

    const step = (now: number) => {
      const elapsed = Math.max(0, now - startTime);
      const t = Math.min(1.0, elapsed / totalDurationMs);
      setSimProgress(t);

      const leadPosInfo = getHorseSimPosition(
        t,
        effectiveDir,
        resolvedMode,
        startLapPos,
        totalLaps,
        4
      );
      const leadLapPos = ((leadPosInfo.lapPosForElev % 1) + 1) % 1;
      const activeSlope = vProf.slopeZones.find(
        (z) => leadLapPos >= z.startLap && leadLapPos <= z.endLap
      );

      if (t < 0.14) {
        setSimPhaseLabel(`🚪 スタート（${startLabel}）＆ 先行争い`);
      } else if (t < 0.45) {
        setSimPhaseLabel(
          activeSlope
            ? `⛰️ 向正面巡航 ［現在: ${activeSlope.label}］`
            : '🐎 向正面（バックストレッチ）折り合い・隊列巡航'
        );
      } else if (t < 0.74) {
        setSimPhaseLabel(
          activeSlope
            ? `🔥 3〜4コーナー勝負所・まくり進出 ［${activeSlope.label}］`
            : '🔥 3〜4コーナー勝負所（後続まくり・ペースアップ！）'
        );
      } else if (t < 0.99) {
        setSimPhaseLabel(
          activeSlope
            ? `⚡ 最後の直線・末脚勝負！ ［${activeSlope.label}］`
            : `⚡ 最後の直線（${vProf.straightMeter}m）・全馬スパート！`
        );
      } else {
        setSimPhaseLabel('🏁 ゴールイン！（写真判定・着順確定）');
      }

      const nextStates: SimHorseTrackState[] = horseProfiles.map((hp) => {
        let p = 0;
        const p1 = Math.max(0.02, 0.25 - hp.earlyLag * 0.65);
        const p2 = Math.max(p1 + 0.05, 0.5 - hp.earlyLag);
        const p3 = Math.max(p2 + 0.05, 0.74 - hp.midLag);
        const p4 = 1.0 - hp.finishLag;

        if (t <= 0.25) {
          p = (t / 0.25) * p1;
        } else if (t <= 0.5) {
          p = p1 + ((t - 0.25) / 0.25) * (p2 - p1);
        } else if (t <= 0.74) {
          const local = (t - 0.5) / 0.24;
          const eased = hp.isMakuriHorse ? Math.pow(local, 0.8) : local;
          p = p2 + eased * (p3 - p2);
        } else {
          const local = (t - 0.74) / 0.26;
          const spurtPower = hp.kyakushitsu >= 3 && hp.rank <= 3 ? Math.pow(local, 0.82) : local;
          p = p3 + spurtPower * (p4 - p3);
        }

        let lane = hp.cruiseLane;
        if (t < 0.2) {
          const lRatio = t / 0.2;
          lane = hp.startLane + (hp.cruiseLane - hp.startLane) * lRatio;
        } else if (t < 0.48) {
          lane = hp.cruiseLane;
        } else if (t < 0.74) {
          const lRatio = (t - 0.48) / 0.26;
          lane = hp.cruiseLane + (hp.makuriLane - hp.cruiseLane) * lRatio;
        } else {
          const lRatio = Math.min(1, (t - 0.74) / 0.14);
          lane = hp.makuriLane + (hp.straightLane - hp.makuriLane) * lRatio;
        }

        const pt = getHorseSimPosition(p, effectiveDir, resolvedMode, startLapPos, totalLaps, lane);

        return {
          umaban: hp.umaban,
          bamei: hp.bamei,
          rank: hp.rank,
          kyakushitsu: hp.kyakushitsu,
          isMakuriHorse: hp.isMakuriHorse,
          x: pt.x,
          y: pt.y,
          currentProgress: p,
          isMakuriActiveNow: hp.isMakuriHorse && t >= 0.46 && t <= 0.78,
          isSpurtActiveNow: hp.rank <= 3 && t >= 0.75 && t < 1.0,
        };
      });

      setSimHorseStates(nextStates);

      if (t < 1.0) {
        animFrameRef.current = requestAnimationFrame(step);
      } else {
        resultTimerRef.current = setTimeout(() => {
          setShowResults(true);
        }, 600);
      }
    };

    animFrameRef.current = requestAnimationFrame(step);

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      if (resultTimerRef.current) clearTimeout(resultTimerRef.current);
    };
  }, [
    isRacing,
    simRunId,
    results,
    activeVenueKey,
    courseType,
    distance,
    expectedPace,
    effectiveDir,
    customStartMode,
    horses,
  ]);

  const handleCopyPostText = async () => {
    try {
      await navigator.clipboard.writeText(xPostText);
      setCopiedFlag(true);
      setTimeout(() => setCopiedFlag(false), 2000);
    } catch (e) {
      console.error(e);
    }
  };

  const handleShareToX = () => {
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(xPostText)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleCopyWin5Post = async () => {
    try {
      await navigator.clipboard.writeText(win5PostText);
      setWin5CopiedFlag(true);
      setTimeout(() => setWin5CopiedFlag(false), 2000);
    } catch (e) {
      console.error(e);
    }
  };

  const handleShareWin5ToX = () => {
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(win5PostText)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleFetchRace = async () => {
    if (!raceId) {
      alert('レースIDを入力してください');
      return;
    }
    setFetching(true);
    try {
      const response = await fetch(`https://keiba-api-hybt.onrender.com/fetch_race/${raceId}`);
      if (!response.ok) throw new Error('通信エラー');
      const data = await response.json();
      if (data.status === 'success') {
        const rawHorses: Partial<HorseData>[] = Array.isArray(data.horses) ? data.horses : [];
        const mappedHorses: HorseData[] = rawHorses.map((h, idx) => ({
          wakuban: Number(h.wakuban ?? 1),
          umaban: Number(h.umaban ?? idx + 1),
          bamei: String(h.bamei ?? ''),
          kishu: String(h.kishu ?? ''),
          odds: Number(h.odds ?? 0.0),
          kinryou: Number(h.kinryou ?? 55),
          bataijuu: Number(h.bataijuu ?? 480),
          weight_change: Number(h.weight_change ?? 0),
          condition_override: String(h.condition_override ?? '1.00'),
          condition_reason: String(h.condition_reason ?? ''),
          training_rank: String(h.training_rank ?? 'B'),
          training_4f: '',
          training_1f: '',
          rotation_mult: Number(h.rotation_mult ?? 1.0),
          rotation_label: String(h.rotation_label ?? ''),
          zenso_chakujun: Number(h.zenso_chakujun ?? 9),
          avg_agari: Number(h.avg_agari ?? 35.0),
          kyakushitsu: Number(h.kyakushitsu ?? 2),
          shussou_kaisuu: Number(h.shussou_kaisuu ?? 0),
          pci: Number(h.pci ?? 50.0),
          pci_type: String(h.pci_type ?? 'B'),
          early_3f_sec: Number(h.early_3f_sec ?? 35.5),
          history_details: Array.isArray(h.history_details) ? h.history_details : [],
        }));
        setHorses(mappedHorses);

        const cType = data.course_type || '芝';
        const tCond = data.track_condition || '良';
        setCourseType(cType);
        setDistance(Number(data.distance || 2000));
        setWeather(data.weather || '晴');
        setTrackCondition(tCond);
        setCourseRailMessage(data.course_rail_message || '');

        const recPace = data.recommended_pace || 'M_JIRIKI';
        setExpectedPace(PACE_SCENARIOS[recPace] ? recPace : 'M_JIRIKI');
        setCourseRpci(data.rpci || 50.0);
        setCourseRpciType(data.rpci_type || 'B');
        setReferenceBenchmarks(data.reference_benchmarks || null);

        setTrackBias(data.auto_track_bias || 'フラット');
        setBiasStrength(data.auto_bias_strength || '中');
        setCushionValue(cType === '芝' && ['稍', '重', '不'].includes(tCond) ? 8.6 : 9.5);

        setTargetRaceName(data.race_name || '');
        setTargetPlace(normalizeToSupportedVenue(data.place_name || '東京'));
        setCustomDirOverride('AUTO');
        setCustomStartMode('AUTO');
        setAutoStatus(data.auto_status || null);

        alert(
          `${mappedHorses.length}頭の出馬表・過去5走履歴・距離/回り/起伏/巻き返し印を取得しました！\n\n` +
            `${data.auto_status?.odds_message || ''}\n\n` +
            `${data.auto_status?.pace_message || ''}\n\n` +
            `${data.auto_status?.bias_message || ''}\n\n` +
            `${data.auto_status?.weight_message || ''}`
        );

        setDiagnosisResults(null);
        setBettingTickets(null);
        setCurrentWin5Profile(null);
        setResults(null);
        setRaceInfo(null);
        setIsRacing(false);
        setShowResults(false);
      } else {
        alert(`エラー: ${data.message}`);
      }
    } catch (error) {
      console.error(error);
      alert('データ取得に失敗しました。サーバーが起動しているか確認してください。');
    } finally {
      setFetching(false);
    }
  };

  const handleChange = (index: number, field: keyof HorseData, value: string) => {
    const newHorses = [...horses];
    const current = { ...newHorses[index] };
    if (
      field === 'bamei' ||
      field === 'kishu' ||
      field === 'pci_type' ||
      field === 'condition_override' ||
      field === 'condition_reason' ||
      field === 'training_rank' ||
      field === 'rotation_label'
    ) {
      current[field] = value;
    } else if (field === 'training_4f' || field === 'training_1f') {
      current[field] = value;
      const autoRank = evaluateTrainingRankFromClock(
        field === 'training_4f' ? value : current.training_4f,
        field === 'training_1f' ? value : current.training_1f
      );
      if (autoRank) {
        current.training_rank = autoRank;
      }
    } else if (field !== 'history_details') {
      current[field] = parseFloat(value) || 0;
    }
    newHorses[index] = current;
    setHorses(newHorses);
  };

  const runDiagnosisWithMode = async (mode: 'STAGE1' | 'STAGE2') => {
    setIsDiagnosing(true);
    setActiveStageView(mode);
    setResults(null);
    setIsRacing(false);
    setShowResults(false);

    try {
      const response = await fetch('https://keiba-api-hybt.onrender.com/diagnose_race', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          race_id: raceId,
          horses: horses,
          course_type: courseType,
          distance: distance,
          weather: weather,
          track_condition: trackCondition,
          expected_pace: expectedPace,
          track_bias: trackBias,
          bias_strength: biasStrength,
          cushion_value: cushionValue,
        }),
      });

      if (!response.ok) throw new Error('API通信エラー');
      const data = await response.json();
      const diagList: DiagnosisResult[] = Array.isArray(data.diagnosis) ? data.diagnosis : [];
      setDiagnosisResults(diagList);
      setBettingTickets(data.betting_tickets || null);
      const w5Prof: Win5Profile = ensureValidWin5Profile(
        data.win5_profile,
        diagList,
        data.betting_tickets
      );
      setCurrentWin5Profile(w5Prof);

      const newRaceInfo = {
        req_up: data.req_up,
        pace_f: data.pace_f,
        pace_l: data.pace_l,
        rpci: data.rpci,
        rpci_type: data.rpci_type,
      };
      setRaceInfo(newRaceInfo);

      saveRaceToHistory({
        raceId,
        savedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        targetRaceName,
        targetPlace,
        courseRailMessage,
        courseRpci,
        courseRpciType,
        referenceBenchmarks,
        courseType,
        distance,
        weather,
        trackCondition,
        expectedPace,
        trackBias,
        biasStrength,
        cushionValue,
        autoStatus,
        horses,
        diagnosisResults: diagList,
        bettingTickets: data.betting_tickets || null,
        win5Profile: w5Prof,
        raceInfo: newRaceInfo,
      });
    } catch (error) {
      console.error(error);
      alert('エラーが発生しました。');
    } finally {
      setIsDiagnosing(false);
    }
  };

  const handleSimulate = async () => {
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }
    if (resultTimerRef.current) {
      clearTimeout(resultTimerRef.current);
      resultTimerRef.current = null;
    }
    setIsRacing(false);
    setShowResults(false);
    setSimProgress(0);
    setLoading(true);

    try {
      const response = await fetch('https://keiba-api-hybt.onrender.com/simulate_race', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          race_id: raceId,
          horses: horses,
          course_type: courseType,
          distance: distance,
          weather: weather,
          track_condition: trackCondition,
          expected_pace: expectedPace,
          track_bias: trackBias,
          bias_strength: biasStrength,
          cushion_value: cushionValue,
        }),
      });

      if (!response.ok) throw new Error('API通信エラー');
      const data = await response.json();
      setResults(Array.isArray(data.ranking) ? data.ranking : []);
      setSimRunId((prev) => prev + 1);
      setIsRacing(true);
    } catch (error) {
      console.error(error);
      alert('エラーが発生しました。');
    } finally {
      setLoading(false);
    }
  };

  const getScenarioMatchLabel = (horse: DiagnosisResult) => {
    const hInput = horses.find((h) => h.umaban === horse.umaban);
    const kyaku = hInput ? Number(hInput.kyakushitsu) : 2;
    if (
      expectedPace === 'S_YOIDON' &&
      (horse.pci_type === 'C' || horse.time_diff <= -0.2) &&
      kyaku <= 3
    )
      return '🔥 直線キレ味合致';
    if (
      expectedPace === 'S_LONSPA' &&
      horse.pci >= 49.5 &&
      horse.pci <= 54.0 &&
      (kyaku === 2 || kyaku === 3)
    )
      return '🔥 ロンスパ適性合致';
    if (expectedPace === 'M_JIRIKI' && horse.pci_type === 'B' && (kyaku === 2 || kyaku === 3))
      return '🔥 王道好位合致';
    if (
      expectedPace === 'M_LONSPA' &&
      (horse.pci_type === 'B' || horse.pci_type === 'A') &&
      (kyaku === 2 || kyaku === 3)
    )
      return '🔥 タフ持続戦合致';
    if (expectedPace === 'H_MAEKUZURE' && (horse.pci_type === 'A' || kyaku >= 3))
      return '🔥 消耗戦・差追合致';
    return null;
  };

  const renderSingleBenchmarkCard = (bench: SingleBenchmark, isCurrentYear: boolean) => (
    <div
      className={`p-3 md:p-4 rounded-xl border ${
        isCurrentYear
          ? 'bg-amber-950/40 border-amber-500/80 shadow-md'
          : 'bg-gray-900/90 border-cyan-700/60'
      }`}
    >
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-gray-800 pb-2 mb-2.5">
        <div className="flex items-center gap-2">
          <span
            className={`text-[10px] md:text-xs font-black px-2.5 py-0.5 rounded-full ${
              isCurrentYear ? 'bg-amber-400 text-gray-950' : 'bg-cyan-700 text-white'
            }`}
          >
            {isCurrentYear ? '🏁 今年度・確定結果' : '⏱️ 前年・同条件基準'}
          </span>
          <span className="text-xs md:text-sm font-bold text-gray-200">{bench.label}</span>
        </div>
        <div className="flex items-center gap-2 bg-black/50 px-3 py-1 rounded-lg border border-gray-700">
          <span className="text-xs text-gray-400 font-bold">1着ゴールタイム:</span>
          <span className="text-base md:text-lg font-mono font-black text-yellow-400">
            {bench.winner_time}
          </span>
          {bench.winner_bamei && (
            <span className="text-[11px] text-gray-300 font-bold">
              ({bench.winner_umaban > 0 ? `${bench.winner_umaban}番 ` : ''}
              {bench.winner_bamei})
            </span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-xs">
        {(bench.top3 || []).map((item) => (
          <div
            key={item.rank}
            className="bg-gray-950/80 border border-gray-800 rounded-lg px-2.5 py-2 flex items-center justify-between gap-2"
          >
            <div className="flex items-center gap-1.5 min-w-0">
              <span
                className={`font-black px-1.5 py-0.5 rounded text-[10px] ${
                  item.rank === 1
                    ? 'bg-yellow-500 text-gray-950'
                    : item.rank === 2
                      ? 'bg-gray-300 text-gray-950'
                      : 'bg-amber-600 text-white'
                }`}
              >
                {item.rank}着
              </span>
              {item.umaban > 0 && (
                <span className="text-gray-300 font-mono font-bold text-[11px]">
                  {item.umaban}番
                </span>
              )}
              <span className="font-bold text-white truncate">{item.bamei}</span>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0 font-mono">
              <span className="text-[11px] text-gray-400" title="走行順位(通過順)">
                [{item.passing}]
              </span>
              <span className="bg-indigo-950/90 text-sky-300 border border-indigo-600/60 px-2 py-0.5 rounded font-extrabold text-xs">
                上り {item.up}秒
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderPatternCard = (
    pat: PatternTicketItem,
    borderClass: string,
    titleClass: string,
    badgeBgClass: string
  ) => (
    <div
      key={pat.id}
      className={`bg-gray-950/90 border ${borderClass} rounded-lg p-3 flex flex-col justify-between`}
    >
      <div>
        <div className="flex justify-between items-center gap-2 border-b border-gray-800 pb-1.5 mb-2">
          <span className={`font-extrabold text-xs md:text-sm ${titleClass}`}>{pat.title}</span>
          <div className="flex items-center gap-1.5 flex-shrink-0">
            <span className="text-[10px] bg-gray-800 text-yellow-300 border border-yellow-600/60 px-2 py-0.5 rounded font-mono font-bold">
              合成 {pat.syntheticOdds}倍
            </span>
            <span className={`text-xs ${badgeBgClass} font-black px-2 py-0.5 rounded whitespace-nowrap`}>
              計 {pat.count} 点
            </span>
          </div>
        </div>
        <div className="font-mono text-xs font-extrabold text-yellow-300 mb-1">
          {pat.structureText}
        </div>
        <p className="text-[11px] text-gray-400 mb-2 leading-snug">{pat.subNote}</p>
      </div>

      <div className="bg-black/60 p-2 rounded border border-gray-800 max-h-36 overflow-y-auto">
        <div className="flex justify-between items-center text-[10px] text-gray-400 border-b border-gray-800 pb-1 mb-1 font-bold">
          <span>買い目 (推定オッズ / 妙味)</span>
          <span>推奨配分 (想定払戻)</span>
        </div>
        <div className="space-y-1 font-mono text-[11px]">
          {(pat.allocations || []).map((al, idx) => (
            <div
              key={idx}
              className="flex justify-between items-center border-b border-gray-900/80 last:border-0 py-0.5"
            >
              <div className="flex items-center gap-1.5">
                <span className="text-white font-bold">{al.combo}</span>
                <span className="text-gray-400 text-[10px]">({al.estOdds}倍)</span>
                {al.isValuePick && (
                  <span className="bg-pink-900/80 text-pink-200 border border-pink-500/60 px-1 rounded text-[9px] font-bold">
                    🔥妙味EV{al.ev}
                  </span>
                )}
                {al.isTrigamiWarn && (
                  <span className="bg-amber-950 text-amber-300 border border-amber-600/60 px-1 rounded text-[9px]">
                    ⚠️安目
                  </span>
                )}
              </div>
              <div className="text-right">
                <span className="text-emerald-300 font-extrabold">{al.stakeYen}円</span>
                <span className="text-gray-400 text-[10px] ml-1">
                  (➔{al.expectedReturnYen.toLocaleString()}円)
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const startGatePt = getHorseSimPosition(
    0.0,
    effectiveDir,
    startConfig.resolvedMode,
    startConfig.startLapPos,
    startConfig.totalLaps,
    10
  );
  const pocketMergePt = getTrackPointAndNormal(startConfig.startLapPos, effectiveDir, 10);
  const goalGatePt = getTrackPointAndNormal(0.0, effectiveDir, 0);

  const elevationSamples = 60;
  const maxElev = Math.max(3.5, venueProfile.elevationDiff + 0.5);
  const elevPoints: string[] = [];
  for (let i = 0; i <= elevationSamples; i++) {
    const ratio = i / elevationSamples;
    const lapPos = (startConfig.startLapPos + ratio * startConfig.totalLaps) % 1;
    const elev = venueProfile.getElevationAtLapPos(lapPos);
    const px = 40 + ratio * 720;
    const py = 74 - (elev / maxElev) * 48;
    elevPoints.push(`${px.toFixed(1)},${py.toFixed(1)}`);
  }
  const elevPolygonPoints = `40,78 ${elevPoints.join(' ')} 760,78`;
  const currentLeadLapPos = (startConfig.startLapPos + simProgress * startConfig.totalLaps) % 1;
  const currentLeadElev = venueProfile.getElevationAtLapPos(currentLeadLapPos);
  const currentElevX = 40 + simProgress * 720;
  const currentElevY = 74 - (currentLeadElev / maxElev) * 48;

  const currentScenario = PACE_SCENARIOS[expectedPace] || PACE_SCENARIOS.M_JIRIKI;

  const displayedDiagnosis = diagnosisResults
    ? [...diagnosisResults].sort((a, b) =>
        activeStageView === 'STAGE1' ? b.stage1_shisu - a.stage1_shisu : b.shisu - a.shisu
      )
    : null;

  const axisDefensePlan = buildAxisDefensePlan(
    diagnosisResults,
    bettingTickets,
    budgetYen,
    allocMode
  );

  const totalWin5Combos = win5Slots.reduce((acc, s) => {
    const selLen = Array.isArray(s?.selectedUmabans) ? s!.selectedUmabans.length : 0;
    return acc * (selLen > 0 ? selLen : 1);
  }, 1);

  return (
    <main className="min-h-screen bg-gray-900 text-white p-4 md:p-6 font-sans pb-20">
      <div className="max-w-5xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-center gap-3 mb-5">
          <h1 className="text-2xl md:text-3xl font-bold text-center md:text-left text-red-500">
            PRO仕様 競馬本格シミュレーター
          </h1>
          <button
            onClick={() => setShowWin5Panel((prev) => !prev)}
            className={`px-4 py-2.5 rounded-xl font-extrabold text-xs md:text-sm border-2 transition shadow-lg flex items-center gap-2 ${
              showWin5Panel
                ? 'bg-amber-500 text-gray-950 border-yellow-300'
                : 'bg-gradient-to-r from-amber-700 to-yellow-600 text-white border-amber-400 hover:brightness-110'
            }`}
          >
            <span>🏆 WIN5 予想＆点数配分モード</span>
            <span className="bg-black/40 text-yellow-200 px-2 py-0.5 rounded-full text-[11px]">
              {win5Slots.filter(Boolean).length}/5登録済
            </span>
          </button>
        </div>

        {/* 📌 診断済みレース履歴バー（個別削除「✕」＆「🗑️ 全履歴クリア」付き） */}
        {savedRacesHistory.length > 0 && (
          <div className="mb-5 bg-gray-800/90 border border-gray-700 rounded-xl p-3 flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold text-sky-400 mr-1">
                📌 診断済み履歴 (ワンタップ切替):
              </span>
              {savedRacesHistory.map((item) => {
                const rNum = item.raceId.slice(-2);
                const isCurrent = item.raceId === raceId && Boolean(diagnosisResults);
                return (
                  <div
                    key={item.raceId}
                    onClick={() => handleLoadFromHistory(item)}
                    className={`cursor-pointer pl-2.5 pr-1.5 py-1 rounded-lg text-xs font-bold border transition flex items-center gap-1.5 ${
                      isCurrent
                        ? 'bg-indigo-600 text-white border-indigo-400 shadow'
                        : 'bg-gray-900 text-gray-300 border-gray-600 hover:bg-gray-700'
                    }`}
                  >
                    <span>
                      {item.targetPlace}
                      {parseInt(rNum, 10) || rNum}R
                    </span>
                    <span className="truncate max-w-[100px] text-[11px] text-yellow-300">
                      {String(item.targetRaceName || '').replace(/出馬表.*$/, '').trim()}
                    </span>
                    <button
                      type="button"
                      onClick={(e) => handleDeleteHistoryItem(item.raceId, e)}
                      title="この履歴を削除"
                      className="ml-1 w-4 h-4 rounded-full bg-black/40 hover:bg-red-600 text-gray-300 hover:text-white flex items-center justify-center text-[10px] leading-none transition"
                    >
                      ✕
                    </button>
                  </div>
                );
              })}
            </div>
            <button
              type="button"
              onClick={handleClearAllHistory}
              className="text-[11px] font-bold bg-red-950/80 hover:bg-red-700 text-red-200 hover:text-white px-2.5 py-1 rounded-lg border border-red-700/70 transition whitespace-nowrap"
            >
              🗑️ 全履歴クリア
            </button>
          </div>
        )}

        {/* 🏆 WIN5 予想＆点数配分シミュレーター パネル */}
        {showWin5Panel && (
          <div className="bg-gradient-to-b from-gray-800 via-gray-900 to-gray-950 p-4 md:p-6 rounded-2xl shadow-2xl border-2 border-amber-500/80 mb-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 border-b border-gray-700 pb-3 mb-4">
              <div>
                <h2 className="text-lg md:text-2xl font-black text-amber-400 flex items-center gap-2">
                  <span>🏆 WIN5 AIフォーメーション ＆ 予算別点数最適化ボード</span>
                </h2>
                <p className="text-xs text-gray-300 mt-0.5">
                  5つのレースIDを入力して連続解析するか、各レース診断後の「WIN5登録ボタン」で1レースずつセットできます。
                </p>
              </div>
              <div className="flex items-center gap-2">
                {win5Slots.some(Boolean) && (
                  <button
                    type="button"
                    onClick={handleClearAllWin5Slots}
                    className="text-xs bg-red-950/80 hover:bg-red-700 text-red-200 hover:text-white px-3 py-1.5 rounded-lg border border-red-700/70 font-bold transition"
                  >
                    🗑️ WIN5全クリア
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setShowWin5Panel(false)}
                  className="text-xs text-gray-400 hover:text-white bg-gray-800 px-3 py-1.5 rounded-lg border border-gray-600"
                >
                  閉じる ▲
                </button>
              </div>
            </div>

            <div className="bg-gray-950/90 p-3.5 rounded-xl border border-gray-700 mb-4">
              <div className="text-xs font-bold text-amber-300 mb-2">
                🌐 方法A：5つのレースID（12桁）から順番に一括自動解析（タイムアウト防止・直列取得）
              </div>
              <div className="grid grid-cols-2 md:grid-cols-6 gap-2 items-end">
                {[0, 1, 2, 3, 4].map((idx) => (
                  <div key={idx}>
                    <label className="text-[10px] text-gray-400 block mb-1 font-bold">
                      WIN5 第{idx + 1}戦 ID
                    </label>
                    <input
                      type="text"
                      value={win5InputIds[idx]}
                      onChange={(e) => {
                        const next = [...win5InputIds];
                        next[idx] = e.target.value;
                        setWin5InputIds(next);
                      }}
                      placeholder="例: 202608040410"
                      className="w-full bg-gray-900 text-white font-mono text-xs p-2 rounded border border-gray-600 focus:outline-none focus:border-amber-400"
                    />
                  </div>
                ))}
                <button
                  onClick={handleBatchFetchWin5}
                  disabled={win5BatchLoading}
                  className="col-span-2 md:col-span-1 bg-amber-500 hover:bg-amber-400 text-gray-950 font-black py-2 px-3 rounded-lg text-xs shadow-md transition disabled:opacity-50"
                >
                  {win5BatchLoading ? '順次解析中...' : '🚀 5レース連続解析'}
                </button>
              </div>
              {win5BatchProgressText && (
                <div className="mt-2.5 text-xs font-bold text-sky-300 bg-sky-950/60 border border-sky-600/60 px-3 py-1.5 rounded-lg">
                  {win5BatchProgressText}
                </div>
              )}
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 bg-gray-900 p-3 rounded-xl border border-amber-600/40 mb-4">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-extrabold text-amber-300">
                  🎯 目標点数（AI自動メリハリ配分）:
                </span>
                {[12, 24, 36, 48, 72, 96].map((pts) => (
                  <button
                    key={pts}
                    onClick={() => handleApplyWin5TargetPoints(pts)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-black border transition ${
                      win5TargetPoints === pts
                        ? 'bg-amber-400 text-gray-950 border-white shadow'
                        : 'bg-gray-800 text-gray-300 border-gray-600 hover:bg-gray-700'
                    }`}
                  >
                    上限{pts}点 ({(pts * 100).toLocaleString()}円)
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-3 bg-black/60 px-3.5 py-1.5 rounded-lg border border-amber-500/70">
                <span className="text-xs text-gray-300 font-bold">現在の選択点数:</span>
                <span className="text-base md:text-lg font-mono font-black text-yellow-400">
                  {totalWin5Combos} 点 ({(totalWin5Combos * 100).toLocaleString()}円)
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-5 gap-3 mb-4">
              {[0, 1, 2, 3, 4].map((idx) => {
                const slot = win5Slots[idx];
                const slotCands = Array.isArray(slot?.win5Profile?.candidates)
                  ? slot!.win5Profile.candidates
                  : [];
                return (
                  <div
                    key={idx}
                    className="bg-gray-900 border border-gray-700 rounded-xl p-3 flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex justify-between items-center border-b border-gray-800 pb-1.5 mb-2">
                        <span className="text-xs font-black text-amber-400">
                          WIN5 第{idx + 1}戦
                        </span>
                        {slot && (
                          <div className="flex items-center gap-1">
                            <span className="text-[10px] bg-gray-800 text-white px-2 py-0.5 rounded font-bold">
                              選択 {(slot.selectedUmabans || []).length}頭
                            </span>
                            <button
                              type="button"
                              onClick={() => handleClearSingleWin5Slot(idx)}
                              title="このスロットをクリア"
                              className="w-4 h-4 rounded-full bg-gray-800 hover:bg-red-600 text-gray-400 hover:text-white flex items-center justify-center text-[10px]"
                            >
                              ✕
                            </button>
                          </div>
                        )}
                      </div>

                      {!slot ? (
                        <div className="py-8 text-center text-xs text-gray-500">
                          未登録
                          <span className="block text-[10px] mt-1">
                            （上の連続解析、または個別診断後に登録）
                          </span>
                        </div>
                      ) : (
                        <>
                          <div className="mb-2">
                            <div className="text-xs font-extrabold text-white truncate">
                              {slot.placeName}
                              {slot.raceNumLabel}{' '}
                              {String(slot.raceName || '').replace(/出馬表.*$/, '').trim()}
                            </div>
                            <div className="text-[10px] text-gray-400">
                              {slot.courseType}
                              {slot.distance}m ／ 1-2位差 +{slot.win5Profile.shisu_gap}pt
                            </div>
                            <span
                              className={`inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-black border ${
                                slot.win5Profile.difficulty === 'BANKER'
                                  ? 'bg-emerald-950 text-emerald-300 border-emerald-500'
                                  : slot.win5Profile.difficulty === 'CHAOS'
                                    ? 'bg-red-950 text-red-200 border-red-500'
                                    : 'bg-blue-950 text-blue-200 border-blue-500'
                              }`}
                            >
                              {slot.win5Profile.badge_label}
                            </span>
                          </div>

                          <div className="space-y-1.5 mt-2">
                            {slotCands.map((cand) => {
                              const isSel = (slot.selectedUmabans || []).includes(cand.umaban);
                              return (
                                <button
                                  key={cand.umaban}
                                  onClick={() => handleToggleWin5Horse(idx, cand.umaban)}
                                  className={`w-full text-left p-1.5 rounded-lg border text-xs transition flex flex-col gap-0.5 ${
                                    isSel
                                      ? 'bg-amber-950/70 border-amber-400 text-white shadow'
                                      : 'bg-gray-950/60 border-gray-800 text-gray-400 opacity-65 hover:opacity-100'
                                  }`}
                                >
                                  <div className="flex items-center justify-between gap-1">
                                    <div className="flex items-center gap-1 min-w-0">
                                      <span
                                        className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0 ${getHorseColor(cand.umaban)}`}
                                      >
                                        {cand.umaban}
                                      </span>
                                      <span className="font-bold truncate">{cand.bamei}</span>
                                    </div>
                                    <span className="font-mono text-[10px] text-yellow-300 flex-shrink-0">
                                      {cand.shisu}
                                    </span>
                                  </div>
                                  <div className="flex items-center justify-between text-[9px] text-gray-300 pl-5">
                                    <span>
                                      地力{cand.stage1_rank}位 / {cand.odds}倍
                                    </span>
                                    {isSel && (
                                      <span className="text-amber-300 font-black">✔ 選択中</span>
                                    )}
                                  </div>
                                </button>
                              );
                            })}
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {win5Slots.some(Boolean) && (
              <div className="bg-gray-950 border border-amber-500/50 rounded-xl p-3.5 flex flex-col md:flex-row gap-3 items-stretch">
                <textarea
                  value={win5PostText}
                  onChange={(e) => setWin5PostText(e.target.value)}
                  rows={7}
                  className="flex-grow bg-gray-900 text-gray-100 font-mono text-xs p-2.5 rounded-lg border border-gray-700 focus:outline-none"
                />
                <div className="flex flex-col justify-between gap-2 md:w-52">
                  <button
                    onClick={handleShareWin5ToX}
                    className="w-full flex-grow bg-black hover:bg-gray-900 text-white font-extrabold py-2.5 px-4 rounded-lg border-2 border-amber-400 shadow flex items-center justify-center gap-2 text-xs transition"
                  >
                    <span className="text-base">𝕏</span> WIN5予想をポスト
                  </button>
                  <button
                    onClick={handleCopyWin5Post}
                    className="w-full bg-slate-700 hover:bg-slate-600 text-white font-bold py-2 px-3 rounded-lg text-xs transition"
                  >
                    {win5CopiedFlag ? '✅ コピー完了！' : '📋 WIN5文面をコピー'}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* STEP 1 */}
        <div className="bg-gray-800 p-4 md:p-6 rounded-xl shadow-lg border border-gray-700 mb-6 flex flex-col md:flex-row gap-4 items-end">
          <div className="flex-grow w-full">
            <label className="text-sm text-gray-400 block mb-2 font-bold">
              STEP 1: 🌐 レースIDから出馬表・過去5走履歴・距離/回り/起伏/前走巻き返し印を全自動取得
            </label>
            <input
              type="text"
              value={raceId}
              onChange={(e) => setRaceId(e.target.value)}
              className="w-full bg-gray-900 text-white rounded-lg p-3 md:p-4 focus:outline-none focus:ring-2 focus:ring-blue-500 border border-gray-600 font-mono text-lg"
              placeholder="例: 202605041111"
            />
          </div>
          <button
            onClick={handleFetchRace}
            disabled={fetching}
            className="w-full md:w-auto bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 md:py-4 px-8 rounded-lg shadow-lg transition whitespace-nowrap disabled:opacity-50"
          >
            {fetching ? '5走柱＆コース解析中...' : '出馬表を取り込む ↓'}
          </button>
        </div>

        {/* STEP 2 */}
        <div className="bg-gray-800 p-4 md:p-6 rounded-xl shadow-lg border border-gray-700 mb-6">
          <h2 className="text-lg md:text-xl font-semibold mb-4 text-gray-300">
            STEP 2: コース形状・前年/今年度タイム基準 ＆ 追切時計・2段階全頭診断
          </h2>

          {targetRaceName && (
            <div className="mb-4 p-4 md:p-5 bg-gray-900 border border-yellow-600/50 rounded-lg shadow-inner flex flex-col gap-3">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
                <div className="flex flex-col">
                  <span className="text-yellow-500 font-bold text-xs mb-1 tracking-wider">
                    TARGET RACE & COURSE PROFILE
                  </span>
                  <h3 className="text-xl md:text-2xl font-extrabold text-white leading-tight">
                    {targetRaceName}
                  </h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  <span className="inline-block bg-green-800 text-green-100 font-bold px-3 py-1.5 rounded-full text-xs border border-green-600 shadow-sm whitespace-nowrap">
                    📍 {activeVenueKey}競馬場 / {courseType}
                    {distance}m ({effectiveDir === 'LEFT' ? '左回り↺' : '右回り↻'})
                  </span>
                  <span className="inline-block bg-sky-900/80 text-sky-200 font-bold px-3 py-1.5 rounded-full text-xs border border-sky-600 shadow-sm whitespace-nowrap">
                    🚪 {startConfig.startLabel}
                  </span>
                  <span className="inline-block bg-amber-900/70 text-amber-200 font-bold px-3 py-1.5 rounded-full text-xs border border-amber-600 shadow-sm whitespace-nowrap">
                    ⛰️ 高低差 {venueProfile.elevationDiff}m / 直線 {venueProfile.straightMeter}m
                  </span>
                  {courseRpci !== null && (
                    <span
                      className={`inline-block font-bold px-3 py-1.5 rounded-full text-xs border shadow-sm whitespace-nowrap ${getPciBadgeStyle(courseRpciType)}`}
                    >
                      ⏱️ 舞台RPCI: {courseRpci} (傾向{courseRpciType})
                    </span>
                  )}
                </div>
              </div>
              <div className="text-xs text-gray-300 bg-gray-950/80 px-3 py-2 rounded-lg border border-gray-800">
                <span className="text-amber-400 font-bold mr-2">
                  【コース起伏特徴：{venueProfile.slopeTitle}】
                </span>
                {venueProfile.featureText}
                {courseRailMessage && (
                  <span className="block mt-1 text-emerald-300 font-bold">{courseRailMessage}</span>
                )}
              </div>
            </div>
          )}

          {referenceBenchmarks && (
            <div className="mb-5 space-y-3">
              {referenceBenchmarks.current_year &&
                renderSingleBenchmarkCard(referenceBenchmarks.current_year, true)}
              {referenceBenchmarks.prev_year &&
                renderSingleBenchmarkCard(referenceBenchmarks.prev_year, false)}
            </div>
          )}

          {autoStatus && (
            <div className="mb-6 grid grid-cols-1 gap-2 bg-gray-950 p-3.5 rounded-xl border border-gray-700 text-xs">
              {autoStatus.odds_message && (
                <div
                  className={`p-2.5 rounded-lg border font-bold ${
                    autoStatus.odds_status === 'manual_required'
                      ? 'bg-amber-950/70 border-amber-500/80 text-amber-200'
                      : 'bg-yellow-950/60 border-yellow-600/70 text-yellow-200'
                  }`}
                >
                  {autoStatus.odds_message}
                </div>
              )}
              <div
                className={`p-2.5 rounded-lg border font-bold ${
                  autoStatus.bias_status === 'auto_detected'
                    ? 'bg-emerald-950/60 border-emerald-600/60 text-emerald-200'
                    : 'bg-amber-950/70 border-amber-500/80 text-amber-200'
                }`}
              >
                {autoStatus.bias_message}
              </div>
              <div className="p-2.5 rounded-lg border bg-blue-950/50 border-blue-700/60 text-blue-200 font-bold">
                {autoStatus.pace_message}
              </div>
              <div
                className={`p-2.5 rounded-lg border font-bold ${
                  autoStatus.weight_status === 'auto_detected'
                    ? 'bg-purple-950/50 border-purple-700/60 text-purple-200'
                    : 'bg-gray-900 border-gray-600 text-gray-300'
                }`}
              >
                {autoStatus.weight_message}
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 md:grid-cols-6 gap-3 md:gap-4 mb-4">
            <div>
              <label className="text-[10px] md:text-xs text-gray-400 block mb-1">
                競馬場 (主要5場)
              </label>
              <select
                value={activeVenueKey}
                onChange={(e) => setTargetPlace(e.target.value)}
                className="w-full bg-gray-900 text-white rounded p-2 border border-gray-600 focus:outline-none focus:ring-1 focus:ring-green-500 text-sm md:text-base"
              >
                {Object.keys(VENUE_PROFILES).map((v) => (
                  <option key={v} value={v}>
                    {v} ({VENUE_PROFILES[v].dir === 'LEFT' ? '左回り' : '右回り'})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-[10px] md:text-xs text-gray-400 block mb-1">コース</label>
              <select
                value={courseType}
                onChange={(e) => setCourseType(e.target.value)}
                className="w-full bg-gray-900 text-white rounded p-2 border border-gray-600 focus:outline-none focus:ring-1 focus:ring-green-500 text-sm md:text-base"
              >
                <option value="芝">芝</option>
                <option value="ダ">ダート</option>
                <option value="障">障害</option>
              </select>
            </div>
            <div>
              <label className="text-[10px] md:text-xs text-gray-400 block mb-1">距離 (m)</label>
              <input
                type="number"
                step="100"
                value={distance}
                onChange={(e) => setDistance(Number(e.target.value))}
                className="w-full bg-gray-900 text-white rounded p-2 border border-gray-600 focus:outline-none focus:ring-1 focus:ring-green-500 text-sm md:text-base"
              />
            </div>
            <div>
              <label className="text-[10px] md:text-xs text-gray-400 block mb-1">天候</label>
              <select
                value={weather}
                onChange={(e) => setWeather(e.target.value)}
                className="w-full bg-gray-900 text-white rounded p-2 border border-gray-600 focus:outline-none focus:ring-1 focus:ring-green-500 text-sm md:text-base"
              >
                <option value="晴">晴</option>
                <option value="曇">曇</option>
                <option value="雨">雨</option>
                <option value="小雨">小雨</option>
              </select>
            </div>
            <div>
              <label className="text-[10px] md:text-xs text-gray-400 block mb-1">馬場状態</label>
              <select
                value={trackCondition}
                onChange={(e) => {
                  const val = e.target.value;
                  setTrackCondition(val);
                  if (courseType === '芝' && ['稍', '重', '不'].includes(val) && cushionValue >= 9.2) {
                    setCushionValue(8.6);
                  }
                }}
                className="w-full bg-gray-900 text-white rounded p-2 border border-gray-600 focus:outline-none focus:ring-1 focus:ring-green-500 text-sm md:text-base"
              >
                <option value="良">良</option>
                <option value="稍">稍重</option>
                <option value="重">重</option>
                <option value="不">不良</option>
              </select>
            </div>
            <div>
              <label className="text-[10px] md:text-xs text-emerald-400 font-bold block mb-1">
                クッション値
              </label>
              <input
                type="number"
                step="0.1"
                value={cushionValue}
                onChange={(e) => setCushionValue(Number(e.target.value))}
                className="w-full bg-emerald-950 text-white font-bold rounded p-2 border border-emerald-600 focus:outline-none focus:ring-1 focus:ring-emerald-500 text-sm md:text-base"
                placeholder="例: 9.5"
              />
            </div>
          </div>

          <div className="bg-gray-900 p-3 md:p-5 rounded-xl border border-gray-700 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4 mb-4">
              <div>
                <label className="text-xs md:text-sm text-blue-400 font-bold block mb-1">
                  予想ペース・詳細展開シナリオ (自動判定・手動変更可)
                </label>
                <select
                  value={expectedPace}
                  onChange={(e) => setExpectedPace(e.target.value)}
                  className="w-full bg-blue-950 text-white font-bold rounded p-2.5 border border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-400 text-xs md:text-sm"
                >
                  <optgroup label="▼ スローペース (道中遅い・瞬発力/持続力)">
                    <option value="S_YOIDON">
                      スロー ① 直線ヨーイドン (残り400mキレ味勝負)
                    </option>
                    <option value="S_LONSPA">
                      スロー ② ロンスパ・マクリ (向正面〜3角早め仕掛け)
                    </option>
                  </optgroup>
                  <optgroup label="▼ ミドルペース (平均的・実力/持続戦)">
                    <option value="M_JIRIKI">
                      ミドル ① 地力・総合力勝負 (好位抜け出し王道戦)
                    </option>
                    <option value="M_LONSPA">ミドル ② ロンスパ戦 (タフな消耗持続戦)</option>
                  </optgroup>
                  <optgroup label="▼ ハイペース (道中速い・消耗戦)">
                    <option value="H_MAEKUZURE">
                      ハイペース ① 前崩れのバテ合い消耗戦 (後方追込台頭)
                    </option>
                  </optgroup>
                </select>
              </div>
              <div className="flex gap-2">
                <div className="flex-grow">
                  <label className="text-xs md:text-sm text-pink-400 font-bold block mb-1">
                    トラックバイアス (自動判定・手動変更可)
                  </label>
                  <select
                    value={trackBias}
                    onChange={(e) => setTrackBias(e.target.value)}
                    className="w-full bg-pink-950 text-white font-bold rounded p-2.5 border border-pink-600 focus:outline-none focus:ring-2 focus:ring-pink-500 text-xs md:text-sm"
                  >
                    <option value="フラット">フラット (標準)</option>
                    <option value="イン前有利 (1〜4枠・先行)">イン前有利 (1〜4枠・先行好位)</option>
                    <option value="外差し有利 (5〜8枠・差し追込)">外差し有利 (5〜8枠・差し追込)</option>
                    <option value="前残り (逃げ・先行有利)">前残り (逃げ・先行有利)</option>
                    <option value="差し有利 (外伸び)">差し有利 (外伸び)</option>
                    <option value="内枠有利 (インベタ)">内枠有利 (1〜4枠)</option>
                    <option value="外枠有利">外枠有利 (5〜8枠)</option>
                  </select>
                </div>
                <div className="w-24">
                  <label className="text-xs md:text-sm text-pink-300 font-bold block mb-1">
                    強度
                  </label>
                  <select
                    value={biasStrength}
                    onChange={(e) => setBiasStrength(e.target.value)}
                    disabled={trackBias === 'フラット'}
                    className="w-full bg-pink-900/50 text-white font-bold rounded p-2.5 border border-pink-700 focus:outline-none focus:ring-2 focus:ring-pink-500 text-xs md:text-sm disabled:opacity-50"
                  >
                    <option value="弱">レベル1 (弱)</option>
                    <option value="中">レベル2 (中)</option>
                    <option value="極端">レベル3 (極端)</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="bg-gray-950/90 border border-gray-800 rounded-xl p-3 md:p-4">
              <div className="flex flex-wrap items-center gap-2 border-b border-gray-800 pb-2.5 mb-3">
                <span className="bg-blue-900/80 text-blue-200 border border-blue-600/60 text-[10px] md:text-xs font-bold px-2.5 py-0.5 rounded-full">
                  {currentScenario.category}
                </span>
                <span className="text-sm md:text-base font-extrabold text-white">
                  {currentScenario.headline}
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 md:gap-3 text-xs">
                <div className="bg-gray-900/90 p-2.5 md:p-3 rounded-lg border border-gray-800/80">
                  <div className="text-[10px] text-gray-400 font-bold mb-1">発生しやすい展開</div>
                  <div className="text-gray-100 font-bold leading-snug">{currentScenario.flow}</div>
                </div>
                <div className="bg-gray-900/90 p-2.5 md:p-3 rounded-lg border border-gray-800/80">
                  <div className="text-[10px] text-gray-400 font-bold mb-1">
                    最も有利な脚質・適性
                  </div>
                  <div className="text-sky-400 font-bold leading-snug">
                    {currentScenario.advantage}
                  </div>
                </div>
                <div className="bg-gray-900/90 p-2.5 md:p-3 rounded-lg border border-gray-800/80">
                  <div className="text-[10px] text-gray-400 font-bold mb-1">レース展開の特徴</div>
                  <div className="text-gray-300 text-[11px] leading-relaxed">
                    {currentScenario.feature}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid gap-3 md:gap-4">
            {(horses || []).map((horse, index) => (
              <div
                key={index}
                className="bg-gray-900 p-3 md:p-4 rounded-lg border border-gray-700 flex flex-col gap-2"
              >
                <div className="flex gap-2 md:gap-3 items-center flex-wrap md:flex-nowrap">
                  <div
                    className={`w-7 h-7 md:w-8 md:h-8 flex items-center justify-center font-bold text-sm md:text-base rounded-full shadow-md flex-shrink-0 ${getHorseColor(horse.wakuban || horse.umaban)}`}
                    title={`枠番: ${horse.wakuban} / 馬番: ${horse.umaban}`}
                  >
                    {horse.umaban}
                  </div>
                  <div className="flex-grow flex flex-col gap-1.5 w-full">
                    <div className="flex flex-wrap gap-1.5 items-center">
                      <input
                        type="text"
                        value={horse.bamei}
                        onChange={(e) => handleChange(index, 'bamei', e.target.value)}
                        placeholder="馬名"
                        className="w-[38%] md:w-32 bg-gray-700 text-white font-bold rounded p-1.5 text-xs md:text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                      <input
                        type="text"
                        value={horse.kishu}
                        onChange={(e) => handleChange(index, 'kishu', e.target.value)}
                        placeholder="騎手"
                        className="w-[24%] md:w-20 bg-gray-700 text-blue-200 font-bold rounded p-1.5 text-xs md:text-sm border border-blue-800/50 focus:outline-none"
                      />
                      <div className="w-[24%] md:w-20 relative">
                        <input
                          type="number"
                          step="0.1"
                          value={horse.odds || ''}
                          onChange={(e) => handleChange(index, 'odds', e.target.value)}
                          placeholder="オッズ"
                          className="w-full bg-gray-700 text-yellow-300 font-bold rounded p-1.5 pr-4 text-xs md:text-sm border border-yellow-800/50 text-right focus:outline-none"
                        />
                        <span className="absolute right-1 top-1.5 text-[9px] md:text-[10px] text-yellow-500">
                          倍
                        </span>
                      </div>
                      <select
                        value={horse.kyakushitsu}
                        onChange={(e) => handleChange(index, 'kyakushitsu', e.target.value)}
                        className="w-[22%] md:w-16 bg-purple-900 text-purple-200 text-[10px] md:text-xs font-bold rounded p-1.5 border border-purple-700 focus:outline-none"
                      >
                        <option value="1">逃げ</option>
                        <option value="2">先行</option>
                        <option value="3">差し</option>
                        <option value="4">追込</option>
                      </select>

                      <div className="flex items-center gap-1 bg-gray-800 rounded px-1.5 py-1 border border-gray-600">
                        <span className="text-[9px] text-gray-400">馬体重</span>
                        <input
                          type="number"
                          value={horse.bataijuu}
                          onChange={(e) => handleChange(index, 'bataijuu', e.target.value)}
                          className="w-10 bg-transparent text-white font-bold text-xs text-right focus:outline-none"
                        />
                        <span className="text-[10px] text-gray-500">(</span>
                        <input
                          type="number"
                          value={horse.weight_change}
                          onChange={(e) => handleChange(index, 'weight_change', e.target.value)}
                          className={`w-7 bg-transparent font-bold text-xs text-center focus:outline-none ${horse.weight_change > 0 ? 'text-red-400' : horse.weight_change < 0 ? 'text-blue-400' : 'text-gray-300'}`}
                        />
                        <span className="text-[10px] text-gray-500">)</span>
                      </div>

                      <div
                        className="flex items-center gap-1 bg-gray-950 rounded px-1.5 py-1 border border-amber-700/60"
                        title="追切の4F時計(例:51.2)と1F時計(例:11.3)を入力すると自動でS/A/B/Cランクを判定します"
                      >
                        <span className="text-[9px] text-amber-400 font-bold">追切時計</span>
                        <input
                          type="number"
                          step="0.1"
                          value={horse.training_4f || ''}
                          onChange={(e) => handleChange(index, 'training_4f', e.target.value)}
                          placeholder="4F"
                          className="w-10 bg-gray-800 text-amber-200 font-mono text-[11px] text-center rounded px-1 py-0.5 focus:outline-none"
                        />
                        <span className="text-[9px] text-gray-500">-</span>
                        <input
                          type="number"
                          step="0.1"
                          value={horse.training_1f || ''}
                          onChange={(e) => handleChange(index, 'training_1f', e.target.value)}
                          placeholder="1F"
                          className="w-10 bg-gray-800 text-amber-200 font-mono text-[11px] text-center rounded px-1 py-0.5 focus:outline-none"
                        />
                      </div>

                      <select
                        value={horse.training_rank || 'B'}
                        onChange={(e) => handleChange(index, 'training_rank', e.target.value)}
                        className={`w-[34%] md:w-28 text-[10px] md:text-xs font-bold rounded p-1.5 border focus:outline-none ${
                          horse.training_rank === 'S'
                            ? 'bg-amber-900/70 text-yellow-300 border-yellow-500'
                            : horse.training_rank === 'A'
                              ? 'bg-emerald-900/60 text-emerald-200 border-emerald-500'
                              : horse.training_rank === 'C'
                                ? 'bg-red-950 text-red-300 border-red-600'
                                : 'bg-gray-800 text-gray-300 border-gray-600'
                        }`}
                      >
                        <option value="S">🔥 追切S:抜群 (1.05倍)</option>
                        <option value="A">✨ 追切A:好調 (1.03倍)</option>
                        <option value="B">ー 追切B:標準 (1.00倍)</option>
                        <option value="C">⚠️ 追切C:割引 (0.92倍)</option>
                      </select>

                      <select
                        value={horse.condition_override}
                        onChange={(e) => handleChange(index, 'condition_override', e.target.value)}
                        className={`w-[36%] md:w-28 text-[10px] md:text-xs font-bold rounded p-1.5 border focus:outline-none ${horse.condition_override === '1.00' ? 'bg-gray-800 text-gray-400 border-gray-700' : Number(horse.condition_override) > 1.0 ? 'bg-green-900/50 text-green-300 border-green-600' : 'bg-red-900/50 text-red-300 border-red-600'}`}
                      >
                        <option value="1.04">↑ 好仕上 (1.04倍)</option>
                        <option value="1.03">↑ 充実/絞込 (1.03倍)</option>
                        <option value="1.02">↑ 成長分 (1.02倍)</option>
                        <option value="1.00">- 馬体標準 (1.00倍)</option>
                        <option value="0.97">↓ 微減点 (0.97倍)</option>
                        <option value="0.95">↓ 太め注意 (0.95倍)</option>
                        <option value="0.94">↓ 細化注意 (0.94倍)</option>
                        <option value="0.88">↓ 極端減点 (0.88倍)</option>
                      </select>
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-2 pl-1">
                      {horse.condition_reason && (
                        <div className="text-[10px] text-gray-400">
                          💡 自動解析:{' '}
                          <span
                            className={`font-bold ${
                              horse.condition_reason.includes('🚨')
                                ? 'text-red-300'
                                : horse.condition_reason.includes('⚠️')
                                  ? 'text-amber-300'
                                  : 'text-gray-200'
                            }`}
                          >
                            {horse.condition_reason}
                          </span>
                        </div>
                      )}

                      {Array.isArray(horse.history_details) && horse.history_details.length > 0 && (
                        <details className="w-full mt-1">
                          <summary className="text-[10px] text-sky-400 hover:text-sky-300 cursor-pointer font-bold select-none">
                            📋 過去5走履歴（レース名・距離・着順・タイム・上り3F・走行順位）を表示
                          </summary>
                          <div className="mt-1.5 overflow-x-auto bg-gray-950/90 p-2 rounded border border-gray-800">
                            <table className="w-full text-[10px] md:text-[11px] text-left border-collapse min-w-[420px]">
                              <thead>
                                <tr className="border-b border-gray-800 text-gray-400">
                                  <th className="py-1 pr-2">レース名</th>
                                  <th className="py-1 pr-2">距離・馬場</th>
                                  <th className="py-1 pr-2 text-center">着順</th>
                                  <th className="py-1 pr-2 font-mono">タイム</th>
                                  <th className="py-1 pr-2 font-mono">上り3F</th>
                                  <th className="py-1 pr-2 font-mono">走行順位</th>
                                  <th className="py-1 font-mono text-right">PCI</th>
                                </tr>
                              </thead>
                              <tbody>
                                {horse.history_details.map((h, i) => (
                                  <tr
                                    key={i}
                                    className="border-b border-gray-800/50 last:border-0 text-gray-200"
                                  >
                                    <td className="py-1 pr-2 font-bold truncate max-w-[140px]">
                                      {h.race_name}
                                    </td>
                                    <td className="py-1 pr-2 text-gray-300 whitespace-nowrap">
                                      {h.distance || '-'}
                                    </td>
                                    <td
                                      className={`py-1 pr-2 text-center whitespace-nowrap ${getRankTextStyle(h.rank)}`}
                                    >
                                      {h.rank}
                                    </td>
                                    <td className="py-1 pr-2 font-mono whitespace-nowrap">
                                      {h.time}
                                    </td>
                                    <td className="py-1 pr-2 font-mono text-sky-300 font-bold whitespace-nowrap">
                                      {h.up}
                                    </td>
                                    <td className="py-1 pr-2 font-mono text-gray-300 whitespace-nowrap">
                                      {h.passing}
                                    </td>
                                    <td className="py-1 font-mono text-right text-gray-400 whitespace-nowrap">
                                      {h.pci || '-'}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </details>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-6">
            <button
              onClick={() => runDiagnosisWithMode('STAGE1')}
              disabled={isDiagnosing || horses.length < 2}
              className="w-full bg-slate-700 hover:bg-slate-600 text-white font-bold py-3 md:py-4 px-4 rounded-lg shadow-lg border border-slate-500 text-xs md:text-sm transition duration-200 disabled:opacity-50"
            >
              {isDiagnosing
                ? '分析中...'
                : '🔍 第1段階：枠・バイアス・体重抜きの『素の地力＋血統距離診断 (Stage 1)』'}
            </button>
            <button
              onClick={() => runDiagnosisWithMode('STAGE2')}
              disabled={isDiagnosing || horses.length < 2}
              className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 md:py-4 px-4 rounded-lg shadow-lg text-xs md:text-base transition duration-200 disabled:opacity-50"
            >
              {isDiagnosing
                ? '分析中...'
                : '📊 第2段階：距離/回り/起伏/巻き返し/道悪を加味して最終診断 ＆ 資金配分出力！'}
            </button>
          </div>
        </div>

        {/* STEP 3: 診断結果 ＆ 推奨馬券パネル */}
        {displayedDiagnosis && raceInfo && (
          <div className="bg-gray-800 p-4 md:p-6 rounded-xl shadow-lg border border-gray-700 mb-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 mb-4">
              <h2 className="text-xl md:text-2xl font-bold text-indigo-400">
                STEP 3: 📊 2段階AI全頭診断 ＆ 合成オッズ・予算配分付き4パターン買い目
              </h2>
              <div className="flex gap-2 bg-gray-900 p-1 rounded-lg border border-gray-700">
                <button
                  onClick={() => setActiveStageView('STAGE1')}
                  className={`px-3 py-1.5 rounded text-xs font-bold transition ${
                    activeStageView === 'STAGE1'
                      ? 'bg-slate-600 text-white shadow'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  ① 素の地力順 (Stage 1)
                </button>
                <button
                  onClick={() => setActiveStageView('STAGE2')}
                  className={`px-3 py-1.5 rounded text-xs font-bold transition ${
                    activeStageView === 'STAGE2'
                      ? 'bg-indigo-600 text-white shadow'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  ② 展開・適性・道悪加味順 (Stage 2)
                </button>
              </div>
            </div>

            {/* 🏆 この診断結果をWIN5スロットへワンタップ登録するバー */}
            <div className="mb-4 bg-gradient-to-r from-amber-950/70 via-gray-900 to-amber-950/70 border border-amber-500/70 rounded-xl p-3 flex flex-wrap items-center justify-between gap-2">
              <span className="text-xs font-extrabold text-amber-300">
                🏆 このレースの診断結果を『WIN5ボード』に登録する:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {[0, 1, 2, 3, 4].map((idx) => (
                  <button
                    key={idx}
                    onClick={() => handleRegisterCurrentToWin5(idx)}
                    className="bg-amber-500 hover:bg-amber-400 text-gray-950 font-black px-3 py-1 rounded-lg text-xs shadow transition"
                  >
                    WIN5 第{idx + 1}戦に登録
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-col md:flex-row justify-center items-center gap-2 md:gap-5 text-xs md:text-sm font-bold text-red-400 mb-4 bg-gray-900 p-3 md:p-4 rounded-lg border border-gray-700">
              <p className="text-blue-300">【{currentScenario.shortTitle}】</p>
              <p>
                クッション値: <span className="text-emerald-400">{cushionValue}</span>
              </p>
              {raceInfo.rpci && (
                <p>
                  舞台RPCI:{' '}
                  <span className="text-yellow-300 bg-yellow-900/30 px-2 py-0.5 rounded border border-yellow-700/50">
                    {raceInfo.rpci} ({raceInfo.rpci_type})
                  </span>
                </p>
              )}
              <p>
                馬場:{' '}
                <span className="text-pink-400 bg-pink-900/30 px-2 py-0.5 rounded border border-pink-700/50">
                  {trackBias} (強度:{biasStrength})
                </span>
              </p>
              <p>
                要求上り:{' '}
                <span className="text-lg md:text-xl text-yellow-400">{raceInfo.req_up}秒</span>
              </p>
            </div>

            {referenceBenchmarks && (
              <div className="mb-6 space-y-2.5">
                {referenceBenchmarks.current_year &&
                  renderSingleBenchmarkCard(referenceBenchmarks.current_year, true)}
                {referenceBenchmarks.prev_year &&
                  renderSingleBenchmarkCard(referenceBenchmarks.prev_year, false)}
              </div>
            )}

            {/* 🎫 推奨馬券パネル */}
            {bettingTickets && (
              <div className="mb-8 bg-gray-950 border-2 border-indigo-500/70 rounded-xl p-4 md:p-6 shadow-xl">
                <h3 className="text-base md:text-lg font-extrabold text-yellow-400 mb-4 flex items-center gap-2 border-b border-gray-800 pb-2">
                  🎯 2段階指数ロジックによる自動構築フォーメーション ＆ 資金配分シミュレーター
                </h3>

                {marksSummary && (
                  <div className="mb-6 bg-gray-900 border border-sky-500/60 rounded-xl p-4 shadow-lg">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-2 border-b border-gray-800 pb-2.5 mb-3">
                      <span className="text-sm md:text-base font-extrabold text-sky-400">
                        📌 AI決定印（◎本命 / 〇対抗 / ▲単穴 / ☆妙味特注 / △連下）＆ 𝕏ポスト出力
                      </span>
                      <span className="text-[11px] text-gray-400">
                        ※会場名・レース番号＋印・馬番・馬名のシンプル仕様（枠内で直接編集も可能です）
                      </span>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-5 gap-2 mb-4 text-xs">
                      {marksSummary.honmei && (
                        <div className="bg-red-950/50 border border-red-500/70 rounded-lg p-2.5">
                          <span className="inline-block bg-red-600 text-yellow-200 font-black px-1.5 py-0.5 rounded text-xs mr-1.5">
                            ◎ 本命
                          </span>
                          <span className="font-extrabold text-white">
                            {marksSummary.honmei.umaban}番 {marksSummary.honmei.bamei}
                          </span>
                        </div>
                      )}
                      {marksSummary.taikou && (
                        <div className="bg-blue-950/50 border border-blue-500/70 rounded-lg p-2.5">
                          <span className="inline-block bg-blue-600 text-white font-black px-1.5 py-0.5 rounded text-xs mr-1.5">
                            〇 対抗
                          </span>
                          <span className="font-extrabold text-white">
                            {marksSummary.taikou.umaban}番 {marksSummary.taikou.bamei}
                          </span>
                        </div>
                      )}
                      {marksSummary.tanana && (
                        <div className="bg-emerald-950/50 border border-emerald-500/70 rounded-lg p-2.5">
                          <span className="inline-block bg-emerald-600 text-white font-black px-1.5 py-0.5 rounded text-xs mr-1.5">
                            ▲ 単穴
                          </span>
                          <span className="font-extrabold text-white">
                            {marksSummary.tanana.umaban}番 {marksSummary.tanana.bamei}
                          </span>
                        </div>
                      )}
                      {marksSummary.tokuchu && (
                        <div className="bg-pink-950/50 border border-pink-500/70 rounded-lg p-2.5">
                          <span className="inline-block bg-pink-600 text-yellow-200 font-black px-1.5 py-0.5 rounded text-xs mr-1.5">
                            ☆ 特注
                          </span>
                          <span className="font-extrabold text-white">
                            {marksSummary.tokuchu.umaban}番 {marksSummary.tokuchu.bamei}
                          </span>
                        </div>
                      )}
                      {(marksSummary.renshita || []).length > 0 && (
                        <div className="col-span-2 md:col-span-1 bg-gray-800/80 border border-gray-600 rounded-lg p-2.5">
                          <span className="inline-block bg-gray-600 text-white font-bold px-1.5 py-0.5 rounded text-xs mr-1.5">
                            △ 連下
                          </span>
                          <span className="font-bold text-gray-200">
                            {(marksSummary.renshita || []).map((r) => `${r.umaban}番`).join(', ')}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col md:flex-row gap-3 items-stretch">
                      <textarea
                        value={xPostText}
                        onChange={(e) => setXPostText(e.target.value)}
                        rows={8}
                        className="flex-grow bg-gray-950 text-gray-100 font-mono text-xs p-3 rounded-lg border border-gray-700 focus:outline-none focus:ring-2 focus:ring-sky-500 leading-relaxed"
                      />
                      <div className="flex flex-col justify-between gap-2 md:w-56">
                        <button
                          onClick={handleShareToX}
                          className="w-full flex-grow bg-black hover:bg-gray-900 text-white font-extrabold py-3 px-4 rounded-lg border-2 border-gray-500 shadow-lg flex items-center justify-center gap-2 transition text-sm"
                        >
                          <span className="text-lg">𝕏</span> で予想をポストする
                        </button>
                        <button
                          onClick={handleCopyPostText}
                          className="w-full bg-slate-700 hover:bg-slate-600 text-white font-bold py-2.5 px-4 rounded-lg border border-slate-500 text-xs transition"
                        >
                          {copiedFlag ? '✅ コピーしました！' : '📋 ポスト文面をコピー'}
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {axisDefensePlan && (
                  <div
                    className={`mb-5 p-3.5 md:p-4 rounded-xl border-2 ${
                      axisDefensePlan.level === 'RISK'
                        ? 'bg-red-950/60 border-red-500 text-red-100'
                        : axisDefensePlan.level === 'MEDIUM'
                          ? 'bg-amber-950/50 border-amber-500/80 text-amber-100'
                          : 'bg-emerald-950/50 border-emerald-500/80 text-emerald-100'
                    }`}
                  >
                    <div className="flex flex-wrap items-center gap-2 mb-1.5">
                      <span
                        className={`text-[11px] md:text-xs font-black px-2.5 py-0.5 rounded-full ${
                          axisDefensePlan.level === 'RISK'
                            ? 'bg-red-500 text-white'
                            : axisDefensePlan.level === 'MEDIUM'
                              ? 'bg-amber-400 text-gray-950'
                              : 'bg-emerald-400 text-gray-950'
                        }`}
                      >
                        {axisDefensePlan.badgeText}
                      </span>
                      <span className="text-xs md:text-sm font-extrabold text-white">
                        {axisDefensePlan.headline}
                      </span>
                    </div>
                    <p className="text-[11px] md:text-xs text-gray-200 leading-relaxed">
                      {axisDefensePlan.reason}
                    </p>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-6 text-xs">
                  <div className="bg-yellow-950/40 border border-yellow-600/60 rounded-lg p-3">
                    <div className="text-yellow-400 font-bold mb-1.5">👑 1列目（1着軸本命）</div>
                    {(bettingTickets.formation_groups?.axis_1st || []).map((h) => (
                      <div key={h.umaban} className="font-bold text-white text-sm">
                        {h.umaban}番 {h.bamei}
                        <span className="block text-[10px] text-gray-300">
                          地力:{h.stage1_shisu} ➔ 最終:{h.shisu} ({h.odds}倍)
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="bg-indigo-950/40 border border-indigo-500/60 rounded-lg p-3">
                    <div className="text-indigo-300 font-bold mb-1.5">
                      🚀 2列目（相手本線・バイアス合致）
                    </div>
                    <div className="flex flex-col gap-1">
                      {(bettingTickets.formation_groups?.main_2nd || []).map((h) => (
                        <div key={h.umaban} className="font-bold text-white">
                          {h.umaban}番 {h.bamei}{' '}
                          <span className="text-[10px] text-pink-300">
                            (最終:{h.shisu} / 妙味:{h.myoumi})
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-emerald-950/40 border border-emerald-500/60 rounded-lg p-3">
                    <div className="text-emerald-300 font-bold mb-1.5">
                      🛡️ 3列目（地力救済・適性特注ヒモ）
                    </div>
                    <div className="flex flex-col gap-1.5">
                      {(bettingTickets.formation_groups?.saver_3rd || []).length > 0 ? (
                        (bettingTickets.formation_groups?.saver_3rd || []).map((h) => (
                          <div key={h.umaban} className="font-bold text-white">
                            <div>
                              {h.umaban}番 {h.bamei}{' '}
                              <span className="text-[10px] text-gray-300">
                                (地力{h.stage1_rank}位:{h.stage1_shisu} ➔ 最終:{h.shisu})
                              </span>
                            </div>
                            {h.rescue_type === 'time_warn' ? (
                              <span className="inline-block mt-0.5 bg-amber-500/20 text-amber-300 border border-amber-500/60 px-1.5 py-0.5 rounded text-[10px] font-extrabold">
                                ⚠️ 地力上位・持ち時計注意
                              </span>
                            ) : (
                              <span className="inline-block mt-0.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/60 px-1.5 py-0.5 rounded text-[10px] font-bold">
                                🛡️ 地力上位・コース/距離/巻き返し特注
                              </span>
                            )}
                          </div>
                        ))
                      ) : (
                        <span className="text-gray-500">該当なし（2列目馬で完結）</span>
                      )}
                    </div>
                  </div>

                  <div className="bg-red-950/40 border border-red-600/60 rounded-lg p-3">
                    <div className="text-red-400 font-bold mb-1.5">
                      💀 完全消し（地力下位×時計/状態難）
                    </div>
                    <div className="flex flex-col gap-1 max-h-24 overflow-y-auto">
                      {(bettingTickets.formation_groups?.eliminated || []).length > 0 ? (
                        (bettingTickets.formation_groups?.eliminated || []).map((h) => (
                          <div key={h.umaban} className="text-gray-300 font-bold">
                            {h.umaban}番 {h.bamei}{' '}
                            <span className="text-[10px] text-red-300">({h.odds}倍)</span>
                          </div>
                        ))
                      ) : (
                        <span className="text-gray-500">完全消しの該当馬なし</span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6 text-xs">
                  <div className="bg-gray-900 border border-gray-700 rounded-lg p-3">
                    <div className="flex justify-between items-center font-bold text-amber-400 border-b border-gray-800 pb-1 mb-1.5">
                      <span>① 単勝</span>
                      <span className="bg-amber-900/40 px-2 py-0.5 rounded">
                        計 {bettingTickets.tansho?.count || 0} 点
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {(bettingTickets.tansho?.picks || []).map((p) => (
                        <span
                          key={p.umaban}
                          className="bg-gray-800 border border-gray-600 px-2 py-1 rounded font-bold text-white"
                        >
                          {p.type}: <span className="text-yellow-300">{p.umaban}番</span> {p.bamei}{' '}
                          ({p.odds}倍)
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="bg-gray-900 border border-gray-700 rounded-lg p-3">
                    <div className="flex justify-between items-center font-bold text-sky-400 border-b border-gray-800 pb-1 mb-1.5">
                      <span>② 複勝</span>
                      <span className="bg-sky-900/40 px-2 py-0.5 rounded">
                        計 {bettingTickets.fukusho?.count || 0} 点
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {(bettingTickets.fukusho?.picks || []).map((p) => (
                        <span
                          key={p.umaban}
                          className="bg-gray-800 border border-gray-600 px-2 py-1 rounded font-bold text-white"
                        >
                          {p.type}: <span className="text-sky-300">{p.umaban}番</span> {p.bamei}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="bg-gray-900 border border-gray-700 rounded-lg p-3">
                    <div className="flex justify-between items-center font-bold text-pink-400 border-b border-gray-800 pb-1 mb-1.5">
                      <span>③ 基本ワイド（1列目軸 ➔ 2列目本線）</span>
                      <span className="bg-pink-900/40 px-2 py-0.5 rounded">
                        計 {bettingTickets.wide?.count || 0} 点
                      </span>
                    </div>
                    <div className="font-mono font-bold text-white">
                      軸: <span className="text-yellow-300">{bettingTickets.wide?.axis}番</span> ➔
                      相手: {(bettingTickets.wide?.targets || []).join(', ')}番
                    </div>
                    <div className="text-[11px] text-gray-400 mt-0.5">
                      買い目: {(bettingTickets.wide?.combos || []).join(' / ')}
                    </div>
                  </div>
                </div>

                {axisDefensePlan && (
                  <div className="space-y-6">
                    <div className="bg-gray-900 border border-indigo-500/50 rounded-xl p-3.5 flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
                      <div>
                        <h4 className="text-sm md:text-base font-black text-white flex items-center gap-2">
                          <span>💰 Harville合成オッズ ＆ 自動資金配分シミュレーター</span>
                        </h4>
                        <p className="text-[11px] text-gray-400">
                          1パターンあたりの予算を設定すると、推定オッズとAI期待値(EV)から100円単位の最適配分額を自動算出します。
                        </p>
                      </div>

                      <div className="flex flex-wrap items-center gap-2.5 text-xs w-full md:w-auto">
                        <div className="flex items-center gap-1.5 bg-gray-950 px-2.5 py-1.5 rounded-lg border border-gray-700">
                          <span className="text-gray-400 font-bold">予算:</span>
                          <input
                            type="number"
                            step="500"
                            min="500"
                            value={budgetYen}
                            onChange={(e) => setBudgetYen(Math.max(500, Number(e.target.value)))}
                            className="w-20 bg-gray-800 text-yellow-300 font-mono font-extrabold text-right rounded px-1.5 py-0.5 border border-yellow-600/50 focus:outline-none"
                          />
                          <span className="text-gray-400">円</span>
                        </div>

                        <select
                          value={allocMode}
                          onChange={(e) =>
                            setAllocMode(e.target.value as 'EV_FOCUS' | 'EQUAL_RETURN')
                          }
                          className="bg-indigo-950 text-indigo-200 font-bold rounded-lg px-2.5 py-1.5 border border-indigo-500 focus:outline-none"
                        >
                          <option value="EV_FOCUS">🔥 AI期待値・穴目厚め配分</option>
                          <option value="EQUAL_RETURN">⚖️ 払戻均等・トリガミ防止配分</option>
                        </select>

                        <div className="flex flex-wrap gap-1 bg-gray-950 p-1 rounded-lg border border-gray-700">
                          <button
                            onClick={() => setActivePatternTab('ALL')}
                            className={`px-2 py-1 rounded font-bold transition ${
                              activePatternTab === 'ALL'
                                ? 'bg-indigo-600 text-white'
                                : 'text-gray-400 hover:text-white'
                            }`}
                          >
                            全表示
                          </button>
                          <button
                            onClick={() => setActivePatternTab('WIDE')}
                            className={`px-2 py-1 rounded font-bold transition ${
                              activePatternTab === 'WIDE'
                                ? 'bg-pink-600 text-white'
                                : 'text-gray-400 hover:text-white'
                            }`}
                          >
                            ワイド(4種)
                          </button>
                          <button
                            onClick={() => setActivePatternTab('PUKU')}
                            className={`px-2 py-1 rounded font-bold transition ${
                              activePatternTab === 'PUKU'
                                ? 'bg-emerald-600 text-white'
                                : 'text-gray-400 hover:text-white'
                            }`}
                          >
                            3連複(4種)
                          </button>
                          <button
                            onClick={() => setActivePatternTab('TAN')}
                            className={`px-2 py-1 rounded font-bold transition ${
                              activePatternTab === 'TAN'
                                ? 'bg-amber-500 text-gray-950'
                                : 'text-gray-400 hover:text-white'
                            }`}
                          >
                            3連単(4種)
                          </button>
                        </div>
                      </div>
                    </div>

                    {(activePatternTab === 'ALL' || activePatternTab === 'WIDE') && (
                      <div className="bg-gradient-to-br from-pink-950/40 to-gray-900 border-2 border-pink-500/70 rounded-xl p-4">
                        <div className="flex items-center justify-between border-b border-pink-800/70 pb-2 mb-3">
                          <span className="text-sm md:text-base font-extrabold text-pink-300">
                            💣 【2列目 × 3列目 攻略ワイド】本命飛び・タテ目・紐穴狙い撃ち（全4パターン）
                          </span>
                          <span className="text-[11px] bg-pink-900/70 text-pink-200 px-2.5 py-0.5 rounded-full font-bold">
                            2列目(本線) × 3列目(地力救済・妙味穴)
                          </span>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                          {(axisDefensePlan.widePatterns || []).map((pat) =>
                            renderPatternCard(
                              pat,
                              'border-pink-700/50',
                              'text-pink-200',
                              'bg-pink-600 text-white'
                            )
                          )}
                        </div>
                      </div>
                    )}

                    {(activePatternTab === 'ALL' || activePatternTab === 'PUKU') && (
                      <div className="bg-gradient-to-br from-emerald-950/40 to-gray-900 border-2 border-emerald-500/70 rounded-xl p-4">
                        <div className="flex items-center justify-between border-b border-emerald-800/70 pb-2 mb-3">
                          <span className="text-sm md:text-base font-extrabold text-emerald-300">
                            🛡️ 【3連複 4大フォーメーション＆BOX】王道軸・2/3列目W軸・タテ目BOX・3列目1頭軸
                          </span>
                          <span className="text-[11px] bg-emerald-900/70 text-emerald-200 px-2.5 py-0.5 rounded-full font-bold">
                            全4パターン
                          </span>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                          {(axisDefensePlan.sanrenpukuPatterns || []).map((pat) =>
                            renderPatternCard(
                              pat,
                              'border-emerald-700/50',
                              'text-emerald-200',
                              'bg-emerald-600 text-white'
                            )
                          )}
                        </div>
                      </div>
                    )}

                    {(activePatternTab === 'ALL' || activePatternTab === 'TAN') && (
                      <div className="bg-gradient-to-br from-indigo-950/50 via-purple-950/40 to-gray-900 border-2 border-amber-400/80 rounded-xl p-4">
                        <div className="flex items-center justify-between border-b border-amber-700/70 pb-2 mb-3">
                          <span className="text-sm md:text-base font-extrabold text-yellow-300">
                            👑 【3連単 4大フォーメーション】本命頭・3列目2着抜擢・2列目頭・3列目(地力/特注)頭
                          </span>
                          <span className="text-[11px] bg-amber-500 text-gray-950 px-2.5 py-0.5 rounded-full font-black">
                            1着固定＆逆転 全4パターン
                          </span>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                          {(axisDefensePlan.sanrentanPatterns || []).map((pat) =>
                            renderPatternCard(
                              pat,
                              'border-amber-600/50',
                              'text-amber-200',
                              'bg-amber-500 text-gray-950'
                            )
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* 各馬の2段階指数カード一覧 */}
            <div className="grid md:grid-cols-2 gap-4">
              {(displayedDiagnosis || []).map((horse) => {
                const matchLabel = getScenarioMatchLabel(horse);
                const mark = marksSummary?.markMap[horse.umaban];
                const roleBadgeColor =
                  horse.role_code === 'AXIS_1ST'
                    ? 'bg-yellow-500 text-gray-950'
                    : horse.role_code === 'MAIN_2ND'
                      ? 'bg-pink-600 text-white'
                      : horse.role_code === 'SAVER_3RD_TIME_WARN'
                        ? 'bg-amber-500 text-gray-950 font-black'
                        : horse.role_code === 'SAVER_3RD'
                          ? 'bg-emerald-600 text-white'
                          : horse.role_code === 'ELIMINATED'
                            ? 'bg-red-800 text-red-100'
                            : 'bg-gray-700 text-gray-300';

                return (
                  <div
                    key={horse.umaban}
                    className={`bg-gray-900 p-3 md:p-4 rounded-lg border flex flex-col gap-3 relative overflow-hidden ${
                      horse.role_code === 'AXIS_1ST'
                        ? 'border-yellow-500'
                        : horse.role_code === 'MAIN_2ND'
                          ? 'border-pink-500/80'
                          : horse.role_code === 'SAVER_3RD_TIME_WARN'
                            ? 'border-amber-500/90'
                            : horse.role_code === 'SAVER_3RD'
                              ? 'border-emerald-500/80'
                              : horse.role_code === 'ELIMINATED'
                                ? 'border-red-800/70 opacity-75'
                                : 'border-gray-700'
                    }`}
                  >
                    {horse.role_label && (
                      <div
                        className={`existing-badge absolute top-0 right-0 text-[9px] md:text-[10px] font-bold px-2.5 py-1 rounded-bl-lg shadow-md ${roleBadgeColor}`}
                      >
                        {horse.role_label}
                      </div>
                    )}

                    <div className="flex justify-between items-center mt-2">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2">
                          <div
                            className={`w-7 h-7 md:w-8 md:h-8 flex items-center justify-center font-bold text-sm md:text-base rounded-full shadow-md ${getHorseColor(horse.wakuban || horse.umaban)}`}
                          >
                            {horse.umaban}
                          </div>
                          {mark && (
                            <span
                              className={`w-7 h-7 md:w-8 md:h-8 flex items-center justify-center font-black text-sm md:text-base rounded-md border ${getMarkBadgeStyle(mark)}`}
                            >
                              {mark}
                            </span>
                          )}
                          <span className="text-base md:text-lg font-bold">{horse.bamei}</span>
                          {horse.odds > 0 && (
                            <span className="text-xs font-mono text-yellow-400 font-bold">
                              ({horse.odds}倍)
                            </span>
                          )}
                        </div>

                        {Array.isArray(horse.tactical_badges) && horse.tactical_badges.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 mt-0.5">
                            {horse.tactical_badges.map((bText, bIdx) => (
                              <span
                                key={bIdx}
                                className={`px-2 py-0.5 rounded text-[10px] border ${getTacticalBadgeStyle(bText)}`}
                              >
                                {bText}
                              </span>
                            ))}
                          </div>
                        )}

                        <div className="flex flex-wrap items-center gap-1.5 mt-0.5">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold border ${getPciBadgeStyle(horse.pci_type)}`}
                          >
                            好走PCI: {horse.pci} ({getPciLabelText(horse.pci_type)})
                          </span>
                          {horse.early_3f_sec && (
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold border border-gray-700 bg-gray-800 text-gray-300">
                              テン3F目安:{horse.early_3f_sec}秒
                            </span>
                          )}
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold border border-gray-600 bg-gray-800 text-gray-300">
                            {horse.bataijuu}kg (
                            {horse.weight_change > 0
                              ? `+${horse.weight_change}`
                              : horse.weight_change}
                            )
                          </span>
                          {horse.training_rank && horse.training_rank !== 'B' && (
                            <span
                              className={`px-1.5 py-0.5 rounded text-[10px] font-extrabold border ${
                                horse.training_rank === 'S'
                                  ? 'bg-amber-900/80 text-yellow-300 border-yellow-500'
                                  : horse.training_rank === 'A'
                                    ? 'bg-emerald-900/80 text-emerald-200 border-emerald-500'
                                    : 'bg-red-950 text-red-300 border-red-500'
                              }`}
                            >
                              追切:{horse.training_rank}
                            </span>
                          )}
                          {horse.rotation_label && (
                            <span
                              className={`px-1.5 py-0.5 rounded text-[10px] font-bold border ${
                                horse.rotation_label.includes('叩き2走目') ||
                                horse.rotation_label.includes('叩き3走目')
                                  ? 'bg-cyan-950/90 text-cyan-200 border-cyan-500'
                                  : horse.rotation_label.includes('🚨') ||
                                      horse.rotation_label.includes('⚠️')
                                    ? 'bg-red-950/80 text-red-200 border-red-600'
                                    : 'bg-gray-800 text-gray-300 border-gray-600'
                              }`}
                            >
                              {horse.rotation_label}
                            </span>
                          )}
                          {horse.pedigree_label && (
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold border border-purple-700/70 bg-purple-950/60 text-purple-200">
                              {horse.pedigree_label}
                            </span>
                          )}
                          {horse.is_jiriki_time_warn ? (
                            <span className="bg-amber-900/80 text-amber-200 border border-amber-500 text-[10px] font-extrabold px-1.5 py-0.5 rounded">
                              ⚠️ 地力上位・持ち時計注意 ({horse.time_limit_mult}倍)
                            </span>
                          ) : horse.time_limit_mult !== undefined &&
                            horse.time_limit_mult <= 0.93 ? (
                            <span className="bg-red-900/80 text-red-200 border border-red-500 text-[10px] font-bold px-1.5 py-0.5 rounded">
                              ⚠️ 持ち時計やや不足 ({horse.time_limit_mult}倍)
                            </span>
                          ) : null}
                          {matchLabel && (
                            <span className="bg-yellow-500/20 text-yellow-300 border border-yellow-500/50 text-[10px] font-bold px-1.5 py-0.5 rounded">
                              {matchLabel}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex gap-2.5 md:gap-3.5 text-right items-end">
                        <div className="flex flex-col items-end border-r border-gray-700 pr-2.5">
                          <div className="text-[9px] md:text-[10px] text-slate-400 font-bold">
                            ①素の地力 ({horse.stage1_rank}位)
                          </div>
                          <div className="text-base md:text-lg font-bold text-slate-200 font-mono">
                            {horse.stage1_shisu.toFixed(1)}
                          </div>
                        </div>

                        {horse.odds > 0 && (
                          <div className="flex flex-col items-end border-r border-gray-700 pr-2.5">
                            <div className="text-[9px] md:text-[10px] text-pink-400 font-bold">
                              妙味指数
                            </div>
                            <div
                              className={`text-lg md:text-xl font-bold ${horse.myoumi >= 60 ? 'text-pink-500' : horse.myoumi >= 50 ? 'text-pink-300' : 'text-gray-500'}`}
                            >
                              {horse.myoumi > 0 ? horse.myoumi.toFixed(1) : '-'}
                            </div>
                          </div>
                        )}

                        <div className="flex flex-col items-end">
                          <div className="text-[9px] md:text-[10px] text-indigo-300 font-bold">
                            ②最終指数 ({horse.stage2_rank}位)
                          </div>
                          <div
                            className={`text-xl md:text-2xl font-bold ${horse.shisu >= 60 ? 'text-red-400' : horse.shisu >= 50 ? 'text-yellow-400' : 'text-gray-500'}`}
                          >
                            {horse.shisu.toFixed(1)}
                          </div>
                        </div>
                      </div>
                    </div>

                    {Array.isArray(horse.history_details) && horse.history_details.length > 0 && (
                      <div className="mt-1 bg-gray-950/90 rounded-lg p-2.5 border border-gray-800 overflow-x-auto">
                        <div className="text-[10px] font-bold text-gray-400 mb-1 flex justify-between items-center">
                          <span>📋 過去5走履歴（最新順）</span>
                          <span className="text-[9px] text-gray-500">
                            要求上り差: {horse.time_diff > 0 ? `+${horse.time_diff}` : horse.time_diff}秒
                          </span>
                        </div>
                        <table className="w-full text-[10px] md:text-[11px] text-left border-collapse min-w-[380px]">
                          <thead>
                            <tr className="border-b border-gray-800 text-gray-400">
                              <th className="py-1 pr-2">レース名</th>
                              <th className="py-1 pr-2">距離</th>
                              <th className="py-1 pr-2 text-center">着順</th>
                              <th className="py-1 pr-2 font-mono">タイム</th>
                              <th className="py-1 pr-2 font-mono">上り3F</th>
                              <th className="py-1 pr-2 font-mono">走行順位</th>
                              <th className="py-1 font-mono text-right">PCI</th>
                            </tr>
                          </thead>
                          <tbody>
                            {horse.history_details.map((h, i) => (
                              <tr
                                key={i}
                                className="border-b border-gray-800/50 last:border-0 text-gray-200"
                              >
                                <td className="py-1 pr-2 font-bold truncate max-w-[125px]">
                                  {h.race_name}
                                </td>
                                <td className="py-1 pr-2 text-gray-300 whitespace-nowrap">
                                  {h.distance || '-'}
                                </td>
                                <td
                                  className={`py-1 pr-2 text-center whitespace-nowrap ${getRankTextStyle(h.rank)}`}
                                >
                                  {h.rank}
                                </td>
                                <td className="py-1 pr-2 font-mono whitespace-nowrap">{h.time}</td>
                                <td className="py-1 pr-2 font-mono text-sky-300 font-bold whitespace-nowrap">
                                  {h.up}
                                </td>
                                <td className="py-1 pr-2 font-mono text-gray-300 whitespace-nowrap">
                                  {h.passing}
                                </td>
                                <td className="py-1 font-mono text-right text-gray-400 whitespace-nowrap">
                                  {h.pci || '-'}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <button
              onClick={handleSimulate}
              disabled={loading}
              className="w-full bg-red-600 hover:bg-red-500 text-white font-bold py-3 md:py-4 rounded-lg mt-6 md:mt-8 shadow-[0_0_15px_rgba(220,38,38,0.5)] text-sm md:text-lg transition duration-200 disabled:opacity-50"
            >
              {loading ? 'レースを生成中...' : '🏁 リアル隊列・まくり・コース高低差シミュレーション開始'}
            </button>
          </div>
        )}

        {/* シミュレーションモーダル */}
        {isRacing && results && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/85 backdrop-blur-sm p-2 md:p-4">
            <div className="relative w-full max-w-5xl max-h-[96vh] overflow-y-auto bg-gray-900 rounded-2xl border border-gray-600 shadow-2xl p-3 md:p-5">
              <button
                onClick={() => {
                  if (animFrameRef.current) {
                    cancelAnimationFrame(animFrameRef.current);
                    animFrameRef.current = null;
                  }
                  if (resultTimerRef.current) {
                    clearTimeout(resultTimerRef.current);
                    resultTimerRef.current = null;
                  }
                  setIsRacing(false);
                  setShowResults(false);
                }}
                className="absolute top-2 right-2 md:top-4 md:right-4 text-gray-400 hover:text-white bg-gray-800 hover:bg-red-600 rounded-full w-8 h-8 flex items-center justify-center transition z-50 font-bold"
              >
                ✕
              </button>

              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-2 mb-2.5 pr-8">
                <div>
                  <h3 className="font-extrabold text-white text-base md:text-xl flex flex-wrap items-center gap-2">
                    <span>🏁 {activeVenueKey}競馬場</span>
                    <span className="text-yellow-400">
                      {courseType}
                      {distance}m
                    </span>
                    <span className="bg-indigo-900 text-indigo-200 border border-indigo-500 px-2.5 py-0.5 rounded-full text-xs">
                      {effectiveDir === 'LEFT'
                        ? '↺ 左回り（反時計回り）'
                        : '↻ 右回り（時計回り）'}
                    </span>
                    <span className="bg-sky-900/80 text-sky-200 border border-sky-500 px-2.5 py-0.5 rounded-full text-xs">
                      🚪 {startConfig.startLabel}
                    </span>
                  </h3>
                  <p className="text-[11px] text-gray-400 mt-0.5">{venueProfile.featureText}</p>
                </div>
                <div className="bg-gray-950 border border-gray-700 px-3 py-1.5 rounded-lg text-xs font-bold text-sky-300 whitespace-nowrap">
                  {simPhaseLabel} ({Math.round(simProgress * distance)}m / {distance}m)
                </div>
              </div>

              <div className="mb-3 bg-gray-950/90 border border-gray-800 rounded-xl p-2.5 flex flex-wrap items-center gap-2.5 text-xs">
                <div className="flex items-center gap-1.5">
                  <span className="text-gray-400 font-bold">競馬場図:</span>
                  <select
                    value={activeVenueKey}
                    onChange={(e) => {
                      setTargetPlace(e.target.value);
                      setShowResults(false);
                      setSimRunId((prev) => prev + 1);
                    }}
                    className="bg-gray-800 text-white font-bold rounded px-2 py-1 border border-gray-600 focus:outline-none"
                  >
                    {Object.keys(VENUE_PROFILES).map((v) => (
                      <option key={v} value={v}>
                        {v} ({VENUE_PROFILES[v].dir === 'LEFT' ? '左回り↺' : '右回り↻'})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center gap-1.5">
                  <span className="text-gray-400 font-bold">回り方向:</span>
                  <select
                    value={customDirOverride}
                    onChange={(e) => {
                      setCustomDirOverride(e.target.value as 'AUTO' | 'LEFT' | 'RIGHT');
                      setShowResults(false);
                      setSimRunId((prev) => prev + 1);
                    }}
                    className="bg-gray-800 text-indigo-200 font-bold rounded px-2 py-1 border border-indigo-700 focus:outline-none"
                  >
                    <option value="AUTO">
                      自動 ({venueProfile.dir === 'LEFT' ? '左回り↺' : '右回り↻'})
                    </option>
                    <option value="LEFT">↺ 左回り（東京・中京）</option>
                    <option value="RIGHT">↻ 右回り（中山・京都・阪神）</option>
                  </select>
                </div>

                <div className="flex items-center gap-1.5">
                  <span className="text-gray-400 font-bold">スタート位置:</span>
                  <select
                    value={customStartMode}
                    onChange={(e) => {
                      setCustomStartMode(e.target.value as StartModeType);
                      setShowResults(false);
                      setSimRunId((prev) => prev + 1);
                    }}
                    className="bg-gray-800 text-sky-200 font-bold rounded px-2 py-1 border border-sky-700 focus:outline-none"
                  >
                    <option value="AUTO">自動判定 ({startConfig.startLabel})</option>
                    <option value="POCKET_1C">1角奥ポケット発走 (東京2000m)</option>
                    <option value="POCKET_2C">
                      2角奥ポケット発走 (東京1800/中京2000/京都・阪神外1800/中山1600)
                    </option>
                    <option value="BACK_STRETCH">向正面発走 (マイル・短距離・3000m・3200m)</option>
                    <option value="HOME_STRETCH">
                      スタンド前直線発走 (内2000m・2400m)
                    </option>
                    <option value="CORNER_3_4">
                      3〜4角発走 (阪神2200m・中山2500m)
                    </option>
                  </select>
                </div>

                <button
                  onClick={() => {
                    setShowResults(false);
                    setSimRunId((prev) => prev + 1);
                  }}
                  className="ml-auto bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-3 py-1 rounded border border-indigo-400 transition"
                >
                  🔄 最初から再生
                </button>
              </div>

              <div className="relative w-full mx-auto bg-[#143627] rounded-xl overflow-hidden shadow-inner border-2 border-gray-700">
                <svg
                  viewBox="0 0 800 395"
                  className="w-full h-auto block"
                  preserveAspectRatio="xMidYMid meet"
                >
                  <rect width="800" height="300" fill="#1b4332" />

                  {venueProfile.hasOuterLoop && (
                    <path
                      d={
                        effectiveDir === 'RIGHT'
                          ? 'M 260 54 L 615 40 A 110 110 0 0 1 615 262 L 420 248'
                          : 'M 540 54 L 185 40 A 110 110 0 0 0 185 262 L 380 248'
                      }
                      fill="none"
                      stroke={courseType === 'ダ' ? '#9c7858' : '#23533d'}
                      strokeWidth="22"
                      strokeDasharray="6 4"
                      opacity="0.7"
                    />
                  )}

                  {(venueProfile.has1CPocket || startConfig.resolvedMode === 'POCKET_1C') && (
                    <g>
                      <line
                        x1={effectiveDir === 'LEFT' ? 748 : 52}
                        y1="212"
                        x2={pocketMergePt.x}
                        y2={pocketMergePt.y}
                        stroke={courseType === 'ダ' ? '#b08968' : '#2d6a4f'}
                        strokeWidth="28"
                        strokeLinecap="round"
                      />
                      <line
                        x1={effectiveDir === 'LEFT' ? 748 : 52}
                        y1="212"
                        x2={pocketMergePt.x}
                        y2={pocketMergePt.y}
                        stroke="#ffffff"
                        strokeWidth="1.5"
                        strokeDasharray="4 4"
                        opacity="0.7"
                      />
                    </g>
                  )}

                  {(venueProfile.has2CPocket || startConfig.resolvedMode === 'POCKET_2C') && (
                    <g>
                      <line
                        x1={effectiveDir === 'LEFT' ? 735 : 65}
                        y1="36"
                        x2={effectiveDir === 'LEFT' ? 580 : 220}
                        y2="68"
                        stroke={courseType === 'ダ' ? '#b08968' : '#2d6a4f'}
                        strokeWidth="26"
                        strokeLinecap="round"
                      />
                      <line
                        x1={effectiveDir === 'LEFT' ? 735 : 65}
                        y1="36"
                        x2={effectiveDir === 'LEFT' ? 580 : 220}
                        y2="68"
                        stroke="#ffffff"
                        strokeWidth="1.5"
                        strokeDasharray="4 4"
                        opacity="0.65"
                      />
                    </g>
                  )}

                  <path
                    d="M 210 248 L 590 248 A 96 96 0 0 0 590 56 L 210 56 A 96 96 0 0 0 210 248 Z"
                    fill="none"
                    stroke={courseType === 'ダ' ? '#b08968' : '#2d6a4f'}
                    strokeWidth="36"
                  />
                  <path
                    d="M 210 236 L 590 236 A 84 84 0 0 0 590 68 L 210 68 A 84 84 0 0 0 210 236 Z"
                    fill="#143627"
                    stroke="#e5e7eb"
                    strokeWidth="2"
                    strokeDasharray="5 5"
                    opacity="0.8"
                  />

                  <text
                    x="400"
                    y="128"
                    fill="#ffffff"
                    fontSize="15"
                    fontWeight="bold"
                    textAnchor="middle"
                    opacity="0.9"
                  >
                    {activeVenueKey} {courseType}
                    {distance}m ({effectiveDir === 'LEFT' ? '左回り ↺' : '右回り ↻'})
                  </text>
                  <text
                    x="400"
                    y="150"
                    fill="#fcd34d"
                    fontSize="12"
                    fontWeight="bold"
                    textAnchor="middle"
                    opacity="0.9"
                  >
                    直線 {venueProfile.straightMeter}m ／ 高低差 {venueProfile.elevationDiff}m (
                    {venueProfile.slopeTitle})
                  </text>
                  <text
                    x="400"
                    y="174"
                    fill="#93c5fd"
                    fontSize="11"
                    fontWeight="bold"
                    textAnchor="middle"
                    opacity="0.85"
                  >
                    {effectiveDir === 'LEFT'
                      ? '【向正面（上側）】 ← 右から左へ進行（反時計回り ↺）'
                      : '【向正面（上側）】 → 左から右へ進行（時計回り ↻）'}
                  </text>
                  <text
                    x="400"
                    y="214"
                    fill="#fde047"
                    fontSize="11"
                    fontWeight="bold"
                    textAnchor="middle"
                    opacity="0.9"
                  >
                    {effectiveDir === 'LEFT'
                      ? '【スタンド前直線（下側）】 左から右へ進行（→ 🏁GOAL）'
                      : '【スタンド前直線（下側）】 右から左へ進行（🏁GOAL ←）'}
                  </text>

                  <text
                    x="110"
                    y="52"
                    fill="#cbd5e1"
                    fontSize="11"
                    fontWeight="bold"
                    textAnchor="middle"
                  >
                    {effectiveDir === 'LEFT' ? '第3コーナー' : '第2コーナー'}
                  </text>
                  <text
                    x="690"
                    y="52"
                    fill="#cbd5e1"
                    fontSize="11"
                    fontWeight="bold"
                    textAnchor="middle"
                  >
                    {effectiveDir === 'LEFT' ? '第2コーナー' : '第3コーナー'}
                  </text>
                  <text
                    x="110"
                    y="268"
                    fill="#cbd5e1"
                    fontSize="11"
                    fontWeight="bold"
                    textAnchor="middle"
                  >
                    {effectiveDir === 'LEFT' ? '第4コーナー' : '第1コーナー'}
                  </text>
                  <text
                    x="690"
                    y="268"
                    fill="#cbd5e1"
                    fontSize="11"
                    fontWeight="bold"
                    textAnchor="middle"
                  >
                    {effectiveDir === 'LEFT' ? '第1コーナー' : '第4コーナー'}
                  </text>

                  <g transform={`translate(${startGatePt.x.toFixed(1)}, ${startGatePt.y.toFixed(1)})`}>
                    <circle r="13" fill="#0284c7" stroke="#ffffff" strokeWidth="2" opacity="0.95" />
                    <text
                      x="0"
                      y="3"
                      fill="#ffffff"
                      fontSize="8"
                      fontWeight="bold"
                      textAnchor="middle"
                    >
                      START
                    </text>
                    <text
                      x="0"
                      y="-17"
                      fill="#38bdf8"
                      fontSize="10"
                      fontWeight="bold"
                      textAnchor="middle"
                    >
                      🚪{startConfig.startLabel}
                    </text>
                  </g>

                  <g transform={`translate(${goalGatePt.x.toFixed(1)}, ${goalGatePt.y.toFixed(1)})`}>
                    <line x1="0" y1="-16" x2="0" y2="36" stroke="#ef4444" strokeWidth="5" />
                    <circle cx="0" cy="-20" r="6" fill="#ef4444" stroke="#ffffff" strokeWidth="1.5" />
                    <text
                      x="0"
                      y="48"
                      fill="#fca5a5"
                      fontSize="12"
                      fontWeight="bold"
                      textAnchor="middle"
                    >
                      🏁 GOAL
                    </text>
                  </g>

                  {[...simHorseStates]
                    .sort((a, b) => b.rank - a.rank)
                    .map((hs) => {
                      const colors = getHorseSvgColors(hs.umaban);
                      return (
                        <g
                          key={`sim-h-${hs.umaban}`}
                          transform={`translate(${hs.x.toFixed(1)}, ${hs.y.toFixed(1)})`}
                        >
                          {hs.isMakuriActiveNow && (
                            <>
                              <circle
                                r="13.5"
                                fill="none"
                                stroke="#f97316"
                                strokeWidth="2.5"
                                opacity="0.9"
                              />
                              <text
                                x="0"
                                y="-12"
                                fill="#fdba74"
                                fontSize="8.5"
                                fontWeight="bold"
                                textAnchor="middle"
                              >
                                🔥まくり
                              </text>
                            </>
                          )}
                          {!hs.isMakuriActiveNow && hs.isSpurtActiveNow && (
                            <circle
                              r="12"
                              fill="none"
                              stroke="#facc15"
                              strokeWidth="2"
                              opacity="0.85"
                            />
                          )}
                          <circle
                            cx="0"
                            cy="0"
                            r="8.5"
                            fill={colors.bg}
                            stroke={colors.border}
                            strokeWidth="1.8"
                          />
                          <text
                            x="0"
                            y="3.2"
                            fontSize="8.5"
                            fontWeight="bold"
                            textAnchor="middle"
                            fill={colors.text}
                          >
                            {hs.umaban}
                          </text>
                        </g>
                      );
                    })}

                  <g transform="translate(0, 300)">
                    <rect width="800" height="95" fill="#090d16" />
                    <line x1="0" y1="0" x2="800" y2="0" stroke="#374151" strokeWidth="1.5" />
                    <text x="40" y="16" fill="#9ca3af" fontSize="10" fontWeight="bold">
                      ⛰️ コース高低差・起伏断面図（START ➔ GOAL {distance}m / 最大高低差{' '}
                      {venueProfile.elevationDiff}m）
                    </text>

                    <polygon points={elevPolygonPoints} fill="rgba(16, 185, 129, 0.22)" />
                    <polyline
                      points={elevPoints.join(' ')}
                      fill="none"
                      stroke="#10b981"
                      strokeWidth="2.5"
                    />

                    <line
                      x1="40"
                      y1="78"
                      x2="760"
                      y2="78"
                      stroke="#4b5563"
                      strokeWidth="1"
                    />
                    <text x="40" y="90" fill="#60a5fa" fontSize="9" fontWeight="bold">
                      START (0m)
                    </text>
                    <text
                      x="400"
                      y="90"
                      fill="#9ca3af"
                      fontSize="9"
                      fontWeight="bold"
                      textAnchor="middle"
                    >
                      道中・3〜4コーナー勝負所 ({Math.round(distance * 0.5)}m付近)
                    </text>
                    <text
                      x="760"
                      y="90"
                      fill="#f87171"
                      fontSize="9"
                      fontWeight="bold"
                      textAnchor="end"
                    >
                      🏁 GOAL ({distance}m)
                    </text>

                    <line
                      x1={currentElevX}
                      y1="22"
                      x2={currentElevX}
                      y2="78"
                      stroke="#facc15"
                      strokeWidth="1.5"
                      strokeDasharray="2 2"
                    />
                    <circle
                      cx={currentElevX}
                      cy={currentElevY}
                      r="5"
                      fill="#facc15"
                      stroke="#000000"
                      strokeWidth="1.5"
                    />
                  </g>
                </svg>

                {showResults && (
                  <div
                    className="absolute inset-0 bg-black/85 z-40 flex flex-col items-center justify-center p-2 md:p-4"
                    style={{ animation: 'popIn 0.4s ease-out forwards' }}
                  >
                    <h3 className="text-2xl md:text-3xl font-black text-yellow-400 mb-3 tracking-widest">
                      レース確定
                    </h3>
                    <div className="w-full max-w-sm md:max-w-lg bg-gray-900 border-2 border-yellow-600 rounded-xl p-2 md:p-4 shadow-[0_0_30px_rgba(234,179,8,0.3)] overflow-x-auto">
                      <table className="w-full text-center border-collapse min-w-[260px]">
                        <thead>
                          <tr className="border-b border-gray-700 text-gray-400 text-[10px] md:text-xs">
                            <th className="pb-1.5 md:pb-2 w-12 md:w-16">着順</th>
                            <th className="pb-1.5 md:pb-2 w-10 md:w-12">馬番</th>
                            <th className="pb-1.5 md:pb-2 text-left pl-2 md:pl-4">馬名</th>
                            <th className="pb-1.5 md:pb-2 text-right pr-2 md:pr-4">AIスコア</th>
                          </tr>
                        </thead>
                        <tbody>
                          {(results || []).slice(0, 5).map((r) => (
                            <tr key={r.umaban} className="border-b border-gray-800/80 last:border-0">
                              <td
                                className={`py-1.5 md:py-2 text-sm md:text-lg font-bold ${r.rank === 1 ? 'text-yellow-400' : r.rank === 2 ? 'text-gray-300' : r.rank === 3 ? 'text-orange-400' : 'text-gray-500'}`}
                              >
                                {r.rank}
                              </td>
                              <td className="py-1.5 md:py-2">
                                <div
                                  className={`w-4 h-4 md:w-5 md:h-5 mx-auto rounded-full flex items-center justify-center font-bold text-[9px] md:text-[10px] border ${getHorseColor(r.umaban)}`}
                                >
                                  {r.umaban}
                                </div>
                              </td>
                              <td className="py-1.5 md:py-2 text-left pl-2 md:pl-4 font-bold text-sm md:text-base text-gray-100 truncate">
                                {r.bamei}
                              </td>
                              <td className="py-1.5 md:py-2 text-right pr-2 md:pr-4 text-gray-400 font-mono text-xs md:text-sm">
                                {r.shisu.toFixed(1)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      <div className="mt-3 flex justify-center">
                        <button
                          onClick={() => {
                            setShowResults(false);
                            setSimRunId((prev) => prev + 1);
                          }}
                          className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold px-4 py-2 rounded-lg shadow transition"
                        >
                          🔄 もう一度リプレイを見る
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div
                className={`mt-3 md:mt-4 grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-3 transition-opacity duration-700 ${showResults ? 'opacity-100' : 'opacity-0 h-0 overflow-hidden'}`}
              >
                {(results || []).map((result, index) => (
                  <div
                    key={index}
                    className={`flex flex-col p-2 md:p-2.5 rounded-xl border ${result.rank === 1 ? 'bg-yellow-900/40 border-yellow-500 shadow-[0_0_10px_rgba(234,179,8,0.2)]' : result.rank <= 3 ? 'bg-gray-800 border-gray-500' : 'bg-gray-900 border-gray-800'}`}
                  >
                    <div className="flex items-center gap-1.5 md:gap-2">
                      <span
                        className={`text-sm md:text-base font-extrabold ${result.rank === 1 ? 'text-yellow-400' : result.rank === 2 ? 'text-gray-300' : result.rank === 3 ? 'text-orange-400' : 'text-gray-600'}`}
                      >
                        {result.rank}着
                      </span>
                      <div
                        className={`w-5 h-5 flex items-center justify-center font-bold text-[9px] rounded-full border flex-shrink-0 ${getHorseColor(result.umaban)}`}
                      >
                        {result.umaban}
                      </div>
                      <span className="text-xs font-bold text-gray-200 truncate flex-grow">
                        {result.bamei}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
// ====== ここまで page.tsx [Part 4/4 (最終行)] ======
