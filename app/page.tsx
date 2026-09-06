'use client';

import { useEffect, useState, type ReactNode } from 'react';
import {
  Activity,
  BrainCircuit,
  CheckCircle2,
  CircleDot,
  Clock3,
  Database,
  ExternalLink,
  Eye,
  Film,
  Layers3,
  Pause,
  Play,
  RotateCcw,
  ScanLine,
  ShieldCheck,
  Sparkles,
  Target,
  Users,
  XCircle,
} from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Slider } from '@/components/ui/slider';
import { games, totalAuditedPlays, totalCorrectPlays, type PlayAudit, type TrackingFrame } from './demo-data';

const MODEL_SECONDS = 12;
const auditAccuracy = Math.round((totalCorrectPlays / totalAuditedPlays) * 100);

function formatTimestamp(seconds: number) {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const rest = Math.floor(seconds % 60);
  return hours ? `${hours}:${String(minutes).padStart(2, '0')}:${String(rest).padStart(2, '0')}` : `${minutes}:${String(rest).padStart(2, '0')}`;
}

function lerp(a: number, b: number, amount: number) {
  return a + (b - a) * amount;
}

function interpolateTracking(play: PlayAudit, elapsed: number): TrackingFrame {
  const frameIndex = Math.min(play.frames.length - 1, Math.floor(elapsed / 3));
  const current = play.frames[frameIndex];
  const next = play.frames[Math.min(play.frames.length - 1, frameIndex + 1)];
  const amount = frameIndex === play.frames.length - 1 ? 0 : (elapsed - current.at) / Math.max(1, next.at - current.at);
  const points = (from: [number, number][], to: [number, number][]) =>
    from.map(([x, y], index) => [lerp(x, to[index][0], amount), lerp(y, to[index][1], amount)] as [number, number]);

  return {
    ...current,
    shotClock: Math.max(0, Math.round(lerp(current.shotClock, next.shotClock, amount))),
    confidence: Math.round(lerp(current.confidence, next.confidence, amount)),
    epv: lerp(current.epv, next.epv, amount),
    winProbability: lerp(current.winProbability, next.winProbability, amount),
    offense: points(current.offense, next.offense),
    defense: points(current.defense, next.defense),
  };
}

export default function Home() {
  const [gameId, setGameId] = useState(games[0].id);
  const [playIndex, setPlayIndex] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [filmKey, setFilmKey] = useState(0);

  const game = games.find((item) => item.id === gameId) ?? games[0];
  const playAudit = game.plays[playIndex] ?? game.plays[0];
  const frame = interpolateTracking(playAudit, elapsed);
  const revealed = elapsed >= 9;
  const gameCorrect = game.plays.filter((item) => item.correct).length;

  useEffect(() => {
    if (!playing) return;
    const timer = window.setInterval(() => {
      setElapsed((current) => {
        if (current >= MODEL_SECONDS) {
          setPlaying(false);
          return MODEL_SECONDS;
        }
        return Math.min(MODEL_SECONDS, current + 0.2);
      });
    }, 250);
    return () => window.clearInterval(timer);
  }, [playing]);

  function selectGame(id: string) {
    setGameId(id);
    setPlayIndex(0);
    setElapsed(0);
    setPlaying(true);
    setFilmKey((value) => value + 1);
  }

  function selectPlay(index: number) {
    setPlayIndex(index);
    setElapsed(0);
    setPlaying(true);
    setFilmKey((value) => value + 1);
  }

  return (
    <main className="min-h-screen bg-background text-foreground">
      <header className="border-b border-white/8 bg-[#080d12]/92 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-[1580px] items-center justify-between px-4 sm:px-7">
          <div className="flex items-center gap-3">
            <div className="grid size-9 place-items-center rounded-lg border border-orange-400/40 bg-orange-400/10 text-orange-300"><ScanLine className="size-5" /></div>
            <div><p className="text-[15px] font-semibold tracking-[0.16em] text-white">COURTCAST</p><p className="text-[10px] uppercase tracking-[0.18em] text-slate-500">Live basketball intelligence</p></div>
          </div>
          <div className="flex items-center gap-2">
            <span className="hidden items-center gap-2 text-xs text-slate-400 sm:flex"><span className="size-1.5 animate-pulse rounded-full bg-emerald-400" />Interactive film audit</span>
            <Badge className="border border-amber-300/25 bg-amber-300/8 text-amber-200">Portfolio prototype</Badge>
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-[1580px] px-4 py-6 sm:px-7">
        <div className="mb-5 grid gap-4 xl:grid-cols-[1fr_auto] xl:items-end">
          <div>
            <div className="mb-2 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-orange-300"><Activity className="size-3.5" />Film → playbook → next-play probability</div>
            <h1 className="max-w-4xl text-2xl font-semibold tracking-[-0.025em] text-white sm:text-[34px]">See the possession. Predict the decision.</h1>
            <p className="mt-2 max-w-4xl text-sm leading-6 text-slate-400">CourtCast turns complete game film into a coach-aware playbook, predicts the next action and defensive response, then revises the probability as all ten players move.</p>
          </div>
          <div className="grid grid-cols-3 gap-px overflow-hidden rounded-xl border border-white/8 bg-white/8">
            <TopMetric value="5" label="full games" />
            <TopMetric value="25" label="audited plays" />
            <TopMetric value={`${auditAccuracy}%`} label="film baseline" accent />
          </div>
        </div>

        <nav aria-label="Demo games" className="mb-4 grid gap-2 sm:grid-cols-5">
          {games.map((item, index) => (
            <button key={item.id} onClick={() => selectGame(item.id)} aria-pressed={item.id === game.id} className={`group rounded-xl border px-3 py-3 text-left transition ${item.id === game.id ? 'border-orange-300/50 bg-orange-300/10 text-white' : 'border-white/8 bg-white/[0.025] text-slate-400 hover:border-white/16 hover:bg-white/[0.045]'}`}>
              <span className="flex items-center justify-between text-[9px] font-semibold uppercase tracking-[0.15em]">{item.league}<span className="text-slate-600">0{index + 1}</span></span>
              <span className="mt-1.5 block text-xs font-semibold tracking-wide">{item.away.code} <span className="text-slate-600">vs</span> {item.home.code}</span>
              <span className="mt-1 block text-[9px] text-slate-600">Full game · 5 plays</span>
            </button>
          ))}
        </nav>

        <div className="grid gap-4 2xl:grid-cols-[minmax(900px,1fr)_400px]">
          <section className="panel overflow-hidden">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/7 px-4 py-3">
              <div>
                <div className="flex flex-wrap items-center gap-2"><span className="size-2 animate-pulse rounded-full bg-emerald-400" /><span className="text-xs font-semibold text-white">{game.away.code} vs {game.home.code}</span><span className="text-xs text-slate-600">•</span><span className="text-xs text-slate-400">{game.label}</span><span className="text-xs text-slate-600">•</span><span className="text-xs text-slate-400">{playAudit.gameClock}</span></div>
                <p className="mt-1 text-[10px] uppercase tracking-[0.14em] text-slate-600">Play {playIndex + 1} of 5 · {playAudit.offense} offense · source {formatTimestamp(playAudit.start)}</p>
              </div>
              <div className="flex items-center gap-2"><Badge variant="outline" className="border-emerald-300/20 text-emerald-200">Full-game player</Badge><Badge variant="outline" className="border-white/10 text-slate-400">5 audited possessions</Badge></div>
            </div>

            <div className="grid bg-black xl:grid-cols-2">
              <div className="border-b border-white/8 xl:border-r xl:border-b-0">
                <ViewLabel icon={<Film className="size-3.5" />} title="Complete game film" status={`jump ${formatTimestamp(playAudit.start)}`} />
                <div className="aspect-video w-full">
                  <iframe key={`${game.video.id}-${filmKey}`} className="h-full w-full" src={`https://www.youtube-nocookie.com/embed/${game.video.id}?start=${playAudit.start}&autoplay=${filmKey ? 1 : 0}&rel=0&modestbranding=1`} title={game.video.title} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowFullScreen />
                </div>
              </div>

              <div>
                <ViewLabel icon={<ScanLine className="size-3.5" />} title="Reconstructed model view" status={`${frame.confidence}% confidence`} />
                <Court frame={frame} offenseCode={playAudit.offense} defenseCode={playAudit.defense} />
                <ModelControls elapsed={elapsed} playing={playing} onElapsed={setElapsed} onPlaying={setPlaying} />
              </div>
            </div>

            <div className="border-t border-white/8 bg-[#0b1117] px-4 py-3">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div><p className="text-xs font-medium text-slate-200">{game.video.title}</p><p className="mt-0.5 text-[10px] text-slate-600">The entire game remains playable. CourtCast analyzes only the five timestamped windows below; footage is embedded, not rehosted.</p></div>
                <a href={game.video.sourceUrl} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-[11px] font-medium text-slate-400 transition hover:text-white">Open on YouTube <ExternalLink className="size-3" /></a>
              </div>
            </div>

            <div className="border-t border-white/7">
              <div className="flex items-center justify-between px-4 py-2.5"><span className="eyebrow">Five audited possessions</span><span className="text-[10px] text-slate-600">Select a card to jump the full game</span></div>
              <div className="grid gap-px bg-white/7 sm:grid-cols-5">
                {game.plays.map((item, index) => (
                  <button key={item.id} onClick={() => selectPlay(index)} className={`bg-[#0b1117] px-3 py-3 text-left transition hover:bg-white/[0.045] ${index === playIndex ? 'shadow-[inset_0_2px_0_#f7a755]' : ''}`}>
                    <span className={`flex items-center justify-between font-mono text-[10px] ${index === playIndex ? 'text-orange-300' : 'text-slate-600'}`}><span>PLAY 0{index + 1}</span><span>{formatTimestamp(item.start)}</span></span>
                    <span className={`mt-1.5 block truncate text-[11px] font-semibold ${index === playIndex ? 'text-white' : 'text-slate-400'}`}>{item.predicted}</span>
                    <span className="mt-1.5 flex items-center justify-between text-[10px] text-slate-600"><span>{item.offense}</span>{item.correct ? <span className="text-emerald-400">HIT</span> : <span className="text-rose-400">MISS</span>}</span>
                  </button>
                ))}
              </div>
            </div>
          </section>

          <aside className="space-y-4">
            <section className="panel p-4">
              <div className="mb-4 flex items-center justify-between"><span className="eyebrow">Next action · live probability</span><span className="font-mono text-[10px] text-emerald-300">UPDATING</span></div>
              <div className="space-y-3.5">{frame.actions.map((prediction, index) => <PredictionRow key={prediction.label} item={prediction} primary={index === 0} />)}</div>
              <div className="mt-4 rounded-lg border border-orange-300/16 bg-orange-300/[0.055] p-3"><p className="text-[10px] font-semibold uppercase tracking-[0.13em] text-orange-300">What the system sees</p><p className="mt-1.5 text-xs leading-5 text-slate-300">{frame.read}</p></div>
            </section>

            <section className="panel p-4">
              <div className="flex items-center justify-between"><span className="eyebrow">Prediction audit</span><Badge variant="outline" className={playAudit.correct ? 'border-emerald-300/20 text-emerald-200' : 'border-rose-300/20 text-rose-200'}>{revealed ? (playAudit.correct ? 'TOP-1 HIT' : 'TOP-1 MISS') : 'PREDICTION FROZEN'}</Badge></div>
              <div className="mt-4 space-y-2">
                <ChainStep index="01" label="Predicted offense" value={playAudit.predicted} />
                <ArrowDown />
                <ChainStep index="02" label="Expected defense" value={playAudit.coverage} />
                <ArrowDown />
                <ChainStep index="03" label="Likely counter" value={playAudit.counter} accent />
              </div>
              <div className={`mt-3 rounded-lg border p-3 ${revealed ? 'border-white/8 bg-white/[0.025]' : 'border-dashed border-white/10 bg-transparent'}`}>
                <div className="flex items-center gap-2">{revealed ? (playAudit.correct ? <CheckCircle2 className="size-4 text-emerald-400" /> : <XCircle className="size-4 text-rose-400" />) : <Clock3 className="size-4 text-slate-500" />}<p className="text-[10px] font-semibold uppercase tracking-[0.13em] text-slate-500">{revealed ? `Observed · ${playAudit.actual}` : 'Observed action hidden until 9.0s'}</p></div>
                <p className="mt-1.5 text-xs leading-5 text-slate-300">{revealed ? playAudit.result : 'Run the possession to compare the frozen prediction with the film-review label.'}</p>
              </div>
              <div className="mt-4 grid grid-cols-3 gap-2 border-t border-white/7 pt-4"><Metric label="Confidence" value={`${frame.confidence}%`} /><Metric label="Possession" value={frame.epv.toFixed(2)} suffix="est. EPV" /><Metric label="Game" value={`${frame.winProbability.toFixed(1)}%`} suffix="est. win" /></div>
            </section>
          </aside>
        </div>

        <section className="mt-4 grid gap-4 xl:grid-cols-[1.12fr_.88fr]">
          <div className="panel p-4">
            <div className="flex flex-wrap items-center justify-between gap-2"><div className="flex items-center gap-2"><Users className="size-4 text-orange-300" /><span className="eyebrow">Coach layer · living playbook</span></div><span className="text-[10px] text-slate-600">{game.date} · {game.venue}</span></div>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <CoachCard team={game.away} active={playAudit.offense === game.away.code} />
              <CoachCard team={game.home} active={playAudit.offense === game.home.code} />
            </div>
          </div>
          <div className="panel p-4">
            <div className="flex items-center justify-between"><span className="eyebrow">Matchup forecast</span><Badge variant="outline" className="border-white/10 text-slate-400">{gameCorrect}/5 top-1</Badge></div>
            <div className="mt-4 space-y-3">
              <Insight icon={<ShieldCheck />} label="Defense expectation" text={game.defenseExpectation} />
              <Insight icon={<BrainCircuit />} label="Overall play prediction" text={game.overallPrediction} />
            </div>
            <div className="mt-4 border-t border-white/7 pt-4"><p className="mb-2 text-[9px] font-semibold uppercase tracking-[0.13em] text-slate-600">Observed five-play sample</p><div className="grid grid-cols-2 gap-2">{game.playbook.map((item) => <div key={item.label} className="flex items-center justify-between rounded-md border border-white/7 bg-white/[0.025] px-2.5 py-2"><span className="text-[10px] text-slate-400">{item.label}</span><span className="font-mono text-[10px] text-orange-200">{item.count}</span></div>)}</div></div>
          </div>
        </section>

        <section className="panel mt-4 grid gap-px overflow-hidden bg-white/7 md:grid-cols-3">
          <AuditNote icon={<Film />} title="Complete context" text="Each tab embeds a complete game. The five cards are explicit analysis jump points—not a claim that every possession was labeled." />
          <AuditNote icon={<ScanLine />} title="Estimated tracking" text="The moving dots reconstruct visible spacing and action geometry. They are a portfolio visualization, not calibrated optical tracking." />
          <AuditNote icon={<Database />} title="Honest baseline" text={`${totalCorrectPlays}/${totalAuditedPlays} (${auditAccuracy}%) is a curated film-audit baseline. It is not held-out trained-model accuracy.`} />
        </section>

        <section className="mt-10">
          <div className="mb-4"><span className="eyebrow">The intended CourtCast loop</span><h2 className="mt-2 text-xl font-semibold text-white">From raw film to the next decision</h2></div>
          <div className="grid gap-3 md:grid-cols-4">
            <ProcessCard number="01" icon={<Eye />} title="Observe" text="Track players and the ball; align complete possessions to game context." />
            <ProcessCard number="02" icon={<Layers3 />} title="Build playbooks" text="Learn recurring actions by player, lineup, team, opponent, and coach." />
            <ProcessCard number="03" icon={<Target />} title="Predict" text="Rank the next action, likely coverage, counter, and possession value." />
            <ProcessCard number="04" icon={<Activity />} title="Update" text="Refresh the tree as spacing, timing, score, and substitutions change." />
          </div>
        </section>

        <section className="mt-4 rounded-xl border border-amber-300/15 bg-amber-300/[0.035] px-4 py-3">
          <div className="flex items-start gap-3"><Sparkles className="mt-0.5 size-4 shrink-0 text-amber-300" /><div><p className="text-xs font-semibold text-amber-100">Research prototype disclosure</p><p className="mt-1 text-[11px] leading-5 text-slate-400">{game.sourceNote} Coach tendencies are scouting interpretations, tactical labels are analyst hypotheses, and EPV/win numbers are illustrative. The next research gate is automated tracking plus source-disjoint validation.</p></div></div>
        </section>
      </section>
    </main>
  );
}

function TopMetric({ value, label, accent = false }: { value: string; label: string; accent?: boolean }) {
  return <div className="min-w-24 bg-[#0d141b] px-3 py-3 text-center"><p className={`font-mono text-lg font-semibold ${accent ? 'text-orange-200' : 'text-white'}`}>{value}</p><p className="text-[9px] uppercase tracking-[0.12em] text-slate-600">{label}</p></div>;
}

function ViewLabel({ icon, title, status }: { icon: ReactNode; title: string; status: string }) {
  return <div className="flex h-10 items-center justify-between border-b border-white/8 bg-[#0b1117] px-3"><span className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.13em] text-slate-400">{icon}{title}</span><span className="font-mono text-[9px] text-slate-600">{status}</span></div>;
}

function Court({ frame, offenseCode, defenseCode }: { frame: TrackingFrame; offenseCode: string; defenseCode: string }) {
  const ball = frame.offense[frame.ballOwner];
  return (
    <div className="relative overflow-hidden bg-[#101820] p-3">
      <svg viewBox="46 0 49 50" aria-label={`Estimated half-court positions during ${frame.stage}`} className="aspect-video w-full overflow-visible rounded-md">
        <defs><pattern id="wood" width="4" height="50" patternUnits="userSpaceOnUse"><rect width="4" height="50" fill="#c98b52" /><path d="M4 0V50" stroke="#b87942" strokeWidth=".16" /></pattern><filter id="shadow"><feDropShadow dx="0" dy=".8" stdDeviation=".65" floodOpacity=".32" /></filter></defs>
        <rect x="46" y="0" width="49" height="50" rx="1" fill="url(#wood)" />
        <g fill="none" stroke="#f6dfc5" strokeWidth=".35" opacity=".9"><path d="M47 0V50M94 0V50M47 0H94M47 50H94" /><circle cx="47" cy="25" r="6" /><rect x="75" y="17" width="19" height="16" /><circle cx="75" cy="25" r="6" /><path d="M94 3H88A23.75 23.75 0 0 0 88 47H94" /><path d="M88.75 23.5V26.5M89.3 25h2.2" /><path d="M84.75 25a4 4 0 0 0 8 0" strokeDasharray=".8 .6" /></g>
        <g opacity=".18" fill="#0e5f76"><rect x="75" y="17" width="19" height="16" /><circle cx="75" cy="25" r="6" /></g>
        {frame.defense.map(([x, y], index) => <g key={`d-${index}`} style={{ transform: `translate(${x}px, ${y}px)` }} filter="url(#shadow)"><circle r="2.05" fill="#0e5665" stroke="#8fe6eb" strokeWidth=".42" /><text textAnchor="middle" dy=".75" fontSize="1.8" fontWeight="700" fill="#d8fbff">{index + 1}</text></g>)}
        {frame.offense.map(([x, y], index) => <g key={`o-${index}`} style={{ transform: `translate(${x}px, ${y}px)` }} filter="url(#shadow)">{frame.ballOwner === index && <circle r="2.85" fill="none" stroke="#fff0c7" strokeWidth=".35" strokeDasharray=".7 .5" />}<circle r="2.05" fill="#d46622" stroke="#ffd29c" strokeWidth=".42" /><text textAnchor="middle" dy=".75" fontSize="1.8" fontWeight="700" fill="#fff7eb">{index + 1}</text></g>)}
        <circle cx={ball[0] + 2.5} cy={ball[1] - 1.5} r=".72" fill="#31160a" stroke="#ffbe67" strokeWidth=".28" />
        <CourtLegend y={3} color="#ff9a4b" code={offenseCode} /><CourtLegend y={7} color="#6adce2" code={defenseCode} />
      </svg>
      <div className="absolute bottom-5 left-5 flex items-center gap-2 rounded-lg border border-black/10 bg-[#111820]/88 px-2.5 py-1.5 text-[10px] font-medium text-white shadow-lg backdrop-blur"><CircleDot className="size-3 text-orange-300" />{frame.stage}</div>
      <div className="absolute right-5 top-5 rounded-md border border-black/10 bg-[#111820]/88 px-2 py-1 font-mono text-[9px] text-slate-300 backdrop-blur">SHOT {frame.shotClock}</div>
    </div>
  );
}

function CourtLegend({ y, color, code }: { y: number; color: string; code: string }) {
  return <g transform={`translate(49 ${y})`}><rect width="13" height="3.3" rx="1.65" fill="#081016" opacity=".78" /><circle cx="1.7" cy="1.65" r=".55" fill={color} /><text x="3" y="2.15" fontSize="1.35" fontWeight="700" fill="#f7f4ef">{code}</text></g>;
}

function ModelControls({ elapsed, playing, onElapsed, onPlaying }: { elapsed: number; playing: boolean; onElapsed: (value: number) => void; onPlaying: (value: boolean) => void }) {
  return (
    <div className="border-t border-white/7 bg-[#0b1117] px-3 py-3">
      <div className="flex items-center gap-2">
        <Button variant="outline" size="icon" onClick={() => onPlaying(!playing)} aria-label={playing ? 'Pause simulation' : 'Play simulation'} className="size-8 border-white/10 bg-white/[0.04] text-white hover:bg-white/10">{playing ? <Pause /> : <Play />}</Button>
        <Button variant="ghost" size="icon" onClick={() => { onElapsed(0); onPlaying(false); }} aria-label="Reset simulation" className="size-8 text-slate-400 hover:bg-white/8 hover:text-white"><RotateCcw /></Button>
        <Slider min={0} max={MODEL_SECONDS} step={0.1} value={[elapsed]} onValueChange={(value) => { onElapsed(typeof value === 'number' ? value : value[0]); onPlaying(false); }} aria-label="Possession timeline" className="[&_[data-slot=slider-range]]:bg-orange-300 [&_[data-slot=slider-thumb]]:border-orange-300" />
        <span className="w-11 text-right font-mono text-[10px] text-slate-500">{elapsed.toFixed(1)}s</span>
      </div>
      <div className="mt-2 grid grid-cols-4 gap-1">{['ALIGN', 'TRIGGER', 'READ', 'REVEAL'].map((label, index) => <button key={label} onClick={() => { onElapsed(index * 3); onPlaying(false); }} className={`rounded py-1 font-mono text-[8px] ${elapsed >= index * 3 ? 'bg-orange-300/12 text-orange-300' : 'bg-white/[0.025] text-slate-700'}`}>{label}</button>)}</div>
    </div>
  );
}

function PredictionRow({ item, primary }: { item: { label: string; value: number }; primary?: boolean }) {
  return <div><div className="mb-1.5 flex items-baseline justify-between gap-3"><span className={`text-xs ${primary ? 'font-semibold text-white' : 'text-slate-400'}`}>{item.label}</span><span className={`font-mono text-xs ${primary ? 'text-orange-200' : 'text-slate-500'}`}>{item.value}%</span></div><Progress value={item.value} className={`[&_[data-slot=progress-track]]:h-1.5 [&_[data-slot=progress-track]]:bg-white/7 ${primary ? '[&_[data-slot=progress-indicator]]:bg-orange-300' : '[&_[data-slot=progress-indicator]]:bg-slate-600'}`} /></div>;
}

function ChainStep({ index, label, value, accent = false }: { index: string; label: string; value: string; accent?: boolean }) {
  return <div className={`flex items-center gap-3 rounded-lg border px-3 py-2.5 ${accent ? 'border-orange-300/25 bg-orange-300/[0.07]' : 'border-white/7 bg-white/[0.025]'}`}><span className={`font-mono text-[10px] ${accent ? 'text-orange-300' : 'text-slate-600'}`}>{index}</span><div><p className="text-[9px] uppercase tracking-[0.13em] text-slate-600">{label}</p><p className="mt-0.5 text-xs font-medium text-slate-200">{value}</p></div></div>;
}

function ArrowDown() { return <div className="ml-5 h-3 w-px bg-white/10" />; }

function Metric({ label, value, suffix }: { label: string; value: string; suffix?: string }) {
  return <div><p className="text-[9px] uppercase tracking-[0.1em] text-slate-600">{label}</p><p className="mt-1 font-mono text-base font-semibold text-white">{value}</p>{suffix && <p className="text-[9px] text-slate-600">{suffix}</p>}</div>;
}

function CoachCard({ team, active }: { team: (typeof games)[number]['away']; active: boolean }) {
  return (
    <article className={`rounded-xl border p-3 ${active ? 'border-orange-300/24 bg-orange-300/[0.055]' : 'border-white/7 bg-white/[0.025]'}`}>
      <div className="flex items-center gap-3"><div className={`grid size-9 place-items-center rounded-lg border font-mono text-[10px] font-bold ${active ? 'border-orange-300/30 bg-orange-300/10 text-orange-200' : 'border-cyan-300/20 bg-cyan-300/8 text-cyan-200'}`}>{team.code}</div><div><p className="text-xs font-semibold text-white">{team.coach}</p><p className="text-[10px] text-slate-600">Head coach · {team.name}</p></div>{active && <Badge variant="outline" className="ml-auto border-orange-300/20 text-[8px] text-orange-200">ON OFFENSE</Badge>}</div>
      <div className="mt-3 space-y-2"><MiniRead label="Identity" text={team.identity} /><MiniRead label="Defense prior" text={team.defense} /><MiniRead label="Expected adjustment" text={team.adjustment} /></div>
    </article>
  );
}

function MiniRead({ label, text }: { label: string; text: string }) { return <div><p className="text-[8px] font-semibold uppercase tracking-[0.12em] text-slate-600">{label}</p><p className="mt-0.5 text-[10px] leading-4 text-slate-400">{text}</p></div>; }

function Insight({ icon, label, text }: { icon: ReactNode; label: string; text: string }) { return <div className="flex gap-3 rounded-lg border border-white/7 bg-white/[0.025] p-3"><span className="mt-0.5 text-orange-300 [&_svg]:size-4">{icon}</span><div><p className="text-[9px] font-semibold uppercase tracking-[0.13em] text-slate-600">{label}</p><p className="mt-1 text-xs leading-5 text-slate-400">{text}</p></div></div>; }

function AuditNote({ icon, title, text }: { icon: ReactNode; title: string; text: string }) { return <div className="flex gap-3 bg-[#0d141b] p-4"><span className="mt-0.5 text-slate-500 [&_svg]:size-4">{icon}</span><div><p className="text-xs font-semibold text-slate-200">{title}</p><p className="mt-1 text-[10px] leading-4 text-slate-500">{text}</p></div></div>; }

function ProcessCard({ number, icon, title, text }: { number: string; icon: ReactNode; title: string; text: string }) {
  return <div className="panel p-4"><div className="flex items-center justify-between"><span className="text-orange-300 [&_svg]:size-5">{icon}</span><span className="font-mono text-[10px] text-slate-600">{number}</span></div><p className="mt-5 text-sm font-semibold text-white">{title}</p><p className="mt-1.5 text-xs leading-5 text-slate-500">{text}</p></div>;
}
