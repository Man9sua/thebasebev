import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  agentRules: false,
  poweredByHeader: false,
  skipTrailingSlashRedirect: true,
  turbopack: {
    root: process.cwd(),
  },
  images: {
    unoptimized: true,
  },
  async redirects() {
    return [
      { source: "/page65953477.html", destination: "/", statusCode: 301 },
      { source: "/page65953593.html", destination: "/", statusCode: 301 },
      { source: "/raf-cofeee", destination: "/raf-coffee", statusCode: 301 },
      { source: "/raf-cofee", destination: "/raf-coffee", statusCode: 301 },
      { source: "/functional-wellness", destination: "/catalog", statusCode: 301 },
      { source: "/cabinet", destination: "/", statusCode: 301 },

      /*
       * Blog posts whose title changed after they were published. Tilda routes
       * `/tpost/` on the id and ignores the slug, so both spellings resolve
       * there; here every route is generated, so the old spelling needs saying.
       * These three are the ones `/resources` linked to — see
       * `relinkBlogPosts` in `lib/site-pages.ts`, which stops the page itself
       * from taking the hop.
       */
      {
        source: "/tpost/vb9gvbp5m1-the-unmanned-cafe-is-already-here-its-we",
        destination: "/tpost/vb9gvbp5m1-unmanned-cafs-have-one-weak-link-ingredi",
        statusCode: 301,
      },
      {
        source: "/tpost/gflfp1fx41-why-matcha-belongs-on-your-menu-the-numb",
        destination: "/tpost/gflfp1fx41-the-numbers-behind-matchas-green-rush",
        statusCode: 301,
      },
      {
        source: "/tpost/eljzud0n91-karak-and-masala-are-different-builds-on",
        destination: "/tpost/eljzud0n91-one-sku-two-builds-30-seconds",
        statusCode: 301,
      },
    ];
  },
};

export default nextConfig;
