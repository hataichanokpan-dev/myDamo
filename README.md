# Damodaran Valuation Toolkit

Web-based valuation calculators based on Aswath Damodaran's spreadsheet models at NYU Stern. Built with React + TypeScript + Vite, deployed on Netlify.

## Models

| Model | Route | Description |
|-------|-------|-------------|
| FCFF Simple DCF | `/fcff-simple` | Free Cash Flow to Firm valuation with projection table |
| FCFF Full DCF | `/fcff-full` | Full FCFF with detailed assumptions |
| High Growth Valuation | `/high-growth` | For negative-earnings / high-growth companies |
| WACC Calculator | `/wacc` | Weighted Average Cost of Capital |
| Implied ERP | `/implied-erp` | Equity Risk Premium from index levels |
| Implied ROC/ROE | `/implied-roc-roe` | Return on Capital / Return on Equity |
| R&D Converter | `/rd-converter` | Capitalize R&D expenses |
| Operating Lease Converter | `/operating-lease` | Convert operating leases to debt |
| Normalized Earnings | `/normalized-earnings` | Normalize earnings over time |
| Model Selector | `/model-selector` | Guided questionnaire to pick the right model |

## Features

- **Auto-fill from Yahoo Finance** — Enter a ticker (e.g. `AAPL`, `PTT.BK`) and financial data populates automatically
- **Mobile-first responsive** — Works on phone, tablet, and desktop
- **PWA** — Installable as a standalone app with offline caching
- **Thai stock support** — Use `.BK` suffix for SET-listed stocks (e.g. `CPALL.BK`, `BBL.BK`)

## Tech Stack

- React 18 + TypeScript 5.6
- Vite 6 with PWA plugin
- Recharts for projections
- Netlify Functions for production API
- Yahoo Finance (v8 chart API + HTML scraping)

## Development

```bash
npm install
npm run dev
```

## Production Build

```bash
npm run build
```

Deployed on Netlify with serverless functions for Yahoo Finance data.

## Spreadsheet Sources

Original Excel models from Prof. Aswath Damodaran (NYU Stern):

- `fcffsimpleginzu.xlsx` — FCFF Simple DCF
- `fcffginzu.xlsx` — FCFF Full DCF
- `higrowth.xls` — High Growth Valuation
- `wacccalc.xls` — WACC Calculator
- `implprem.xls` — Implied ERP
- `ImpliedROCROE.xls` — Implied ROC/ROE
- `R&DConv.xls` — R&D Converter
- `oplease.xls` — Operating Lease Converter
- `normearn.xls` — Normalized Earnings
- `model.xls` — Model Selector logic

## License

Educational use. Spreadsheet models are copyright Aswath Damodaran.
