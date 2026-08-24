/**
 * First-touch attribution capture.
 *
 * The first touch has to be recorded before React hydrates. `LeadAttributionBridge`
 * used to be the only writer, from a `useEffect`, which meant the landing page's
 * campaign was stored only if the visitor stayed put long enough for hydration to
 * finish. A referral that lands on `/?utm_source=chatgpt.com` and clicks through
 * within that window arrived at the next page with no stored first touch, and the
 * bridge then recorded that inner page — with no campaign on it — as the origin.
 *
 * So the write happens here instead, from a blocking inline script in `<head>`:
 * it runs while the document is still parsing, on every route, before any
 * navigation can outrun it. The bridge still reads the same key and still falls
 * back to computing a value itself, so a blocked or failed script costs accuracy
 * rather than the submission.
 *
 * The shape must stay identical to `createFirstTouchAttribution` in
 * `src/lib/leads.ts` — `parseFirstTouchAttribution` validates whatever is read
 * back, and a mismatch would silently drop the stored value.
 */

export const FIRST_TOUCH_STORAGE_KEY = "thebase:first-touch-attribution:v1";

/**
 * Written once per session. Keys are matched case-insensitively and first
 * occurrence wins, mirroring `createFirstTouchAttribution`.
 */
export const FIRST_TOUCH_SCRIPT = `(function(){try{
var K=${JSON.stringify(FIRST_TOUCH_STORAGE_KEY)};
if(window.sessionStorage.getItem(K))return;
var p=new URL(window.location.href).searchParams,q={};
p.forEach(function(v,k){k=k.toLowerCase();if(!(k in q))q[k]=v;});
var g=function(n){return q[n]||null;};
window.sessionStorage.setItem(K,JSON.stringify({
landingPage:window.location.href,
referrer:document.referrer,
utm_source:g("utm_source"),
utm_medium:g("utm_medium"),
utm_campaign:g("utm_campaign"),
utm_content:g("utm_content"),
utm_term:g("utm_term")
}));
}catch(e){}})();`;
