# Plotline

Plotline turns a large goal or life change into a visual path of milestones. Each milestone is upcoming, current or complete, and the current one marks where you are in the chapter. Milestones can be reordered by drag and drop or with the arrow buttons.

Plots are saved in the browser with localStorage. There is no account and no backend, so a plot is only available in the browser where it was created.

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
| `/create` | Create a plot |
| `/plots` | List of saved plots |
| `/plot/:id` | A single plot and its timeline |
| `/privacy`, `/terms` | Legal pages |

## Stack

React 19, TypeScript, Vite, React Router and lucide-react. Styles are in `src/App.css`, with design tokens and the font stack in `src/index.css`.

## Deployment

The site is deployed on Vercel. `vercel.json` rewrites every path to `index.html`, which lets direct visits and refreshes on client-side routes such as `/plots` load the app instead of returning a 404.
