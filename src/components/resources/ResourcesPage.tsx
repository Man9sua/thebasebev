import Image from "next/image";
import { SiteLink } from "@/components/site/SiteLink";
import { BLOG_POSTS, type BlogPost } from "@/data/blog";
import styles from "./ResourcesPage.module.css";

const FEATURED = [
  { uid: "vb9gvbp5m1", title: "The Unmanned Cafe Is Already Here. Its Weakness Is the Ingredient", topic: "Vending", excerpt: "Unattended coffee points fail on ingredient logistics, not on hardware. Why vending-grade bases decide the unit economics of every cup." },
  { uid: "gflfp1fx41", title: "Why Matcha Belongs on Your Menu. The Numbers Behind the Green Cup", topic: "Matcha", excerpt: "Caffeine, margins and a market past one billion dollars in the US alone: an operator’s guide to matcha quality and a program that runs at service speed." },
  { uid: "eljzud0n91", title: "Karak and Masala Are Different Builds. One Soluble SKU Serves Both in 30 Seconds", topic: "Karak and chai", excerpt: "Karak and masala chai target different guests but share the same stovetop bottleneck. How a soluble base cuts a 15-minute boil to 30 seconds." },
] as const;

const ARTICLES = FEATURED.flatMap((copy) => {
  const post = BLOG_POSTS.find((candidate) => candidate.uid === copy.uid);
  return post ? [{ ...post, ...copy }] : [];
});

const DATE_FORMATTER = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });
function displayDate(value: string) { return DATE_FORMATTER.format(new Date(`${value}T12:00:00Z`)); }

function ArticleCard({ post, featured = false }: { post: Omit<BlogPost, "topic"> & { topic: string }; featured?: boolean }) {
  return (
    <SiteLink className={`${styles.article} ${featured ? styles.featured : ""}`} href={post.path}>
      {post.cover && <Image className={styles.image} src={post.cover.src} alt={post.title} width={1440} height={900} sizes={featured ? "(max-width: 767px) 90vw, 48vw" : "(max-width: 767px) 90vw, 43vw"} priority={featured} />}
      <div className={styles.articleBody}>
        <div className={styles.meta}><span>{post.topic}</span><time dateTime={post.published}>{displayDate(post.published)}</time></div>
        <h2>{post.title}</h2>
        <p>{post.excerpt}</p>
        {featured && <span className={styles.readMore}>Read the article <span aria-hidden="true">→</span></span>}
      </div>
    </SiteLink>
  );
}

export function ResourcesPage() {
  const [lead, ...rest] = ARTICLES;
  return (
    <main className={styles.page}>
      <div className={styles.inner}>
        <header className={styles.header}>
          <h1>Resources</h1>
          <p>Guides, market data and practical notes on beverage ingredients for cafés, restaurants and hotels.</p>
          <nav className={styles.tabs} aria-label="Resource sections">
            <SiteLink href="/resources" aria-current="page">All</SiteLink>
            <SiteLink href="/resources/blog">Articles</SiteLink>
            <SiteLink href="/resources/glossary">Glossary</SiteLink>
            <SiteLink href="/resources/tools">Tools</SiteLink>
          </nav>
        </header>
        <section aria-label="Featured articles">
          {lead && <ArticleCard post={lead} featured />}
          <div className={styles.grid}>{rest.map((post) => <ArticleCard post={post} key={post.uid} />)}</div>
          <SiteLink className={styles.allArticles} href="/resources/blog">All articles <span aria-hidden="true">→</span></SiteLink>
        </section>
        <nav className={styles.resources} aria-label="More resources">
          <SiteLink href="/resources/glossary"><h2>Glossary</h2><span>Beverage ingredients and operations</span></SiteLink>
          <SiteLink href="/resources/tools"><h2>Tools</h2><span>HoReCa cost calculator and menu tools</span></SiteLink>
          <SiteLink href="/knowledge-recipes"><h2>Recipe base</h2><span>Preparation and serving guidance</span></SiteLink>
          <a href="/files/barista-guide.pdf" download><h2>Chef Barista Guide</h2><span>Preparation, dosage and flavour pairing standards. PDF, 6 pages.</span></a>
        </nav>
      </div>
    </main>
  );
}
