# Plotline

Live: https://plotline-lac.vercel.app

Plotline turns a large goal or life change into a visual path of milestones. Each milestone is upcoming, current or complete, and the current one marks where you are in the chapter. Milestones can be reordered by drag and drop or with the arrow buttons.

Plots are saved in the browser with `localStorage`. There is no account and no backend, so a plot is only available in the browser where it was created.

## Plotline AI preview

The create flow and individual plot pages include a preview of two planned features:

- **Build with AI:** describe a goal and review an editable proposed timeline.
- **Adjust with AI:** explain a change and review suggested timing adjustments. Completed milestones stay unchanged.

The preview runs sample logic in the browser. It does not call an AI model, send prompts to a server, or need API keys. The output is illustrative and is labelled as a preview in the interface. A live model integration is planned for later.

## Run locally

```
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

React 19, TypeScript, Vite, React Router, Tailwind CSS v4 and lucide-react. Design tokens and the font stack are in `src/index.css`.

## Deployment

Deployed on Vercel. `vercel.json` rewrites client-side routes to `index.html`, so direct visits and refreshes on routes such as `/plots` load the app instead of returning a 404.
