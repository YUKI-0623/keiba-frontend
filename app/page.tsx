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
  zenso_chakujun: number;
  avg_agari: number;
  kyakushitsu: number;
  shussou_kaisuu: number;
}

interface HistoryDetail {
  race_name: string;
  rank: string;
  time: string;
  up: string;
  passing: string; 
}

interface DiagnosisResult {
  umaban: number;
  bamei: string;
  odds: number;
  shisu: number;
  myoumi: number; 
  time_diff: number;
  history_details: HistoryDetail[];
}

interface RaceResult {
  umaban: number;
  bamei: string;
  shisu: number;
  time_diff: number;
  rank: number;
}

export default function Home() {
  const [raceId, setRaceId] = useState('202305021211');
  const [fetching, setFetching] = useState(false);

  const [targetRaceName, setTargetRaceName] = useState('');
  const [targetPlace, setTargetPlace] = useState('');

  const [courseType, setCourseType] = useState('芝');
  const [distance, setDistance] = useState(2400);
  const [weather, setWeather] = useState('晴');
  const [trackCondition, setTrackCondition] = useState('良');
  const [expectedPace, setExpectedPace] = useState('M');
  const [trackBias, setTrackBias] = useState('フラット'); 

  const [horses, setHorses] = useState<HorseData[]>([
    { wakuban: 1, umaban: 1, bamei: '馬名を入力', kishu: '騎手', odds: 0.0, kinryou: 55, bataijuu: 480, zenso_chakujun: 9, avg_agari: 35.0, kyakushitsu: 2, shussou_kaisuu: 0 },
  ]);

  const [diagnosisResults, setDiagnosisResults] = useState<DiagnosisResult[] | null>(null);
  const [isDiagnosing, setIsDiagnosing] = useState(false);

  const [results, setResults] = useState<RaceResult[] | null>(null);
  const [raceInfo, setRaceInfo] = useState<{req_up: number, pace_f: number, pace_l: number} | null>(null);
  
  const [loading, setLoading] = useState(false);
  const [isRacing, setIsRacing] = useState(false);
  const [showResults, setShowResults] = useState(false); 
  const [animationStyles, setAnimationStyles] = useState(''); 

  // ▼▼ ここから追加：スマホ画面リサイズ対応のための設定 ▼▼
  const trackContainerRef = useRef<HTMLDivElement>(null);
  const [trackScale, setTrackScale] = useState(1);

  useEffect(() => {
    if (!isRacing) return;
    const updateScale = () => {
      if (trackContainerRef.current) {
        // コンテナの幅を取得し、800px未満なら自動的に縮小率を計算する
        const availableWidth = trackContainerRef.current.clientWidth;
        setTrackScale(availableWidth < 800 ? availableWidth / 800 : 1);
      }
    };
    updateScale();
    // 画面表示直後のズレを防ぐため、少し待ってから再計算
    const timer = setTimeout(updateScale, 100);
    window.addEventListener('resize', updateScale);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', updateScale);
    };
  }, [isRacing]);
  // ▲▲ 追加ここまで ▲▲

  const handleFetchRace = async () => {
    if (!raceId) {
      alert("レースIDを入力してください");
      return;
    }
    
    setFetching(true);
    try {
      const response = await fetch(`https://keiba-api-hybt.onrender.com/fetch_race/${raceId}`);
      if (!response.ok) throw new Error('通信エラー');
      
      const data = await response.json();
      if (data.status === 'success') {
        setHorses(data.horses);
        setCourseType(data.course_type);
        setDistance(data.distance);
        setWeather(data.weather || '晴');
        setTrackCondition(data.track_condition);
        setExpectedPace('M'); 
        setTrackBias('フラット'); 
        
        setTargetRaceName(data.race_name);
        setTargetPlace(data.place_name);

        alert(`${data.horses.length}頭のデータを取得しました。`);
        setDiagnosisResults(null); 
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
    if (field === 'bamei' || field === 'kishu') {
      newHorses[index][field] = value as never;
    } else {
      newHorses[index][field] = (parseFloat(value) || 0) as never;
    }
    setHorses(newHorses);
  };

  const addHorse = () => {
    const newUmaban = horses.length + 1;
    setHorses([...horses, { wakuban: 1, umaban: newUmaban, bamei: '', kishu: '', odds: 0.0, kinryou: 55, bataijuu: 480, zenso_chakujun: 9, avg_agari: 35.0, kyakushitsu: 2, shussou_kaisuu: 0 }]);
  };

  const handleDiagnose = async () => {
    setIsDiagnosing(true);
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
          track_bias: trackBias
        }),
      });

      if (!response.ok) throw new Error('API通信エラー');

      const data = await response.json();
      setDiagnosisResults(data.diagnosis);
      setRaceInfo({ req_up: data.req_up, pace_f: data.pace_f, pace_l: data.pace_l });
      
    } catch (error) {
      console.error(error);
      alert('エラーが発生しました。');
    } finally {
      setIsDiagnosing(false);
    }
  };

  const generateTrackingAnimations = (ranking: RaceResult[], currentHorses: HorseData[]) => {
    let styles = `
      @keyframes popIn {
        from { opacity: 0; transform: scale(0.95); }
        to { opacity: 1; transform: scale(1); }
      }
    `;
    
    ranking.forEach((result) => {
      const horse = currentHorses.find(h => h.umaban === result.umaban);
      const kyakushitsu = horse ? horse.kyakushitsu : 2;

      let p1 = 0; let p2 = 0;
      
      if (kyakushitsu == 1) p1 = 37.0; 
      else if (kyakushitsu == 2) p1 = 34.5; 
      else if (kyakushitsu == 3) p1 = 33.5; 
      else p1 = 32.5; 
      p1 += (Math.random() * 1.2 - 0.6); 

      if (kyakushitsu == 1) p2 = 72.0; 
      else if (kyakushitsu == 2) p2 = 70.0;
      else if (kyakushitsu == 3) p2 = 69.0;
      else p2 = 68.0;
      p2 += (Math.random() * 1.2 - 0.6);

      const finalPos = 105; 

      styles += `
        @keyframes tracking-${result.umaban} {
          0% { offset-distance: 0%; }
          35% { offset-distance: ${p1}%; }
          70% { offset-distance: ${p2}%; }
          100% { offset-distance: ${finalPos}%; }
        }
      `;
    });
    return styles;
  };

  const handleSimulate = async () => {
    setLoading(true);
    setShowResults(false);

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
          track_bias: trackBias 
        }),
      });

      if (!response.ok) throw new Error('API通信エラー');

      const data = await response.json();
      
      const generatedStyles = generateTrackingAnimations(data.ranking, horses);
      setAnimationStyles(generatedStyles);
      setResults(data.ranking);
      
      setIsRacing(true);
      
      setTimeout(() => {
        setShowResults(true);
      }, 12500);

    } catch (error) {
      console.error(error);
      alert('エラーが発生しました。');
    } finally {
      setLoading(false);
    }
  };

  const getHorseColor = (umaban: number) => {
    const colors = [
      'bg-white text-gray-900 border-gray-300',
      'bg-gray-900 text-white border-gray-700',
      'bg-red-600 text-white border-red-800',
      'bg-blue-600 text-white border-blue-800',
      'bg-yellow-400 text-gray-900 border-yellow-600',
      'bg-green-600 text-white border-green-800',
      'bg-orange-500 text-white border-orange-700',
      'bg-pink-400 text-gray-900 border-pink-600'
    ];
    return colors[(umaban - 1) % 8] || 'bg-gray-500 text-white';
  };

  return (
    <main className="min-h-screen bg-gray-900 text-white p-6 font-sans pb-20">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold mb-2 text-center text-red-500">PRO仕様 競馬本格シミュレーター</h1>
        <p className="text-center text-gray-400 mb-8 text-sm font-bold">
          [ 展開 × トラックバイアス × 騎手適性 × オッズ期待値 ]
        </p>

        <div className="bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-700 mb-6 flex flex-col md:flex-row gap-4 items-end">
          <div className="flex-grow w-full">
            <label className="text-sm text-gray-400 block mb-2 font-bold">
              STEP 1: 🌐 ネットから出馬表と環境データを自動取得
            </label>
            <input 
              type="text" 
              value={raceId} 
              onChange={e => setRaceId(e.target.value)} 
              className="w-full bg-gray-900 text-white rounded-lg p-4 focus:outline-none focus:ring-2 focus:ring-blue-500 border border-gray-600 font-mono text-lg"
              placeholder="例: 202305021211" 
            />
          </div>
          <button 
            onClick={handleFetchRace} 
            disabled={fetching} 
            className="w-full md:w-auto bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 px-8 rounded-lg shadow-lg transition whitespace-nowrap disabled:opacity-50"
          >
            {fetching ? '通信中...' : '出馬表を取り込む ↓'}
          </button>
        </div>

        <div className="bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-700 mb-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-300">STEP 2: レース環境 ＆ 展開・バイアス設定</h2>
          
          {targetRaceName && (
            <div className="mb-6 p-5 bg-gray-900 border border-yellow-600/50 rounded-lg shadow-inner flex flex-col md:flex-row items-center justify-between">
              <div className="flex flex-col">
                <span className="text-yellow-500 font-bold text-xs mb-1 tracking-wider">TARGET RACE</span>
                <h3 className="text-2xl font-extrabold text-white">{targetRaceName}</h3>
              </div>
              <div className="mt-3 md:mt-0 text-right">
                <span className="inline-block bg-green-800 text-green-100 font-bold px-4 py-2 rounded-full text-sm border border-green-600 shadow-sm">
                  📍 {targetPlace}競馬場 / {courseType}{distance}m
                </span>
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <div>
              <label className="text-sm text-gray-400 block mb-1">コース</label>
              <select value={courseType} onChange={e => setCourseType(e.target.value)} className="w-full bg-gray-900 text-white rounded p-2.5 border border-gray-600 focus:outline-none focus:ring-1 focus:ring-green-500">
                <option value="芝">芝</option><option value="ダ">ダート</option><option value="障">障害</option>
              </select>
            </div>
            <div>
              <label className="text-sm text-gray-400 block mb-1">距離 (m)</label>
              <input type="number" step="100" value={distance} onChange={e => setDistance(Number(e.target.value))} className="w-full bg-gray-900 text-white rounded p-2.5 border border-gray-600 focus:outline-none focus:ring-1 focus:ring-green-500" />
            </div>
            <div>
              <label className="text-sm text-gray-400 block mb-1">天候</label>
              <select value={weather} onChange={e => setWeather(e.target.value)} className="w-full bg-gray-900 text-white rounded p-2.5 border border-gray-600 focus:outline-none focus:ring-1 focus:ring-green-500">
                <option value="晴">晴</option><option value="曇">曇</option><option value="雨">雨</option><option value="小雨">小雨</option><option value="雪">雪</option><option value="小雪">小雪</option>
              </select>
            </div>
            <div>
              <label className="text-sm text-gray-400 block mb-1">馬場状態</label>
              <select value={trackCondition} onChange={e => setTrackCondition(e.target.value)} className="w-full bg-gray-900 text-white rounded p-2.5 border border-gray-600 focus:outline-none focus:ring-1 focus:ring-green-500">
                <option value="良">良</option><option value="稍">稍重 (稍)</option><option value="重">重</option><option value="不">不良 (不)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 bg-gray-900 p-4 rounded-lg border border-gray-700">
            <div>
              <label className="text-sm text-orange-400 font-bold block mb-1">予想ペース (展開)</label>
              <select value={expectedPace} onChange={e => setExpectedPace(e.target.value)} className="w-full bg-orange-900 text-white font-bold rounded p-2.5 border border-orange-600 focus:outline-none focus:ring-1 focus:ring-orange-500 shadow-[0_0_10px_rgba(234,88,12,0.3)]">
                <option value="H">ハイペース (前がキツくなる)</option>
                <option value="M">ミドルペース (標準)</option>
                <option value="S">スローペース (前が楽になる)</option>
              </select>
            </div>
            <div>
              <label className="text-sm text-pink-400 font-bold block mb-1">トラックバイアス (馬場傾向)</label>
              <select value={trackBias} onChange={e => setTrackBias(e.target.value)} className="w-full bg-pink-900 text-white font-bold rounded p-2.5 border border-pink-600 focus:outline-none focus:ring-1 focus:ring-pink-500 shadow-[0_0_10px_rgba(219,39,119,0.3)]">
                <option value="フラット">フラット (標準)</option>
                <option value="前残り (逃げ・先行有利)">前残り (逃げ・先行有利)</option>
                <option value="差し有利 (外伸び)">差し有利 (外伸び)</option>
                <option value="内枠有利 (インベタ)">内枠有利 (イン前)</option>
                <option value="外枠有利">外枠有利</option>
              </select>
            </div>
          </div>
          
          <div className="grid md:grid-cols-2 gap-4">
            {horses.map((horse, index) => (
              <div key={index} className="bg-gray-900 p-4 rounded-lg border border-gray-700 flex gap-4 items-start">
                <div className={`mt-1 w-8 h-8 flex items-center justify-center font-bold rounded-full shadow-md flex-shrink-0 ${getHorseColor(horse.umaban)}`}>
                  {horse.umaban}
                </div>
                <div className="flex-grow flex flex-col gap-2 w-full">
                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      value={horse.bamei} 
                      onChange={(e) => handleChange(index, 'bamei', e.target.value)} 
                      placeholder="馬名"
                      className="w-1/3 bg-gray-700 text-white font-bold rounded p-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500" 
                    />
                    <input 
                      type="text" 
                      value={horse.kishu} 
                      onChange={(e) => handleChange(index, 'kishu', e.target.value)} 
                      placeholder="騎手"
                      className="w-1/4 bg-gray-700 text-blue-200 font-bold rounded p-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 border border-blue-800/50" 
                    />
                    <div className="w-1/5 relative">
                      <input 
                        type="number" 
                        step="0.1"
                        value={horse.odds || ''} 
                        onChange={(e) => handleChange(index, 'odds', e.target.value)} 
                        placeholder="オッズ"
                        className="w-full bg-gray-700 text-yellow-300 font-bold rounded p-1.5 pr-4 text-sm focus:outline-none focus:ring-1 focus:ring-yellow-500 border border-yellow-800/50 text-right" 
                      />
                      <span className="absolute right-1 top-2 text-[10px] text-yellow-500">倍</span>
                    </div>
                    <select 
                      value={horse.kyakushitsu} 
                      onChange={(e) => handleChange(index, 'kyakushitsu', e.target.value)} 
                      className="w-1/5 bg-purple-900 text-purple-200 text-xs font-bold rounded p-1 focus:outline-none border border-purple-700"
                    >
                      <option value="1">逃げ</option>
                      <option value="2">先行</option>
                      <option value="3">差し</option>
                      <option value="4">追込</option>
                    </select>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-2 text-xs text-yellow-400 font-bold text-right">
            ※ 未来のレースを予想する場合は、JRA発表の「単勝オッズ」を手動で入力してください。
          </div>

          <button onClick={addHorse} className="w-full mt-4 border-2 border-dashed border-gray-600 text-gray-400 hover:text-white hover:border-gray-400 py-2 rounded-lg transition">
            ＋ 出走馬を手動で追加する
          </button>

          <button onClick={handleDiagnose} disabled={isDiagnosing || horses.length < 2} className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-4 rounded-lg mt-8 shadow-lg text-lg transition duration-200 disabled:opacity-50">
            {isDiagnosing ? '過去のデータを分析中...' : '📊 指定展開・バイアス・オッズ期待値で全頭診断を実行！'}
          </button>
        </div>

        {diagnosisResults && raceInfo && (
          <div className="bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-700 mb-6">
            <h2 className="text-2xl font-bold mb-4 text-indigo-400">STEP 3: 📊 AI全頭診断 ＆ 期待値レポート</h2>
            
            <div className="flex flex-col md:flex-row justify-center gap-6 text-sm font-bold text-red-400 mb-6 bg-gray-900 p-4 rounded-lg border border-gray-700">
              <p>【{expectedPace === 'H' ? 'ハイ' : expectedPace === 'S' ? 'スロー' : 'ミドル'}想定】 前半 {raceInfo.pace_f}秒 / 後半 {raceInfo.pace_l}秒</p>
              <p>馬場傾向: <span className="text-pink-400 bg-pink-900/30 px-2 py-1 rounded border border-pink-700/50">{trackBias}</span></p>
              <p>要求タイム: <span className="text-xl text-yellow-400">{raceInfo.req_up}秒</span></p>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              {diagnosisResults.map((horse, index) => (
                <div key={index} className="bg-gray-900 p-4 rounded-lg border border-gray-700 flex flex-col gap-3 relative overflow-hidden">
                  
                  {horse.myoumi >= 60 && horse.odds >= 10 ? (
                     <div className="absolute top-0 right-0 bg-purple-600 text-white text-[10px] font-bold px-3 py-1 rounded-bl-lg shadow-md">
                        💡 穴馬推奨
                     </div>
                  ) : index < 3 ? (
                     <div className="absolute top-0 right-0 bg-yellow-600 text-white text-[10px] font-bold px-3 py-1 rounded-bl-lg">
                        AI上位
                     </div>
                  ) : null}
                  
                  <div className="flex justify-between items-center mb-1">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 flex items-center justify-center font-bold rounded-full shadow-md ${getHorseColor(horse.umaban)}`}>
                        {horse.umaban}
                      </div>
                      <span className="text-lg font-bold">{horse.bamei}</span>
                    </div>
                    <div className="flex gap-4 text-right">
                      {horse.odds > 0 && (
                        <div className="flex flex-col items-end border-r border-gray-700 pr-4">
                          <div className="text-[10px] text-pink-400 font-bold">妙味指数 (期待値)</div>
                          <div className={`text-2xl font-bold ${horse.myoumi >= 60 ? 'text-pink-500' : horse.myoumi >= 50 ? 'text-pink-300' : 'text-gray-500'}`}>
                            {horse.myoumi > 0 ? horse.myoumi.toFixed(1) : '-'}
                          </div>
                        </div>
                      )}
                      <div className="flex flex-col items-end">
                        <div className="text-[10px] text-gray-400">AI基本指数 (能力)</div>
                        <div className={`text-2xl font-bold ${horse.shisu >= 60 ? 'text-red-400' : horse.shisu >= 50 ? 'text-yellow-400' : 'text-gray-500'}`}>
                          {horse.shisu}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-800 p-3 rounded border border-gray-700">
                    <div className="flex justify-between mb-2">
                       <span className="text-gray-400 text-[10px] font-bold">直近5走の戦歴 (場所・距離・馬場) / 通過 / タイム / 上り</span>
                       {horse.odds > 0 && (
                         <span className="text-yellow-400 text-[11px] font-bold border border-yellow-600/50 px-2 rounded">
                           想定単勝: {horse.odds}倍
                         </span>
                       )}
                    </div>
                    {horse.history_details && horse.history_details.length > 0 ? (
                      <div className="flex flex-col gap-1.5">
                        {horse.history_details.map((hd, i) => (
                          <div key={i} className="flex justify-between items-center text-[11px] border-b border-gray-700/50 pb-1.5 last:border-0 last:pb-0 gap-1">
                            <span className="text-gray-300 w-32 truncate" title={hd.race_name}>{hd.race_name}</span>
                            <span className={`font-bold w-6 text-right flex-shrink-0 ${hd.rank === '1着' ? 'text-yellow-400' : hd.rank === '2着' || hd.rank === '3着' ? 'text-green-400' : 'text-gray-400'}`}>{hd.rank}</span>
                            <span className="text-orange-300/80 w-12 text-center text-[10px] tracking-tighter" title="道中の通過順">{hd.passing}</span>
                            <span className="text-gray-400 w-10 text-right">{hd.time}</span>
                            <span className="text-blue-300 w-10 text-right">{hd.up}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-xs text-gray-500 text-center py-2">過去のデータがありません</div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <button onClick={handleSimulate} disabled={loading} className="w-full bg-red-600 hover:bg-red-500 text-white font-bold py-4 rounded-lg mt-8 shadow-[0_0_15px_rgba(220,38,38,0.5)] text-lg transition duration-200 disabled:opacity-50">
              {loading ? 'レースを生成中...' : '🏁 展開とバイアスを加味したシミュレーション開始'}
            </button>
          </div>
        )}

        {isRacing && results && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            
            <div className="relative w-full max-w-4xl max-h-[95vh] overflow-y-auto bg-gray-900 rounded-2xl border border-gray-600 shadow-2xl p-6">
              
              <button 
                onClick={() => {
                  setIsRacing(false);
                  setShowResults(false);
                }}
                className="absolute top-4 right-4 text-gray-400 hover:text-white bg-gray-800 hover:bg-red-600 rounded-full w-10 h-10 flex items-center justify-center transition z-50 text-xl font-bold"
                title="閉じる"
              >
                ✕
              </button>

              <style>{animationStyles}</style>

              <h3 className="text-center font-bold text-gray-300 mb-4 tracking-widest text-xl">
                【 RACE TRACKING 】
              </h3>

              {/* ▼▼ スマホリサイズ対応：自動で縮小して綺麗に収まるコンテナ ▼▼ */}
              <div 
                ref={trackContainerRef}
                className="relative w-full max-w-[800px] mx-auto bg-[#1b4332] rounded-xl overflow-hidden shadow-inner flex-shrink-0 border-2 border-gray-700 flex justify-center"
                style={{ height: `${300 * trackScale}px` }}
              >
                <div 
                  className="relative origin-top" 
                  style={{ 
                    width: '800px', 
                    height: '300px', 
                    transform: `scale(${trackScale})` 
                  }}
                >
                  <svg width="100%" height="100%" viewBox="0 0 800 300" className="absolute inset-0">
                    <rect width="800" height="300" fill="#2d6a4f" />
                    <path d="M 500 250 L 700 250 A 100 100 0 0 0 700 50 L 100 50 A 100 100 0 0 0 100 250 Z" fill="#1b4332" stroke="#d4a373" strokeWidth="46" />
                    <path d="M 500 250 L 700 250 A 100 100 0 0 0 700 50 L 100 50 A 100 100 0 0 0 100 250 Z" fill="none" stroke="#ffffff" strokeWidth="2" strokeDasharray="4 8" opacity="0.8" />
                    <line x1="500" y1="227" x2="500" y2="273" stroke="#ef4444" strokeWidth="6" opacity="0.9" />
                    <text x="500" y="290" fill="white" fontSize="12" fontWeight="bold" textAnchor="middle" opacity="0.8">GOAL</text>
                    <text x="400" y="35" fill="rgba(255,255,255,0.3)" fontSize="14" fontWeight="bold">向正面 (BACK STRETCH)</text>
                    <text x="80" y="150" fill="rgba(255,255,255,0.3)" fontSize="14" fontWeight="bold">3コーナー</text>
                    <text x="720" y="150" fill="rgba(255,255,255,0.3)" fontSize="14" fontWeight="bold">4コーナー</text>
                  </svg>

                  {results.map((result) => {
                    const duration = 12 + (result.rank * 0.12) + (Math.random() * 0.1); 
                    return (
                      <div
                        key={result.umaban}
                        className={`absolute top-0 left-0 w-4 h-4 -ml-2 -mt-2 rounded-full flex items-center justify-center font-bold text-[9px] shadow-[0_2px_4px_rgba(0,0,0,0.5)] border border-gray-500 z-10 ${getHorseColor(result.umaban)}`}
                        style={{
                          offsetPath: 'path("M 500 250 L 700 250 A 100 100 0 0 0 700 50 L 100 50 A 100 100 0 0 0 100 250 Z")',
                          animation: `tracking-${result.umaban} ${duration}s linear forwards`
                        }}
                        title={result.bamei} 
                      >
                        {result.umaban}
                      </div>
                    );
                  })}

                  {showResults && (
                    <div className="absolute inset-0 bg-black/85 z-40 flex flex-col items-center justify-center" style={{ animation: 'popIn 0.5s ease-out forwards' }}>
                      <h3 className="text-3xl font-black text-yellow-400 mb-4 tracking-widest drop-shadow-[0_0_10px_rgba(234,179,8,0.8)]">
                        レース確定
                      </h3>
                      
                      <div className="w-[90%] max-w-lg bg-gray-900 border-2 border-yellow-600 rounded-xl p-4 shadow-[0_0_30px_rgba(234,179,8,0.3)]">
                        <table className="w-full text-center border-collapse">
                          <thead>
                            <tr className="border-b border-gray-700 text-gray-400 text-xs">
                              <th className="pb-2 w-16">着順</th>
                              <th className="pb-2 w-12">馬番</th>
                              <th className="pb-2 text-left pl-4">馬名</th>
                              <th className="pb-2 text-right pr-4">AIスコア</th>
                            </tr>
                          </thead>
                          <tbody>
                            {results.slice(0, 5).map((r) => (
                              <tr key={r.umaban} className="border-b border-gray-800/80 last:border-0">
                                <td className={`py-2 text-lg font-bold ${r.rank === 1 ? 'text-yellow-400' : r.rank === 2 ? 'text-gray-300' : r.rank === 3 ? 'text-orange-400' : 'text-gray-500'}`}>
                                  {r.rank}
                                </td>
                                <td className="py-2">
                                  <div className={`w-5 h-5 mx-auto rounded-full flex items-center justify-center font-bold text-[10px] border ${getHorseColor(r.umaban)}`}>
                                    {r.umaban}
                                  </div>
                                </td>
                                <td className="py-2 text-left pl-4 font-bold text-base text-gray-100">{r.bamei}</td>
                                <td className="py-2 text-right pr-4 text-gray-400 font-mono text-sm">{r.shisu.toFixed(1)}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              {/* ▲▲ 自動縮小コンテナここまで ▲▲ */}

              <div className={`mt-6 grid grid-cols-2 md:grid-cols-4 gap-4 transition-opacity duration-1000 ${showResults ? 'opacity-100' : 'opacity-0 h-0 overflow-hidden'}`}>
                {results.map((result, index) => (
                  <div key={index} className={`flex flex-col p-3 rounded-xl border ${result.rank === 1 ? 'bg-yellow-900/40 border-yellow-500 shadow-[0_0_10px_rgba(234,179,8,0.2)]' : result.rank <= 3 ? 'bg-gray-800 border-gray-500' : 'bg-gray-900 border-gray-800'}`}>
                    <div className="flex items-center gap-2">
                      <span className={`text-lg font-extrabold ${result.rank === 1 ? 'text-yellow-400' : result.rank === 2 ? 'text-gray-300' : result.rank === 3 ? 'text-orange-400' : 'text-gray-600'}`}>
                        {result.rank}着
                      </span>
                      <div className={`w-6 h-6 flex items-center justify-center font-bold text-[10px] rounded-full border ${getHorseColor(result.umaban)}`}>
                        {result.umaban}
                      </div>
                      <span className="text-sm font-bold text-gray-200 truncate flex-grow">
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
