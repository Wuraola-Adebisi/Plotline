# Plotline

Plotline turns a large goal or life change into a visual path of milestones. Each milestone is upcoming, current or complete, and the current one marks where you are in the chapter. Milestones can be reordered by drag and drop or with the arrow buttons.

Plots are saved in the browser with `localStorage`. There is no account and no backend, so a plot is only available in the browser where it was created.

## AI experience preview

The create flow and individual plot pages include an interactive **Plotline AI** mock-up for two planned capabilities:

- **Build with AI:** describe a goal and review an editable proposed timeline.
- **Adjust with AI:** explain a change and review suggested timing adjustments while completed milestones remain unchanged.

This is a frontend prototype only. It uses local sample logic in the browser; it does not call an AI model, use AWS Bedrock, send prompts to a server, or require API keys or AI credits. The sample output is illustrative, not real AI reasoning. The live Bedrock integration will be added separately after provider access and credits are ready.

## Run locally

```bash
npm install
npm run dev
```

`npm run build` type-checks the project and writes a production build to `dist`. `npm run lint` runs ESLint.

## Routes

| Path | Page |
| --- | --- |
| `/` | Home, with switchable example plots |
| `/create` | Create a plot, manually or with the AI preview |
| `/plots` | List of saved plots |
| `/plot/:id` | A single plot and its timeline, including the replanning preview |
| `/privacy`, `/terms` | Legal pages |

## Stack

React 19, TypeScript, Vite, React Router and lucide-react. Styles are in `src/App.css`, with design tokens and the font stack in `src/index.css`.

## Deployment

The site is deployed on Vercel. `vercel.json` rewrites client-side routes to `index.html`, which lets direct visits and refreshes on routes such as `/plots` load the app instead of returning a 404.
