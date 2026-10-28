# SaaStudio

A modern, responsive SaaS website and simulated analytics dashboard built with vanilla HTML, CSS, and JavaScript. SaaStudio pairs a polished marketing site with a fully interactive demo dashboard, light and dark themes, and no build step.

## Highlights

- Responsive layout for desktop, tablet, and mobile
- Light and dark color themes with saved preference
- Marketing pages for Home, Pricing, About, Reviews, and Contact
- Simulated dashboard with analytics, users, and settings
- Interactive charts powered by Chart.js
- Login, signup, and add-user modals with demo validation
- Search, role/status filtering, notifications, and toast feedback
- Accessible focus states, mobile navigation, and reduced-motion support

## Pages

| Page | What it includes |
| --- | --- |
| Home | Hero, product mockup, feature grid, trusted-by strip, reviews, and CTA |
| Pricing | Basic, Pro, and Enterprise plan comparison |
| About | Mission, values, team cards, and a builder profile |
| Reviews | Customer testimonials and ratings |
| Contact | Contact form and company details |
| Dashboard | KPI cards, revenue/user charts, activity feed, and quick actions |
| Analytics | Monthly revenue and engagement charts |
| Users | Searchable, filterable user table with add/delete actions |
| Settings | Profile form and preference toggles |

## Tech Stack

- HTML5
- CSS custom properties, flexbox, and CSS grid
- Vanilla JavaScript
- [Chart.js](https://www.chartjs.org/) via CDN
- [Google Fonts](https://fonts.google.com/) (Inter and Sora)

## Project Structure

```text
website1/
├── index.html      # All pages, modals, and navigation
├── style.css       # Design system, themes, components, responsive rules
├── app.js          # Navigation, auth demo, charts, forms, and UI behavior
├── about_me.md     # Builder profile used as About page content
└── README.md
```

## Run Locally

There is no install or build step. Open `index.html` in a browser, or serve the folder locally:

```bash
python -m http.server 8000
```

Then visit [http://localhost:8000](http://localhost:8000).

## Demo Login

Any valid email with a password of at least 6 characters works. Authentication and dashboard data are simulated in the browser with `localStorage`; no backend is connected.

## Customization

- Design tokens and both themes live at the top of `style.css`.
- Page content, navigation, and modals live in `index.html`.
- Dashboard sample data and UI behavior live in `app.js`.

## About

SaaStudio is a frontend showcase built by [Mubassar](https://github.com/dev-mubassir), focused on clean interfaces, responsive layouts, and thoughtful interaction details. Read more in [about_me.md](about_me.md).

## License

MIT © dev-mubassir
