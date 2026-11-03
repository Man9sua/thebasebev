"use client";

import { useId } from "react";

// The outline follows the supplied 2559 × 2560 photograph. The image itself
// stays unchanged, including the label, QR code and the pouch's white areas.
const POUCH_OUTLINE = "M656 244 L1894 244 Q1910 250 1925 284 L1925 300 L1921 444 L1914 448 Q1894 459 1902 468 L1919 476 C1906 820 1888 1260 1875 1660 L1861 2220 Q1860 2270 1820 2304 L1696 2308 L1591 2312 L1535 2316 L1487 2320 L1434 2324 L1369 2328 Q1266 2335 1164 2328 L1083 2324 L1018 2320 L954 2316 L896 2312 L813 2308 L719 2304 Q686 2270 684 2220 C677 1900 662 1360 642 860 L628 476 Q651 463 638 452 L627 448 L622 300 L622 284 Q633 258 656 244 Z";

export function AtHomePackImage({
  src = "/images/shop/at-home.jpg",
  className,
  alt = "",
}: {
  src?: string;
  className?: string;
  alt?: string;
}) {
  const id = useId();
  return (
    <svg
      className={className}
      viewBox="208 36 2144 2488"
      preserveAspectRatio="xMidYMid meet"
      style={{ position: "absolute", inset: 0, display: "block", width: "100%", height: "100%" }}
      role={alt ? "img" : undefined}
      aria-label={alt || undefined}
      aria-hidden={alt ? undefined : true}
    >
      <defs><clipPath id={id} clipPathUnits="userSpaceOnUse"><path d={POUCH_OUTLINE} /></clipPath></defs>
      <image href={src} x="0" y="0" width="2559" height="2560" clipPath={`url(#${id})`} />
    </svg>
  );
}
