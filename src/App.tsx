import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import {
  ArrowDownRight,
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  CalendarDays,
  Check,
  Circle,
  ChevronDown,
  ChevronUp,
  GripVertical,
  Home as HomeIcon,
  Plus,
  Sparkles,
  Trash2,
} from "lucide-react";
import {
  BrowserRouter,
  Link,
  Navigate,
  NavLink,
  Route,
  Routes,
  useLocation,
  useNavigate,
  useParams,
} from "react-router-dom";
import { cn } from "./lib/cn";

type MilestoneStatus = "upcoming" | "current" | "complete";

type Milestone = {
  id: string;
  title: string;
  date?: string;
  note?: string;
  status: MilestoneStatus;
};

type Plotline = {
  id: string;
  title: string;
  description?: string;
  startDate: string;
  milestones: Milestone[];
};

const STORAGE_KEY = "plotline-data";


const examplePlots: Plotline[] = [
  {
    id: "launch-my-first-product",
    title: "Launch my first product",
    description: "From the first usable version to putting it in the world.",
    startDate: "2026-09-08",
    milestones: [
      { id: "launch-1", title: "Shape the idea", date: "2026-09-10", status: "complete" },
      { id: "launch-2", title: "Build the MVP", date: "2026-09-22", status: "complete" },
      { id: "launch-3", title: "Test with people", date: "2026-10-03", status: "current" },
      { id: "launch-4", title: "Polish the launch", date: "2026-10-10", status: "upcoming" },
      { id: "launch-5", title: "Put it live", date: "2026-10-17", status: "upcoming" },
      { id: "launch-6", title: "See what happens", date: "2026-10-24", status: "upcoming" },
    ],
  },
  {
    id: "moving-to-lagos",
    title: "Moving to Lagos",
    description: "A simple path from decision to feeling properly settled.",
    startDate: "2026-09-01",
    milestones: [
      { id: "move-1", title: "Find apartments", date: "2026-09-03", status: "complete" },
      { id: "move-2", title: "Inspect apartments", date: "2026-09-10", status: "complete" },
      { id: "move-3", title: "Pay deposit", date: "2026-09-18", status: "current" },
      { id: "move-4", title: "Get the keys", date: "2026-09-28", status: "upcoming" },
      { id: "move-5", title: "Move in", date: "2026-10-03", status: "upcoming" },
      { id: "move-6", title: "Feel settled", date: "2026-10-17", status: "upcoming" },
    ],
  },
  {
    id: "land-my-first-frontend-role",
    title: "Land my first frontend role",
    description: "Turn the job search into a sequence instead of one giant task.",
    startDate: "2026-08-24",
    milestones: [
      { id: "job-1", title: "Sharpen the portfolio", date: "2026-08-28", status: "complete" },
      { id: "job-2", title: "Start applying", date: "2026-09-02", status: "complete" },
      { id: "job-3", title: "Get through interviews", date: "2026-10-06", status: "current" },
      { id: "job-4", title: "Choose the right offer", date: "2026-10-14", status: "upcoming" },
      { id: "job-5", title: "Start the role", date: "2026-10-26", status: "upcoming" },
    ],
  },
  {
    id: "plan-the-wedding",
    title: "Plan the wedding",
    description: "Keep the big decisions visible without turning the whole thing into a checklist.",
    startDate: "2026-07-12",
    milestones: [
      { id: "wed-1", title: "Set the date", date: "2026-07-15", status: "complete" },
      { id: "wed-2", title: "Book the venue", date: "2026-07-28", status: "complete" },
      { id: "wed-3", title: "Send invitations", date: "2026-10-08", status: "current" },
      { id: "wed-4", title: "Final fittings", date: "2026-11-01", status: "upcoming" },
      { id: "wed-5", title: "Get married", date: "2026-11-21", status: "upcoming" },
    ],
  },
  {
    id: "ship-a-client-website",
    title: "Ship a client website",
    description: "A project path from first conversation to launch day.",
    startDate: "2026-09-14",
    milestones: [
      { id: "site-1", title: "Kickoff", date: "2026-09-15", status: "complete" },
      { id: "site-2", title: "Approve the direction", date: "2026-09-19", status: "complete" },
      { id: "site-3", title: "Build the pages", date: "2026-10-07", status: "current" },
      { id: "site-4", title: "Review together", date: "2026-10-12", status: "upcoming" },
      { id: "site-5", title: "Launch", date: "2026-10-16", status: "upcoming" },
    ],
  },
];

const seedPlot = examplePlots[1];

function isPlot(value: unknown): value is Plotline {
  if (!value || typeof value !== "object") return false;
  const plot = value as Partial<Plotline>;
  return (
    typeof plot.id === "string" &&
    typeof plot.title === "string" &&
    typeof plot.startDate === "string" &&
    Array.isArray(plot.milestones)
  );
}

function loadPlots(): Plotline[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed: unknown = JSON.parse(saved);
      if (Array.isArray(parsed)) return parsed.filter(isPlot);
    }
  } catch {
    // Fall through to the seed plot.
  }
  return [seedPlot];
}

function todayISO() {
  const now = new Date();
  const pad = (value: number) => String(value).padStart(2, "0");
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
}

function formatDate(date?: string) {
  if (!date) return "No date";
  const parsed = new Date(`${date}T12:00:00`);
  if (Number.isNaN(parsed.getTime())) return "No date";
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(parsed);
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}


const sectionLabel = "font-mono text-[11px] font-medium uppercase leading-none tracking-[.1em]";
const eyebrow = cn(
  sectionLabel,
  "mb-[26px] flex items-center gap-2.5 [&>span]:border [&>span]:border-ink [&>span]:bg-lime [&>span]:px-1.5 [&>span]:py-1",
);
const monoLink = "font-mono text-xs uppercase tracking-[.04em]";
const textLink = cn(monoLink, "inline-flex items-center gap-1.5 py-2.5 underline-offset-4 hover:underline");
const backLink = cn(monoLink, "inline-flex items-center gap-2 underline-offset-4 hover:underline");
const btn =
  "inline-flex min-h-12 items-center justify-center gap-[9px] border-2 border-ink px-[18px] font-bold transition duration-200 hover:-translate-x-[3px] hover:-translate-y-[3px] hover:shadow-[5px_5px_0_var(--color-ink)] disabled:opacity-40 disabled:hover:translate-x-0 disabled:hover:translate-y-0 disabled:hover:shadow-none";
const btnDark = cn(btn, "bg-ink text-cream");
const btnLight = cn(btn, "border-lime bg-lime text-ink");
const heroH1 =
  "font-display font-extrabold tracking-[-.065em] text-[length:clamp(54px,10vw,82px)] lg:text-[length:clamp(58px,7vw,104px)] leading-[.91]";
const pageH1 =
  "font-display font-extrabold tracking-[-.06em] text-[52px] sm:text-[length:clamp(56px,8.6vw,120px)] leading-[.9]";
const h2Big =
  "font-display font-extrabold tracking-[-.065em] text-[length:clamp(48px,10vw,72px)] lg:text-[length:clamp(50px,6.4vw,92px)] leading-[.9]";
const brandMark =
  "grid size-[30px] -rotate-[8deg] place-items-center border-2 border-ink bg-lime font-mono text-lg transition-transform duration-[250ms] group-hover:rotate-[8deg] group-hover:scale-105";
const field =
  "w-full rounded-none border-b-2 border-line bg-transparent py-[13px] text-ink outline-none placeholder:text-ink/50 focus:border-ink";
const dateInput = cn(
  field,
  "[color-scheme:light] [&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-calendar-picker-indicator]:opacity-65",
);
const labelText = "mb-2.5 block font-mono text-xs font-semibold uppercase";
const footerLink = "text-sm text-cream hover:text-lime";
const cardColors = ["bg-orange", "bg-lime", "bg-blue text-cream", "bg-pink"];
const legalCopy =
  "max-w-[760px] [&_h2]:mt-12 [&_h2]:mb-3 [&_h2]:font-display [&_h2]:text-[28px] [&_h2]:font-bold [&_h2]:leading-[1.05] [&_h2]:tracking-[-.03em] [&_p]:text-base [&_p]:leading-[1.7] md:[&_p]:text-lg";

function Seo({ title, description }: { title: string; description: string }) {
  useEffect(() => {
    document.title = title;
    const descriptionTag = document.querySelector<HTMLMetaElement>('meta[name="description"]');
    if (descriptionTag) descriptionTag.content = description;
    const canonical = document.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (canonical) canonical.href = window.location.href.split("#")[0];
  }, [title, description]);
  return null;
}

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, [pathname]);
  return null;
}

function ScrollReveal({ children, className = "" }: { children: ReactNode; className?: string }) {
  const [visible, setVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!ref.current || typeof IntersectionObserver === "undefined") { setVisible(true); return; }
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { setVisible(true); observer.disconnect(); }
    }, { threshold: 0.12 });
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);
  return (
    <div
      ref={ref}
      className={cn(
        "transition-[opacity,transform] duration-[800ms] ease-[cubic-bezier(.2,.75,.2,1)]",
        visible ? "translate-y-0 opacity-100" : "translate-y-[25px] opacity-0 md:translate-y-[42px]",
        className,
      )}
    >
      {children}
    </div>
  );
}

function Header() {
  return (
    <header className="sticky top-0 z-20 flex h-[68px] items-center justify-between border-b border-line bg-paper/90 px-bar backdrop-blur-[14px] md:h-[76px]">
      <Link to="/" className="group flex items-center gap-2.5 font-display text-[21px] font-extrabold tracking-[-1.2px] sm:text-2xl" aria-label="Plotline home">
        <span className={brandMark} aria-hidden="true">/</span>
        <span>plotline</span>
      </Link>

      <nav className="flex items-center gap-2.5 md:gap-7" aria-label="Main navigation">
        <NavLink
          to="/plots"
          className={cn(
            monoLink,
            "relative py-2 after:absolute after:inset-x-0 after:bottom-0.5 after:h-px after:origin-right after:scale-x-0 after:bg-ink after:transition-transform after:duration-200 hover:after:origin-left hover:after:scale-x-100 aria-[current=page]:after:scale-x-100",
          )}
        >
          <span className="hidden sm:inline">Your </span>plots
        </NavLink>
        <Link to="/create" className={cn(btnDark, "min-h-[38px] px-2.5 sm:min-h-10 sm:px-3.5")}>
          <Plus size={16} className="hidden sm:block" /> New plot
        </Link>
      </nav>
    </header>
  );
}

function Footer() {
  return (
    <footer className="border-t border-white/10 bg-smoke px-bar text-cream">
      <div className="grid gap-[50px] pt-[45px] pb-[45px] md:grid-cols-[minmax(0,1.4fr)_minmax(260px,.7fr)] md:gap-20 md:pt-[72px] md:pb-16">
        <div className="max-w-[500px]">
          <Link to="/" className="group inline-flex items-center gap-2.5 font-display text-[25px] font-extrabold tracking-[-1.2px] text-cream" aria-label="Plotline home">
            <span className={cn(brandMark, "border-cream")} aria-hidden="true">/</span>
            <span>plotline</span>
          </Link>
          <p className="mt-[25px] mb-[26px] max-w-[430px] text-base leading-[1.55] text-cream/60">Make the next chapter visible. Turn a big thing into a path you can actually move through.</p>
          <Link to="/create" className="inline-flex items-center gap-2 py-2.5 font-mono text-[11px] font-medium uppercase tracking-[.06em] text-lime underline-offset-[5px] hover:underline">Start a plot <ArrowRight size={15} /></Link>
        </div>

        <div className="grid grid-cols-2 gap-[30px] max-md:max-w-[420px] md:gap-[50px]">
          <div className="flex flex-col items-start gap-3">
            <span className="mb-2 font-mono text-[10px] font-medium uppercase tracking-[.1em] text-cream/40">Explore</span>
            <Link to="/" className={footerLink}>Home</Link>
            <Link to="/plots" className={footerLink}>Your plots</Link>
            <Link to="/create" className={footerLink}>Create a plot</Link>
          </div>
          <div className="flex flex-col items-start gap-3">
            <span className="mb-2 font-mono text-[10px] font-medium uppercase tracking-[.1em] text-cream/40">Information</span>
            <Link to="/privacy" className={footerLink}>Privacy</Link>
            <Link to="/terms" className={footerLink}>Terms</Link>
          </div>
        </div>
      </div>

      <div className="flex flex-col items-start gap-[9px] border-t border-white/10 pt-5 pb-6 font-mono text-[10px] uppercase tracking-[.06em] text-cream/60 md:flex-row md:items-center md:justify-between md:gap-5 md:[&>span:last-child]:text-right">
        <span>© {new Date().getFullYear()} Plotline</span>
        <span>Built for the things that do not fit in a checklist.</span>
        <span>Chapters / Milestones / Movement</span>
      </div>
    </footer>
  );
}

function Home() {
  const [exampleIndex, setExampleIndex] = useState(0);
  const activeExample = examplePlots[exampleIndex];
  const activeComplete = activeExample.milestones.filter((item) => item.status === "complete").length;
  const pad = (value: number) => String(value).padStart(2, "0");

  return (
    <main>
      <Seo title="Plotline — See the path." description="Turn a big, messy chapter into a visual path of meaningful milestones." />

      <section className="relative grid items-center gap-[clamp(30px,5vw,90px)] overflow-hidden bg-orange px-section py-[50px] sm:py-[58px] md:py-[70px] lg:min-h-[min(760px,calc(100vh_-_76px))] lg:grid-cols-[minmax(0,1fr)_minmax(460px,.9fr)]">
        <div className="pointer-events-none absolute inset-0 animate-pattern-drift bg-[radial-gradient(var(--color-ink)_1.3px,transparent_1.3px)] bg-[length:18px_18px] opacity-70 [mask-image:linear-gradient(90deg,black_0%,transparent_78%)]" aria-hidden="true" />
        <div className="pointer-events-none absolute -top-[22vw] -right-[13vw] size-[52vw] max-h-[760px] max-w-[760px] rotate-[14deg] border border-ink/20 opacity-45 shadow-[0_0_0_30px_rgba(23,20,20,.05),0_0_0_60px_rgba(23,20,20,.04)]" aria-hidden="true" />

        <div className="relative z-[2] max-w-[760px] animate-rise-in self-center">
          <div className={eyebrow}><span>01</span> SEE THE PATH</div>
          <h1 className={cn(heroH1, "max-w-[720px] [&_em]:text-cream [&_em]:not-italic")}>Make the next<br /><em>chapter visible.</em></h1>
          <p className="my-[26px] max-w-[500px] text-[17px] leading-[1.55] sm:text-lg">Turn a big thing into a clear path of moments, so you can see where you are and what comes next.</p>
          <div className="flex flex-wrap items-center gap-6">
            <Link to="/create" className={btnDark}>Create a plot <ArrowRight size={18} /></Link>
            <Link to="/create" className={textLink}>Make yours <ArrowUpRight size={17} /></Link>
          </div>
        </div>

        <div className="relative flex min-h-[340px] animate-float-in items-center justify-center self-center md:min-h-[420px] lg:min-h-[500px]" aria-label={`Plotline example showing ${activeExample.title} and its milestones`}>
          <div className="relative z-[2] w-[min(100%,590px)] rotate-[1.5deg] border-[3px] border-ink bg-cream p-[17px] shadow-[8px_8px_0_var(--color-ink)] sm:p-6 sm:shadow-[12px_12px_0_var(--color-ink)]">
            <div className="flex items-center justify-between gap-3 border-b border-line pb-[18px] font-mono text-[10px] uppercase tracking-[.06em]"><span>EXAMPLE CHAPTER</span><strong>{pad(exampleIndex + 1)} / {pad(examplePlots.length)}</strong></div>
            <div className="mt-7 font-display text-[38px] font-extrabold leading-[.9] tracking-[-.06em] sm:text-[length:clamp(38px,4vw,58px)]">{activeExample.title}</div>
            <div className="mt-3 font-mono text-[11px] text-ink/70">{activeExample.milestones.length} milestones · {activeComplete} complete · 1 current</div>
            <div
              className="relative mt-[35px] mb-7 grid grid-cols-[repeat(var(--count),minmax(0,1fr))] gap-[3px] sm:mt-12 sm:mb-[38px] sm:gap-2"
              style={{ ["--count" as string]: activeExample.milestones.length }}
            >
              <span className="absolute top-[11px] right-[calc(50%_/_var(--count))] left-[calc(50%_/_var(--count))] h-[3px] bg-ink sm:top-4" />
              {activeExample.milestones.map((milestone, index) => (
                <div className="relative z-[1] flex flex-col items-center gap-2" key={milestone.id}>
                  <span
                    className={cn(
                      "grid size-[26px] place-items-center rounded-full border-2 border-ink bg-paper font-mono text-[10px] sm:size-[34px]",
                      milestone.status === "complete" && "bg-lime",
                      milestone.status === "current" && "-mt-[3px] size-[34px] bg-orange sm:-mt-[5px] sm:size-11",
                    )}
                  >
                    {milestone.status === "complete" ? "✓" : ""}
                  </span>
                  <small className="font-mono text-[7px] opacity-45 sm:text-[9px]">{pad(index + 1)}</small>
                  <strong className="text-center text-[9px] leading-[1.2] font-semibold [overflow-wrap:anywhere] sm:text-[11px]">{milestone.title}</strong>
                </div>
              ))}
            </div>
            <div className="flex items-center gap-3 border-t-2 border-ink pt-4 font-mono text-[10px] uppercase tracking-[.06em]">
              <span className="bg-orange px-[7px] py-[5px] text-ink">YOU ARE HERE</span>
              <b className="mr-auto font-sans text-[11px] tracking-normal normal-case sm:text-xs">{activeExample.milestones.find((item) => item.status === "current")?.title}</b>
              <ArrowRight size={16} />
            </div>
          </div>
          <div className="absolute top-[4%] right-0 z-[3] rotate-[7deg] border-2 border-ink bg-lime px-[15px] py-3 font-mono text-[11px] leading-[1.1] font-bold shadow-[5px_5px_0_var(--color-ink)] sm:-right-[1%]">NOT A CHECKLIST<br />A CHAPTER</div>
          <div className="absolute bottom-[4%] left-0 z-[3] -rotate-[7deg] border-2 border-ink bg-pink px-[15px] py-3 font-mono text-[11px] leading-[1.1] font-bold shadow-[5px_5px_0_var(--color-ink)] sm:-left-1">SEE WHERE<br />YOU ARE</div>
        </div>

        <div className="relative z-[4] col-span-full md:max-w-[760px]" aria-label="Plotline examples">
          <span className="mb-2.5 block font-mono text-[9px] font-medium uppercase tracking-[.1em] opacity-50">TRY A CHAPTER</span>
          <div className="grid grid-cols-2 gap-1.5 sm:flex sm:flex-wrap">
            {examplePlots.map((example, index) => (
              <button
                type="button"
                className={cn(
                  "inline-flex min-h-[38px] items-center justify-start gap-2 border border-line bg-paper/70 px-2.5 font-mono text-[8px] font-medium tracking-[.025em] text-ink uppercase transition duration-[180ms] hover:-translate-y-0.5 hover:border-ink sm:min-h-[34px] sm:text-[10px] [&>span]:opacity-40",
                  index === exampleIndex && "border-ink bg-ink text-cream [&>span]:text-lime [&>span]:opacity-100",
                )}
                key={example.id}
                onClick={() => setExampleIndex(index)}
                aria-pressed={index === exampleIndex}
              >
                <span>{pad(index + 1)}</span>
                {example.title}
              </button>
            ))}
          </div>
        </div>

        <div className="absolute right-[clamp(20px,7vw,100px)] bottom-5 hidden font-mono text-[10px] tracking-[.1em] opacity-55 [writing-mode:vertical-rl] md:block">CHAPTERS / MILESTONES / MOVEMENT</div>
      </section>

      <ScrollReveal>
        <section className="bg-cream px-section py-[82px] md:py-[120px]">
          <div className={sectionLabel}>02 / THE IDEA</div>
          <h2 className={cn(h2Big, "mt-[42px] mb-[50px] max-w-[1050px] md:mt-[60px] md:mb-[70px] [&_em]:text-orange [&_em]:not-italic")}>Some things are not tasks.<br /><em>They are chapters.</em></h2>
          <div className="flex flex-col items-start gap-6 border-t-2 border-ink pt-6 md:flex-row md:items-end md:justify-between md:gap-[50px]">
            <p className="max-w-[530px] text-xl leading-normal">A move. A new job. A launch. A wedding. A project. Plotline gives one of those big transitions a shape you can actually follow.</p>
            <Link to="/create" className={cn(textLink, "whitespace-nowrap")}>Make one <ArrowRight size={16} /></Link>
          </div>
        </section>
      </ScrollReveal>

      <ScrollReveal>
        <section className="overflow-hidden border-y border-line bg-paper pt-[70px] pb-20 md:pt-[90px] md:pb-[110px]">
          <div className="px-section mb-[55px] flex flex-col items-start gap-10 lg:flex-row lg:items-end lg:justify-between">
            <div className={sectionLabel}>03 / THE PRODUCT</div>
            <div>
              <h2 className="mt-[18px] font-display text-[length:clamp(48px,5.5vw,78px)] leading-[.9] font-extrabold tracking-[-.07em] [&_em]:text-blue [&_em]:not-italic">One chapter.<br /><em>One visible path.</em></h2>
              <p className="mt-3 max-w-[240px] text-[17px]">Everything important lives on the timeline. The chapter can be anything.</p>
            </div>
          </div>
          <div className="mx-auto grid w-[calc(100%_-_40px)] border-[3px] border-ink bg-cream shadow-[14px_14px_0_var(--color-ink)] md:grid-cols-[270px_minmax(0,1fr)] lg:w-[min(1200px,calc(100%_-_clamp(40px,14vw,200px)))]">
            <div className="flex flex-col bg-smoke p-7 text-cream md:min-h-[390px]">
              <span className="font-mono text-[10px] tracking-[.08em] opacity-55">EXAMPLE CHAPTER</span>
              <strong className="mt-5 font-display text-[30px] leading-none font-bold tracking-[-.04em]">{activeExample.title}</strong>
              <small className="mt-6 font-mono text-[10px] tracking-[.08em] opacity-55 md:mt-auto">NOT A TEMPLATE</small>
              <div className="mt-[18px] flex items-baseline gap-2"><b className="font-display text-[32px] font-bold">{pad(activeExample.milestones.length)}</b><span className="font-mono text-[10px] opacity-55">milestones</span></div>
              <div className="mt-[18px] flex items-baseline gap-2"><b className="font-display text-[32px] font-bold">{pad(activeComplete)}</b><span className="font-mono text-[10px] opacity-55">complete</span></div>
            </div>
            <div className="min-w-0 px-3.5 py-[25px] max-md:overflow-hidden md:px-[35px] md:py-10"><TimelinePreview plot={activeExample} /></div>
          </div>
          <div className="px-section pt-7 pb-12 md:pb-[70px]">
            <span className="mb-2.5 block font-mono text-[9px] font-medium uppercase tracking-[.1em] opacity-50">A few things you could plot</span>
            <div className="grid grid-cols-1 border-t border-l border-line sm:grid-cols-2 md:grid-cols-5">
              {examplePlots.map((example, index) => (
                <button
                  type="button"
                  className={cn(
                    "grid min-h-[82px] grid-cols-[auto_1fr_auto] items-center gap-3 border-r border-b border-line px-4 py-3.5 text-left text-ink transition duration-[180ms] hover:-translate-y-[3px] hover:bg-lime",
                    index === exampleIndex && "bg-lime",
                  )}
                  key={example.id}
                  onClick={() => setExampleIndex(index)}
                >
                  <span className="self-start font-mono text-[9px] opacity-40">{pad(index + 1)}</span>
                  <strong className="font-display text-base leading-[1.05] font-bold tracking-[-.035em]">{example.title}</strong>
                  <ArrowUpRight size={16} />
                </button>
              ))}
            </div>
          </div>
        </section>
      </ScrollReveal>

      <ScrollReveal>
        <section className="bg-lime px-section py-[75px] md:py-[100px]">
          <div className={sectionLabel}>04 / KEEP MOVING</div>
          <div className="mt-[55px] grid border-y-[3px] border-ink md:grid-cols-3">
            {[
              { n: "01", title: "Upcoming", text: "What has not happened yet.", extra: "md:border-r-[3px] md:pr-[30px]" },
              { n: "02", title: "Current", text: "Where you are right now.", extra: "bg-orange max-md:px-4 md:border-r-[3px] md:px-[30px]" },
              { n: "03", title: "Complete", text: "What you have already moved through.", extra: "md:pl-[30px]" },
            ].map((item) => (
              <div key={item.n} className={cn("min-h-[190px] border-b-2 border-ink py-[22px] last:border-b-0 md:min-h-[260px] md:border-b-0 md:py-7", item.extra)}>
                <span className="font-mono text-[11px] font-medium">{item.n}</span>
                <h3 className="mt-10 mb-2.5 font-display text-[44px] leading-none font-extrabold tracking-[-.06em] md:mt-[70px]">{item.title}</h3>
                <p className="max-w-[220px]">{item.text}</p>
              </div>
            ))}
          </div>
        </section>
      </ScrollReveal>

      <ScrollReveal>
        <section className="bg-cream px-section py-[85px] md:py-[110px] lg:pb-[125px]">
          <div className={sectionLabel}>05 / FOR THE BIG THINGS</div>
          <div className="mt-[55px] grid items-end gap-[35px] md:grid-cols-[1.2fr_.55fr] md:gap-[8vw]">
            <h2 className={cn(h2Big, "[&_em]:text-blue [&_em]:not-italic")}>Move house.<br />Get the job.<br />Ship the thing.<br /><em>Start somewhere new.</em></h2>
            <p className="max-w-[330px] text-[19px] leading-normal">Plotline is not for one kind of goal. It is for the moments where the destination matters, but the path is still taking shape.</p>
          </div>
        </section>
      </ScrollReveal>

      <ScrollReveal>
        <section className="relative flex flex-col items-start justify-between gap-10 overflow-hidden bg-smoke px-section py-[70px] text-cream md:flex-row md:items-center md:py-[105px]">
          <div>
            <div className={cn(sectionLabel, "text-cream/55")}>06 / YOUR NEXT CHAPTER</div>
            <h2 className="mt-[15px] font-display text-[length:clamp(48px,6.5vw,90px)] leading-[.92] font-extrabold tracking-[-.065em] [&_em]:text-lime [&_em]:not-italic">You already know the chapter.<br /><em>Give it a path.</em></h2>
          </div>
          <Link to="/create" className={btnLight}>Start plotting <ArrowRight size={18} /></Link>
        </section>
      </ScrollReveal>
    </main>
  );
}

function TimelinePreview({ plot }: { plot: Plotline }) {
  return (
    <div
      className="relative grid min-h-[300px] grid-cols-[repeat(var(--count),minmax(0,1fr))] items-start before:absolute before:top-[27px] before:right-[calc(100%_/_var(--count)_-_27px)] before:left-[27px] before:h-[3px] before:bg-ink before:content-[''] max-md:flex max-md:flex-col max-md:before:top-[25px] max-md:before:right-auto max-md:before:bottom-[25px] max-md:before:left-[25px] max-md:before:h-auto max-md:before:w-[3px]"
      style={{ ["--count" as string]: plot.milestones.length }}
    >
      {plot.milestones.map((milestone, index) => (
        <div
          className="group relative z-[1] animate-node-in max-md:grid max-md:grid-cols-[54px_1fr] max-md:gap-5 max-md:pb-8"
          style={{ animationDelay: `${index * 0.08}s` }}
          key={milestone.id}
        >
          <div
            className={cn(
              "grid size-[54px] place-items-center border-[3px] border-ink bg-paper font-mono text-xs transition duration-200 group-hover:-translate-y-[5px] group-hover:rotate-6",
              milestone.status === "complete" && "bg-lime",
              milestone.status === "current" && "scale-[1.15] bg-orange",
            )}
          >
            {milestone.status === "complete" ? <Check size={15} /> : index + 1}
          </div>
          <div className="flex flex-col gap-[5px] pr-3.5 max-md:mt-1 md:mt-[17px]">
            <span className="font-mono text-[10px] uppercase">{formatDate(milestone.date)}</span>
            <strong className="text-[15px] leading-[1.1]">{milestone.title}</strong>
          </div>
        </div>
      ))}
    </div>
  );
}

function LegalPage({ type }: { type: "privacy" | "terms" }) {
  const privacy = type === "privacy";
  return (
    <main className="min-h-[calc(100vh_-_140px)] px-section pt-[52px] pb-20 md:pt-[70px] md:pb-[110px]">
      <Seo title={privacy ? "Privacy Policy — Plotline" : "Terms of Use — Plotline"} description={privacy ? "How Plotline handles information and local data." : "The terms that apply when you use Plotline."} />
      <Link to="/" className={cn(backLink, "mb-12")}><ArrowLeft size={16} /> Back home</Link>
      <div className="mb-6 font-mono text-[10px] tracking-[.08em] opacity-60">{privacy ? "PRIVACY" : "TERMS"} / LAST UPDATED OCTOBER 5, 2026</div>
      <h1 className={cn(pageH1, "mb-12 max-w-[900px] md:mb-[65px] [&_em]:text-orange [&_em]:not-italic")}>{privacy ? <>Privacy <em>Policy.</em></> : <>Terms of <em>Use.</em></>}</h1>
      {privacy ? <div className={legalCopy}>
        <p>Plotline is a browser-based tool for turning a major chapter or goal into a visual sequence of milestones. This policy explains what information the current version of Plotline handles.</p>
        <h2>What we store</h2><p>Your plots are stored in your browser using local storage. They may include chapter names, descriptions, dates, milestone titles, notes, and progress states that you enter. This data is not sent to a Plotline server by the current version of the product.</p>
        <h2>What we collect</h2><p>Plotline does not currently require an account, collect a name or email address, or use advertising trackers. We do not currently operate a backend database for your plots.</p>
        <h2>Your responsibility</h2><p>Because plot data is stored locally, clearing browser storage, using a different browser or device, or certain browser privacy settings may remove access to saved plots. Do not use Plotline as the sole record for critical information.</p>
        <h2>Changes</h2><p>This policy may change as Plotline gains features such as accounts, analytics, cloud sync, or other services. If those features materially change how information is handled, this page will be updated.</p>
      </div> : <div className={legalCopy}>
        <p>By using Plotline, you agree to use the product responsibly and to these terms. Plotline is a planning and visualization tool, not professional, legal, financial, medical, or other expert advice.</p>
        <h2>The product</h2><p>Plotline lets you create and manage personal chapter timelines in your browser. Features may change, be removed, or become unavailable without notice.</p>
        <h2>Your content</h2><p>You remain responsible for the information you enter into Plotline. Keep independent copies of anything important. The current version stores plot data locally on your device.</p>
        <h2>Acceptable use</h2><p>Do not use Plotline to store unlawful content, interfere with the service, or attempt unauthorized access to systems or data.</p>
        <h2>No guarantees</h2><p>Plotline is provided on an “as available” basis. We do not guarantee that the service will always be available, error-free, or that locally stored data will never be lost.</p>
        <h2>Changes to these terms</h2><p>These terms may be updated as the product develops. Continued use of Plotline after an update means you accept the revised terms.</p>
      </div>}
    </main>
  );
}

function CreatePlot({ onCreate }: { onCreate: (plot: Plotline) => void }) {
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [startDate, setStartDate] = useState(todayISO);
  const [milestones, setMilestones] = useState([
    { title: "", date: "", note: "" },
    { title: "", date: "", note: "" },
  ]);

  const filledCount = milestones.filter((item) => item.title.trim()).length;
  const canCreate = Boolean(title.trim() && filledCount > 0);

  const addMilestone = () => setMilestones((items) => [...items, { title: "", date: "", note: "" }]);

  const updateMilestone = (index: number, field: "title" | "date" | "note", value: string) =>
    setMilestones((items) => items.map((item, itemIndex) => itemIndex === index ? { ...item, [field]: value } : item));

  const removeMilestone = (index: number) =>
    setMilestones((items) => items.length > 2 ? items.filter((_, i) => i !== index) : items);

  const create = () => {
    if (!canCreate) return;
    const plot: Plotline = {
      id: `${slugify(title)}-${Date.now()}`,
      title: title.trim(),
      description: description.trim(),
      startDate,
      milestones: milestones
        .filter((item) => item.title.trim())
        .map((item, index) => ({
          id: crypto.randomUUID(),
          title: item.title.trim(),
          date: item.date || undefined,
          note: item.note.trim() || undefined,
          status: index === 0 ? "current" : "upcoming",
        })),
    };
    onCreate(plot);
    navigate(`/plot/${plot.id}`);
  };

  return (
    <main className="px-section pt-[52px] pb-[75px] md:pt-[75px] md:pb-[110px]">
      <Seo title="Create a plot — Plotline" description="Turn a chapter, goal, or major transition into a visual path." />
      <div className="max-w-[1050px]">
        <Link to="/" className={cn(backLink, "mb-[42px]")}><ArrowLeft size={16} /> Back home</Link>
        <div className={eyebrow}><span>02</span> START WITH THE CHAPTER</div>
        <h1 className={cn(pageH1, "[&_em]:text-orange [&_em]:not-italic")}>What are you <em>moving through?</em></h1>
        <p className="mt-[34px] max-w-[560px] text-[19px]">A chapter can be practical, personal, ambitious, or all three.</p>
      </div>

      <div className="mx-auto mt-12 max-w-[920px] md:mt-[85px]">
        <label className="mb-[35px] block">
          <span className={labelText}>Chapter name</span>
          <input
            autoFocus
            className={cn(field, "font-display text-[32px] leading-none font-bold tracking-[-.05em] sm:text-[length:clamp(32px,5vw,64px)]")}
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="e.g. Launch my first product"
          />
        </label>
        <label className="mb-[35px] block">
          <span className={labelText}>One-line description <small className="font-normal opacity-50">optional</small></span>
          <textarea className={cn(field, "resize-y")} value={description} onChange={(event) => setDescription(event.target.value)} placeholder="What does getting through this chapter look like?" rows={3} />
        </label>
        <label className="mb-[35px] block">
          <span className={labelText}>Starting point</span>
          <div className="flex items-center gap-2.5 border-b-2 border-line">
            <CalendarDays size={17} />
            <input className={cn(dateInput, "border-b-0")} type="date" value={startDate} onChange={(event) => setStartDate(event.target.value)} />
          </div>
        </label>

        <div className="mt-[75px] border-t-2 border-ink">
          <div className="flex justify-between py-5">
            <div>
              <span className={labelText}>Milestones</span>
              <p className="text-[13px] opacity-70">Think in moments, not every little task.</p>
            </div>
            <span className="font-mono text-xs">{filledCount} / {milestones.length}</span>
          </div>
          <div>
            {milestones.map((milestone, index) => (
              <div className="grid animate-rise-in grid-cols-[34px_1fr_36px] gap-2 border-t border-line py-[22px] sm:grid-cols-[50px_1fr_42px] sm:gap-[15px]" key={index}>
                <span className="pt-[13px] font-mono text-[10px] opacity-55 sm:text-xs">{String(index + 1).padStart(2, "0")}</span>
                <div>
                  <input className={cn(field, "text-xl font-semibold")} value={milestone.title} onChange={(event) => updateMilestone(index, "title", event.target.value)} placeholder={index === 0 ? "First meaningful step" : "Next meaningful step"} />
                  <div className="mt-[7px] grid gap-1 sm:grid-cols-[170px_1fr] sm:gap-5">
                    <input className={dateInput} type="date" value={milestone.date} onChange={(event) => updateMilestone(index, "date", event.target.value)} />
                    <input className={field} value={milestone.note} onChange={(event) => updateMilestone(index, "note", event.target.value)} placeholder="A note, if useful" />
                  </div>
                </div>
                <button
                  type="button"
                  className="grid size-9 place-items-center border border-line bg-transparent enabled:hover:border-ink enabled:hover:bg-pink disabled:opacity-40"
                  onClick={() => removeMilestone(index)}
                  aria-label={`Remove milestone ${index + 1}`}
                  disabled={milestones.length <= 2}
                >
                  <Trash2 size={17} />
                </button>
              </div>
            ))}
          </div>
          <button type="button" className="flex items-center gap-2 py-[18px] font-mono text-xs font-medium uppercase underline-offset-4 hover:underline" onClick={addMilestone}>
            <Plus size={17} /> Add another milestone
          </button>
        </div>

        <div className="mt-[50px] flex flex-col items-start gap-[18px] border-t-2 border-ink pt-[22px] font-mono text-[11px] uppercase sm:flex-row sm:items-center sm:justify-between">
          <span>{filledCount} milestones ready</span>
          <button type="button" className={cn(btnDark, "max-sm:w-full")} disabled={!canCreate} onClick={create}>
            Create plot <ArrowRight size={18} />
          </button>
        </div>
      </div>
    </main>
  );
}

function Plots({ plots }: { plots: Plotline[] }) {
  return (
    <main className="px-section pt-[52px] pb-[75px] md:pt-[75px] md:pb-[110px]">
      <Seo title="Your plots — Plotline" description="See and continue the chapters you have mapped in Plotline." />
      <div className="mb-[70px] flex flex-col items-start gap-[30px] md:flex-row md:items-end md:justify-between">
        <div>
          <div className={cn(eyebrow, "mb-[42px]")}><span>03</span> YOUR CHAPTERS</div>
          <h1 className={cn(pageH1, "[&_em]:text-orange [&_em]:not-italic")}>Your <em>plots.</em></h1>
        </div>
        <Link to="/create" className={btnDark}><Plus size={18} /> New plot</Link>
      </div>

      {plots.length === 0 ? (
        <div className="grid min-h-[420px] place-content-center place-items-center border-2 border-dashed border-ink p-[50px] text-center">
          <div className="mb-5 grid size-[58px] -rotate-[8deg] animate-bob place-items-center border-2 border-ink bg-lime"><Sparkles size={24} /></div>
          <h2 className="mb-2.5 font-display text-[42px] font-extrabold tracking-[-.05em]">Nothing plotted yet.</h2>
          <p className="mb-7">Start with one chapter. You can change the path as you go.</p>
          <Link to="/create" className={btnDark}>Create your first plot <ArrowRight size={18} /></Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          {plots.map((plot, index) => {
            const complete = plot.milestones.filter((item) => item.status === "complete").length;
            const progress = plot.milestones.length ? Math.round((complete / plot.milestones.length) * 100) : 0;
            const current = plot.milestones.find((item) => item.status === "current");
            const onBlue = index % 4 === 2;
            return (
              <Link
                to={`/plot/${plot.id}`}
                className={cn(
                  "flex min-h-[300px] flex-col justify-between border-2 border-ink p-[22px] transition duration-[250ms] hover:-translate-x-[5px] hover:-translate-y-[5px] hover:shadow-[8px_8px_0_var(--color-ink)] sm:min-h-[330px] sm:p-7 md:min-h-[390px]",
                  cardColors[index % 4],
                )}
                key={plot.id}
              >
                <div className="flex items-center justify-between font-mono text-xs"><span>{String(index + 1).padStart(2, "0")}</span><ArrowUpRight size={18} /></div>
                <div className="my-[25px]">
                  <span className="font-mono text-[10px] tracking-[.08em] uppercase opacity-70">{progress === 100 ? "Chapter complete" : current ? "In motion" : "Ready to begin"}</span>
                  <h2 className="mt-3 mb-[15px] max-w-[520px] font-display text-[43px] leading-[.9] font-extrabold tracking-[-.06em] [overflow-wrap:anywhere] sm:text-[length:clamp(38px,4.5vw,64px)]">{plot.title}</h2>
                  <p className="max-w-[420px]">{plot.description || "A chapter worth giving a shape to."}</p>
                </div>
                <div className="flex items-center justify-between">
                  <div className={cn("mr-[18px] h-2 flex-1", onBlue ? "bg-cream/30" : "bg-ink/20")}>
                    <span className={cn("block h-full transition-[width] duration-[600ms] ease-[cubic-bezier(.2,.8,.2,1)]", onBlue ? "bg-lime" : "bg-ink")} style={{ width: `${progress}%` }} />
                  </div>
                  <strong className="font-mono text-[11px]">{complete}/{plot.milestones.length}</strong>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </main>
  );
}

function PlotPage({
  plots,
  onUpdate,
  onDelete,
}: {
  plots: Plotline[];
  onUpdate: (plot: Plotline) => void;
  onDelete: (id: string) => void;
}) {
  const { id } = useParams();
  const navigate = useNavigate();
  const plot = plots.find((item) => item.id === id);
  const [draggedId, setDraggedId] = useState<string | null>(null);

  const progress = useMemo(() => {
    if (!plot?.milestones.length) return 0;
    return Math.round((plot.milestones.filter((item) => item.status === "complete").length / plot.milestones.length) * 100);
  }, [plot]);

  if (!plot) return <Navigate to="/plots" replace />;

  const completeCount = plot.milestones.filter((item) => item.status === "complete").length;
  let lastCompleteIndex = -1;
  plot.milestones.forEach((item, index) => {
    if (item.status === "complete") lastCompleteIndex = index;
  });

  const advanceMilestone = (milestoneId: string) => {
    const targetIndex = plot.milestones.findIndex((item) => item.id === milestoneId);
    if (targetIndex < 0) return;

    const target = plot.milestones[targetIndex];
    const next = [...plot.milestones];

    if (target.status === "upcoming") {
      next.forEach((item, index) => {
        if (item.status === "current") next[index] = { ...item, status: "upcoming" };
      });
      next[targetIndex] = { ...target, status: "current" };
    } else if (target.status === "current") {
      next[targetIndex] = { ...target, status: "complete" };
      let nextUpcoming = next.findIndex((item, index) => index > targetIndex && item.status === "upcoming");
      if (nextUpcoming < 0) nextUpcoming = next.findIndex((item) => item.status === "upcoming");
      if (nextUpcoming >= 0) next[nextUpcoming] = { ...next[nextUpcoming], status: "current" };
    } else {
      next.forEach((item, index) => {
        if (item.status === "current") next[index] = { ...item, status: "upcoming" };
      });
      next[targetIndex] = { ...target, status: "current" };
    }

    onUpdate({ ...plot, milestones: next });
  };

  const moveMilestone = (milestoneId: string, direction: -1 | 1) => {
    const index = plot.milestones.findIndex((item) => item.id === milestoneId);
    const targetIndex = index + direction;
    if (index < 0 || targetIndex < 0 || targetIndex >= plot.milestones.length) return;

    const next = [...plot.milestones];
    [next[index], next[targetIndex]] = [next[targetIndex], next[index]];
    onUpdate({ ...plot, milestones: next });
  };

  const reorderMilestone = (fromId: string, toId: string) => {
    if (fromId === toId) return;
    const fromIndex = plot.milestones.findIndex((item) => item.id === fromId);
    const toIndex = plot.milestones.findIndex((item) => item.id === toId);
    if (fromIndex < 0 || toIndex < 0) return;

    const next = [...plot.milestones];
    const [moved] = next.splice(fromIndex, 1);
    next.splice(toIndex, 0, moved);
    onUpdate({ ...plot, milestones: next });
  };

  const deletePlot = () => {
    if (window.confirm(`Delete "${plot.title}"?`)) {
      onDelete(plot.id);
      navigate("/plots");
    }
  };

  const metaLabel = "font-mono text-[10px] uppercase";

  return (
    <main>
      <Seo title={`${plot.title} — Plotline`} description={plot.description || "A visual path for a chapter you are moving through."} />
      <section className="relative overflow-hidden bg-orange">
        <div className="pointer-events-none absolute inset-0 animate-pattern-drift-reverse bg-[radial-gradient(var(--color-ink)_1.3px,transparent_1.3px)] bg-[length:18px_18px] opacity-20 [mask-image:linear-gradient(90deg,transparent,black_25%,black_100%)]" aria-hidden="true" />
        <div className="px-section relative z-[1] pt-10 pb-[60px] md:pt-[60px] md:pb-20">
          <Link to="/plots" className={cn(backLink, "relative mb-[55px]")}><ArrowLeft size={16} /> All plots</Link>
          <div className="grid items-end gap-[35px] md:grid-cols-[minmax(0,1fr)_220px] md:gap-[50px]">
            <div>
              <div className={cn(eyebrow, "mb-0")}><span>CHAPTER</span> {formatDate(plot.startDate)}</div>
              <h1 className={cn(heroH1, "mt-[25px] max-w-[1000px]")}>{plot.title}</h1>
              {plot.description && <p className="mt-[30px] max-w-[620px] text-[19px]">{plot.description}</p>}
            </div>
            <div className="flex w-40 rotate-3 flex-col justify-self-start border-2 border-ink bg-lime p-5 shadow-[7px_7px_0_var(--color-ink)] transition-transform duration-[250ms] hover:-translate-y-1 hover:-rotate-2 md:w-auto">
              <span className={metaLabel}>PATH</span>
              <strong className="my-2.5 font-display text-[74px] leading-[.9] font-extrabold tracking-[-.08em]">{progress}%</strong>
              <small className={metaLabel}>complete</small>
            </div>
          </div>
        </div>
      </section>

      <ScrollReveal>
        <section className="px-section pt-[60px] pb-[100px] md:pt-20">
          <div className="mb-[30px] flex flex-col items-start gap-[30px] sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className={sectionLabel}>THE PATH</div>
              <p className="mt-2 opacity-70">Tap a milestone to change where you are in the chapter.</p>
            </div>
            <button type="button" className={cn(monoLink, "flex items-center gap-1.5 opacity-55 hover:text-[#b00020] hover:opacity-100")} onClick={deletePlot}><Trash2 size={15} /> Delete plot</button>
          </div>

          <div className="mb-[70px] h-3 overflow-hidden bg-ink/10" role="progressbar" aria-label="Chapter progress" aria-valuemin={0} aria-valuemax={100} aria-valuenow={progress}>
            <span className="block h-full bg-orange transition-[width] duration-[600ms] ease-[cubic-bezier(.2,.8,.2,1)]" style={{ width: `${progress}%` }} />
          </div>

          <ol className="mx-auto max-w-[1050px] list-none [--marker-top:26px] [--marker:38px] md:[--marker-top:28px] md:[--marker:54px]">
            {plot.milestones.map((milestone, index) => {
              const status = milestone.status;
              return (
                <li
                  className="grid grid-cols-[40px_minmax(0,1fr)] gap-x-3 md:grid-cols-[72px_minmax(0,1fr)] md:gap-x-5"
                  key={milestone.id}
                  onDragOver={(event) => {
                    if (!draggedId) return;
                    event.preventDefault();
                    event.dataTransfer.dropEffect = "move";
                  }}
                  onDrop={(event) => {
                    event.preventDefault();
                    const fromId = event.dataTransfer.getData("text/plain") || draggedId;
                    if (fromId) reorderMilestone(fromId, milestone.id);
                    setDraggedId(null);
                  }}
                >
                  <div className="relative flex justify-center" aria-hidden="true">
                    <span
                      className={cn(
                        "relative z-[2] mt-[var(--marker-top)] grid size-[var(--marker)] flex-none place-items-center rounded-full border-2 border-ink bg-paper text-ink md:border-[3px] [&>svg]:size-4 md:[&>svg]:size-5",
                        status === "complete" && "bg-orange text-cream",
                        status === "current" && "bg-lime shadow-[0_0_0_7px_rgba(215,248,74,.3)]",
                      )}
                    >
                      {status === "complete" ? <Check size={20} /> : <Circle size={16} />}
                      {status === "current" && <span className="absolute -inset-3 animate-pulse-ring rounded-full border border-blue" />}
                    </span>
                    {index < plot.milestones.length - 1 && (
                      <span
                        className={cn(
                          "absolute top-[calc(var(--marker-top)_+_var(--marker))] bottom-[calc(var(--marker-top)_*_-1)] left-1/2 -ml-0.5 w-1 rounded-full bg-ink/10",
                          status === "complete" && "bg-orange",
                        )}
                      />
                    )}
                  </div>

                  <div
                    className={cn(
                      "relative mb-3 grid grid-cols-1 items-center border border-l-4 border-line border-l-transparent bg-cream/50 transition duration-200 hover:bg-cream/90 md:grid-cols-[minmax(0,1fr)_auto]",
                      status === "complete" && "border-l-orange",
                      status === "current" && "border-2 border-l-[7px] border-ink border-l-lime bg-cream shadow-[6px_6px_0_var(--color-blue)] hover:bg-cream md:shadow-[8px_8px_0_var(--color-blue)]",
                      status === "upcoming" && "opacity-75 focus-within:opacity-100 hover:opacity-100",
                      draggedId === milestone.id && "opacity-40",
                    )}
                  >
                    <button
                      type="button"
                      className="flex min-w-0 flex-col items-start gap-1 px-5 pt-5 pb-3 text-left text-inherit focus-visible:outline-offset-[-3px] md:py-6 md:pr-[22px] md:pl-[26px]"
                      onClick={() => advanceMilestone(milestone.id)}
                      aria-label={`${milestone.title}, ${status}. Activate to change status.`}
                    >
                      <span className="font-mono text-[10px] tracking-[.08em] uppercase opacity-60">{String(index + 1).padStart(2, "0")} / {status}</span>
                      <strong
                        className={cn(
                          "mt-1.5 mb-1 block max-w-[620px] font-display text-[27px] font-bold tracking-[-.045em] [overflow-wrap:anywhere] md:text-[length:clamp(26px,3vw,44px)]",
                          status === "current" && "text-[31px] md:text-[length:clamp(30px,3.5vw,52px)]",
                          "leading-[.95]",
                        )}
                      >
                        {milestone.title}
                      </strong>
                      <span className="text-[13px]">{formatDate(milestone.date)}</span>
                      {milestone.note && <span className="text-[13px] opacity-70">{milestone.note}</span>}
                      {status === "current" && (
                        <span className="mt-3 flex items-center gap-[9px] font-mono text-[10px] font-medium tracking-[.06em] uppercase">
                          <span className="bg-blue px-[7px] py-[5px] text-cream">YOU ARE HERE</span> Mark complete <ArrowRight size={15} />
                        </span>
                      )}
                    </button>

                    <div className="flex items-center gap-[5px] px-5 pb-3.5 md:p-0 md:pr-[22px]">
                      <span
                        className="hidden size-[30px] cursor-grab place-items-center opacity-50 transition-opacity hover:opacity-100 active:cursor-grabbing pointer-fine:grid"
                        draggable
                        aria-hidden="true"
                        title="Drag to reorder"
                        onDragStart={(event) => {
                          const card = event.currentTarget.parentElement?.parentElement;
                          if (card) event.dataTransfer.setDragImage(card, 24, 24);
                          setDraggedId(milestone.id);
                          event.dataTransfer.effectAllowed = "move";
                          event.dataTransfer.setData("text/plain", milestone.id);
                        }}
                        onDragEnd={() => setDraggedId(null)}
                      >
                        <GripVertical size={16} />
                      </span>
                      {([-1, 1] as const).map((direction) => {
                        const disabled = direction === -1 ? index === 0 : index === plot.milestones.length - 1;
                        return (
                          <button
                            key={direction}
                            type="button"
                            className="grid size-[30px] place-items-center border border-line bg-paper text-ink transition duration-[180ms] enabled:hover:-translate-y-0.5 enabled:hover:border-ink enabled:hover:bg-lime disabled:opacity-25"
                            onClick={() => moveMilestone(milestone.id, direction)}
                            disabled={disabled}
                            aria-label={`Move ${milestone.title} ${direction === -1 ? "up" : "down"}`}
                          >
                            {direction === -1 ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
                          </button>
                        );
                      })}
                    </div>

                    {index === lastCompleteIndex && status === "complete" && completeCount > 0 && (
                      <span className="absolute top-2.5 right-4 hidden font-mono text-[9px] tracking-[.08em] opacity-50 md:block">PATH SO FAR</span>
                    )}
                  </div>
                </li>
              );
            })}
          </ol>
        </section>
      </ScrollReveal>

      <ScrollReveal>
        <section className="px-section flex flex-col items-start gap-[30px] border-t border-line pt-[50px] pb-20 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-[15px] font-mono text-[13px] font-semibold uppercase [&>svg]:text-blue"><ArrowDownRight size={34} /><span>Progress does not need to be linear.</span></div>
          <Link to="/create" className={btnDark}>Start another chapter <Plus size={18} /></Link>
        </section>
      </ScrollReveal>
    </main>
  );
}

function NotFound() {
  return (
    <main className="min-h-[calc(100vh_-_150px)] bg-orange px-section py-[120px]">
      <Seo title="Page not found — Plotline" description="The Plotline page you requested does not exist." />
      <div className="mb-[35px] grid size-[62px] -rotate-[8deg] place-items-center border-2 border-ink bg-lime"><HomeIcon size={28} /></div>
      <div className={eyebrow}><span>404</span> WRONG TURN</div>
      <h1 className={cn(pageH1, "max-w-[1000px] [&_em]:text-cream [&_em]:not-italic")}>This path <em>does not exist.</em></h1>
      <p className="my-[35px] text-[19px]">Nothing lives at this address. The chapter is still here.</p>
      <Link to="/" className={btnDark}><ArrowLeft size={18} /> Back to Plotline</Link>
    </main>
  );
}

function App() {
  const [plots, setPlots] = useState<Plotline[]>(loadPlots);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(plots));
    } catch {
      // Storage can be full or blocked (private mode). The app keeps working in memory.
    }
  }, [plots]);

  const createPlot = (plot: Plotline) => setPlots((current) => [...current, plot]);
  const updatePlot = (plot: Plotline) => setPlots((current) => current.map((item) => item.id === plot.id ? plot : item));
  const deletePlot = (id: string) => setPlots((current) => current.filter((item) => item.id !== id));

  return (
    <BrowserRouter>
      <ScrollToTop />
      <Header />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/create" element={<CreatePlot onCreate={createPlot} />} />
        <Route path="/plots" element={<Plots plots={plots} />} />
        <Route path="/plot/:id" element={<PlotPage plots={plots} onUpdate={updatePlot} onDelete={deletePlot} />} />
        <Route path="/privacy" element={<LegalPage type="privacy" />} />
        <Route path="/terms" element={<LegalPage type="terms" />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      <Footer />
    </BrowserRouter>
  );
}

export default App;
