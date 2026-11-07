import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Check, Pause, Play, Plus, Square, Trash2, X } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "OffTheGrid — Visual Time-Block Timers" },
      {
        name: "description",
        content:
          "Build systems like a morning routine from visual time-blocks and run each timer one tap at a time.",
      },
      { property: "og:title", content: "OffTheGrid — Visual Time-Block Timers" },
      {
        property: "og:description",
        content: "Create sets of time-blocks and run them one tap at a time.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Index,
});

type Block = { id: string; name: string; minutes: number };
type System = { id: string; name: string; blocks: Block[] };
type Active = {
  systemId: string;
  blockId: string;
  remaining: number;
  total: number;
  running: boolean;
};

const uid = () => Math.random().toString(36).slice(2, 10);
const KEY = "offgrid-systems";
const SEED_KEY = "offgrid-seed-count";
const SEED: System[] = [
  {
    id: uid(),
    name: "Morning routine",
    blocks: [
      { id: uid(), name: "Pray", minutes: 2 },
      { id: uid(), name: "Brush teeth", minutes: 2 },
      { id: uid(), name: "Stretch", minutes: 5 },
    ],
  },
  {
    id: uid(),
    name: "Deep work sprint",
    blocks: [
      { id: uid(), name: "Clear desk", minutes: 1 },
      { id: uid(), name: "Set intention", minutes: 2 },
      { id: uid(), name: "Deep work", minutes: 25 },
      { id: uid(), name: "Capture notes", minutes: 3 },
    ],
  },
  {
    id: uid(),
    name: "Evening shutdown",
    blocks: [
      { id: uid(), name: "Tidy space", minutes: 3 },
      { id: uid(), name: "Plan tomorrow", minutes: 5 },
      { id: uid(), name: "Read", minutes: 10 },
      { id: uid(), name: "Breathe", minutes: 4 },
    ],
  },
];

const fmt = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
const tag = (n: number) => String(n + 1).padStart(2, "0");

const field =
  "rounded-none border border-input bg-surface px-3 py-2 text-sm text-foreground outline-none transition-colors focus:border-foreground focus:ring-2 focus:ring-ring/25";
const chip =
  "rounded-none border border-foreground/40 bg-surface px-3 py-1.5 font-mono text-[10px] font-bold uppercase tracking-[0.15em] text-foreground transition-colors hover:bg-secondary";

export function Index() {
  const [systems, setSystems] = useState<System[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [active, setActive] = useState<Active | null>(null);
  const [done, setDone] = useState<Record<string, boolean>>({});
  const [newSystem, setNewSystem] = useState("");
  const tick = useRef<number | null>(null);

  useEffect(() => {
    const raw = localStorage.getItem(KEY);
    if (!raw) {
      setSystems(SEED);
      localStorage.setItem(SEED_KEY, String(SEED.length));
    } else {
      const stored: System[] = JSON.parse(raw);
      const applied = Number(localStorage.getItem(SEED_KEY) ?? 1);
      const fresh = SEED.slice(applied).filter((s) => !stored.some((x) => x.name === s.name));
      setSystems(fresh.length ? [...stored, ...fresh] : stored);
      localStorage.setItem(SEED_KEY, String(SEED.length));
    }
    setLoaded(true);
  }, []);
  useEffect(() => {
    if (loaded) localStorage.setItem(KEY, JSON.stringify(systems));
  }, [systems, loaded]);

  useEffect(() => {
    if (!active?.running) return;
    tick.current = window.setInterval(() => {
      setActive((a) => {
        if (!a) return a;
        if (a.remaining <= 1) {
          setDone((d) => ({ ...d, [a.blockId]: true }));
          try {
            const ctx = new AudioContext();
            const o = ctx.createOscillator();
            o.connect(ctx.destination);
            o.start();
            o.stop(ctx.currentTime + 0.4);
          } catch {
            // Web Audio unavailable — the visual "done" state is the fallback.
          }
          return null;
        }
        return { ...a, remaining: a.remaining - 1 };
      });
    }, 1000);
    return () => {
      if (tick.current) clearInterval(tick.current);
    };
  }, [active?.running, active?.blockId]);

  const start = (s: System, b: Block) => {
    if (active?.blockId === b.id) {
      setActive({ ...active, running: !active.running });
      return;
    }
    setActive({
      systemId: s.id,
      blockId: b.id,
      remaining: b.minutes * 60,
      total: b.minutes * 60,
      running: true,
    });
  };

  const addSystem = () => {
    if (!newSystem.trim()) return;
    setSystems([...systems, { id: uid(), name: newSystem.trim(), blocks: [] }]);
    setNewSystem("");
  };
  const update = (id: string, fn: (s: System) => System) =>
    setSystems((all) => all.map((s) => (s.id === id ? fn(s) : s)));

  return (
    <main className="min-h-screen bg-background font-sans text-foreground">
      <div className="mx-auto max-w-6xl px-4 py-6 md:px-8 md:py-10">
        <Dashboard systems={systems} done={done} active={active} />

        <header className="mb-4 mt-8 flex flex-wrap items-end justify-between gap-4 border-b-2 border-foreground pb-3">
          <div className="flex items-center gap-2">
            <span className="h-3.5 w-3.5 border border-foreground bg-primary" />
            <h2 className="font-display text-sm font-bold uppercase tracking-[0.3em]">Systems</h2>
          </div>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              addSystem();
            }}
            className="flex"
          >
            <input
              value={newSystem}
              onChange={(e) => setNewSystem(e.target.value)}
              placeholder="New system / goal"
              className={`${field} w-56 border-r-0`}
            />
            <button className="flex items-center gap-1.5 rounded-none border border-foreground bg-primary px-4 py-2 font-mono text-xs font-bold uppercase tracking-[0.15em] text-primary-foreground transition-colors hover:bg-primary/80">
              <Plus className="h-3.5 w-3.5" /> Add
            </button>
          </form>
        </header>

        <div className="grid gap-4 lg:grid-cols-2">
          {systems.length === 0 && loaded && (
            <p className="border border-dashed border-foreground/30 px-4 py-6 text-center text-sm text-muted-foreground">
              Add your first system above — like “Morning routine”.
            </p>
          )}
          {systems.map((s, i) => (
            <SystemSection
              key={s.id}
              system={s}
              index={i}
              active={active}
              done={done}
              onStart={(b) => start(s, b)}
              onStop={() => setActive(null)}
              onAddBlock={(b) => update(s.id, (x) => ({ ...x, blocks: [...x.blocks, b] }))}
              onRemoveBlock={(id) => {
                if (active?.blockId === id) setActive(null);
                update(s.id, (x) => ({ ...x, blocks: x.blocks.filter((b) => b.id !== id) }));
              }}
              onEditBlock={(id, patch) => {
                if (active?.blockId === id) setActive(null);
                update(s.id, (x) => ({
                  ...x,
                  blocks: x.blocks.map((b) => (b.id === id ? { ...b, ...patch } : b)),
                }));
              }}
              onDelete={() => {
                if (active?.systemId === s.id) setActive(null);
                setSystems((all) => all.filter((x) => x.id !== s.id));
              }}
              onReset={() =>
                setDone((d) => {
                  const n = { ...d };
                  s.blocks.forEach((b) => delete n[b.id]);
                  return n;
                })
              }
            />
          ))}
        </div>
      </div>
    </main>
  );
}

function SystemSection(props: {
  system: System;
  index: number;
  active: Active | null;
  done: Record<string, boolean>;
  onStart: (b: Block) => void;
  onStop: () => void;
  onAddBlock: (b: Block) => void;
  onRemoveBlock: (id: string) => void;
  onEditBlock: (id: string, patch: Partial<Block>) => void;
  onDelete: () => void;
  onReset: () => void;
}) {
  const { system: s, active, done } = props;
  const [name, setName] = useState("");
  const [mins, setMins] = useState(2);
  const total = s.blocks.reduce((t, b) => t + b.minutes, 0);
  const completed = s.blocks.filter((b) => done[b.id]).length;

  return (
    <section className="overflow-hidden rounded-lg border border-foreground/60 bg-card">
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-foreground/25 bg-secondary px-4 py-3">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="border border-foreground/40 bg-surface px-1.5 font-mono text-[10px] font-bold uppercase leading-5 tracking-[0.15em] text-muted-foreground">
              SYS-{tag(props.index)}
            </span>
            <h2 className="font-display text-base font-bold uppercase tracking-wide">{s.name}</h2>
          </div>
          <div className="mt-2 h-1 w-12 bg-primary" />
          <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.15em] text-muted-foreground">
            {s.blocks.length} blocks · {total} min · {completed}/{s.blocks.length} done
          </p>
        </div>
        <div className="flex gap-1.5">
          {completed > 0 && (
            <button onClick={props.onReset} className={chip}>
              Reset
            </button>
          )}
          <button
            onClick={props.onDelete}
            aria-label="Delete system"
            className="rounded-none border border-foreground/40 bg-surface p-2 text-muted-foreground transition-colors hover:border-destructive hover:text-destructive"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 p-3 sm:grid-cols-4">
        {s.blocks.map((b, bi) => {
          const isActive = active?.blockId === b.id;
          const pct = isActive
            ? ((active.total - active.remaining) / active.total) * 100
            : done[b.id]
              ? 100
              : 0;
          return (
            <div
              key={b.id}
              className={`group relative aspect-square overflow-hidden border ${
                isActive
                  ? "border-foreground bg-primary"
                  : done[b.id]
                    ? "border-foreground/30 bg-secondary"
                    : "border-foreground/25 bg-surface"
              }`}
            >
              <div
                className="absolute inset-x-0 bottom-0 bg-foreground/20 transition-all duration-1000 ease-linear"
                style={{ height: `${pct}%` }}
              />
              <div className="relative flex h-full w-full flex-col items-center justify-center gap-0.5 p-2 text-center">
                <button
                  onClick={() => props.onStart(b)}
                  className="flex flex-col items-center gap-0.5"
                >
                  <span
                    className={`font-mono text-[9px] uppercase tracking-[0.15em] ${
                      isActive ? "text-foreground/80" : "text-muted-foreground"
                    }`}
                  >
                    {tag(bi)}
                  </span>
                  <span className="text-xs font-semibold leading-tight">{b.name}</span>
                  <span className="font-display text-lg font-bold tabular-nums">
                    {isActive ? fmt(active.remaining) : done[b.id] ? "✓" : fmt(b.minutes * 60)}
                  </span>
                  <span
                    className={`hidden font-mono text-[9px] uppercase tracking-[0.05em] sm:block ${
                      isActive ? "text-foreground/80" : "text-muted-foreground"
                    }`}
                  >
                    {isActive
                      ? active.running
                        ? "tap to pause"
                        : "paused · tap to resume"
                      : "tap to start"}
                  </span>
                </button>
                {isActive && (
                  <div className="mt-1.5 flex gap-1.5">
                    <button
                      onClick={() => props.onStart(b)}
                      aria-label={active.running ? "Pause" : "Resume"}
                      className="rounded-none border border-foreground bg-foreground p-1.5 text-primary"
                    >
                      {active.running ? (
                        <Pause className="h-3.5 w-3.5" />
                      ) : (
                        <Play className="h-3.5 w-3.5" />
                      )}
                    </button>
                    <button
                      onClick={props.onStop}
                      aria-label="Stop"
                      className="rounded-none border border-foreground bg-surface p-1.5 text-foreground"
                    >
                      <Square className="h-3.5 w-3.5" />
                    </button>
                  </div>
                )}
              </div>
              <div className="absolute right-1.5 top-1.5 flex gap-1">
                {!isActive && (
                  <button
                    onClick={() => props.onRemoveBlock(b.id)}
                    aria-label="Remove block"
                    className="rounded-none bg-surface/80 p-1 text-muted-foreground opacity-0 transition-opacity hover:text-destructive group-hover:opacity-100"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            </div>
          );
        })}

        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (!name.trim() || mins <= 0) return;
            props.onAddBlock({ id: uid(), name: name.trim(), minutes: mins });
            setName("");
          }}
          className="flex aspect-square flex-col justify-center gap-1.5 border-2 border-dashed border-foreground/25 bg-background/40 p-2"
        >
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Block name"
            className={`${field} w-full px-2 py-1 text-xs`}
          />
          <div className="flex items-center gap-1.5">
            <input
              type="number"
              min={1}
              value={mins}
              onChange={(e) => setMins(Number(e.target.value))}
              className={`${field} w-14 px-2 py-1 text-xs`}
            />
            <span className="font-mono text-[10px] uppercase tracking-[0.15em] text-muted-foreground">
              min
            </span>
          </div>
          <button className="flex items-center justify-center gap-1 rounded-none bg-accent py-1 font-mono text-[10px] font-bold uppercase tracking-[0.15em] text-accent-foreground transition-colors hover:bg-accent/85">
            <Plus className="h-3 w-3" /> Block
          </button>
        </form>
      </div>
    </section>
  );
}

function Dashboard({
  systems,
  done,
  active,
}: {
  systems: System[];
  done: Record<string, boolean>;
  active: Active | null;
}) {
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => {
    setNow(new Date());
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);
  const h = now?.getHours() ?? 9;
  const greet = h < 12 ? "Good morning" : h < 18 ? "Good afternoon" : "Good evening";
  const blocks = systems.flatMap((s) => s.blocks);
  const completed = blocks.filter((b) => done[b.id]).length;
  const mins = blocks.reduce((t, b) => t + b.minutes, 0);
  const pct = blocks.length ? Math.round((completed / blocks.length) * 100) : 0;
  const activeName = active && blocks.find((b) => b.id === active.blockId)?.name;
  const segments = 12;
  const filled = Math.round((pct / 100) * segments);
  const stats = [
    { label: "Systems", value: systems.length },
    { label: "Blocks", value: blocks.length },
    { label: "Planned min", value: mins },
    { label: "Completed", value: `${pct}%` },
  ];
  return (
    <section className="overflow-hidden rounded-lg border-2 border-foreground bg-card">
      <div className="flex items-stretch justify-between border-b border-foreground/30 bg-secondary">
        <div className="flex items-center gap-2 px-3 py-2">
          <span className="h-2 w-2 rounded-full bg-foreground" />
          <p className="font-mono text-[10px] font-bold uppercase tracking-[0.25em]">
            OffTheGrid // daily credential
          </p>
        </div>
        <div className="w-16 bg-primary md:w-28" />
      </div>

      <div className="flex flex-wrap items-center justify-between gap-6 px-4 py-6 md:px-6">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
            {now
              ? now.toLocaleDateString([], { weekday: "short", month: "short", day: "numeric" })
              : "—"}{" "}
            · systems online
          </p>
          <h1 className="mt-2 font-display text-3xl font-bold uppercase leading-none tracking-tight md:text-5xl">
            {greet}
          </h1>
          <div className="mt-3 h-1 w-16 bg-primary" />
          <p className="mt-3 max-w-md text-sm text-muted-foreground">
            {activeName
              ? `Timer engaged: ${activeName}. Stay locked in.`
              : blocks.length
                ? `All systems standing by. ${blocks.length - completed} blocks awaiting your command.`
                : "No systems loaded. Shall we build your first one?"}
          </p>
        </div>

        <div className="w-40 shrink-0 border border-foreground bg-surface">
          <div className="flex items-center justify-between border-b border-foreground/30 px-2 py-1">
            <span className="font-mono text-[9px] uppercase tracking-[0.15em] text-muted-foreground">
              Local
            </span>
            <span className="h-1.5 w-1.5 rounded-full bg-primary outline outline-1 outline-foreground" />
          </div>
          <div className="px-3 py-3 text-center">
            <p className="font-display text-2xl font-bold tabular-nums">
              {now ? now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "--:--"}
            </p>
            <p className="mt-1 font-mono text-[9px] uppercase tracking-[0.15em] text-muted-foreground">
              {pct}% complete
            </p>
          </div>
          <div className="flex gap-[2px] px-2 pb-2">
            {Array.from({ length: segments }).map((_, i) => (
              <span
                key={i}
                className={`h-1.5 flex-1 ${i < filled ? "bg-primary" : "bg-foreground/25"}`}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="dot-matrix h-6 border-y border-foreground/25 bg-secondary/50" />

      <div className="grid grid-cols-2 gap-px bg-foreground/25 md:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="bg-secondary px-4 py-3">
            <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-muted-foreground">
              {s.label}
            </p>
            <p className="font-display text-xl font-bold tabular-nums">{s.value}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
