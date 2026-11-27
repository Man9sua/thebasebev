import {
  createFirstTouchAttribution,
  parseFirstTouchAttribution,
  type FirstTouchAttribution,
} from "@/lib/leads";

export const FIRST_TOUCH_STORAGE_KEY = "thebase:first-touch-attribution:v1";

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

export function getFirstTouchAttribution(): FirstTouchAttribution {
  const current = createFirstTouchAttribution(
    window.location.href,
    document.referrer,
    new URL(window.location.href).searchParams,
  );

  try {
    const stored = window.sessionStorage.getItem(FIRST_TOUCH_STORAGE_KEY);
    if (stored) {
      const parsed = parseFirstTouchAttribution(JSON.parse(stored));
      if (parsed) return parsed;
    }

    window.sessionStorage.setItem(
      FIRST_TOUCH_STORAGE_KEY,
      JSON.stringify(current),
    );
  } catch {
  }

  return current;
}
