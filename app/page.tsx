'use client';

import { useState, useRef, useEffect } from 'react';

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
  zenso_chakujun: number;
  avg_agari: number;
  kyakushitsu: number;
  shussou_kaisuu: number;
  pci?: number;
  pci_type?: string;
}

interface HistoryDetail {
  race_name: string;
  rank: string;
  time: string;
  up: string;
  passing: string;
  pci?: string;
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
  time_diff: number;
  pci: number;
  pci_type: string;
  bataijuu: number;
  weight_change: number;
  time_limit_mult?: number;
  bias_mult?: number;
  pace_mult?: number;
  condition_mult?: number;
  role_code?: string;
  role_label?: string;
  is_bias_victim_rescued?: boolean;
  history_details: HistoryDetail[];
}

interface AutoStatusInfo {
  pace_status: string;
  pace_message: string;
  bias_status: string;
  bias_message: string;
  weight_status: string;
  weight_message: string;
}

interface BettingTickets {
  formation_groups: {
    axis_1st: { umaban: number; bamei: string; shisu: number; stage1_shisu: number; odds: number }[];
    main_2nd: { umaban: number; bamei: string; shisu: number; stage1_shisu: number; myoumi: number; odds: number }[];
    saver_3rd: { umaban: number; bamei: string; shisu: number; stage1_shisu: number; stage1_rank: number; odds: number; rescued: boolean }[];
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

interface RaceResult {
  umaban: number;
  bamei: string;
  shisu: number;
  time_diff: number;
  rank: number;
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

export default function Home() {
  const [raceId, setRaceId] = useState('202605040411');
  const [fetching, setFetching] = useState(false);

  const [targetRaceName, setTargetRaceName] = useState('');
  const [targetPlace, setTargetPlace] = useState('');
  const [courseRpci, setCourseRpci] = useState<number | null>(null);
  const [courseRpciType, setCourseRpciType] = useState<string>('');

  const [courseType, setCourseType] = useState('芝');
  const [distance, setDistance] = useState(2000);
  const [weather, setWeather] = useState('晴');
  const [trackCondition, setTrackCondition] = useState('良');
  const [expectedPace, setExpectedPace] = useState('M_JIRIKI');

  const [trackBias, setTrackBias] = useState('フラット');
  const [biasStrength, setBiasStrength] = useState('中');

  const [cushionValue, setCushionValue] = useState<number>(9.0);
  const [autoStatus, setAutoStatus] = useState<AutoStatusInfo | null>(null);

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
      zenso_chakujun: 9,
      avg_agari: 35.0,
      kyakushitsu: 2,
      shussou_kaisuu: 0,
      pci: 50.0,
      pci_type: 'B',
    },
  ]);

  const [diagnosisResults, setDiagnosisResults] = useState<DiagnosisResult[] | null>(null);
  const [bettingTickets, setBettingTickets] = useState<BettingTickets | null>(null);
  const [activeStageView, setActiveStageView] = useState<'STAGE1' | 'STAGE2'>('STAGE2');
  const [isDiagnosing, setIsDiagnosing] = useState(false);

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

  const [simRunId, setSimRunId] = useState(0);
  const svgRef = useRef<SVGSVGElement | null>(null);
  const resultTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (isRacing && svgRef.current) {
      try {
        svgRef.current.setCurrentTime(0);
      } catch (e) {
        console.error(e);
      }
    }
  }, [isRacing, simRunId]);

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
          zenso_chakujun: Number(h.zenso_chakujun ?? 9),
          avg_agari: Number(h.avg_agari ?? 35.0),
          kyakushitsu: Number(h.kyakushitsu ?? 2),
          shussou_kaisuu: Number(h.shussou_kaisuu ?? 0),
          pci: Number(h.pci ?? 50.0),
          pci_type: String(h.pci_type ?? 'B'),
        }));
        setHorses(mappedHorses);

        setCourseType(data.course_type || '芝');
        setDistance(Number(data.distance || 2000));
        setWeather(data.weather || '晴');
        setTrackCondition(data.track_condition || '良');

        const recPace = data.recommended_pace || 'M_JIRIKI';
        setExpectedPace(PACE_SCENARIOS[recPace] ? recPace : 'M_JIRIKI');
        setCourseRpci(data.rpci || 50.0);
        setCourseRpciType(data.rpci_type || 'B');

        setTrackBias(data.auto_track_bias || 'フラット');
        setBiasStrength(data.auto_bias_strength || '中');
        setCushionValue(9.0);

        setTargetRaceName(data.race_name || '');
        setTargetPlace(data.place_name || '');
        setAutoStatus(data.auto_status || null);

        const biasNotice =
          data.auto_status?.bias_status === 'manual_required'
            ? `\n\n${data.auto_status.bias_message}`
            : `\n\n${data.auto_status?.bias_message || ''}`;

        alert(
          `${mappedHorses.length}頭の出馬表と環境データを取得しました！\n\n` +
            `${data.auto_status?.pace_message || ''}` +
            biasNotice +
            `\n\n${data.auto_status?.weight_message || ''}`
        );

        setDiagnosisResults(null);
        setBettingTickets(null);
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
      field === 'condition_reason'
    ) {
      current[field] = value;
    } else {
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
      setDiagnosisResults(data.diagnosis);
      setBettingTickets(data.betting_tickets || null);
      setRaceInfo({
        req_up: data.req_up,
        pace_f: data.pace_f,
        pace_l: data.pace_l,
        rpci: data.rpci,
        rpci_type: data.rpci_type,
      });
    } catch (error) {
      console.error(error);
      alert('エラーが発生しました。');
    } finally {
      setIsDiagnosing(false);
    }
  };

  const handleSimulate = async () => {
    if (resultTimerRef.current) {
      clearTimeout(resultTimerRef.current);
      resultTimerRef.current = null;
    }
    setIsRacing(false);
    setShowResults(false);
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
      setResults(data.ranking);
      setSimRunId((prev) => prev + 1);
      setIsRacing(true);
      resultTimerRef.current = setTimeout(() => {
        setShowResults(true);
      }, 12500);
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

  const currentScenario = PACE_SCENARIOS[expectedPace] || PACE_SCENARIOS.M_JIRIKI;

  const displayedDiagnosis = diagnosisResults
    ? [...diagnosisResults].sort((a, b) =>
        activeStageView === 'STAGE1' ? b.stage1_shisu - a.stage1_shisu : b.shisu - a.shisu
      )
    : null;

  return (
    <main className="min-h-screen bg-gray-900 text-white p-4 md:p-6 font-sans pb-20">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-2xl md:text-3xl font-bold mb-2 text-center text-red-500">
          PRO仕様 競馬本格シミュレーター
        </h1>
        <p className="text-center text-gray-400 mb-8 text-xs md:text-sm font-bold">
          [ 全自動バイアス・展開・体重判定 × 2段階指数(素の地力➔最終) × 3連系フォーメーション自動構築 ]
        </p>

        {/* STEP 1 */}
        <div className="bg-gray-800 p-4 md:p-6 rounded-xl shadow-lg border border-gray-700 mb-6 flex flex-col md:flex-row gap-4 items-end">
          <div className="flex-grow w-full">
            <label className="text-sm text-gray-400 block mb-2 font-bold">
              STEP 1: 🌐 レースIDから出馬表・展開・トラックバイアス・馬体重補正を全自動取得
            </label>
            <input
              type="text"
              value={raceId}
              onChange={(e) => setRaceId(e.target.value)}
              className="w-full bg-gray-900 text-white rounded-lg p-3 md:p-4 focus:outline-none focus:ring-2 focus:ring-blue-500 border border-gray-600 font-mono text-lg"
              placeholder="例: 202605040411"
            />
          </div>
          <button
            onClick={handleFetchRace}
            disabled={fetching}
            className="w-full md:w-auto bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 md:py-4 px-8 rounded-lg shadow-lg transition whitespace-nowrap disabled:opacity-50"
          >
            {fetching ? '環境＆出馬表を解析中...' : '出馬表を取り込む ↓'}
          </button>
        </div>

        {/* STEP 2 */}
        <div className="bg-gray-800 p-4 md:p-6 rounded-xl shadow-lg border border-gray-700 mb-6">
          <h2 className="text-lg md:text-xl font-semibold mb-4 text-gray-300">
            STEP 2: 自動判定ステータス確認 ＆ 2段階全頭診断（地力 ➔ 展開・バイアス加味）
          </h2>

          {targetRaceName && (
            <div className="mb-4 p-4 md:p-5 bg-gray-900 border border-yellow-600/50 rounded-lg shadow-inner flex flex-col md:flex-row items-center justify-between gap-3">
              <div className="flex flex-col w-full">
                <span className="text-yellow-500 font-bold text-xs mb-1 tracking-wider">
                  TARGET RACE
                </span>
                <h3 className="text-xl md:text-2xl font-extrabold text-white leading-tight">
                  {targetRaceName}
                </h3>
              </div>
              <div className="flex flex-wrap gap-2 justify-start md:justify-end w-full md:w-auto">
                <span className="inline-block bg-green-800 text-green-100 font-bold px-3 py-1.5 rounded-full text-xs border border-green-600 shadow-sm whitespace-nowrap">
                  📍 {targetPlace}競馬場 / {courseType}
                  {distance}m
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
          )}

          {/* 自動判定ステータスバー（土曜開催・未確定時の案内含む） */}
          {autoStatus && (
            <div className="mb-6 grid grid-cols-1 gap-2 bg-gray-950 p-3.5 rounded-xl border border-gray-700 text-xs">
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

          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 md:gap-4 mb-4">
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
                onChange={(e) => setTrackCondition(e.target.value)}
                className="w-full bg-gray-900 text-white rounded p-2 border border-gray-600 focus:outline-none focus:ring-1 focus:ring-green-500 text-sm md:text-base"
              >
                <option value="良">良</option>
                <option value="稍">稍重</option>
                <option value="重">重</option>
                <option value="不">不良</option>
              </select>
            </div>
            <div className="col-span-2 md:col-span-1">
              <label className="text-[10px] md:text-xs text-emerald-400 font-bold block mb-1">
                クッション値
              </label>
              <input
                type="number"
                step="0.1"
                value={cushionValue}
                onChange={(e) => setCushionValue(Number(e.target.value))}
                className="w-full bg-emerald-950 text-white font-bold rounded p-2 border border-emerald-600 focus:outline-none focus:ring-1 focus:ring-emerald-500 text-sm md:text-base"
                placeholder="例: 10.6"
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
            {horses.map((horse, index) => (
              <div
                key={index}
                className="bg-gray-900 p-3 md:p-4 rounded-lg border border-gray-700 flex gap-2 md:gap-3 items-center flex-wrap md:flex-nowrap"
              >
                <div
                  className={`w-7 h-7 md:w-8 md:h-8 flex items-center justify-center font-bold text-sm md:text-base rounded-full shadow-md flex-shrink-0 ${getHorseColor(horse.wakuban || horse.umaban)}`}
                  title={`枠番: ${horse.wakuban} / 馬番: ${horse.umaban}`}
                >
                  {horse.umaban}
                </div>
                <div className="flex-grow flex flex-col gap-1.5 w-full">
                  <div className="flex flex-wrap md:flex-nowrap gap-1.5 items-center">
                    <input
                      type="text"
                      value={horse.bamei}
                      onChange={(e) => handleChange(index, 'bamei', e.target.value)}
                      placeholder="馬名"
                      className="w-[42%] md:w-40 bg-gray-700 text-white font-bold rounded p-1.5 text-xs md:text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                    <input
                      type="text"
                      value={horse.kishu}
                      onChange={(e) => handleChange(index, 'kishu', e.target.value)}
                      placeholder="騎手"
                      className="w-[28%] md:w-24 bg-gray-700 text-blue-200 font-bold rounded p-1.5 text-xs md:text-sm border border-blue-800/50 focus:outline-none"
                    />
                    <div className="w-[25%] md:w-20 relative">
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
                      className="w-[30%] md:w-16 bg-purple-900 text-purple-200 text-[10px] md:text-xs font-bold rounded p-1.5 border border-purple-700 focus:outline-none"
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
                        className={`w-8 bg-transparent font-bold text-xs text-center focus:outline-none ${horse.weight_change > 0 ? 'text-red-400' : horse.weight_change < 0 ? 'text-blue-400' : 'text-gray-300'}`}
                      />
                      <span className="text-[10px] text-gray-500">)</span>
                    </div>

                    <select
                      value={horse.condition_override}
                      onChange={(e) => handleChange(index, 'condition_override', e.target.value)}
                      className={`w-[45%] md:w-36 text-[10px] md:text-xs font-bold rounded p-1.5 border focus:outline-none ${horse.condition_override === '1.00' ? 'bg-gray-800 text-gray-400 border-gray-700' : Number(horse.condition_override) > 1.0 ? 'bg-green-900/50 text-green-300 border-green-600' : 'bg-red-900/50 text-red-300 border-red-600'}`}
                    >
                      <option value="1.05">↑ 究極仕上げ (1.05倍)</option>
                      <option value="1.04">↑ 太め解消 (1.04倍)</option>
                      <option value="1.03">↑ 成長分 (1.03倍)</option>
                      <option value="1.00">- 通常 (補正なし)</option>
                      <option value="0.92">↓ 太め残り (0.92倍)</option>
                      <option value="0.90">↓ 仕上げ途上 (0.90倍)</option>
                      <option value="0.88">↓ 輸送細化 (0.88倍)</option>
                      <option value="0.85">↓ パドック減点 (0.85倍)</option>
                    </select>
                  </div>
                  {horse.condition_reason && (
                    <div className="text-[10px] text-gray-400 pl-1">
                      💡 自動判定根拠: <span className="text-gray-300">{horse.condition_reason}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* 2段階診断実行ボタン群 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-6">
            <button
              onClick={() => runDiagnosisWithMode('STAGE1')}
              disabled={isDiagnosing || horses.length < 2}
              className="w-full bg-slate-700 hover:bg-slate-600 text-white font-bold py-3 md:py-4 px-4 rounded-lg shadow-lg border border-slate-500 text-xs md:text-sm transition duration-200 disabled:opacity-50"
            >
              {isDiagnosing
                ? '分析中...'
                : '🔍 第1段階：枠・バイアス・体重抜きの『素の地力全頭診断 (Stage 1)』'}
            </button>
            <button
              onClick={() => runDiagnosisWithMode('STAGE2')}
              disabled={isDiagnosing || horses.length < 2}
              className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 md:py-4 px-4 rounded-lg shadow-lg text-xs md:text-base transition duration-200 disabled:opacity-50"
            >
              {isDiagnosing
                ? '分析中...'
                : '📊 第2段階：枠・バイアス・体重・展開を加味して最終診断 ＆ 推奨馬券出力！'}
            </button>
          </div>
        </div>

        {/* STEP 3: 診断結果 ＆ 推奨馬券パネル */}
        {displayedDiagnosis && raceInfo && (
          <div className="bg-gray-800 p-4 md:p-6 rounded-xl shadow-lg border border-gray-700 mb-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 mb-4">
              <h2 className="text-xl md:text-2xl font-bold text-indigo-400">
                STEP 3: 📊 2段階AI全頭診断 ＆ 推奨馬券出力レポート
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
                  ② 展開・バイアス加味順 (Stage 2)
                </button>
              </div>
            </div>

            <div className="flex flex-col md:flex-row justify-center items-center gap-2 md:gap-5 text-xs md:text-sm font-bold text-red-400 mb-6 bg-gray-900 p-3 md:p-4 rounded-lg border border-gray-700">
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

            {/* 🎫 推奨馬券パネル（全5種・7パターン） */}
            {bettingTickets && (
              <div className="mb-8 bg-gray-950 border-2 border-indigo-500/70 rounded-xl p-4 md:p-6 shadow-xl">
                <h3 className="text-base md:text-lg font-extrabold text-yellow-400 mb-4 flex items-center gap-2 border-b border-gray-800 pb-2">
                  🎯 2段階指数ロジックによる自動構築フォーメーション ＆ 推奨買い目
                </h3>

                {/* 4役割の分類サマリー */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-6 text-xs">
                  <div className="bg-yellow-950/40 border border-yellow-600/60 rounded-lg p-3">
                    <div className="text-yellow-400 font-bold mb-1.5">👑 1列目（不動の1着軸）</div>
                    {bettingTickets.formation_groups.axis_1st.map((h) => (
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
                      {bettingTickets.formation_groups.main_2nd.map((h) => (
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
                      🛡️ 3列目追加（地力上位の救済ヒモ）
                    </div>
                    <div className="flex flex-col gap-1">
                      {bettingTickets.formation_groups.saver_3rd.length > 0 ? (
                        bettingTickets.formation_groups.saver_3rd.map((h) => (
                          <div key={h.umaban} className="font-bold text-white">
                            {h.umaban}番 {h.bamei}{' '}
                            <span className="text-[10px] text-emerald-300">
                              (地力{h.stage1_rank}位:{h.stage1_shisu} ➔ 最終:{h.shisu})
                            </span>
                          </div>
                        ))
                      ) : (
                        <span className="text-gray-500">該当なし（2列目馬で完結）</span>
                      )}
                    </div>
                  </div>

                  <div className="bg-red-950/40 border border-red-600/60 rounded-lg p-3">
                    <div className="text-red-400 font-bold mb-1.5">
                      💀 完全消し（持ち時計不足・大幅減）
                    </div>
                    <div className="flex flex-col gap-1 max-h-24 overflow-y-auto">
                      {bettingTickets.formation_groups.eliminated.length > 0 ? (
                        bettingTickets.formation_groups.eliminated.map((h) => (
                          <div key={h.umaban} className="text-gray-300 font-bold">
                            {h.umaban}番 {h.bamei}{' '}
                            <span className="text-[10px] text-red-300">({h.odds}倍)</span>
                          </div>
                        ))
                      ) : (
                        <span className="text-gray-500">時計不足の該当馬なし</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* 全5種・7パターンの馬券出力テーブル */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs md:text-sm">
                  {/* 単勝・複勝・ワイド */}
                  <div className="bg-gray-900 border border-gray-700 rounded-lg p-3.5 flex flex-col gap-3">
                    <div>
                      <div className="flex justify-between items-center font-bold text-amber-400 border-b border-gray-800 pb-1 mb-1.5">
                        <span>① 単勝</span>
                        <span className="text-xs bg-amber-900/40 px-2 py-0.5 rounded">
                          計 {bettingTickets.tansho.count} 点
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {bettingTickets.tansho.picks.map((p) => (
                          <span
                            key={p.umaban}
                            className="bg-gray-800 border border-gray-600 px-2.5 py-1 rounded font-bold text-white"
                          >
                            {p.type}: <span className="text-yellow-300">{p.umaban}番</span> {p.bamei}{' '}
                            ({p.odds}倍)
                          </span>
                        ))}
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between items-center font-bold text-sky-400 border-b border-gray-800 pb-1 mb-1.5">
                        <span>② 複勝</span>
                        <span className="text-xs bg-sky-900/40 px-2 py-0.5 rounded">
                          計 {bettingTickets.fukusho.count} 点
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {bettingTickets.fukusho.picks.map((p) => (
                          <span
                            key={p.umaban}
                            className="bg-gray-800 border border-gray-600 px-2.5 py-1 rounded font-bold text-white"
                          >
                            {p.type}: <span className="text-sky-300">{p.umaban}番</span> {p.bamei}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between items-center font-bold text-pink-400 border-b border-gray-800 pb-1 mb-1.5">
                        <span>③ ワイド（1着軸 ➔ 相手本線流し）</span>
                        <span className="text-xs bg-pink-900/40 px-2 py-0.5 rounded">
                          計 {bettingTickets.wide.count} 点
                        </span>
                      </div>
                      <div className="font-mono font-bold text-white">
                        軸: <span className="text-yellow-300">{bettingTickets.wide.axis}番</span> ➔
                        相手: {bettingTickets.wide.targets.join(', ')}番
                      </div>
                      <div className="text-[11px] text-gray-400 mt-1">
                        買い目: {bettingTickets.wide.combos.join(' / ')}
                      </div>
                    </div>
                  </div>

                  {/* 3連複（1頭軸流し ＆ フォーメーション） */}
                  <div className="bg-gray-900 border border-gray-700 rounded-lg p-3.5 flex flex-col gap-3">
                    <div>
                      <div className="flex justify-between items-center font-bold text-emerald-400 border-b border-gray-800 pb-1 mb-1.5">
                        <span>④ 3連複（フォーメーション）【推奨】</span>
                        <span className="text-xs bg-emerald-900/40 px-2 py-0.5 rounded">
                          計 {bettingTickets.sanrenpuku_formation.count} 点
                        </span>
                      </div>
                      <div className="font-mono text-xs leading-relaxed text-gray-200">
                        <div>
                          1列目(軸):{' '}
                          <span className="text-yellow-300 font-bold">
                            {bettingTickets.sanrenpuku_formation.row1.join(', ')}
                          </span>
                        </div>
                        <div>
                          2列目(本線):{' '}
                          <span className="text-indigo-300 font-bold">
                            {bettingTickets.sanrenpuku_formation.row2.join(', ')}
                          </span>
                        </div>
                        <div>
                          3列目(本線+地力救済):{' '}
                          <span className="text-emerald-300 font-bold">
                            {bettingTickets.sanrenpuku_formation.row3.join(', ')}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between items-center font-bold text-teal-400 border-b border-gray-800 pb-1 mb-1.5">
                        <span>⑤ 3連複（1頭軸流し）</span>
                        <span className="text-xs bg-teal-900/40 px-2 py-0.5 rounded">
                          計 {bettingTickets.sanrenpuku_nagashi.count} 点
                        </span>
                      </div>
                      <div className="font-mono text-xs text-gray-200">
                        軸:{' '}
                        <span className="text-yellow-300 font-bold">
                          {bettingTickets.sanrenpuku_nagashi.axis}
                        </span>{' '}
                        ー 相手: {bettingTickets.sanrenpuku_nagashi.targets.join(', ')}
                      </div>
                    </div>
                  </div>

                  {/* 3連単（フォーメーション ＆ 1着固定流し） */}
                  <div className="md:col-span-2 bg-gradient-to-r from-indigo-950/60 to-purple-950/60 border border-indigo-400/70 rounded-lg p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <div className="flex justify-between items-center font-extrabold text-yellow-300 border-b border-indigo-700 pb-1.5 mb-2">
                        <span>⑥ 3連単（フォーメーション）【勝負馬券】</span>
                        <span className="text-xs bg-yellow-500 text-gray-900 font-black px-2.5 py-0.5 rounded">
                          計 {bettingTickets.sanrentan_formation.count} 点
                        </span>
                      </div>
                      <div className="font-mono text-xs md:text-sm space-y-1">
                        <div>
                          1着固定(頭):{' '}
                          <span className="text-yellow-300 font-extrabold">
                            {bettingTickets.sanrentan_formation.first.join(', ')}番
                          </span>
                        </div>
                        <div>
                          2着(バイアス本線):{' '}
                          <span className="text-pink-300 font-extrabold">
                            {bettingTickets.sanrentan_formation.second.join(', ')}番
                          </span>
                        </div>
                        <div>
                          3着(本線＋地力救済):{' '}
                          <span className="text-emerald-300 font-extrabold">
                            {bettingTickets.sanrentan_formation.third.join(', ')}番
                          </span>
                        </div>
                      </div>
                      <div className="mt-2 text-[11px] text-gray-300 font-mono bg-black/40 p-2 rounded max-h-20 overflow-y-auto">
                        {bettingTickets.sanrentan_formation.combos.join(' / ')}
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between items-center font-extrabold text-purple-300 border-b border-indigo-700 pb-1.5 mb-2">
                        <span>⑦ 3連単（1頭軸流し・1着固定）</span>
                        <span className="text-xs bg-purple-800 text-white font-bold px-2.5 py-0.5 rounded">
                          計 {bettingTickets.sanrentan_nagashi.count} 点
                        </span>
                      </div>
                      <div className="font-mono text-xs md:text-sm space-y-1">
                        <div>
                          1着固定(頭):{' '}
                          <span className="text-yellow-300 font-extrabold">
                            {bettingTickets.sanrentan_nagashi.first}番
                          </span>
                        </div>
                        <div>
                          2・3着流し相手:{' '}
                          <span className="text-white font-bold">
                            {bettingTickets.sanrentan_nagashi.targets.join(', ')}番
                          </span>
                        </div>
                      </div>
                      <div className="mt-2 text-[11px] text-gray-400">
                        ※地力救済馬（バイアス被害の実力馬）が2着まで食い込むケースも丸ごとカバーする1着固定流しです。
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 各馬の2段階指数カード一覧 */}
            <div className="grid md:grid-cols-2 gap-4">
              {displayedDiagnosis.map((horse, index) => {
                const matchLabel = getScenarioMatchLabel(horse);
                const roleBadgeColor =
                  horse.role_code === 'AXIS_1ST'
                    ? 'bg-yellow-500 text-gray-950'
                    : horse.role_code === 'MAIN_2ND'
                      ? 'bg-pink-600 text-white'
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
                          : horse.role_code === 'SAVER_3RD'
                            ? 'border-emerald-500/80'
                            : horse.role_code === 'ELIMINATED'
                              ? 'border-red-800/70 opacity-75'
                              : 'border-gray-700'
                    }`}
                  >
                    {horse.role_label && (
                      <div
                        className={` existing-badge absolute top-0 right-0 text-[9px] md:text-[10px] font-bold px-2.5 py-1 rounded-bl-lg shadow-md ${roleBadgeColor}`}
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
                          <span className="text-base md:text-lg font-bold">{horse.bamei}</span>
                          {horse.odds > 0 && (
                            <span className="text-xs font-mono text-yellow-400 font-bold">
                              ({horse.odds}倍)
                            </span>
                          )}
                        </div>
                        <div className="flex flex-wrap items-center gap-1.5 mt-0.5">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold border ${getPciBadgeStyle(horse.pci_type)}`}
                          >
                            好走PCI: {horse.pci} ({getPciLabelText(horse.pci_type)})
                          </span>
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold border border-gray-600 bg-gray-800 text-gray-300">
                            {horse.bataijuu}kg (
                            {horse.weight_change > 0
                              ? `+${horse.weight_change}`
                              : horse.weight_change}
                            )
                          </span>
                          {horse.time_limit_mult !== undefined && horse.time_limit_mult <= 0.88 && (
                            <span className="bg-red-900/80 text-red-200 border border-red-500 text-[10px] font-bold px-1.5 py-0.5 rounded">
                              ⚠️ 時計壁減点 ({horse.time_limit_mult}倍)
                            </span>
                          )}
                          {matchLabel && (
                            <span className="bg-yellow-500/20 text-yellow-300 border border-yellow-500/50 text-[10px] font-bold px-1.5 py-0.5 rounded">
                              {matchLabel}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex gap-2.5 md:gap-3.5 text-right items-end">
                        {/* Stage 1: 素の地力指数 */}
                        <div className="flex flex-col items-end border-r border-gray-700 pr-2.5">
                          <div className="text-[9px] md:text-[10px] text-slate-400 font-bold">
                            ①素の地力 ({horse.stage1_rank}位)
                          </div>
                          <div className="text-base md:text-lg font-bold text-slate-200 font-mono">
                            {horse.stage1_shisu.toFixed(1)}
                          </div>
                        </div>

                        {/* 妙味指数 */}
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

                        {/* Stage 2: 最終指数 */}
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
                  </div>
                );
              })}
            </div>

            <button
              onClick={handleSimulate}
              disabled={loading}
              className="w-full bg-red-600 hover:bg-red-500 text-white font-bold py-3 md:py-4 rounded-lg mt-6 md:mt-8 shadow-[0_0_15px_rgba(220,38,38,0.5)] text-sm md:text-lg transition duration-200 disabled:opacity-50"
            >
              {loading ? 'レースを生成中...' : '🏁 最終パラメータを加味してシミュレーション開始'}
            </button>
          </div>
        )}

        {isRacing && results && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-2 md:p-4">
            <div className="relative w-full max-w-4xl max-h-[95vh] overflow-y-auto bg-gray-900 rounded-2xl border border-gray-600 shadow-2xl p-4 md:p-6">
              <button
                onClick={() => {
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
              <h3 className="text-center font-bold text-gray-300 mb-3 md:mb-4 tracking-widest text-lg md:text-xl">
                【 RACE TRACKING 】
              </h3>
              <div className="relative w-full mx-auto bg-[#1b4332] rounded-xl overflow-hidden shadow-inner border-2 border-gray-700">
                <svg
                  key={`race-svg-${simRunId}`}
                  ref={svgRef}
                  viewBox="0 0 800 300"
                  className="w-full h-auto block"
                  preserveAspectRatio="xMidYMid meet"
                >
                  <rect width="800" height="300" fill="#2d6a4f" />
                  <path
                    d="M 500 250 L 700 250 A 100 100 0 0 0 700 50 L 100 50 A 100 100 0 0 0 100 250 Z"
                    fill="#1b4332"
                    stroke="#d4a373"
                    strokeWidth="46"
                  />
                  <path
                    d="M 500 250 L 700 250 A 100 100 0 0 0 700 50 L 100 50 A 100 100 0 0 0 100 250 Z"
                    fill="none"
                    stroke="#ffffff"
                    strokeWidth="2"
                    strokeDasharray="4 8"
                    opacity="0.8"
                  />
                  <line
                    x1="500"
                    y1="227"
                    x2="500"
                    y2="273"
                    stroke="#ef4444"
                    strokeWidth="6"
                    opacity="0.9"
                  />
                  <text
                    x="500"
                    y="290"
                    fill="white"
                    fontSize="14"
                    fontWeight="bold"
                    textAnchor="middle"
                    opacity="0.9"
                  >
                    GOAL
                  </text>
                  {results.map((result) => {
                    const horse = horses.find((h) => h.umaban === result.umaban);
                    const kyakushitsu = horse ? horse.kyakushitsu : 2;
                    let p1 = 0;
                    let p2 = 0;
                    if (kyakushitsu === 1) p1 = 0.37;
                    else if (kyakushitsu === 2) p1 = 0.345;
                    else if (kyakushitsu === 3) p1 = 0.335;
                    else p1 = 0.325;
                    p1 += Math.random() * 0.012 - 0.006;
                    if (kyakushitsu === 1) p2 = 0.72;
                    else if (kyakushitsu === 2) p2 = 0.7;
                    else if (kyakushitsu === 3) p2 = 0.69;
                    else p2 = 0.68;
                    p2 += Math.random() * 0.012 - 0.006;
                    const duration = 12 + result.rank * 0.12 + Math.random() * 0.1;
                    const colors = getHorseSvgColors(result.umaban);
                    const pathString =
                      'M 500 250 L 700 250 A 100 100 0 0 0 700 50 L 100 50 A 100 100 0 0 0 100 250 Z';
                    return (
                      <g key={`horse-${simRunId}-${result.umaban}`} className="drop-shadow-lg">
                        <animateMotion
                          begin="0s"
                          dur={`${duration}s`}
                          fill="freeze"
                          keyTimes="0; 0.35; 0.7; 1"
                          keyPoints={`0; ${p1}; ${p2}; 1`}
                          calcMode="linear"
                          path={pathString}
                        />
                        <circle
                          cx="0"
                          cy="0"
                          r="14"
                          fill={colors.bg}
                          stroke={colors.border}
                          strokeWidth="2"
                        />
                        <text
                          x="0"
                          y="5"
                          fontSize="14"
                          fontWeight="bold"
                          textAnchor="middle"
                          fill={colors.text}
                        >
                          {result.umaban}
                        </text>
                      </g>
                    );
                  })}
                </svg>
                {showResults && (
                  <div
                    className="absolute inset-0 bg-black/85 z-40 flex flex-col items-center justify-center p-2 md:p-4"
                    style={{ animation: 'popIn 0.5s ease-out forwards' }}
                  >
                    <h3 className="text-2xl md:text-3xl font-black text-yellow-400 mb-3 md:mb-4 tracking-widest">
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
                          {results.slice(0, 5).map((r) => (
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
                    </div>
                  </div>
                )}
              </div>
              <div
                className={`mt-4 md:mt-6 grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-4 transition-opacity duration-1000 ${showResults ? 'opacity-100' : 'opacity-0 h-0 overflow-hidden'}`}
              >
                {results.map((result, index) => (
                  <div
                    key={index}
                    className={`flex flex-col p-2 md:p-3 rounded-xl border ${result.rank === 1 ? 'bg-yellow-900/40 border-yellow-500 shadow-[0_0_10px_rgba(234,179,8,0.2)]' : result.rank <= 3 ? 'bg-gray-800 border-gray-500' : 'bg-gray-900 border-gray-800'}`}
                  >
                    <div className="flex items-center gap-1.5 md:gap-2">
                      <span
                        className={`text-sm md:text-lg font-extrabold ${result.rank === 1 ? 'text-yellow-400' : result.rank === 2 ? 'text-gray-300' : result.rank === 3 ? 'text-orange-400' : 'text-gray-600'}`}
                      >
                        {result.rank}着
                      </span>
                      <div
                        className={`w-5 h-5 md:w-6 md:h-6 flex items-center justify-center font-bold text-[9px] md:text-[10px] rounded-full border flex-shrink-0 ${getHorseColor(result.umaban)}`}
                      >
                        {result.umaban}
                      </div>
                      <span className="text-xs md:text-sm font-bold text-gray-200 truncate flex-grow">
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
