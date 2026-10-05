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

      <nav className="site-nav" aria-label="Main navigation">
        <Link to="/plots" className="nav-link">Your plots</Link>
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
      <div className="footer-main">
        <div className="footer-brand">
          <Link to="/" className="footer-logo" aria-label="Plotline home">
            <span className="brand-mark" aria-hidden="true">/</span>
            <span>plotline</span>
          </Link>
          <p>Make the next chapter visible. Turn a big thing into a path you can actually move through.</p>
          <Link to="/create" className="footer-cta">Start a plot <ArrowRight size={15} /></Link>
        </div>

        <div className="footer-links-group">
          <div>
            <span className="footer-heading">Explore</span>
            <Link to="/">Home</Link>
            <Link to="/plots">Your plots</Link>
            <Link to="/create">Create a plot</Link>
          </div>
          <div>
            <span className="footer-heading">Information</span>
            <Link to="/privacy">Privacy</Link>
            <Link to="/terms">Terms</Link>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <span>© {new Date().getFullYear()} Plotline</span>
        <span>Built for the things that do not fit in a checklist.</span>
        <span>Chapters / Milestones / Movement</span>
      </div>
    </footer>
  );
}

function Home({ plots }: { plots: Plotline[] }) {
  const example = plots.find((plot) => plot.id === seedPlot.id) ?? plots[0] ?? seedPlot;

  return (
    <>
      <Seo title="Plotline — See the path." description="Turn a big, messy chapter into a visual path of meaningful milestones." />

      <section className="hero">
        <div className="hero-pattern" aria-hidden="true" />
        <div className="hero-grid-mark" aria-hidden="true" />
        <div className="hero-copy">
          <div className="eyebrow hero-eyebrow"><span>01</span> SEE THE PATH</div>
          <h1>Make the next<br /><em>chapter visible.</em></h1>
          <p>Turn a big thing into a clear path of moments, so you can see where you are and what comes next.</p>
          <div className="hero-actions">
            <Link to="/create" className="button button-dark">Create a plot <ArrowRight size={18} /></Link>
            <Link to={`/plot/${example.id}`} className="text-link">See an example <ArrowUpRight size={17} /></Link>
          </div>
        </div>
        <div className="hero-art hero-product-art" aria-label="Plotline example showing a chapter and its milestones">
          <div className="product-window">
            <div className="product-window-top"><span>YOUR CHAPTER</span><strong>01 / 06</strong></div>
            <div className="product-window-title">Moving to Lagos</div>
            <div className="product-window-meta">6 milestones · 2 complete · 1 current</div>
            <div className="product-window-path">
              <span className="window-line" />
              {["Find", "Inspect", "Deposit", "Keys", "Move", "Settled"].map((item, index) => (
                <div className={`window-step ${index < 2 ? "done" : index === 2 ? "current" : ""}`} key={item}>
                  <span className="window-dot">{index < 2 ? "✓" : ""}</span>
                  <small>0{index + 1}</small>
                  <strong>{item}</strong>
                </div>
              ))}
            </div>
            <div className="product-window-footer"><span>YOU ARE HERE</span><b>Inspect apartments</b><ArrowRight size={16} /></div>
          </div>
          <div className="hero-sticker sticker-top">ONE CHAPTER<br />AT A TIME</div>
          <div className="hero-sticker sticker-bottom">SEE WHERE<br />YOU ARE</div>
        </div>
        <div className="hero-side-note">CHAPTERS / MILESTONES / MOVEMENT</div>
      </section>

      <ScrollReveal>
        <section className="manifesto section-pad">
          <div className="section-label">02 / THE IDEA</div>
          <h2>Some things are not tasks.<br /><em>They are chapters.</em></h2>
          <div className="manifesto-bottom">
            <p>A move. A new job. A launch. A wedding. A project. Plotline gives one of those big transitions a shape you can actually follow.</p>
            <Link to="/create" className="text-link">Make one <ArrowRight size={16} /></Link>
          </div>
        </section>
      </ScrollReveal>

      <ScrollReveal>
        <section className="product-section">
          <div className="section-pad product-heading">
            <div className="section-label">03 / THE PRODUCT</div>
            <div><h2>One chapter.<br /><em>One visible path.</em></h2><p>Everything important lives on the timeline.</p></div>
          </div>
          <div className="product-demo">
            <div className="demo-sidebar"><span>THE CHAPTER</span><strong>{example.title}</strong><small>YOUR PLOT</small><div className="demo-stat"><b>06</b><span>milestones</span></div><div className="demo-stat"><b>02</b><span>complete</span></div></div>
            <div className="demo-main"><TimelinePreview plot={example} /></div>
          </div>
        </section>
      </ScrollReveal>

      <ScrollReveal>
        <section className="movement-section section-pad">
          <div className="section-label">04 / KEEP MOVING</div>
          <div className="movement-grid">
            <div><span className="movement-number">01</span><h3>Upcoming</h3><p>What has not happened yet.</p></div>
            <div className="movement-current"><span className="movement-number">02</span><h3>Current</h3><p>Where you are right now.</p></div>
            <div><span className="movement-number">03</span><h3>Complete</h3><p>What you have already moved through.</p></div>
          </div>
        </section>
      </ScrollReveal>

      <ScrollReveal>
        <section className="possibilities section-pad">
          <div className="section-label">05 / FOR THE BIG THINGS</div>
          <div className="possibilities-copy"><h2>Move house.<br />Get the job.<br />Ship the thing.<br /><em>Start somewhere new.</em></h2><p>Plotline works wherever the destination matters, but the path is still taking shape.</p></div>
        </section>
      </ScrollReveal>

      <ScrollReveal>
        <section className="dark-cta">
          <div><div className="section-label light">06 / YOUR NEXT CHAPTER</div><h2>You already know the chapter.<br /><em>Give it a path.</em></h2></div>
          <Link to="/create" className="button button-light">Start plotting <ArrowRight size={18} /></Link>
        </section>
      </ScrollReveal>
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

  const [draggedId, setDraggedId] = useState<string | null>(null);

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
            <div
              className={`timeline-item ${milestone.status} ${draggedId === milestone.id ? "is-dragging" : ""}`}
              key={milestone.id}
              draggable
              tabIndex={0}
              onClick={() => advanceMilestone(milestone.id)}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  advanceMilestone(milestone.id);
                }
              }}
              onDragStart={(event) => {
                setDraggedId(milestone.id);
                event.dataTransfer.effectAllowed = "move";
                event.dataTransfer.setData("text/plain", milestone.id);
              }}
              onDragOver={(event) => {
                event.preventDefault();
                event.dataTransfer.dropEffect = "move";
              }}
              onDrop={(event) => {
                event.preventDefault();
                const fromId = event.dataTransfer.getData("text/plain") || draggedId;
                if (fromId) reorderMilestone(fromId, milestone.id);
                setDraggedId(null);
              }}
              onDragEnd={() => setDraggedId(null)}
              aria-label={`${milestone.title}, ${milestone.status}. Click to change status. Drag to reorder.`}
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
                <span className="timeline-hint"><GripVertical size={13} /> Drag to reorder</span>
              </span>
              <span className="timeline-controls" onClick={(event) => event.stopPropagation()}>
                <button
                  type="button"
                  className="timeline-move"
                  onClick={() => moveMilestone(milestone.id, -1)}
                  disabled={index === 0}
                  aria-label={`Move ${milestone.title} up`}
                >
                  <ChevronUp size={15} />
                </button>
                <button
                  type="button"
                  className="timeline-move"
                  onClick={() => moveMilestone(milestone.id, 1)}
                  disabled={index === plot.milestones.length - 1}
                  aria-label={`Move ${milestone.title} down`}
                >
                  <ChevronDown size={15} />
                </button>
              </span>
              {milestone.status === "current" && (
                <span className="current-action">Mark complete <ArrowRight size={15} /></span>
              )}
            </div>
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
