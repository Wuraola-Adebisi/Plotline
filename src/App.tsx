import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import {
  ArrowDownRight,
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  CalendarDays,
  Check,
  Circle,
  Home as HomeIcon,
  Plus,
  Sparkles,
  Trash2,
} from "lucide-react";
import {
  BrowserRouter,
  Link,
  Route,
  Routes,
  useNavigate,
  useParams,
} from "react-router-dom";
import "./App.css";

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

const seedPlot: Plotline = {
  id: "moving-to-lagos",
  title: "Moving to Lagos",
  description: "A simple path from decision to feeling properly settled.",
  startDate: "2026-09-01",
  milestones: [
    { id: "m1", title: "Find apartments", date: "2026-09-03", status: "complete" },
    { id: "m2", title: "Inspect apartments", date: "2026-09-10", status: "complete" },
    { id: "m3", title: "Pay deposit", date: "2026-09-18", status: "current" },
    { id: "m4", title: "Get the keys", date: "2026-09-28", status: "upcoming" },
    { id: "m5", title: "Move in", date: "2026-10-03", status: "upcoming" },
    { id: "m6", title: "Feel settled", date: "2026-10-17", status: "upcoming" },
  ],
};

function loadPlots(): Plotline[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) return JSON.parse(saved);
  } catch {
    // Fall through to the seed plot.
  }
  return [seedPlot];
}

function formatDate(date?: string) {
  if (!date) return "No date";
  const parsed = new Date(`${date}T12:00:00`);
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
  return <div ref={ref} className={`reveal ${visible ? "is-visible" : ""} ${className}`}>{children}</div>;
}

function Header() {
  return (
    <header className="site-header">
      <Link to="/" className="brand" aria-label="Plotline home">
        <span className="brand-mark" aria-hidden="true">/</span>
        <span>plotline</span>
      </Link>
      <nav>
        <Link to="/plots" className="nav-link">Your plots</Link>
        <Link to="/privacy" className="nav-link">Privacy</Link>
        <Link to="/create" className="button button-dark button-small">
          <Plus size={16} /> New plot
        </Link>
      </nav>
    </header>
  );
}

function Footer() {
  return (
    <footer className="site-footer">
      <span>plotline / make the next chapter visible</span>
      <span>Built for the things that do not fit in a checklist.</span>
      <span className="footer-links"><Link to="/privacy">Privacy</Link><Link to="/terms">Terms</Link></span>
    </footer>
  );
}

function Home({ plots }: { plots: Plotline[] }) {
  const example = plots.find((plot) => plot.id === seedPlot.id) ?? plots[0] ?? seedPlot;
  const useCases = [
    ["01", "Moving somewhere", "From finding a place to finally feeling settled."],
    ["02", "Getting the job", "From searching to interviews to your first day."],
    ["03", "Launching something", "From the idea to the moment it is finally out there."],
    ["04", "Planning a wedding", "From the big decision to the day itself."],
    ["05", "Shipping a project", "From first thought to finished and live."],
    ["06", "Starting a new chapter", "Whatever the chapter looks like for you."],
  ];
  return (
    <>
      <Seo title="Plotline — See the path." description="Plotline turns big chapters into visual paths of meaningful milestones." />
      <section className="hero">
        <div className="hero-pattern" aria-hidden="true" /><div className="hero-grid-mark" aria-hidden="true" />
        <div className="hero-copy">
          <div className="eyebrow hero-eyebrow"><span>01</span> A VISUAL PATH FOR BIG THINGS</div>
          <h1>Make the next<br /><em>chapter visible.</em></h1>
          <p>Turn something big and messy into a sequence of moments you can actually move through.</p>
          <div className="hero-actions"><Link to="/create" className="button button-dark">Create a plot <ArrowRight size={18} /></Link><Link to={`/plot/${example.id}`} className="text-link">See an example <ArrowUpRight size={17} /></Link></div>
        </div>
        <div className="hero-art hero-product-art" aria-label="Example Plotline timeline">
          <div className="product-art-label">A CHAPTER / MOVING TO LAGOS</div>
          <div className="product-path"><div className="path-track"><span className="path-progress" /></div>
            {["Decide", "Plan", "Move", "Settle"].map((item, index) => <div className={`path-step ${index === 2 ? "active" : index < 2 ? "done" : ""}`} key={item}><span className="path-dot">{index < 2 ? "✓" : index === 2 ? "YOU" : ""}</span><span>{item}</span></div>)}
          </div>
          <div className="hero-sticker sticker-top">ONE CHAPTER<br />AT A TIME</div><div className="hero-sticker sticker-bottom">SEE WHERE<br />YOU ARE</div><div className="hero-number">01</div>
        </div>
        <div className="hero-side-note">CHAPTERS / MILESTONES / MOVEMENT</div>
      </section>

      <ScrollReveal><section className="what-section section-pad">
        <div className="section-label">SO, WHAT IS PLOTLINE?</div>
        <div className="what-grid"><h2>A timeline for <em>the things that are bigger than a task.</em></h2><div><p className="lead-copy">Plotline helps you take one major chapter of your life or work and turn it into a clear sequence of meaningful milestones.</p><p>You choose the chapter. You decide what the important moments are. Then Plotline gives you a visual path to move through and update as things change.</p></div></div>
      </section></ScrollReveal>

      <ScrollReveal><section className="how-section"><div className="section-pad">
        <div className="section-label">HOW IT WORKS</div><div className="how-grid">
          <article><span>01</span><h3>Name the chapter</h3><p>Give the big thing a name and a starting point. Moving, launching, changing jobs, planning.</p></article>
          <article><span>02</span><h3>Plot the moments</h3><p>Add the milestones that matter. Not every tiny task. Just the moments that move the story forward.</p></article>
          <article><span>03</span><h3>Move through it</h3><p>Mark where you are as the chapter unfolds. Your path changes with you.</p></article>
        </div>
      </div></section></ScrollReveal>

      <ScrollReveal><section className="example-section">
        <div className="example-head"><div><div className="section-label">SEE IT IN ACTION</div><h2>{example.title}</h2></div><Link to={`/plot/${example.id}`} className="round-arrow" aria-label="Open example"><ArrowUpRight size={21} /></Link></div>
        <TimelinePreview plot={example} /><div className="example-caption"><span>YOU ARE NOT MANAGING A LIST.</span><strong>YOU ARE MOVING THROUGH A CHAPTER.</strong></div>
      </section></ScrollReveal>

      <ScrollReveal><section className="use-cases section-pad">
        <div className="section-label">WHAT WOULD YOU USE IT FOR?</div><div className="use-case-grid">
          {useCases.map(([number, title, description]) => <article key={number} className={`use-case-card card-${number}`}><span>{number}</span><h3>{title}</h3><p>{description}</p></article>)}
        </div>
      </section></ScrollReveal>

      <ScrollReveal><section className="contrast-section section-pad">
        <div className="section-label">WHY NOT JUST USE A CHECKLIST?</div><div className="contrast-grid">
          <div><span>CHECKLIST</span><h3>What do I need to do?</h3><p>Great for individual tasks and things you need to tick off.</p></div>
          <div className="contrast-plotline"><span>PLOTLINE</span><h3>Where am I in this thing?</h3><p>Built around the shape of a chapter, with milestones that show how far you have moved.</p></div>
        </div>
      </section></ScrollReveal>

      <ScrollReveal><section className="dark-cta">
        <div className="cta-scribble" aria-hidden="true">→</div><div><div className="section-label light">YOUR NEXT CHAPTER</div><h2>You already know the chapter.<br /><em>Give it a path.</em></h2></div>
        <Link to="/create" className="button button-light">Start plotting <ArrowRight size={18} /></Link>
      </section></ScrollReveal>
    </>
  );
}

function TimelinePreview({ plot }: { plot: Plotline }) {
  return (
    <div className="preview-timeline">
      {plot.milestones.map((milestone, index) => (
        <div className={`preview-node ${milestone.status}`} key={milestone.id}>
          <div className="node-marker">
            {milestone.status === "complete" ? <Check size={15} /> : index + 1}
          </div>
          <div className="node-copy">
            <span>{formatDate(milestone.date)}</span>
            <strong>{milestone.title}</strong>
          </div>
        </div>
      ))}
    </div>
  );
}


function LegalPage({ type }: { type: "privacy" | "terms" }) {
  const privacy = type === "privacy";
  return (
    <main className="legal-page section-pad">
      <Seo title={privacy ? "Privacy Policy — Plotline" : "Terms of Use — Plotline"} description={privacy ? "How Plotline handles information and local data." : "The terms that apply when you use Plotline."} />
      <Link to="/" className="back-link"><ArrowLeft size={16} /> Back home</Link>
      <div className="legal-kicker">{privacy ? "PRIVACY" : "TERMS"} / LAST UPDATED OCTOBER 5, 2026</div>
      <h1>{privacy ? <>Privacy <em>Policy.</em></> : <>Terms of <em>Use.</em></>}</h1>
      {privacy ? <div className="legal-copy">
        <p>Plotline is a browser-based tool for turning a major chapter or goal into a visual sequence of milestones. This policy explains what information the current version of Plotline handles.</p>
        <h2>What we store</h2><p>Your plots are stored in your browser using local storage. They may include chapter names, descriptions, dates, milestone titles, notes, and progress states that you enter. This data is not sent to a Plotline server by the current version of the product.</p>
        <h2>What we collect</h2><p>Plotline does not currently require an account, collect a name or email address, or use advertising trackers. We do not currently operate a backend database for your plots.</p>
        <h2>Your responsibility</h2><p>Because plot data is stored locally, clearing browser storage, using a different browser or device, or certain browser privacy settings may remove access to saved plots. Do not use Plotline as the sole record for critical information.</p>
        <h2>Changes</h2><p>This policy may change as Plotline gains features such as accounts, analytics, cloud sync, or other services. If those features materially change how information is handled, this page will be updated.</p>
      </div> : <div className="legal-copy">
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
  const [startDate, setStartDate] = useState(new Date().toISOString().slice(0, 10));
  const [milestones, setMilestones] = useState([
    { title: "", date: "", note: "" },
    { title: "", date: "", note: "" },
  ]);

  const canCreate = Boolean(title.trim() && milestones.some((item) => item.title.trim()));

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
    <main className="create-page section-pad">
      <Seo title="Create a plot — Plotline" description="Turn a chapter, goal, or major transition into a visual path." />
      <div className="create-intro">
        <Link to="/" className="back-link"><ArrowLeft size={16} /> Back home</Link>
        <div className="eyebrow"><span>02</span> START WITH THE CHAPTER</div>
        <h1>What are you <em>moving through?</em></h1>
        <p>A chapter can be practical, personal, ambitious, or all three.</p>
      </div>

      <div className="create-form">
        <label>
          <span>Chapter name</span>
          <input autoFocus value={title} onChange={(event) => setTitle(event.target.value)} placeholder="e.g. Launch my first product" />
        </label>
        <label>
          <span>One-line description <small>optional</small></span>
          <textarea value={description} onChange={(event) => setDescription(event.target.value)} placeholder="What does getting through this chapter look like?" rows={3} />
        </label>
        <label>
          <span>Starting point</span>
          <div className="date-input">
            <CalendarDays size={17} />
            <input type="date" value={startDate} onChange={(event) => setStartDate(event.target.value)} />
          </div>
        </label>

        <div className="milestone-builder">
          <div className="builder-head">
            <div>
              <span>Milestones</span>
              <p>Think in moments, not every little task.</p>
            </div>
            <span className="builder-count">{milestones.filter((item) => item.title.trim()).length} / {milestones.length}</span>
          </div>
          <div className="builder-list">
            {milestones.map((milestone, index) => (
              <div className="builder-row" key={index}>
                <span className="row-number">{String(index + 1).padStart(2, "0")}</span>
                <div className="row-fields">
                  <input value={milestone.title} onChange={(event) => updateMilestone(index, "title", event.target.value)} placeholder={index === 0 ? "First meaningful step" : "Next meaningful step"} />
                  <div className="row-meta">
                    <input type="date" value={milestone.date} onChange={(event) => updateMilestone(index, "date", event.target.value)} />
                    <input value={milestone.note} onChange={(event) => updateMilestone(index, "note", event.target.value)} placeholder="A note, if useful" />
                  </div>
                </div>
                <button type="button" className="icon-button" onClick={() => removeMilestone(index)} aria-label={`Remove milestone ${index + 1}`} disabled={milestones.length <= 2}>
                  <Trash2 size={17} />
                </button>
              </div>
            ))}
          </div>
          <button type="button" className="add-milestone" onClick={addMilestone}>
            <Plus size={17} /> Add another milestone
          </button>
        </div>

        <div className="form-footer">
          <span>{milestones.filter((item) => item.title.trim()).length} milestones ready</span>
          <button type="button" className="button button-dark" disabled={!canCreate} onClick={create}>
            Create plot <ArrowRight size={18} />
          </button>
        </div>
      </div>
    </main>
  );
}

function Plots({ plots }: { plots: Plotline[] }) {
  return (
    <main className="plots-page section-pad">
      <Seo title="Your plots — Plotline" description="See and continue the chapters you have mapped in Plotline." />
      <div className="page-heading">
        <div>
          <div className="eyebrow"><span>03</span> YOUR CHAPTERS</div>
          <h1>Your <em>plots.</em></h1>
        </div>
        <Link to="/create" className="button button-dark"><Plus size={18} /> New plot</Link>
      </div>

      {plots.length === 0 ? (
        <div className="empty-state">
          <div className="empty-mark"><Sparkles size={24} /></div>
          <h2>Nothing plotted yet.</h2>
          <p>Start with one chapter. You can change the path as you go.</p>
          <Link to="/create" className="button button-dark">Create your first plot <ArrowRight size={18} /></Link>
        </div>
      ) : (
        <div className="plot-grid">
          {plots.map((plot, index) => {
            const complete = plot.milestones.filter((item) => item.status === "complete").length;
            const progress = plot.milestones.length ? Math.round((complete / plot.milestones.length) * 100) : 0;
            const current = plot.milestones.find((item) => item.status === "current");
            return (
              <Link to={`/plot/${plot.id}`} className={`plot-card card-${index % 4}`} key={plot.id}>
                <div className="card-top"><span>{String(index + 1).padStart(2, "0")}</span><ArrowUpRight size={18} /></div>
                <div className="card-main">
                  <span className="card-kicker">{progress === 100 ? "Chapter complete" : current ? "In motion" : "Ready to begin"}</span>
                  <h2>{plot.title}</h2>
                  <p>{plot.description || "A chapter worth giving a shape to."}</p>
                </div>
                <div className="card-bottom">
                  <div className="mini-progress"><span style={{ width: `${progress}%` }} /></div>
                  <strong>{complete}/{plot.milestones.length}</strong>
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

  const progress = useMemo(() => {
    if (!plot?.milestones.length) return 0;
    return Math.round((plot.milestones.filter((item) => item.status === "complete").length / plot.milestones.length) * 100);
  }, [plot]);

  useEffect(() => {
    if (!plot) navigate("/plots", { replace: true });
  }, [plot, navigate]);

  if (!plot) return null;

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
      const nextUpcoming = next.findIndex((item, index) => index > targetIndex && item.status === "upcoming");
      if (nextUpcoming >= 0) next[nextUpcoming] = { ...next[nextUpcoming], status: "current" };
    } else {
      next.forEach((item, index) => {
        if (item.status === "current") next[index] = { ...item, status: "upcoming" };
      });
      next[targetIndex] = { ...target, status: "current" };
    }

    onUpdate({ ...plot, milestones: next });
  };

  const deletePlot = () => {
    if (window.confirm(`Delete "${plot.title}"?`)) {
      onDelete(plot.id);
      navigate("/plots");
    }
  };

  return (
    <main className="plot-page">
      <Seo title={`${plot?.title ?? "Plot"} — Plotline`} description={plot?.description || "A visual path for a chapter you are moving through."} />
      <section className="plot-intro">
        <div className="plot-intro-pattern" aria-hidden="true" />
        <div className="section-pad plot-intro-inner">
          <Link to="/plots" className="back-link dark-back"><ArrowLeft size={16} /> All plots</Link>
          <div className="plot-intro-grid">
            <div>
              <div className="eyebrow"><span>CHAPTER</span> {formatDate(plot.startDate)}</div>
              <h1>{plot.title}</h1>
              <p>{plot.description}</p>
            </div>
            <div className="progress-stamp">
              <span>PATH</span>
              <strong>{progress}%</strong>
              <small>complete</small>
            </div>
          </div>
        </div>
      </section>

      <ScrollReveal>
      <section className="timeline-section section-pad">
        <div className="timeline-head">
          <div>
            <div className="section-label">THE PATH</div>
            <p>Tap a milestone to change where you are in the chapter.</p>
          </div>
          <button type="button" className="delete-link" onClick={deletePlot}><Trash2 size={15} /> Delete plot</button>
        </div>

        <div className="big-progress" aria-label={`${progress}% complete`}>
          <span style={{ width: `${progress}%` }} />
        </div>

        <div className="timeline">
          {plot.milestones.map((milestone, index) => (
            <button
              type="button"
              className={`timeline-item ${milestone.status}`}
              key={milestone.id}
              onClick={() => advanceMilestone(milestone.id)}
              aria-label={`${milestone.title}, ${milestone.status}. Change status.`}
            >
              <span className="timeline-line" aria-hidden="true" />
              <span className="timeline-marker">
                {milestone.status === "complete" ? <Check size={20} /> : <Circle size={16} />}
              </span>
              <span className="timeline-content">
                <span className="timeline-index">0{index + 1} / {milestone.status}</span>
                <strong>{milestone.title}</strong>
                <span className="timeline-date">{formatDate(milestone.date)}</span>
                {milestone.note && <span className="timeline-note">{milestone.note}</span>}
              </span>
              {milestone.status === "current" && (
                <span className="current-action">Mark complete <ArrowRight size={15} /></span>
              )}
            </button>
          ))}
        </div>
      </section>
      </ScrollReveal>
      <ScrollReveal>
      <section className="plot-bottom section-pad">
        <div className="bottom-note"><ArrowDownRight size={34} /><span>Progress does not need to be linear.</span></div>
        <Link to="/create" className="button button-dark">Start another chapter <Plus size={18} /></Link>
      </section>
      </ScrollReveal>
    </main>
  );
}

function NotFound() {
  return (
    <main className="not-found section-pad">
      <Seo title="Page not found — Plotline" description="The Plotline page you requested does not exist." />
      <div className="not-found-mark"><HomeIcon size={28} /></div>
      <div className="eyebrow"><span>404</span> WRONG TURN</div>
      <h1>This path <em>does not exist.</em></h1>
      <p>Nothing lives at this address. The chapter is still here.</p>
      <Link to="/" className="button button-dark"><ArrowLeft size={18} /> Back to Plotline</Link>
    </main>
  );
}

function App() {
  const [plots, setPlots] = useState<Plotline[]>(loadPlots);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(plots));
  }, [plots]);

  const createPlot = (plot: Plotline) => setPlots((current) => [...current, plot]);
  const updatePlot = (plot: Plotline) => setPlots((current) => current.map((item) => item.id === plot.id ? plot : item));
  const deletePlot = (id: string) => setPlots((current) => current.filter((item) => item.id !== id));

  return (
    <BrowserRouter>
      <Header />
      <Routes>
        <Route path="/" element={<Home plots={plots} />} />
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
