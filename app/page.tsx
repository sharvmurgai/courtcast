'use client';

import { useEffect, useMemo, useState, type Dispatch, type ReactNode, type SetStateAction } from 'react';
import {
  Activity,
  ArrowRight,
  BrainCircuit,
  Check,
  CircleDot,
  ExternalLink,
  Eye,
  Film,
  Layers3,
  Pause,
  Play,
  RotateCcw,
  ScanLine,
  Sparkles,
  Target,
} from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Slider } from '@/components/ui/slider';
import { games } from './demo-data';

const MODEL_SECONDS = 16;

function formatTimestamp(seconds: number) {
  const minutes = Math.floor(seconds / 60);
  return `${minutes}:${String(seconds % 60).padStart(2, '0')}`;
}

export default function Home() {
  const [gameId, setGameId] = useState(games[0].id);
  const [elapsed, setElapsed] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [filmKey, setFilmKey] = useState(0);

  const game = games.find((item) => item.id === gameId) ?? games[0];
  const phaseIndex = Math.min(game.phases.length - 1, Math.floor(elapsed / 4));
  const phase = game.phases[phaseIndex];
  const selectedGameIndex = useMemo(
    () => games.findIndex((item) => item.id === game.id),
    [game.id],
  );

  useEffect(() => {
    if (!playing) return;
    const timer = window.setInterval(() => {
      setElapsed((current) => {
        if (current >= MODEL_SECONDS) {
          setPlaying(false);
          return MODEL_SECONDS;
        }
        return Math.min(MODEL_SECONDS, current + 0.25);
      });
    }, 350);
    return () => window.clearInterval(timer);
  }, [playing]);

  function selectGame(id: string) {
    setGameId(id);
    setElapsed(0);
    setPlaying(true);
    setFilmKey((value) => value + 1);
  }

  function selectPlay(index: number) {
    setElapsed(index * 4);
    setPlaying(false);
    setFilmKey((value) => value + 1);
  }

  return (
    <main className="min-h-screen bg-background text-foreground">
      <header className="border-b border-white/8 bg-[#080d12]/92 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-[1580px] items-center justify-between px-4 sm:px-7">
          <div className="flex items-center gap-3">
            <div className="grid size-9 place-items-center rounded-lg border border-orange-400/40 bg-orange-400/10 text-orange-300">
              <ScanLine className="size-5" />
            </div>
            <div>
              <p className="text-[15px] font-semibold tracking-[0.16em] text-white">COURTCAST</p>
              <p className="text-[10px] uppercase tracking-[0.18em] text-slate-500">Basketball intelligence</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="hidden items-center gap-2 text-xs text-slate-400 sm:flex">
              <span className="size-1.5 animate-pulse rounded-full bg-emerald-400" />
              Live concept demo
            </span>
            <Badge className="border border-amber-300/25 bg-amber-300/8 text-amber-200">Portfolio prototype</Badge>
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-[1580px] px-4 py-5 sm:px-7">
        <div className="mb-5 flex flex-col justify-between gap-4 xl:flex-row xl:items-end">
          <div>
            <div className="mb-2 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-orange-300">
              <Activity className="size-3.5" />
              Action-response prediction lab
            </div>
            <h1 className="max-w-4xl text-2xl font-semibold tracking-[-0.025em] text-white sm:text-[32px]">
              See the possession. Predict the decision.
            </h1>
            <p className="mt-2 max-w-4xl text-sm leading-6 text-slate-400">
              CourtCast learns a living playbook from film—player habits, lineup geometry, team actions, coach preferences, and matchup adjustments—then updates the next likely decision as everyone moves.
            </p>
          </div>
          <div className="flex items-center gap-3 rounded-xl border border-white/8 bg-white/[0.025] px-4 py-3">
            <BrainCircuit className="size-5 text-orange-300" />
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-slate-500">Demo scope</p>
              <p className="text-sm text-slate-200">5 games · 3 NBA + 2 NCAA</p>
            </div>
          </div>
        </div>

        <nav aria-label="Demo games" className="mb-4 grid gap-2 sm:grid-cols-5">
          {games.map((item, index) => (
            <button
              key={item.id}
              onClick={() => selectGame(item.id)}
              className={`group rounded-xl border px-3 py-2.5 text-left transition ${
                item.id === game.id
                  ? 'border-orange-300/50 bg-orange-300/10 text-white'
                  : 'border-white/8 bg-white/[0.025] text-slate-400 hover:border-white/16 hover:bg-white/[0.045]'
              }`}
              aria-pressed={item.id === game.id}
            >
              <span className="flex items-center justify-between text-[9px] font-semibold uppercase tracking-[0.15em]">
                {item.league}
                <span className="text-slate-600">0{index + 1}</span>
              </span>
              <span className="mt-1.5 block text-xs font-semibold tracking-wide">
                {item.awayCode} <span className="text-slate-600">@</span> {item.homeCode}
              </span>
            </button>
          ))}
        </nav>

        <div className="grid gap-4 2xl:grid-cols-[minmax(880px,1fr)_390px]">
          <section className="panel overflow-hidden">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/7 px-4 py-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="size-2 animate-pulse rounded-full bg-emerald-400" />
                  <span className="text-xs font-semibold text-white">{game.awayCode} at {game.homeCode}</span>
                  <span className="text-xs text-slate-600">•</span>
                  <span className="text-xs text-slate-400">{game.situation}</span>
                </div>
                <p className="mt-1 text-[10px] uppercase tracking-[0.14em] text-slate-600">Video and model synchronized to analysis window {phaseIndex + 1}</p>
              </div>
              <Badge variant="outline" className="border-white/10 text-slate-400">{game.sample}</Badge>
            </div>

            <div className="grid bg-black xl:grid-cols-2">
              <div className="border-b border-white/8 xl:border-r xl:border-b-0">
                <ViewLabel icon={<Film className="size-3.5" />} title="Game film" status={formatTimestamp(game.video.starts[phaseIndex])} />
                <div className="aspect-video w-full">
                  <iframe
                    key={`${game.video.id}-${filmKey}`}
                    className="h-full w-full"
                    src={`https://www.youtube-nocookie.com/embed/${game.video.id}?start=${game.video.starts[phaseIndex]}&autoplay=${filmKey ? 1 : 0}&rel=0&modestbranding=1`}
                    title={game.video.title}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                  />
                </div>
              </div>

              <div>
                <ViewLabel icon={<ScanLine className="size-3.5" />} title="CourtCast model view" status={`${phase.confidence}% confidence`} />
                <Court
                  phase={phase}
                  offenseCode={game.offense === game.home ? game.homeCode : game.awayCode}
                  defenseCode={game.defense === game.home ? game.homeCode : game.awayCode}
                />
                <ModelControls
                  elapsed={elapsed}
                  playing={playing}
                  setElapsed={setElapsed}
                  setPlaying={setPlaying}
                  game={game}
                  phaseIndex={phaseIndex}
                />
              </div>
            </div>

            <div className="border-t border-white/8 bg-[#0b1117] px-4 py-3">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-medium text-slate-200">{game.video.title}</p>
                  <p className="mt-0.5 text-[10px] text-slate-600">Embedded from {game.video.sourceLabel}; footage is not copied or hosted by CourtCast.</p>
                </div>
                <a href={game.video.sourceUrl} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-[11px] font-medium text-slate-400 transition hover:text-white">
                  Official source <ExternalLink className="size-3" />
                </a>
              </div>
            </div>

            <div className="border-t border-white/7">
              <div className="flex items-center justify-between px-4 py-2.5">
                <span className="eyebrow">Possession-by-possession analysis</span>
                <span className="text-[10px] text-slate-600">Select a row to jump both views</span>
              </div>
              <div className="grid gap-px bg-white/7 sm:grid-cols-5">
                {game.phases.map((item, index) => (
                  <button
                    key={item.state}
                    onClick={() => selectPlay(index)}
                    className={`bg-[#0b1117] px-3 py-3 text-left transition hover:bg-white/[0.045] ${index === phaseIndex ? 'shadow-[inset_0_2px_0_#f7a755]' : ''}`}
                  >
                    <span className={`flex items-center justify-between font-mono text-[10px] ${index === phaseIndex ? 'text-orange-300' : 'text-slate-600'}`}>
                      PLAY 0{index + 1}
                      <span>{formatTimestamp(game.video.starts[index])}</span>
                    </span>
                    <span className={`mt-1.5 block truncate text-[11px] font-semibold ${index === phaseIndex ? 'text-white' : 'text-slate-400'}`}>{item.actions[0].label}</span>
                    <span className="mt-1 flex items-center justify-between text-[10px] text-slate-600">
                      <span>{item.actions[0].value}%</span>
                      <span>{item.epv.toFixed(2)} EPV</span>
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </section>

          <aside className="space-y-4">
            <section className="panel p-4">
              <div className="mb-4 flex items-center justify-between">
                <span className="eyebrow">Next action</span>
                <span className="font-mono text-[10px] text-emerald-300">UPDATING</span>
              </div>
              <div className="space-y-3.5">
                {phase.actions.map((prediction, index) => (
                  <PredictionRow key={prediction.label} item={prediction} primary={index === 0} />
                ))}
              </div>
              <div className="mt-4 rounded-lg border border-orange-300/16 bg-orange-300/[0.055] p-3">
                <p className="text-[10px] font-semibold uppercase tracking-[0.13em] text-orange-300">What CourtCast sees</p>
                <p className="mt-1.5 text-xs leading-5 text-slate-300">{phase.read}</p>
              </div>
            </section>

            <section className="panel p-4">
              <span className="eyebrow">Action → response → counter</span>
              <div className="mt-4 space-y-2">
                <ChainStep index="01" label="Offense" value={phase.actions[0].label} />
                <ArrowDown />
                <ChainStep index="02" label="Defense" value={phase.coverages[0].label} />
                <ArrowDown />
                <ChainStep index="03" label="Likely counter" value={phase.counter} accent />
              </div>
              <div className="mt-4 grid grid-cols-3 gap-2 border-t border-white/7 pt-4">
                <Metric label="Confidence" value={`${phase.confidence}%`} />
                <Metric label="Possession" value={phase.epv.toFixed(2)} suffix="EPV" />
                <Metric label="Game" value={`${phase.winProbability.toFixed(1)}%`} suffix="win" />
              </div>
            </section>

            <section className="panel p-4">
              <div className="mb-4 flex items-center justify-between">
                <span className="eyebrow">Match context</span>
                <Badge variant="outline" className="border-white/10 text-slate-400">{game.league}</Badge>
              </div>
              <div className="space-y-3">
                <TeamRow code={game.awayCode} name={game.away} coach={game.awayCoach} />
                <div className="h-px bg-white/7" />
                <TeamRow code={game.homeCode} name={game.home} coach={game.homeCoach} home />
              </div>
            </section>
          </aside>
        </div>

        <section className="panel mt-4 grid gap-4 p-4 sm:grid-cols-3">
          <div className="flex items-center gap-2 sm:col-span-3">
            <Sparkles className="size-4 text-orange-300" />
            <span className="eyebrow">Living playbook · coach, player, and matchup context</span>
          </div>
          <Insight label="Coach tendency" text={game.coachRead} />
          <Insight label="Player tendency" text={game.playerRead} />
          <Insight label="Adjustment read" text={game.adjustmentRead} />
        </section>

        <section className="mt-10">
          <div className="mb-4">
            <span className="eyebrow">The full CourtCast loop</span>
            <h2 className="mt-2 text-xl font-semibold text-white">From raw film to the next decision</h2>
          </div>
          <div className="grid gap-3 md:grid-cols-4">
            <ProcessCard number="01" icon={<Eye />} title="Observe" text="Track all ten players and the ball; align possessions to official play-by-play." />
            <ProcessCard number="02" icon={<Layers3 />} title="Build the playbook" text="Learn recurring actions by player, lineup, team, coach, and opponent." />
            <ProcessCard number="03" icon={<Target />} title="Predict" text="Rank the next action, defensive response, counter, and possession value." />
            <ProcessCard number="04" icon={<Activity />} title="Update" text="Refresh probabilities as spacing, timing, substitutions, and score context change." />
          </div>
        </section>

        <section className="mt-10 grid gap-4 xl:grid-cols-[1.15fr_.85fr]">
          <div className="panel p-5">
            <span className="eyebrow">Five connected intelligence layers</span>
            <div className="mt-4 grid gap-2 sm:grid-cols-5">
              {[
                ['Player', 'Habits and options'],
                ['Lineup', 'Shared geometry'],
                ['Team', 'Action families'],
                ['Coach', 'Rules and counters'],
                ['Matchup', 'Opponent response'],
              ].map(([title, text], index) => (
                <div key={title} className="rounded-lg border border-white/7 bg-white/[0.025] p-3">
                  <span className="font-mono text-[9px] text-orange-300">0{index + 1}</span>
                  <p className="mt-3 text-xs font-semibold text-white">{title}</p>
                  <p className="mt-1 text-[10px] leading-4 text-slate-500">{text}</p>
                </div>
              ))}
            </div>
            <p className="mt-4 text-xs leading-5 text-slate-400">
              The product does not pretend to hear the called play. It estimates what is most likely next from movement, learned tendencies, and game context—and keeps revising that estimate.
            </p>
          </div>

          <div className="panel p-5">
            <span className="eyebrow">Prototype honesty</span>
            <div className="mt-4 space-y-3">
              <TruthRow state="working" label="Film ingestion, possession segmentation, play-by-play alignment" />
              <TruthRow state="progress" label="Player/ball detection and motion evidence" />
              <TruthRow state="simulated" label="Tactical labels, coach state, EPV, and win probability in this UI" />
            </div>
            <p className="mt-4 border-t border-white/7 pt-4 text-xs leading-5 text-slate-400">
              The research standard is simple: observe reliably before interpreting aggressively. Nothing simulated here is presented as measured model accuracy.
            </p>
          </div>
        </section>

        <p className="mt-6 text-center text-[11px] leading-5 text-slate-600">
          Game {selectedGameIndex + 1} of 5 · All 25 tactical windows, probabilities, coach reads, and timestamps are illustrative product data layered beside official-source video—not validated ground truth from the footage.
        </p>
      </section>
    </main>
  );
}

function ViewLabel({ icon, title, status }: { icon: ReactNode; title: string; status: string }) {
  return (
    <div className="flex h-10 items-center justify-between border-b border-white/8 bg-[#0b1117] px-3">
      <span className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.13em] text-slate-400">{icon}{title}</span>
      <span className="font-mono text-[9px] text-slate-600">{status}</span>
    </div>
  );
}

function TeamRow({ code, name, coach, home = false }: { code: string; name: string; coach: string; home?: boolean }) {
  return (
    <div className="flex items-center gap-3">
      <div className={`grid size-10 place-items-center rounded-lg border font-mono text-xs font-bold ${home ? 'border-orange-300/30 bg-orange-300/10 text-orange-200' : 'border-cyan-300/20 bg-cyan-300/8 text-cyan-200'}`}>{code}</div>
      <div className="min-w-0"><p className="truncate text-sm font-medium text-white">{name}</p><p className="truncate text-[11px] text-slate-500">Coach · {coach}</p></div>
      {home && <span className="ml-auto text-[9px] uppercase tracking-[0.13em] text-slate-600">Home</span>}
    </div>
  );
}

function Insight({ label, text }: { label: string; text: string }) {
  return <div><p className="mb-1 text-[9px] font-semibold uppercase tracking-[0.13em] text-slate-600">{label}</p><p className="text-xs leading-5 text-slate-400">{text}</p></div>;
}

function Court({ phase, offenseCode, defenseCode }: { phase: (typeof games)[number]['phases'][number]; offenseCode: string; defenseCode: string }) {
  const ball = phase.offense[phase.ballOwner];
  return (
    <div className="relative overflow-hidden bg-[#101820] p-3">
      <svg viewBox="46 0 49 50" role="img" aria-label={`Animated half-court showing ${phase.state}`} className="aspect-video w-full overflow-visible rounded-md">
        <defs>
          <pattern id="wood" width="4" height="50" patternUnits="userSpaceOnUse"><rect width="4" height="50" fill="#c98b52" /><path d="M4 0V50" stroke="#b87942" strokeWidth=".16" /></pattern>
          <filter id="shadow"><feDropShadow dx="0" dy=".8" stdDeviation=".65" floodOpacity=".32" /></filter>
        </defs>
        <rect x="46" y="0" width="49" height="50" rx="1" fill="url(#wood)" />
        <g fill="none" stroke="#f6dfc5" strokeWidth=".35" opacity=".9">
          <path d="M47 0V50M94 0V50M47 0H94M47 50H94" /><circle cx="47" cy="25" r="6" /><rect x="75" y="17" width="19" height="16" /><circle cx="75" cy="25" r="6" /><path d="M94 3H88A23.75 23.75 0 0 0 88 47H94" /><path d="M88.75 23.5V26.5M89.3 25h2.2" /><path d="M84.75 25a4 4 0 0 0 8 0" strokeDasharray=".8 .6" />
        </g>
        <g opacity=".18" fill="#0e5f76"><rect x="75" y="17" width="19" height="16" /><circle cx="75" cy="25" r="6" /></g>
        {phase.defense.map(([x, y], index) => (
          <g key={`d-${index}`} className="court-player" style={{ transform: `translate(${x}px, ${y}px)` }} filter="url(#shadow)"><circle r="2.05" fill="#0e5665" stroke="#8fe6eb" strokeWidth=".42" /><text textAnchor="middle" dy=".75" fontSize="1.8" fontWeight="700" fill="#d8fbff">{index + 1}</text></g>
        ))}
        {phase.offense.map(([x, y], index) => (
          <g key={`o-${index}`} className="court-player" style={{ transform: `translate(${x}px, ${y}px)` }} filter="url(#shadow)">{phase.ballOwner === index && <circle r="2.85" fill="none" stroke="#fff0c7" strokeWidth=".35" strokeDasharray=".7 .5" />}<circle r="2.05" fill="#d46622" stroke="#ffd29c" strokeWidth=".42" /><text textAnchor="middle" dy=".75" fontSize="1.8" fontWeight="700" fill="#fff7eb">{index + 1}</text></g>
        ))}
        <circle className="court-ball" cx={ball[0] + 2.5} cy={ball[1] - 1.5} r=".72" fill="#31160a" stroke="#ffbe67" strokeWidth=".28" />
        <CourtLegend y={3} color="#ff9a4b" code={offenseCode} /><CourtLegend y={7} color="#6adce2" code={defenseCode} />
      </svg>
      <div className="absolute bottom-5 left-5 flex items-center gap-2 rounded-lg border border-black/10 bg-[#111820]/88 px-2.5 py-1.5 text-[10px] font-medium text-white shadow-lg backdrop-blur"><CircleDot className="size-3 text-orange-300" /> {phase.state}</div>
    </div>
  );
}

function CourtLegend({ y, color, code }: { y: number; color: string; code: string }) {
  return <g transform={`translate(49 ${y})`}><rect width="12" height="3.3" rx="1.65" fill="#081016" opacity=".78" /><circle cx="1.7" cy="1.65" r=".55" fill={color} /><text x="3" y="2.15" fontSize="1.35" fontWeight="700" fill="#f7f4ef">{code}</text></g>;
}

function ModelControls({ elapsed, playing, setElapsed, setPlaying, game, phaseIndex }: { elapsed: number; playing: boolean; setElapsed: Dispatch<SetStateAction<number>>; setPlaying: Dispatch<SetStateAction<boolean>>; game: (typeof games)[number]; phaseIndex: number }) {
  return (
    <div className="border-t border-white/7 bg-[#0b1117] px-3 py-3">
      <div className="flex items-center gap-2">
        <Button variant="outline" size="icon" onClick={() => setPlaying((value) => !value)} aria-label={playing ? 'Pause simulation' : 'Play simulation'} className="size-8 border-white/10 bg-white/[0.04] text-white hover:bg-white/10">{playing ? <Pause /> : <Play />}</Button>
        <Button variant="ghost" size="icon" onClick={() => { setElapsed(0); setPlaying(false); }} aria-label="Reset simulation" className="size-8 text-slate-400 hover:bg-white/8 hover:text-white"><RotateCcw /></Button>
        <Slider min={0} max={MODEL_SECONDS} step={0.25} value={[elapsed]} onValueChange={(value) => { setElapsed(value[0]); setPlaying(false); }} aria-label="Possession timeline" className="[&_[data-slot=slider-range]]:bg-orange-300 [&_[data-slot=slider-thumb]]:border-orange-300" />
        <span className="w-11 text-right font-mono text-[10px] text-slate-500">{elapsed.toFixed(1)}s</span>
      </div>
      <div className="mt-2 grid grid-cols-5 gap-1">
        {game.phases.map((item, index) => (
          <button key={item.state} onClick={() => { setElapsed(item.at); setPlaying(false); }} aria-label={`Jump to ${item.state}`} className={`h-1 rounded-full transition ${index <= phaseIndex ? 'bg-orange-300' : 'bg-white/10'}`} />
        ))}
      </div>
    </div>
  );
}

function PredictionRow({ item, primary }: { item: { label: string; value: number }; primary?: boolean }) {
  return (
    <div><div className="mb-1.5 flex items-baseline justify-between gap-3"><span className={`text-xs ${primary ? 'font-semibold text-white' : 'text-slate-400'}`}>{item.label}</span><span className={`font-mono text-xs ${primary ? 'text-orange-200' : 'text-slate-500'}`}>{item.value}%</span></div><Progress value={item.value} className={`[&_[data-slot=progress-track]]:h-1.5 [&_[data-slot=progress-track]]:bg-white/7 ${primary ? '[&_[data-slot=progress-indicator]]:bg-orange-300' : '[&_[data-slot=progress-indicator]]:bg-slate-600'}`} /></div>
  );
}

function ChainStep({ index, label, value, accent = false }: { index: string; label: string; value: string; accent?: boolean }) {
  return <div className={`flex items-center gap-3 rounded-lg border px-3 py-2.5 ${accent ? 'border-orange-300/25 bg-orange-300/[0.07]' : 'border-white/7 bg-white/[0.025]'}`}><span className={`font-mono text-[10px] ${accent ? 'text-orange-300' : 'text-slate-600'}`}>{index}</span><div><p className="text-[9px] uppercase tracking-[0.13em] text-slate-600">{label}</p><p className="mt-0.5 text-xs font-medium text-slate-200">{value}</p></div></div>;
}

function ArrowDown() {
  return <div className="ml-5 h-3 w-px bg-white/10" />;
}

function Metric({ label, value, suffix }: { label: string; value: string; suffix?: string }) {
  return <div><p className="text-[9px] uppercase tracking-[0.1em] text-slate-600">{label}</p><p className="mt-1 font-mono text-base font-semibold text-white">{value}</p>{suffix && <p className="text-[9px] text-slate-600">{suffix}</p>}</div>;
}

function ProcessCard({ number, icon, title, text }: { number: string; icon: ReactNode; title: string; text: string }) {
  return (
    <div className="panel p-4">
      <div className="flex items-center justify-between"><span className="text-orange-300">{icon}</span><span className="font-mono text-[10px] text-slate-600">{number}</span></div>
      <p className="mt-5 text-sm font-semibold text-white">{title}</p>
      <p className="mt-1.5 text-xs leading-5 text-slate-500">{text}</p>
    </div>
  );
}

function TruthRow({ state, label }: { state: 'working' | 'progress' | 'simulated'; label: string }) {
  const copy = {
    working: { tag: 'Working', styles: 'border-emerald-300/20 bg-emerald-300/8 text-emerald-200' },
    progress: { tag: 'In progress', styles: 'border-cyan-300/20 bg-cyan-300/8 text-cyan-200' },
    simulated: { tag: 'Simulated', styles: 'border-amber-300/20 bg-amber-300/8 text-amber-200' },
  }[state];
  return (
    <div className="flex items-start gap-3">
      <div className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full border border-white/8 bg-white/[0.03]"><Check className="size-3 text-slate-400" /></div>
      <div><Badge variant="outline" className={`mb-1 h-5 text-[9px] ${copy.styles}`}>{copy.tag}</Badge><p className="text-xs leading-5 text-slate-400">{label}</p></div>
    </div>
  );
}
