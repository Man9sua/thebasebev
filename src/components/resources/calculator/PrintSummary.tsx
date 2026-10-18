import { BrandLogo } from "@/components/site/BrandLogo";
import { COMPANY } from "@/lib/site-config";
import { T, lineCost, type Row } from "./calc-model";

/*
 * "Download PDF" is the browser's own print dialog (Save as PDF): no library,
 * nothing sent anywhere. The summary is portalled straight under <body>, so
 * the print sheet can hide every other body child and print one clean page.
 * It is plain global CSS because a CSS module cannot target `body > *`.
 */
export const PRINT_CSS = `
[data-calc-print]{display:none}
@media print{
  @page{size:A4;margin:14mm}
  body>*:not([data-calc-print]){display:none!important}
  html,body{background:#fff!important;padding:0!important;margin:0!important}
  [data-calc-print]{display:flex!important;flex-direction:column;gap:28px;color:#0e0e0e;font-family:var(--tbb-font-body);-webkit-print-color-adjust:exact;print-color-adjust:exact}
  [data-calc-print] .cp-head{display:flex;justify-content:space-between;align-items:flex-start}
  [data-calc-print] .cp-logo{width:110px;height:auto;color:#0e0e0e}
  [data-calc-print] .cp-meta{display:flex;flex-direction:column;align-items:flex-end;gap:2px;font-size:11pt;color:#8a867f}
  [data-calc-print] .cp-title{display:flex;flex-direction:column;gap:6px}
  [data-calc-print] .cp-drink{font-family:var(--tbb-font-heading);font-weight:var(--tbb-font-weight-heading);font-size:30pt;line-height:.9;text-transform:uppercase}
  [data-calc-print] .cp-sub{font-size:11pt;color:#55524c}
  [data-calc-print] .cp-table{display:flex;flex-direction:column;font-size:11pt}
  [data-calc-print] .cp-tr{display:grid;grid-template-columns:2fr 1fr 1fr 1fr 1fr;gap:8px;padding:8px 0;border-bottom:1px solid #e6e4df}
  [data-calc-print] .cp-th{font-weight:700;border-bottom:1.5px solid #0e0e0e}
  [data-calc-print] .cp-tr span:first-child{font-weight:700}
  [data-calc-print] .cp-th span:first-child{font-weight:700}
  [data-calc-print] .cp-r{text-align:right}
  [data-calc-print] .cp-note{padding:8px 0;color:#55524c}
  [data-calc-print] .cp-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:20px;padding:20px;background:#f3f2ef;border-radius:14px;font-size:11pt}
  [data-calc-print] .cp-cell{display:flex;flex-direction:column;gap:4px}
  [data-calc-print] .cp-cell span{color:#55524c}
  [data-calc-print] .cp-cell strong{font-family:var(--tbb-font-heading);font-weight:var(--tbb-font-weight-heading);font-size:20pt;color:#0e0e0e}
  [data-calc-print] .cp-foot{display:flex;justify-content:space-between;gap:20px;padding-top:16px;border-top:1px solid #e6e4df;font-size:10pt;color:#55524c}
}
`;

type PrintSummaryProps = {
  drinkName: string;
  date: string;
  rows: Row[];
  wasteLine: string;
  costCup: string;
  price: string;
  pct: string;
  verdict: string;
  profit: string;
  profitNote: string;
  suggested: string;
  target: string;
  perDay: string;
  monthly: string;
  delivery: string | null;
};

export function PrintSummary(props: PrintSummaryProps) {
  return (
    <div data-calc-print aria-hidden="true">
      <div className="cp-head">
        <BrandLogo className="cp-logo" />
        <div className="cp-meta">
          <span>{props.date}</span>
        </div>
      </div>
      <div className="cp-title">
        <span className="cp-drink">{props.drinkName}</span>
        <span className="cp-sub">{T.title}</span>
      </div>
      <div className="cp-table">
        <div className="cp-tr cp-th">
          <span>{T.ing}</span>
          <span>{T.packPrice}</span>
          <span>{T.packSize}</span>
          <span>{T.inCup}</span>
          <span className="cp-r">{T.cost}</span>
        </div>
        {props.rows.map((row) => (
          <div key={row.id} className="cp-tr">
            <span>{row.name}</span>
            <span>{row.price}</span>
            <span>
              {row.pack} {row.unit}
            </span>
            <span>
              {row.use} {row.unit}
            </span>
            <span className="cp-r">{lineCost(row).toFixed(2)}</span>
          </div>
        ))}
        <div className="cp-note">
          {props.wasteLine}
          {props.delivery ? ` · ${T.delivery} ${props.delivery}` : ""}
        </div>
      </div>
      <div className="cp-grid">
        <div className="cp-cell">
          <span>{T.costCup}</span>
          <strong>{props.costCup}</strong>
        </div>
        <div className="cp-cell">
          <span>{T.menuPrice}</span>
          <strong>{props.price}</strong>
        </div>
        <div className="cp-cell">
          <span>{T.pct}</span>
          <strong>{props.pct}</strong>
          <span>{props.verdict}</span>
        </div>
        <div className="cp-cell">
          <span>{T.profit}</span>
          <strong>{props.profit}</strong>
          <span>{props.profitNote}</span>
        </div>
        <div className="cp-cell">
          <span>
            {T.suggested} ({props.target})
          </span>
          <strong>{props.suggested}</strong>
        </div>
        <div className="cp-cell">
          <span>
            {T.monthly} ({props.perDay})
          </span>
          <strong>{props.monthly}</strong>
        </div>
      </div>
      <div className="cp-foot">
        <span>the Base · {COMPANY.city}, UAE</span>
        <span>{COMPANY.email}</span>
        <span>{COMPANY.phone}</span>
        <span>thebasebev.com</span>
      </div>
    </div>
  );
}
