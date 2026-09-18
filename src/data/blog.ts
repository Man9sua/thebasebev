import blogContent from "./blog-content.json";

/**
 * The Blog, as data.
 *
 * Imported once from the production Tilda feed by
 * `scripts/import-blog-production.mjs` and read from the repository from then
 * on — see that file for what the import covers and how to refresh it. Nothing
 * here calls Tilda, and the imagery is local too.
 */

export type BlogInline =
  | { type: "text"; text: string; strong?: boolean; em?: boolean }
  | { type: "link"; text: string; href: string; strong?: boolean; em?: boolean };

export type BlogBlock =
  | { type: "heading"; level: number; content: BlogInline[] }
  | { type: "paragraph"; content: BlogInline[] }
  | { type: "list"; ordered: boolean; items: BlogInline[][] }
  | { type: "image"; src: string; alt: string }
  | { type: "video"; provider: "youtube"; id: string };

export type BlogTopic = { id: string; label: string };

export type BlogPost = {
  uid: string;
  path: string;
  sourceUrl: string;
  title: string;
  excerpt: string;
  published: string;
  topic: BlogTopic;
  cover: { src: string; alt: string } | null;
  body: BlogBlock[];
  bodyText: string;
  readingMinutes: number;
  sourceStatus: number;
  sourceRobots: string;
  sourceTextHash: string;
  seo: {
    title: string;
    description: string;
    canonical: string;
    openGraphTitle: string;
    openGraphDescription: string;
    openGraphImage: string;
  };
};

const posts = blogContent.posts as BlogPost[];

/** Newest first, which is the order the production feed publishes them in. */
export const BLOG_POSTS: readonly BlogPost[] = posts;

const POST_BY_PATH = new Map(posts.map((post) => [post.path, post]));
const POST_BY_UID = new Map(posts.map((post) => [post.uid, post]));
const PRODUCTION_ORIGIN = "https://thebasebev.com";

/**
 * Every topic that at least one post carries, in the order the list in the
 * importer declares them — derived rather than written down twice.
 */
export const BLOG_TOPICS: readonly BlogTopic[] = [
  ...new Map(posts.map((post) => [post.topic.id, post.topic])).values(),
];

function normalizePath(value: string) {
  try {
    const url = new URL(value, PRODUCTION_ORIGIN);
    const normalized = url.pathname.replace(/\/+$/, "");
    return normalized || "/";
  } catch {
    const normalized = value.split(/[?#]/, 1)[0].replace(/\/+$/, "");
    return normalized || "/";
  }
}

export function findBlogPostByPath(value: string) {
  return POST_BY_PATH.get(normalizePath(value));
}

/**
 * Tilda routes a `/tpost/` URL on the uid alone and ignores the slug after it,
 * so the same article is reachable under every title it has ever had. Three of
 * those older spellings are still linked from `/resources`; this resolves any
 * of them to the one path this site serves.
 */
export function resolveBlogPath(value: string) {
  const normalized = normalizePath(value);
  if (POST_BY_PATH.has(normalized)) return normalized;
  const uid = /^\/tpost\/([a-z0-9]+)-/i.exec(normalized)?.[1];
  return uid ? POST_BY_UID.get(uid)?.path : undefined;
}

/**
 * Keep links between migrated articles local, and send the rest to production.
 * Bodies link to product pages, to the Glossary and to each other; only the
 * last group needs resolving, and an unmigrated `/tpost/` link must still reach
 * a real page rather than a staging 404.
 */
export function resolveBlogHref(href: string) {
  if (!href.startsWith("/tpost/")) return href;
  return resolveBlogPath(href) ?? `${PRODUCTION_ORIGIN}${href}`;
}

export function getRelatedBlogPosts(post: BlogPost, limit = 3) {
  if (limit <= 0) return [];
  const sameTopic = posts.filter(
    (candidate) => candidate.uid !== post.uid && candidate.topic.id === post.topic.id,
  );
  const rest = posts.filter(
    (candidate) => candidate.uid !== post.uid && candidate.topic.id !== post.topic.id,
  );
  return [...sameTopic, ...rest].slice(0, limit);
}
