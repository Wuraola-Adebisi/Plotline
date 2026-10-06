import { useEffect, useMemo, useRef, useState } from "react";
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
  Lock,
  Plus,
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


const linkText = "text-sm font-semibold";
const textLink = cn(linkText, "inline-flex items-center gap-1.5 py-2.5 underline underline-offset-4 hover:no-underline");
const backLink = cn(linkText, "inline-flex items-center gap-2 py-2 underline-offset-4 hover:underline");
const btn =
  "inline-flex min-h-12 items-center justify-center gap-[9px] border-2 border-ink px-[18px] font-bold transition duration-200 hover:-translate-x-[3px] hover:-translate-y-[3px] hover:shadow-[5px_5px_0_var(--color-ink)] disabled:opacity-40 disabled:hover:translate-x-0 disabled:hover:translate-y-0 disabled:hover:shadow-none";
const btnDark = cn(btn, "bg-ink text-cream");
const btnLight = cn(btn, "border-lime bg-lime text-ink");
const heroH1 =
  "font-display font-extrabold tracking-[-.055em] text-[length:clamp(46px,8vw,96px)] leading-[.94]";
const pageH1 =
  "font-display font-extrabold tracking-[-.05em] text-[length:clamp(40px,6.5vw,84px)] leading-[.96]";
const h2Section =
  "font-display font-extrabold tracking-[-.05em] text-[length:clamp(36px,5.5vw,68px)] leading-[.98]";
const leadText = "max-w-[56ch] text-lg leading-relaxed text-ink/75";
const tileTitle = "font-display text-[28px] font-bold leading-[1.02] tracking-[-.04em]";
const brandMark =
  "grid size-[30px] -rotate-[8deg] place-items-center border-2 border-ink bg-lime font-mono text-lg transition-transform duration-[250ms] group-hover:rotate-[8deg] group-hover:scale-105";
const field =
  "w-full rounded-none border-2 border-ink bg-cream px-3.5 py-3 text-ink outline-none transition-shadow placeholder:text-ink/50 focus:bg-white focus:shadow-[4px_4px_0_var(--color-ink)]";
const dateInput = cn(field, "[color-scheme:light]");
const labelText = "mb-2 block text-sm font-semibold";
const footerLink = "text-sm text-cream hover:text-lime";
const statusLabel: Record<MilestoneStatus, string> = { complete: "Complete", current: "Current", upcoming: "Upcoming" };
const pagePad = "px-section py-[48px] md:py-[72px]";

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

function Header() {
  return (
    <header className="sticky top-0 z-20 flex h-[68px] items-center justify-between border-b-2 border-ink bg-paper px-bar md:h-[76px]">
      <Link to="/" className="group flex items-center gap-2.5 font-display text-[21px] font-extrabold tracking-[-1.2px] sm:text-2xl" aria-label="Plotline home">
        <span className={brandMark} aria-hidden="true">/</span>
        <span>plotline</span>
      </Link>

      <nav className="flex items-center gap-3 md:gap-7" aria-label="Main navigation">
        <NavLink
          to="/plots"
          className={({ isActive }) => cn(linkText, "py-2 underline-offset-[6px] hover:underline", isActive && "underline decoration-2")}
        >
          <span className="sm:hidden">Plots</span>
          <span className="hidden sm:inline">Your plots</span>
        </NavLink>
        <Link to="/create" className={cn(btnDark, "min-h-[38px] px-3 sm:min-h-10 sm:px-3.5")}>
          <Plus size={16} className="hidden sm:block" /> New plot
        </Link>
      </nav>
    </header>
  );
}

function Footer() {
  return (
    <footer className="border-t-2 border-ink bg-smoke px-bar text-cream">
      <div className="grid gap-12 py-12 md:grid-cols-[minmax(0,1.4fr)_minmax(260px,.7fr)] md:gap-20 md:py-[72px]">
        <div className="max-w-[460px]">
          <Link to="/" className="group inline-flex items-center gap-2.5 font-display text-[25px] font-extrabold tracking-[-1.2px] text-cream" aria-label="Plotline home">
            <span className={cn(brandMark, "border-cream")} aria-hidden="true">/</span>
            <span>plotline</span>
          </Link>
          <p className="mt-6 max-w-[40ch] text-cream/70">Turn a big change into a path of milestones, and see where you are.</p>
          <Link to="/create" className={cn(btnLight, "mt-7")}>Create a plot <ArrowRight size={18} /></Link>
        </div>

        <div className="grid grid-cols-2 gap-8 md:gap-12">
          <nav className="flex flex-col items-start gap-3" aria-label="Explore">
            <h2 className="mb-1 text-sm font-semibold text-cream/55">Explore</h2>
            <Link to="/" className={footerLink}>Home</Link>
            <Link to="/plots" className={footerLink}>Your plots</Link>
            <Link to="/create" className={footerLink}>Create a plot</Link>
          </nav>
          <nav className="flex flex-col items-start gap-3" aria-label="Legal">
            <h2 className="mb-1 text-sm font-semibold text-cream/55">Legal</h2>
            <Link to="/privacy" className={footerLink}>Privacy</Link>
            <Link to="/terms" className={footerLink}>Terms</Link>
          </nav>
        </div>
      </div>

      <div className="flex flex-col gap-2 border-t border-white/15 py-6 text-sm text-cream/60 md:flex-row md:justify-between">
        <span>© {new Date().getFullYear()} Plotline</span>
        <span>Your plots are saved in your browser. Nothing is sent to a server.</span>
      </div>
    </footer>
  );
}

function useInView<T extends HTMLElement>(threshold = 0.3) {
  const ref = useRef<T>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const node = ref.current;
    if (!node || typeof IntersectionObserver === "undefined") { setInView(true); return; }
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { setInView(true); observer.disconnect(); }
    }, { threshold });
    observer.observe(node);
    return () => observer.disconnect();
  }, [threshold]);
  return [ref, inView] as const;
}

const moveChecklist = ["Find apartments", "Inspect apartments", "Pay deposit", "Get the keys", "Book movers", "Buy boxes", "Change address", "Set up internet"];
const tickedItems = new Set(["Find apartments", "Buy boxes", "Set up internet"]);

function ProblemSection() {
  const [ref, inView] = useInView<HTMLDivElement>(0.35);
  const move = examplePlots.find((plot) => plot.id === "moving-to-lagos") ?? examplePlots[0];
  const current = move.milestones.find((item) => item.status === "current");

  return (
    <section className="bg-cream px-section py-[80px] md:py-[120px]" aria-labelledby="problem-heading">
      <div className="grid gap-12 lg:grid-cols-[minmax(0,.85fr)_minmax(0,1.15fr)] lg:gap-[6vw]">
        <div className="self-start lg:sticky lg:top-[120px]">
          <h2 id="problem-heading" className={cn(h2Section, "max-w-[14ch]")}>Big changes do not fit in a checklist.</h2>
          <p className={cn(leadText, "mt-6")}>A checklist gives every item the same weight and says nothing about where you are. A chapter has moments, and some of them are already behind you.</p>
          <Link to="/create" className={cn(btnDark, "mt-8")}>Plot a chapter <ArrowRight size={18} /></Link>
        </div>

        <div ref={ref} className="grid gap-5 sm:grid-cols-2">
          <figure className="flex flex-col border-2 border-ink bg-paper">
            <figcaption className="border-b-2 border-ink px-5 py-3 font-bold">As a checklist</figcaption>
            <ul className="flex-1 divide-y divide-line px-5 py-1.5">
              {moveChecklist.map((item) => {
                const ticked = tickedItems.has(item);
                return (
                  <li className="flex items-center gap-3 py-2.5 text-[15px]" key={item}>
                    <span className={cn("grid size-5 flex-none place-items-center border-2 border-ink", ticked && "bg-ink text-cream")}>{ticked && <Check size={13} />}</span>
                    <span className={cn(ticked && "text-ink/50 line-through")}>{item}</span>
                  </li>
                );
              })}
            </ul>
            <p className="border-t-2 border-ink px-5 py-3.5 text-sm">Three of eight ticked. Which part of the move are you in?</p>
          </figure>

          <figure className="flex flex-col border-2 border-ink bg-lime">
            <figcaption className="border-b-2 border-ink px-5 py-3 font-bold">As a path</figcaption>
            <ol className="flex-1 px-5 py-5">
              {move.milestones.map((milestone, index) => {
                const last = index === move.milestones.length - 1;
                const fill = milestone.status === "complete" ? "bg-orange text-cream" : milestone.status === "current" ? "bg-ink text-lime" : "bg-cream";
                return (
                  <li className="flex gap-4 pb-5 last:pb-0" key={milestone.id}>
                    <span className="relative flex flex-col items-center">
                      <span
                        className={cn("z-[1] grid size-7 place-items-center rounded-full border-2 border-ink bg-cream transition-colors duration-500", inView && fill)}
                        style={{ transitionDelay: `${index * 160}ms` }}
                      >
                        {milestone.status === "complete" && <Check size={14} />}
                      </span>
                      {!last && (
                        <span
                          className={cn("absolute top-7 -bottom-5 w-[3px] origin-top bg-ink transition-transform duration-500", inView ? "scale-y-100" : "scale-y-0")}
                          style={{ transitionDelay: `${index * 160 + 120}ms` }}
                        />
                      )}
                    </span>
                    <span className="pt-0.5">
                      <span className={cn("block text-[15px] font-semibold", milestone.status === "upcoming" && "text-ink/60")}>{milestone.title}</span>
                      {milestone.status === "current" && <span className="mt-1 inline-block bg-ink px-1.5 py-0.5 text-xs text-lime">You are here</span>}
                    </span>
                  </li>
                );
              })}
            </ol>
            <p className="border-t-2 border-ink px-5 py-3.5 text-sm">Six moments, and you are at: {current?.title}.</p>
          </figure>
        </div>
      </div>
    </section>
  );
}

function HowItWorks() {
  const sample = examplePlots.find((plot) => plot.id === "moving-to-lagos") ?? examplePlots[0];
  const states = [
    { label: "Complete", note: "You have moved through it", icon: <Check size={14} />, fill: "bg-orange text-cream" },
    { label: "Current", note: "Where you are now", icon: null, fill: "bg-lime" },
    { label: "Upcoming", note: "Still ahead", icon: null, fill: "bg-cream" },
  ];
  const stepShell = "flex flex-col border-2 border-ink bg-cream md:not-first:-ml-0.5";
  const stepHead = "p-6 md:p-7";
  const stepVisual = "mt-auto border-t-2 border-ink bg-paper p-6 md:p-7";
  const stepTitle = "mt-5 font-display text-[26px] font-bold leading-[1.05] tracking-[-.04em]";

  return (
    <section id="how" className="scroll-mt-[76px] border-y-2 border-ink bg-paper px-section py-[80px] md:py-[120px]" aria-labelledby="how-heading">
      <div className="max-w-[760px]">
        <h2 id="how-heading" className={h2Section}>Three steps from messy to clear</h2>
        <p className={cn(leadText, "mt-5")}>A name, the moments that matter, and a tap to say where you are.</p>
      </div>

      <ol className="mt-14 grid gap-6 md:grid-cols-3 md:gap-0">
        <li className={stepShell}>
          <div className={stepHead}>
            <span className="grid size-9 place-items-center bg-ink font-display text-lg font-bold text-cream">1</span>
            <h3 className={stepTitle}>Name the chapter</h3>
            <p className="mt-3 text-ink/75">Give it a title and a starting date. A move, a launch, a new job.</p>
          </div>
          <div className={stepVisual}>
            <span className="block text-xs text-ink/60">Chapter name</span>
            <div className="border-b-2 border-line pb-2 font-display text-2xl font-bold tracking-[-.03em]">{sample.title}</div>
            <div className="mt-3 flex items-center gap-2 text-sm text-ink/70"><CalendarDays size={16} /> Starting {formatDate(sample.startDate)}</div>
          </div>
        </li>

        <li className={stepShell}>
          <div className={stepHead}>
            <span className="grid size-9 place-items-center bg-ink font-display text-lg font-bold text-cream">2</span>
            <h3 className={stepTitle}>Mark the moments</h3>
            <p className="mt-3 text-ink/75">Add the milestones that matter. Skip the small tasks.</p>
          </div>
          <div className={stepVisual}>
            <ul className="space-y-2">
              {sample.milestones.slice(0, 3).map((milestone) => (
                <li className="flex items-center justify-between gap-3 border border-line bg-cream px-3 py-2 text-sm" key={milestone.id}>
                  <span className="font-medium">{milestone.title}</span>
                  <span className="text-xs text-ink/60">{formatDate(milestone.date)}</span>
                </li>
              ))}
              <li className="flex items-center gap-2 border border-dashed border-ink px-3 py-2 text-sm text-ink/60"><Plus size={14} /> Add another moment</li>
            </ul>
          </div>
        </li>

        <li className={stepShell}>
          <div className={stepHead}>
            <span className="grid size-9 place-items-center bg-ink font-display text-lg font-bold text-cream">3</span>
            <h3 className={stepTitle}>Move through it</h3>
            <p className="mt-3 text-ink/75">Tap a milestone to set where you are. The path updates as you go.</p>
          </div>
          <div className={stepVisual}>
            <ul className="space-y-3">
              {states.map((state) => (
                <li className="flex items-center gap-3" key={state.label}>
                  <span className={cn("grid size-7 flex-none place-items-center rounded-full border-2 border-ink", state.fill)}>{state.icon}</span>
                  <span className="text-sm"><b className="font-semibold">{state.label}</b> <span className="text-ink/65">{state.note}</span></span>
                </li>
              ))}
            </ul>
          </div>
        </li>
      </ol>
    </section>
  );
}

function Features() {
  const chip = "inline-flex items-center gap-1.5 border-2 border-ink px-3 py-1.5 text-sm font-semibold";
  const dragRow = "flex items-center gap-2 border-2 border-ink bg-paper px-3 py-2 text-sm font-medium";

  return (
    <section className="bg-paper px-section py-[80px] md:py-[120px]" aria-labelledby="features-heading">
      <div className="max-w-[760px]">
        <h2 id="features-heading" className={h2Section}>What a plot gives you</h2>
      </div>

      <div className="mt-14 grid gap-5 md:grid-cols-6">
        <article className="flex flex-col justify-between gap-10 border-2 border-ink bg-orange p-7 md:col-span-4 md:p-9">
          <div>
            <h3 className={tileTitle}>Know where you are</h3>
            <p className="mt-3 max-w-[44ch]">Every milestone is upcoming, current or complete. One marks the place you are right now, and the path fills in behind it.</p>
          </div>
          <ul className="flex flex-wrap gap-2">
            <li className={cn(chip, "bg-ink text-cream")}><Check size={15} /> Complete</li>
            <li className={cn(chip, "bg-lime")}><span className="size-2.5 rounded-full bg-ink" /> Current</li>
            <li className={cn(chip, "bg-cream")}><Circle size={14} /> Upcoming</li>
          </ul>
        </article>

        <article className="flex flex-col justify-between gap-8 border-2 border-ink bg-cream p-7 md:col-span-2">
          <div>
            <h3 className={tileTitle}>Reorder when plans change</h3>
            <p className="mt-3 text-ink/75">Drag a milestone or use the arrows.</p>
          </div>
          <div className="space-y-2" aria-hidden="true">
            <div className={dragRow}><GripVertical size={16} /> Pay deposit</div>
            <div className={cn(dragRow, "translate-x-3 -rotate-2 bg-lime shadow-[4px_4px_0_var(--color-ink)]")}><GripVertical size={16} /> Get the keys</div>
            <div className={dragRow}><GripVertical size={16} /> Move in</div>
          </div>
        </article>

        <article className="flex flex-col justify-between gap-8 border-2 border-ink bg-cream p-7 md:col-span-2">
          <div>
            <h3 className={tileTitle}>Not a straight line</h3>
            <p className="mt-3 text-ink/75">Tap any milestone to make it current. Progress does not have to be linear.</p>
          </div>
          <div className="flex items-center gap-2" aria-hidden="true">
            {[0, 1, 2, 3, 4].map((dot) => (
              <span className={cn("size-6 rounded-full border-2 border-ink", dot < 2 && "bg-orange", dot === 3 && "size-8 bg-lime ring-4 ring-lime/40")} key={dot} />
            ))}
          </div>
        </article>

        <article className="flex flex-col justify-between gap-8 border-2 border-ink bg-blue p-7 text-cream md:col-span-2">
          <div>
            <h3 className={tileTitle}>Stays on your device</h3>
            <p className="mt-3 text-cream/85">No account. Your plots are saved in your browser.</p>
          </div>
          <Lock size={30} aria-hidden="true" />
        </article>

        <article className="flex flex-col justify-between gap-8 border-2 border-ink bg-cream p-7 md:col-span-2">
          <div>
            <h3 className={tileTitle}>Dates and notes, if useful</h3>
            <p className="mt-3 text-ink/75">Add either to a milestone, or leave them blank.</p>
          </div>
          <div className="border-2 border-ink bg-paper p-3 text-sm" aria-hidden="true">
            <b className="font-semibold">Pay deposit</b>
            <div className="mt-0.5 flex items-center gap-1.5 text-xs text-ink/60"><CalendarDays size={13} /> 18 Sep 2026</div>
          </div>
        </article>
      </div>
    </section>
  );
}

const faqs = [
  { q: "Do I need an account?", a: "No. Your plots are saved in your browser, so there is nothing to sign up for." },
  { q: "Will my plots show up on my phone and my laptop?", a: "Not yet. A plot lives in the browser where you created it, so another browser or device starts empty. Clearing your browser data also removes your plots." },
  { q: "How is this different from a to-do list?", a: "A to-do list holds tasks. A plot holds the moments of a chapter in order and shows which one you are in." },
  { q: "How many milestones should I add?", a: "Think in moments, not every small task. The examples on this page use five or six." },
  { q: "Do I have to finish them in order?", a: "No. Tap any milestone to make it current, and move milestones up or down when the plan changes." },
  { q: "Are dates required?", a: "No. Dates and notes are optional on every milestone." },
];

function Faq() {
  return (
    <section className="bg-cream px-section py-[80px] md:py-[120px]" aria-labelledby="faq-heading">
      <div className="grid gap-10 lg:grid-cols-[minmax(0,.7fr)_minmax(0,1.3fr)] lg:gap-[6vw]">
        <div className="self-start">
          <h2 id="faq-heading" className={h2Section}>Common questions</h2>
          <p className={cn(leadText, "mt-5")}>Short answers about how Plotline saves and shows your plots.</p>
        </div>
        <div>
          {faqs.map((item) => (
            <details className="group border-b-2 border-ink first:border-t-2" key={item.q}>
              <summary className="flex cursor-pointer list-none items-center justify-between gap-6 py-5 text-lg font-semibold [&::-webkit-details-marker]:hidden">
                {item.q}
                <span className="grid size-8 flex-none place-items-center border-2 border-ink transition-transform duration-200 group-open:rotate-45 group-open:bg-lime"><Plus size={16} /></span>
              </summary>
              <p className="max-w-[60ch] pb-6 text-ink/75">{item.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

function FinalCta() {
  return (
    <section className="bg-smoke px-section py-[80px] text-cream md:py-[120px]" aria-labelledby="cta-heading">
      <div className="flex items-center" aria-hidden="true">
        {["bg-orange", "bg-orange", "bg-lime ring-4 ring-lime/30", "bg-transparent", "bg-transparent"].map((fill, index, all) => (
          <div className="flex items-center" key={index}>
            <span className={cn("size-7 rounded-full border-2 border-cream/80", fill)} />
            {index < all.length - 1 && <span className={cn("h-[3px] w-10 sm:w-16 md:w-24", index < 2 ? "bg-orange" : "bg-cream/30")} />}
          </div>
        ))}
      </div>
      <h2 id="cta-heading" className="mt-10 max-w-[16ch] font-display text-[length:clamp(40px,6.5vw,92px)] font-extrabold tracking-[-.05em] leading-[.95]">You already know the chapter. Give it a path.</h2>
      <p className="mt-6 max-w-[48ch] text-lg text-cream/75">Start with a name and a few milestones. You can reorder them whenever the plan changes.</p>
      <div className="mt-9 flex flex-wrap items-center gap-6">
        <Link to="/create" className={btnLight}>Start plotting <ArrowRight size={18} /></Link>
        <Link to="/plots" className="font-semibold text-cream underline underline-offset-4 hover:text-lime">See your plots</Link>
      </div>
    </section>
  );
}

function Home() {
  const [exampleIndex, setExampleIndex] = useState(0);
  const [progressById, setProgressById] = useState<Record<string, number>>({});
  const baseExample = examplePlots[exampleIndex];
  const currentIndex =
    progressById[baseExample.id] ?? Math.max(0, baseExample.milestones.findIndex((item) => item.status === "current"));
  const activeExample: Plotline = {
    ...baseExample,
    milestones: baseExample.milestones.map((item, index): Milestone => ({
      ...item,
      status: index < currentIndex ? "complete" : index === currentIndex ? "current" : "upcoming",
    })),
  };
  const activeComplete = currentIndex;
  const pad = (value: number) => String(value).padStart(2, "0");

  return (
    <main>
      <Seo title="Plotline — See the path." description="Turn a big, messy chapter into a visual path of meaningful milestones." />

      <section className="relative overflow-hidden border-b-2 border-ink bg-orange px-section py-[48px] md:py-[72px] lg:py-[88px]">
        <div className="pointer-events-none absolute inset-0 animate-pattern-drift bg-[radial-gradient(var(--color-ink)_1.3px,transparent_1.3px)] bg-[length:18px_18px] opacity-70 [mask-image:linear-gradient(90deg,black_0%,transparent_78%)]" aria-hidden="true" />
        <div className="relative z-[1] grid items-center gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] lg:gap-[5vw]">
          <div className="animate-rise-in">
            <h1 className={cn(heroH1, "max-w-[12ch]")}>Make the next chapter visible.</h1>
            <p className="mt-6 max-w-[46ch] text-lg leading-relaxed sm:text-xl">Turn a big change into a path of milestones, so you can see where you are and what comes next.</p>
            <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-2">
              <Link to="/create" className={btnDark}>Create a plot <ArrowRight size={18} /></Link>
              <a href="#how" className={textLink}>See how it works</a>
            </div>
          </div>

          <div className="animate-float-in border-[3px] border-ink bg-cream shadow-[8px_8px_0_var(--color-ink)] sm:shadow-[12px_12px_0_var(--color-ink)]" aria-label={`Interactive example: ${activeExample.title}`}>
            <div className="flex gap-1.5 overflow-x-auto border-b-2 border-ink bg-paper p-2.5 [scrollbar-width:thin]" role="group" aria-label="Choose an example chapter">
              {examplePlots.map((example, index) => (
                <button
                  type="button"
                  className={cn(
                    "shrink-0 border-2 border-transparent px-3 py-1.5 text-sm font-semibold whitespace-nowrap hover:border-ink",
                    index === exampleIndex && "border-ink bg-ink text-cream",
                  )}
                  key={example.id}
                  onClick={() => setExampleIndex(index)}
                  aria-pressed={index === exampleIndex}
                >
                  {example.title}
                </button>
              ))}
            </div>

            <div className="p-5 sm:p-7">
              <div className="font-display text-[length:clamp(28px,3.4vw,44px)] leading-none font-extrabold tracking-[-.045em]">{activeExample.title}</div>
              <p className="mt-2 text-sm text-ink/70">Step {currentIndex + 1} of {activeExample.milestones.length}</p>

              <ol className="mt-6">
                {activeExample.milestones.map((milestone, index) => {
                  const last = index === activeExample.milestones.length - 1;
                  return (
                    <li key={milestone.id}>
                      <button
                        type="button"
                        className="group flex w-full items-start gap-4 py-1.5 text-left"
                        onClick={() => setProgressById((current) => ({ ...current, [baseExample.id]: index }))}
                        aria-label={`Set ${milestone.title} as current`}
                        aria-current={milestone.status === "current" ? "step" : undefined}
                      >
                        <span className="relative flex flex-col items-center">
                          <span
                            className={cn(
                              "z-[1] grid size-7 flex-none place-items-center rounded-full border-2 border-ink bg-cream text-xs font-bold transition-colors duration-200 group-hover:bg-lime",
                              milestone.status === "complete" && "bg-orange text-cream group-hover:bg-orange",
                              milestone.status === "current" && "bg-ink text-lime group-hover:bg-ink",
                            )}
                          >
                            {milestone.status === "complete" ? <Check size={14} /> : index + 1}
                          </span>
                          {!last && <span className={cn("absolute top-7 -bottom-3 w-[3px] bg-ink/15", milestone.status === "complete" && "bg-orange")} />}
                        </span>
                        <span className="flex min-w-0 flex-1 flex-wrap items-baseline justify-between gap-x-4 pt-0.5">
                          <span className={cn("font-semibold", milestone.status === "upcoming" && "text-ink/60")}>{milestone.title}</span>
                          <span className="text-sm text-ink/60">{formatDate(milestone.date)}</span>
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ol>

              <p className="mt-5 border-t-2 border-ink pt-4 text-sm text-ink/70">Select any step to move the marker. This is how every plot works.</p>
            </div>
          </div>
        </div>
      </section>

      <ProblemSection />
      <HowItWorks />

      <section id="demo" className="overflow-hidden border-b-2 border-ink bg-lime py-[80px] md:py-[120px]" aria-labelledby="demo-heading">
        <div className="px-section mb-12 max-w-[760px]">
          <h2 id="demo-heading" className={h2Section}>See a finished path</h2>
          <p className={cn(leadText, "mt-5 text-ink/80")}>Pick a chapter and read it from left to right. Each one has a past, a present and a future.</p>
        </div>
        <div className="mx-auto grid w-[calc(100%_-_40px)] border-[3px] border-ink bg-cream shadow-[10px_10px_0_var(--color-ink)] md:grid-cols-[270px_minmax(0,1fr)] md:shadow-[14px_14px_0_var(--color-ink)] lg:w-[min(1200px,calc(100%_-_clamp(40px,14vw,200px)))]">
          <div className="flex flex-col bg-smoke p-7 text-cream md:min-h-[390px]">
            <span className="text-sm text-cream/60">Example chapter</span>
            <strong className="mt-3 font-display text-[30px] leading-none font-bold tracking-[-.04em]">{activeExample.title}</strong>
            <div className="mt-8 flex items-baseline gap-2 md:mt-auto"><b className="font-display text-[32px] font-bold">{pad(activeExample.milestones.length)}</b><span className="text-sm text-cream/60">milestones</span></div>
            <div className="mt-3 flex items-baseline gap-2"><b className="font-display text-[32px] font-bold">{pad(activeComplete)}</b><span className="text-sm text-cream/60">complete</span></div>
          </div>
          <div className="min-w-0 px-3.5 py-[25px] max-md:overflow-hidden md:px-[35px] md:py-10"><TimelinePreview plot={activeExample} /></div>
        </div>
        <div className="px-section pt-10">
          <div className="grid grid-cols-1 border-t-2 border-l-2 border-ink sm:grid-cols-2 md:grid-cols-5">
            {examplePlots.map((example, index) => (
              <button
                type="button"
                className={cn(
                  "grid min-h-[82px] grid-cols-[1fr_auto] items-center gap-3 border-r-2 border-b-2 border-ink px-4 py-3.5 text-left text-ink transition-colors duration-200 hover:bg-cream",
                  index === exampleIndex && "bg-ink text-cream hover:bg-ink",
                )}
                key={example.id}
                onClick={() => setExampleIndex(index)}
                aria-pressed={index === exampleIndex}
              >
                <strong className="font-display text-base leading-[1.05] font-bold tracking-[-.035em]">{example.title}</strong>
                <ArrowUpRight size={16} />
              </button>
            ))}
          </div>
        </div>
      </section>

      <Features />
      <Faq />
      <FinalCta />
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

const legalDocs = {
  privacy: {
    title: "Privacy Policy",
    seoTitle: "Privacy Policy — Plotline",
    description: "How Plotline handles information and local data.",
    intro: "Plotline is a browser-based tool for turning a major chapter or goal into a visual sequence of milestones. This policy explains what information the current version of Plotline handles.",
    sections: [
      { id: "what-we-store", title: "What we store", body: "Your plots are stored in your browser using local storage. They may include chapter names, descriptions, dates, milestone titles, notes, and progress states that you enter. This data is not sent to a Plotline server by the current version of the product." },
      { id: "what-we-collect", title: "What we collect", body: "Plotline does not currently require an account, collect a name or email address, or use advertising trackers. We do not currently operate a backend database for your plots." },
      { id: "your-responsibility", title: "Your responsibility", body: "Because plot data is stored locally, clearing browser storage, using a different browser or device, or certain browser privacy settings may remove access to saved plots. Do not use Plotline as the sole record for critical information." },
      { id: "changes", title: "Changes", body: "This policy may change as Plotline gains features such as accounts, analytics, cloud sync, or other services. If those features materially change how information is handled, this page will be updated." },
    ],
  },
  terms: {
    title: "Terms of Use",
    seoTitle: "Terms of Use — Plotline",
    description: "The terms that apply when you use Plotline.",
    intro: "By using Plotline, you agree to use the product responsibly and to these terms. Plotline is a planning and visualization tool, not professional, legal, financial, medical, or other expert advice.",
    sections: [
      { id: "the-product", title: "The product", body: "Plotline lets you create and manage personal chapter timelines in your browser. Features may change, be removed, or become unavailable without notice." },
      { id: "your-content", title: "Your content", body: "You remain responsible for the information you enter into Plotline. Keep independent copies of anything important. The current version stores plot data locally on your device." },
      { id: "acceptable-use", title: "Acceptable use", body: "Do not use Plotline to store unlawful content, interfere with the service, or attempt unauthorized access to systems or data." },
      { id: "no-guarantees", title: "No guarantees", body: "Plotline is provided on an “as available” basis. We do not guarantee that the service will always be available, error-free, or that locally stored data will never be lost." },
      { id: "changes-to-terms", title: "Changes to these terms", body: "These terms may be updated as the product develops. Continued use of Plotline after an update means you accept the revised terms." },
    ],
  },
};

function LegalPage({ type }: { type: "privacy" | "terms" }) {
  const doc = legalDocs[type];
  return (
    <main className={cn(pagePad, "min-h-[calc(100vh_-_140px)]")}>
      <Seo title={doc.seoTitle} description={doc.description} />
      <Link to="/" className={backLink}><ArrowLeft size={16} /> Back home</Link>
      <h1 className={cn(pageH1, "mt-8")}>{doc.title}</h1>
      <p className="mt-4 text-sm text-ink/65">Last updated October 5, 2026</p>

      <div className="mt-12 grid gap-10 lg:grid-cols-[220px_minmax(0,1fr)] lg:gap-[6vw]">
        <nav className="self-start border-2 border-ink bg-cream p-5 lg:sticky lg:top-[100px]" aria-label="On this page">
          <h2 className="text-sm font-semibold text-ink/65">On this page</h2>
          <ul className="mt-3 space-y-2">
            {doc.sections.map((section) => (
              <li key={section.id}><a href={`#${section.id}`} className="text-sm font-semibold underline-offset-4 hover:underline">{section.title}</a></li>
            ))}
          </ul>
        </nav>

        <div className="max-w-[68ch]">
          <p className="text-xl leading-relaxed">{doc.intro}</p>
          {doc.sections.map((section) => (
            <section id={section.id} className="scroll-mt-[100px] border-t-2 border-ink pt-6 mt-10" aria-labelledby={`${section.id}-title`} key={section.id}>
              <h2 id={`${section.id}-title`} className="font-display text-[28px] leading-[1.05] font-bold tracking-[-.03em]">{section.title}</h2>
              <p className="mt-3 text-lg leading-[1.7] text-ink/80">{section.body}</p>
            </section>
          ))}
        </div>
      </div>
    </main>
  );
}

function PathPreview({ title, steps }: { title: string; steps: { title: string; date: string }[] }) {
  const named = steps.filter((step) => step.title.trim());
  const placeholder = named.length === 0;
  const rows = placeholder ? [{ title: "Your first milestone", date: "" }, { title: "Your next milestone", date: "" }] : named;

  return (
    <div className="border-2 border-ink bg-lime">
      <div className="border-b-2 border-ink px-5 py-3 font-bold">Preview</div>
      <div className="px-5 py-5">
        <div className="font-display text-2xl leading-tight font-bold tracking-[-.03em] [overflow-wrap:anywhere]">{title.trim() || "Your chapter"}</div>
        <ol className="mt-5">
          {rows.map((row, index) => {
            const last = index === rows.length - 1;
            return (
              <li className="flex gap-4 pb-5 last:pb-0" key={index}>
                <span className="relative flex flex-col items-center">
                  <span className={cn("z-[1] grid size-7 place-items-center rounded-full border-2 border-ink bg-cream text-xs font-bold", index === 0 && "bg-ink text-lime")}>{index + 1}</span>
                  {!last && <span className="absolute top-7 -bottom-5 w-[3px] bg-ink" />}
                </span>
                <span className="min-w-0 pt-0.5">
                  <span className={cn("block font-semibold [overflow-wrap:anywhere]", placeholder && "text-ink/55")}>{row.title}</span>
                  {index === 0 && !placeholder && <span className="mt-1 inline-block bg-ink px-1.5 py-0.5 text-xs text-lime">You are here</span>}
                </span>
              </li>
            );
          })}
        </ol>
      </div>
      <p className="border-t-2 border-ink px-5 py-3.5 text-sm">The first milestone starts as current. You can change that any time.</p>
    </div>
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
    <main className={pagePad}>
      <Seo title="Create a plot — Plotline" description="Turn a chapter, goal, or major transition into a visual path." />
      <Link to="/" className={backLink}><ArrowLeft size={16} /> Back home</Link>
      <div className="mt-8 max-w-[760px]">
        <h1 className={pageH1}>What are you moving through?</h1>
        <p className={cn(leadText, "mt-5")}>A chapter can be practical, personal or ambitious. Name it, then add the moments that matter.</p>
      </div>

      <div className="mt-12 grid gap-12 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,.7fr)] lg:gap-[5vw]">
        <div>
          <div className="grid gap-6">
            <label className="block">
              <span className={labelText}>Chapter name</span>
              <input autoFocus className={cn(field, "text-xl font-semibold")} value={title} onChange={(event) => setTitle(event.target.value)} placeholder="e.g. Launch my first product" />
            </label>
            <label className="block">
              <span className={labelText}>Description <span className="font-normal text-ink/60">(optional)</span></span>
              <textarea className={cn(field, "resize-y")} value={description} onChange={(event) => setDescription(event.target.value)} placeholder="What does getting through this chapter look like?" rows={3} />
            </label>
            <label className="block sm:max-w-[260px]">
              <span className={labelText}>Starting point</span>
              <input className={dateInput} type="date" value={startDate} onChange={(event) => setStartDate(event.target.value)} />
            </label>
          </div>

          <div className="mt-12">
            <div className="flex items-baseline justify-between gap-4">
              <h2 className="font-display text-3xl font-bold tracking-[-.03em]">Milestones</h2>
              <span className="text-sm text-ink/65">{filledCount} of {milestones.length} named</span>
            </div>
            <p className="mt-1 text-ink/70">Think in moments, not every small task.</p>

            <ol className="mt-6 space-y-4">
              {milestones.map((milestone, index) => (
                <li className="animate-rise-in border-2 border-ink bg-paper p-4 sm:p-5" key={index}>
                  <div className="flex items-start gap-3">
                    <span className="grid size-10 flex-none place-items-center bg-ink font-display font-bold text-cream">{index + 1}</span>
                    <div className="min-w-0 flex-1">
                      <input
                        className={cn(field, "font-semibold")}
                        value={milestone.title}
                        onChange={(event) => updateMilestone(index, "title", event.target.value)}
                        placeholder={index === 0 ? "First meaningful step" : "Next meaningful step"}
                        aria-label={`Milestone ${index + 1} title`}
                      />
                      <div className="mt-3 grid gap-3 sm:grid-cols-[180px_minmax(0,1fr)]">
                        <input className={dateInput} type="date" value={milestone.date} onChange={(event) => updateMilestone(index, "date", event.target.value)} aria-label={`Milestone ${index + 1} date`} />
                        <input className={field} value={milestone.note} onChange={(event) => updateMilestone(index, "note", event.target.value)} placeholder="A note, if useful" aria-label={`Milestone ${index + 1} note`} />
                      </div>
                    </div>
                    <button
                      type="button"
                      className="grid size-10 flex-none place-items-center border-2 border-ink bg-cream enabled:hover:bg-pink disabled:opacity-40"
                      onClick={() => removeMilestone(index)}
                      aria-label={`Remove milestone ${index + 1}`}
                      disabled={milestones.length <= 2}
                    >
                      <Trash2 size={17} />
                    </button>
                  </div>
                </li>
              ))}
            </ol>

            <button type="button" className="mt-4 flex w-full items-center justify-center gap-2 border-2 border-dashed border-ink px-4 py-3 font-semibold hover:bg-lime" onClick={addMilestone}>
              <Plus size={17} /> Add a milestone
            </button>
          </div>

          <div className="mt-10 flex flex-col items-start gap-3 border-t-2 border-ink pt-6 sm:flex-row sm:items-center sm:gap-5">
            <button type="button" className={cn(btnDark, "max-sm:w-full")} disabled={!canCreate} onClick={create}>
              Create plot <ArrowRight size={18} />
            </button>
            {!canCreate && <p className="text-sm text-ink/65">Add a chapter name and at least one milestone to continue.</p>}
          </div>
        </div>

        <aside className="lg:sticky lg:top-[100px] lg:self-start" aria-label="Live preview of your path">
          <PathPreview title={title} steps={milestones} />
        </aside>
      </div>
    </main>
  );
}

function MiniPath({ milestones }: { milestones: Milestone[] }) {
  return (
    <div className="flex items-center" aria-hidden="true">
      {milestones.map((milestone, index) => {
        const last = index === milestones.length - 1;
        return (
          <div className={cn("flex items-center", !last && "flex-1")} key={milestone.id}>
            <span
              className={cn(
                "size-4 flex-none rounded-full border-2 border-ink bg-cream",
                milestone.status === "complete" && "bg-orange",
                milestone.status === "current" && "size-5 bg-lime ring-4 ring-lime/40",
              )}
            />
            {!last && <span className={cn("h-[3px] flex-1", milestone.status === "complete" ? "bg-orange" : "bg-ink/15")} />}
          </div>
        );
      })}
    </div>
  );
}

function Plots({ plots }: { plots: Plotline[] }) {
  return (
    <main className={pagePad}>
      <Seo title="Your plots — Plotline" description="See and continue the chapters you have mapped in Plotline." />
      <div className="flex flex-col items-start gap-6 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className={pageH1}>Your plots</h1>
          <p className={cn(leadText, "mt-4")}>{plots.length === 0 ? "Nothing here yet." : `${plots.length} ${plots.length === 1 ? "plot" : "plots"} saved in this browser.`}</p>
        </div>
        <Link to="/create" className={btnDark}><Plus size={18} /> New plot</Link>
      </div>

      {plots.length === 0 ? (
        <div className="mt-12 flex flex-col items-start gap-8 border-2 border-dashed border-ink p-8 md:p-12">
          <div className="flex items-center" aria-hidden="true">
            <span className="size-5 rounded-full border-2 border-dashed border-ink" />
            <span className="h-0 w-12 border-t-[3px] border-dashed border-ink sm:w-20" />
            <span className="size-5 rounded-full border-2 border-dashed border-ink" />
            <span className="h-0 w-12 border-t-[3px] border-dashed border-ink sm:w-20" />
            <span className="size-5 rounded-full border-2 border-dashed border-ink" />
          </div>
          <div>
            <h2 className="font-display text-3xl font-bold tracking-[-.03em]">No plots yet</h2>
            <p className="mt-2 max-w-[44ch] text-ink/75">Start with one chapter. You can reorder it and move the marker as things change.</p>
          </div>
          <Link to="/create" className={btnDark}>Create your first plot <ArrowRight size={18} /></Link>
        </div>
      ) : (
        <div className="mt-12 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {plots.map((plot) => {
            const complete = plot.milestones.filter((item) => item.status === "complete").length;
            const total = plot.milestones.length;
            const current = plot.milestones.find((item) => item.status === "current");
            const done = total > 0 && complete === total;
            return (
              <Link
                to={`/plot/${plot.id}`}
                className="group flex flex-col gap-6 border-2 border-ink bg-cream p-6 transition-shadow duration-200 hover:shadow-[6px_6px_0_var(--color-ink)]"
                key={plot.id}
              >
                <div className="flex items-center justify-between gap-3">
                  <span className={cn("border-2 border-ink px-2 py-0.5 text-xs font-semibold", done ? "bg-orange text-cream" : current ? "bg-lime" : "bg-paper")}>
                    {done ? "Complete" : current ? "In progress" : "Not started"}
                  </span>
                  <ArrowUpRight size={18} className="transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </div>
                <div>
                  <h2 className="font-display text-[length:clamp(26px,2.6vw,34px)] leading-[1.02] font-bold tracking-[-.04em] [overflow-wrap:anywhere]">{plot.title}</h2>
                  <p className="mt-2 line-clamp-2 text-ink/70">{plot.description || "A chapter worth giving a shape to."}</p>
                </div>
                <div className="mt-auto space-y-3">
                  <MiniPath milestones={plot.milestones} />
                  <div className="flex items-baseline justify-between gap-4 text-sm">
                    <span className="min-w-0 truncate font-semibold">{done ? "All milestones done" : current ? `Now: ${current.title}` : "No milestone is current"}</span>
                    <span className="flex-none text-ink/65">{complete} of {total}</span>
                  </div>
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
  const current = plot.milestones.find((item) => item.status === "current");

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

  return (
    <main>
      <Seo title={`${plot.title} — Plotline`} description={plot.description || "A visual path for a chapter you are moving through."} />

      <section className="border-b-2 border-ink bg-orange">
        <div className="px-section py-10 md:py-[60px]">
          <Link to="/plots" className={backLink}><ArrowLeft size={16} /> All plots</Link>
          <div className="mt-10 grid items-end gap-10 md:grid-cols-[minmax(0,1fr)_auto]">
            <div>
              <p className="text-sm font-semibold">Started {formatDate(plot.startDate)}</p>
              <h1 className={cn(heroH1, "mt-3 max-w-[16ch]")}>{plot.title}</h1>
              {plot.description && <p className="mt-6 max-w-[52ch] text-lg">{plot.description}</p>}
            </div>
            <div className="border-2 border-ink bg-lime p-5 shadow-[6px_6px_0_var(--color-ink)] md:min-w-[210px]">
              <div className="font-display text-[64px] leading-none font-extrabold tracking-[-.06em]">{progress}%</div>
              <div className="mt-2 text-sm font-semibold">{completeCount} of {plot.milestones.length} complete</div>
            </div>
          </div>
        </div>
      </section>

      <section className={pagePad} aria-labelledby="path-heading">
        <div className="mx-auto max-w-[1050px]">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 id="path-heading" className="font-display text-[length:clamp(30px,4vw,48px)] leading-none font-extrabold tracking-[-.05em]">The path</h2>
              <p className="mt-2 text-ink/70">Select a milestone to change where you are. Use the arrows or drag the handle to reorder.</p>
            </div>
            <button type="button" className="inline-flex items-center gap-1.5 text-sm font-semibold text-ink/60 hover:text-[#b00020]" onClick={deletePlot}><Trash2 size={15} /> Delete plot</button>
          </div>

          <div className="mt-8 flex flex-wrap items-center gap-x-4 gap-y-2 border-2 border-ink bg-cream px-5 py-4">
            {current ? (
              <>
                <span className="bg-ink px-2 py-1 text-xs font-semibold text-lime">You are here</span>
                <strong className="font-display text-xl tracking-[-.02em]">{current.title}</strong>
                {current.date && <span className="text-sm text-ink/65">{formatDate(current.date)}</span>}
              </>
            ) : (
              <span className="font-semibold">{progress === 100 ? "Chapter complete. Every milestone is done." : "Nothing is current yet. Select a milestone to set where you are."}</span>
            )}
          </div>

          <div className="mt-6 mb-12 h-3 overflow-hidden bg-ink/10" role="progressbar" aria-label="Chapter progress" aria-valuemin={0} aria-valuemax={100} aria-valuenow={progress}>
            <span className="block h-full bg-orange transition-[width] duration-[600ms] ease-[cubic-bezier(.2,.8,.2,1)]" style={{ width: `${progress}%` }} />
          </div>

          <ol className="list-none [--marker-top:26px] [--marker:38px] md:[--marker-top:28px] md:[--marker:54px]">
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
                      {status === "complete" ? <Check size={20} /> : <span className="font-display text-sm font-bold md:text-base">{index + 1}</span>}
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
                      <span className="text-xs font-semibold text-ink/60">{statusLabel[status]}</span>
                      <strong
                        className={cn(
                          "mt-1 mb-1 block max-w-[620px] font-display text-[27px] font-bold tracking-[-.045em] [overflow-wrap:anywhere] md:text-[length:clamp(26px,3vw,44px)]",
                          status === "current" && "text-[31px] md:text-[length:clamp(30px,3.5vw,52px)]",
                          "leading-[.95]",
                        )}
                      >
                        {milestone.title}
                      </strong>
                      <span className="text-sm">{formatDate(milestone.date)}</span>
                      {milestone.note && <span className="text-sm text-ink/70">{milestone.note}</span>}
                      {status === "current" && (
                        <span className="mt-3 flex items-center gap-2 text-sm font-semibold">
                          <span className="bg-blue px-2 py-1 text-xs text-cream">You are here</span> Mark complete <ArrowRight size={15} />
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
                  </div>
                </li>
              );
            })}
          </ol>
        </div>
      </section>

      <section className="flex flex-col items-start gap-6 border-t-2 border-ink bg-paper px-section py-12 md:flex-row md:items-center md:justify-between md:py-[72px]">
        <p className="flex items-center gap-3 font-semibold"><ArrowDownRight size={28} className="text-blue" /> Progress does not need to be linear.</p>
        <Link to="/create" className={btnDark}>Start another chapter <Plus size={18} /></Link>
      </section>
    </main>
  );
}

function NotFound() {
  return (
    <main className="border-b-2 border-ink bg-orange px-section py-[72px] md:py-[110px]">
      <Seo title="Page not found — Plotline" description="The Plotline page you requested does not exist." />
      <div className="flex items-center" aria-hidden="true">
        <span className="size-7 rounded-full border-2 border-ink bg-ink" />
        <span className="h-[3px] w-14 bg-ink sm:w-24" />
        <span className="size-7 rounded-full border-2 border-ink bg-ink" />
        <span className="h-0 w-14 border-t-[3px] border-dashed border-ink sm:w-24" />
        <span className="size-7 rounded-full border-2 border-dashed border-ink" />
      </div>
      <h1 className={cn(pageH1, "mt-10 max-w-[14ch]")}>This path does not exist.</h1>
      <p className="mt-6 max-w-[46ch] text-lg">Nothing lives at this address. Your plots are still where you left them.</p>
      <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-2">
        <Link to="/" className={btnDark}><ArrowLeft size={18} /> Back to Plotline</Link>
        <Link to="/plots" className={textLink}>See your plots</Link>
      </div>
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
