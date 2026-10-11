import { useState } from "react";
import { ArrowRight, Check, X } from "lucide-react";

type Status = "upcoming" | "current" | "complete";
type Milestone = {
  id: string;
  title: string;
  date?: string;
  note?: string;
  status: Status;
};
type Plot = {
  id: string;
  title: string;
  description?: string;
  startDate: string;
  milestones: Milestone[];
};
type Proposal = {
  title: string;
  description: string;
  startDate: string;
  summary: string;
  assumptions: string[];
  milestones: Milestone[];
};

type Props = {
  mode: "create" | "replan";
  startDate?: string;
  currentPlot?: Plot;
  onClose: () => void;
  onApply: (proposal: Proposal) => void;
};

function addDays(date: string, days: number) {
  const parsed = new Date((date || new Date().toISOString().slice(0, 10)) + "T12:00:00");
  parsed.setDate(parsed.getDate() + days);
  return parsed.getFullYear() + "-" +
    String(parsed.getMonth() + 1).padStart(2, "0") + "-" +
    String(parsed.getDate()).padStart(2, "0");
}

function makeMilestone(title: string, date: string, note: string, index: number): Milestone {
  return {
    id: "",
    title,
    date,
    note,
    status: index === 0 ? "current" : "upcoming",
  };
}

function buildMockProposal(prompt: string, startDate: string): Proposal {
  const text = prompt.toLowerCase();
  let title = "Make progress on my goal";
  let description = "A practical path from the first decision to meaningful progress.";
  let steps = [
    ["Define what success looks like", 1, "Make the outcome specific."],
    ["Work out what needs to happen first", 5, "Identify the key decisions and dependencies."],
    ["Make the first meaningful move", 12, "Turn the plan into visible progress."],
    ["Review what is working", 21, "Adjust the next steps based on what you learn."],
    ["Reach the next milestone", 30, "Decide what comes after this chapter."],
  ] as [string, number, string][];

  if (text.includes("mov") || text.includes("apartment") || text.includes("lagos") || text.includes("settle")) {
    title = "Move and get settled";
    description = "A manageable path from making the decision to feeling at home.";
    steps = [
      ["Set a realistic moving budget", 2, "Account for rent, transport and setup costs."],
      ["Shortlist and inspect places", 10, "Compare total costs, location and practical needs."],
      ["Confirm the place and moving date", 18, "Review the agreement before committing."],
      ["Arrange the move", 27, "Plan transport, packing and essential services."],
      ["Settle into the new place", 35, "Handle essentials first, then the rest."],
    ];
  } else if (text.includes("launch") || text.includes("product") || text.includes("build")) {
    title = "Launch my product";
    description = "A path from a clear problem to a first public release.";
    steps = [
      ["Define the smallest useful version", 2, "Keep the first release focused."],
      ["Build the core experience", 10, "Prioritise the main user journey."],
      ["Test with a few real people", 18, "Look for confusion and blockers."],
      ["Fix the highest-impact issues", 24, "Avoid polishing details users do not need yet."],
      ["Release and learn", 30, "Watch what people actually do."],
    ];
  } else if (text.includes("job") || text.includes("career") || text.includes("role")) {
    title = "Move into my next role";
    description = "A focused path from positioning to interviews and a decision.";
    steps = [
      ["Clarify the roles I am targeting", 2, "Choose roles that fit my strengths."],
      ["Make the strongest work easy to review", 7, "Polish the portfolio and project explanations."],
      ["Start a consistent application rhythm", 12, "Track applications and thoughtful outreach."],
      ["Prepare for interviews", 21, "Practise explaining decisions and trade-offs."],
      ["Review opportunities and choose", 35, "Compare role, team, compensation and growth."],
    ];
  }

  return {
    title,
    description,
    startDate,
    summary: "A first-pass plan based on your description. Adjust the milestones and dates to fit your actual circumstances.",
    assumptions: [
      "The dates are illustrative, not predictions or commitments.",
      "The plan assumes you can make progress between each milestone.",
    ],
    milestones: steps.map((step, index) =>
      makeMilestone(step[0], addDays(startDate, step[1]), step[2], index),
    ),
  };
}

function buildMockReplan(prompt: string, plot: Plot): Proposal {
  const text = prompt.toLowerCase();
  const shift = text.includes("earlier") || text.includes("sooner") || text.includes("deadline moved up")
    ? -7
    : text.includes("delay") || text.includes("later") || text.includes("more time") || text.includes("blocked")
      ? 7
      : 3;
  const completed = plot.milestones.filter((item) => item.status === "complete");
  const remaining = plot.milestones.filter((item) => item.status !== "complete");
  const milestones = plot.milestones.map((item) => {
    if (item.status === "complete") return { ...item };
    const adjustedDate = item.date ? addDays(item.date, shift) : undefined;
    return {
      ...item,
      date: adjustedDate,
      note: item.note
        ? item.note + " · Timing updated"
        : "Suggested timing adjustment",
    };
  });

  return {
    title: plot.title,
    description: plot.description || "",
    startDate: plot.startDate,
    summary: "This preview keeps " + completed.length +
      " completed milestone(s) unchanged and adjusts the timing of " +
      remaining.length + " unfinished milestone(s). Review each date before applying.",
    assumptions: [
      "Check the revised timing against your deadlines and dependencies.",
      "The unfinished dates have been shifted by " + Math.abs(shift) +
        " day(s) " + (shift < 0 ? "earlier." : "later."),
      "Dependencies and real-world constraints have not been independently verified.",
    ],
    milestones,
  };
}

const fieldClass =
  "w-full border-2 border-ink bg-cream px-3 py-2.5 text-ink outline-none focus:bg-white focus:shadow-[3px_3px_0_var(--color-ink)]";

export default function PlotlineAIMockup({
  mode,
  startDate,
  currentPlot,
  onClose,
  onApply,
}: Props) {
  const [prompt, setPrompt] = useState("");
  const [proposal, setProposal] = useState<Proposal | null>(null);
  const [error, setError] = useState("");

  const replan = mode === "replan";

  const generate = () => {
    if (!prompt.trim()) {
      setError("Add a little context first so the preview has something to work with.");
      return;
    }
    setError("");
    setProposal(
      replan && currentPlot
        ? buildMockReplan(prompt.trim(), currentPlot)
        : buildMockProposal(prompt.trim(), startDate || new Date().toISOString().slice(0, 10)),
    );
  };

  const updateMilestone = (index: number, key: "title" | "date" | "note", value: string) => {
    setProposal((previous) => previous ? ({
      ...previous,
      milestones: previous.milestones.map((item, itemIndex) =>
        itemIndex === index ? { ...item, [key]: value } : item,
      ),
    }) : previous);
  };

  const apply = () => {
    if (!proposal || !proposal.title.trim()) {
      setError("Add a chapter name before applying this proposal.");
      return;
    }
    if (!proposal.milestones.some((item) => item.title.trim())) {
      setError("Keep at least one named milestone.");
      return;
    }
    onApply({
      ...proposal,
      title: proposal.title.trim(),
      milestones: proposal.milestones
        .filter((item) => item.title.trim())
        .map((item) => ({ ...item, title: item.title.trim() })),
    });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-ink/70 p-3 py-6 sm:p-6"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="plotline-ai-heading"
        className="my-auto w-full max-w-[760px] border-[3px] border-ink bg-paper shadow-[8px_8px_0_var(--color-lime)] sm:shadow-[12px_12px_0_var(--color-lime)]"
      >
        <header className="flex items-start justify-between gap-4 border-b-2 border-ink bg-lime p-5 sm:p-7">
          <div>
            <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[.12em]">
              Plotline AI <span className="border border-ink bg-cream px-1.5 py-0.5 text-[10px] tracking-[.08em]">Preview</span>
            </span>
            <h2 id="plotline-ai-heading" className="mt-3 font-display text-3xl font-extrabold leading-none tracking-[-.05em] sm:text-4xl">
              {replan ? "When plans change" : "Give the chapter a shape"}
            </h2>
            <p className="mt-3 max-w-[52ch] text-sm text-ink/75">
              {replan
                ? "Explain what changed and review a suggested adjustment to the path."
                : "Describe what you want to accomplish and start with an editable milestone proposal."}
            </p>
          </div>
          <button type="button" className="grid size-10 flex-none place-items-center border-2 border-ink bg-cream hover:bg-white" onClick={onClose} aria-label="Close preview">
            <X size={18} />
          </button>
        </header>

        <div className="space-y-5 p-5 sm:p-7">
          <div className="border-2 border-ink bg-blue p-3.5 text-cream">
            <p className="text-sm leading-relaxed">This is a preview. The plan below comes from sample logic in your browser, not a live AI model, and nothing you type leaves your device. Edit the milestones, dates and notes to fit your real plans.</p>
          </div>

          {!proposal && (
            <div>
              <label className="mb-2 block text-sm font-bold" htmlFor="plotline-ai-prompt">
                {replan ? "What has changed?" : "What are you trying to do?"}
              </label>
              <textarea
                id="plotline-ai-prompt"
                className={fieldClass + " min-h-32 resize-y"}
                value={prompt}
                onChange={(event) => setPrompt(event.target.value)}
                maxLength={2000}
                placeholder={replan
                  ? "The deadline moved a week earlier and I am still waiting on one important decision."
                  : "I want to move to Lagos in four months. I need to find a place I can afford and get settled."}
                autoFocus
              />
              <div className="mt-1 flex justify-between gap-3 text-xs text-ink/60">
                <span>Be as specific as you like.</span><span>{prompt.length}/2000</span>
              </div>
              {!replan && (
                <div className="mt-4 flex flex-wrap gap-2">
                  <span className="w-full text-xs font-bold uppercase tracking-[.08em] text-ink/60">Try a sample</span>
                  {[
                    "I want to move to Lagos and get settled in four months.",
                    "I want to launch my first product.",
                    "I want to land a frontend role.",
                  ].map((sample) => (
                    <button key={sample} type="button" onClick={() => { setPrompt(sample); setError(""); }} className="border border-ink bg-cream px-3 py-2 text-left text-sm hover:bg-lime">
                      {sample}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {proposal && (
            <div className="space-y-5">
              <div className="border-2 border-ink bg-cream p-4 sm:p-5">
                <span className="text-xs font-bold uppercase tracking-[.1em]">Proposed path · editable</span>
                <label className="mt-3 block">
                  <span className="mb-1 block text-sm font-semibold">Chapter name</span>
                  <input className={fieldClass} value={proposal.title} onChange={(event) => setProposal({ ...proposal, title: event.target.value })} />
                </label>
                <label className="mt-3 block">
                  <span className="mb-1 block text-sm font-semibold">Description</span>
                  <textarea className={fieldClass} rows={2} value={proposal.description} onChange={(event) => setProposal({ ...proposal, description: event.target.value })} />
                </label>
                <p className="mt-4 text-sm leading-relaxed text-ink/75">{proposal.summary}</p>
                {proposal.assumptions.length > 0 && (
                  <div className="mt-4 border-t border-line pt-3">
                    <h3 className="text-sm font-bold">Assumptions to check</h3>
                    <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-ink/70">
                      {proposal.assumptions.map((item) => <li key={item}>{item}</li>)}
                    </ul>
                  </div>
                )}
              </div>

              <div>
                <div className="flex items-baseline justify-between gap-3">
                  <h3 className="font-display text-2xl font-bold tracking-[-.04em]">Milestones</h3>
                  <span className="text-sm text-ink/60">{proposal.milestones.length} proposed</span>
                </div>
                <ol className="mt-3 space-y-3">
                  {proposal.milestones.map((item, index) => (
                    <li key={(item.id || "new") + "-" + index} className="border-2 border-ink bg-cream p-4">
                      <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[.08em] text-ink/60">
                        <span className="grid size-7 place-items-center bg-ink text-lime">{index + 1}</span>
                        {item.status === "complete" ? "Complete" : item.status === "current" ? "Current" : "Upcoming"}
                      </div>
                      <label className="mt-3 block">
                        <span className="mb-1 block text-sm font-semibold">Milestone</span>
                        <input className={fieldClass} value={item.title} onChange={(event) => updateMilestone(index, "title", event.target.value)} />
                      </label>
                      <div className="mt-3 grid gap-3 sm:grid-cols-2">
                        <label>
                          <span className="mb-1 block text-sm font-semibold">Target date</span>
                          <input type="date" className={fieldClass} value={item.date || ""} onChange={(event) => updateMilestone(index, "date", event.target.value)} />
                        </label>
                        <label>
                          <span className="mb-1 block text-sm font-semibold">Note</span>
                          <input className={fieldClass} value={item.note || ""} onChange={(event) => updateMilestone(index, "note", event.target.value)} placeholder="Optional" />
                        </label>
                      </div>
                    </li>
                  ))}
                </ol>
              </div>
              <p className="text-sm text-ink/65">Review the assumptions and dates, then apply the changes that make sense for your plan.</p>
            </div>
          )}

          {error && <p role="alert" className="border-2 border-ink bg-pink p-3 text-sm font-semibold">{error}</p>}

          <div className="flex flex-col-reverse gap-3 border-t-2 border-ink pt-5 sm:flex-row sm:items-center sm:justify-between">
            <button type="button" className="min-h-11 px-3 font-semibold underline underline-offset-4" onClick={() => proposal ? setProposal(null) : onClose()}>
              {proposal ? "Back to instructions" : "Cancel"}
            </button>
            {proposal ? (
              <button type="button" className="inline-flex min-h-12 items-center justify-center gap-2 border-2 border-ink bg-lime px-5 font-bold hover:shadow-[4px_4px_0_var(--color-ink)]" onClick={apply}>
                <Check size={17} /> {replan ? "Apply revised path" : "Use this plot"} <ArrowRight size={17} />
              </button>
            ) : (
              <button type="button" className="inline-flex min-h-12 items-center justify-center gap-2 border-2 border-ink bg-ink px-5 font-bold text-cream hover:shadow-[4px_4px_0_var(--color-ink)]" onClick={generate}>
                {replan ? "Preview adjustments" : "Build my plot"}
              </button>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
