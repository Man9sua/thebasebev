import Image from "next/image";
import { AboutHero } from "@/components/about/AboutHero";
import { AboutLocation } from "@/components/about/AboutLocation";
import { AboutQuality } from "@/components/about/AboutQuality";
import { CareersSection } from "@/components/about/CareersSection";
import { AboutFaq } from "@/components/about/AboutFaq";
import { SiteLink } from "@/components/site/SiteLink";
import { resizedImage } from "@/lib/images";
import { CATALOG_PRODUCTS } from "@/data/catalog";
import styles from "./AboutPage.module.css";

const LAB_CHECKS = [
  { title: "Develop", body: "New recipes and custom formulas built around your menu, your equipment and your price per cup." },
  { title: "Test", body: "Every formula is tested for taste, texture, stability and shelf life before it reaches production." },
  { title: "Certify", body: "Raw materials from the world’s leading manufacturers. HACCP and Halal certified production." },
] as const;

const LOGISTICS = [
  { title: "Six continents", body: "Shipped from the UAE by air, sea or road, on the route that fits your timing and budget." },
  { title: "Door to door", body: "Our supply chain team handles customs documents and delivers to your warehouse or café." },
  { title: "Samples by DHL", body: "Sample kits travel by DHL Express, tracked from our lab to your door." },
] as const;

const PACK_SLUGS = ["milkshake", "sugar-syrup", "chocolate", "cordial", "matcha", "raf-coffee", "chai-latte", "iced-tea", "frappe", "cream-latte", "jam", "vending"] as const;

function Lab() {
  return (
    <section id="laboratory" className={`${styles.section} ${styles.lab}`} aria-labelledby="about-lab-title" data-surface="dark">
      <div className={styles.inner}>
        <div className={styles.labIntro}>
          <h2 id="about-lab-title">The lab behind every cup</h2>
          <p>Every product the Base makes starts here, in our own laboratory in Dubai. Our technologists develop the recipe, test it and sign it off before a single batch is produced.</p>
        </div>
        <div className={styles.labPhotos}>
          <Image src={resizedImage("/images/tild3635-3534-4562-a230-386630306263__3_1.jpg") ?? "/images/tild3635-3534-4562-a230-386630306263__3_1.jpg"} alt="THE BASE laboratory technologist in Dubai" width={600} height={440} sizes="(max-width: 767px) 92vw, 46vw" />
          <Image src="/images/tild3637-3037-4530-b561-386139383037__mask_group.png" alt="THE BASE laboratory, where taste begins" width={628} height={460} sizes="(max-width: 767px) 92vw, 46vw" />
        </div>
        <div className={styles.checks}>
          {LAB_CHECKS.map((item) => <div key={item.title}><h3>{item.title}</h3><p>{item.body}</p></div>)}
        </div>
        <div className={styles.actions}>
          <SiteLink className={styles.primaryButton} href="/rnd#rnd-form">Start a project with our lab</SiteLink>
          <SiteLink className={styles.textLink} href="/rnd">How R&amp;D works <span aria-hidden="true">→</span></SiteLink>
        </div>
      </div>
    </section>
  );
}

function Logistics() {
  return (
    <section className={`${styles.section} ${styles.logistics}`} aria-labelledby="about-logistics-title" data-surface="dark">
      <Image className={styles.truck} src={resizedImage("/images/tild3663-3430-4638-b336-316531626361__mask_group_4.jpg") ?? "/images/tild3663-3430-4638-b336-316531626361__mask_group_4.jpg"} alt="THE BASE delivery truck" fill sizes="100vw" />
      <div className={styles.inner}>
        <h2 id="about-logistics-title">From the UAE to six continents</h2>
        <p className={styles.logisticsLead}>Your samples and orders are in safe hands. Our supply chain team finds the route for every shipment, so it arrives on time, to your door.</p>
        <div className={styles.checks}>
          {LOGISTICS.map((item) => <div key={item.title}><h3>{item.title}</h3><p>{item.body}</p></div>)}
        </div>
      </div>
    </section>
  );
}

function Manufacturing() {
  return (
    <section id="manufacturing" className={`${styles.section} ${styles.manufacturing}`} aria-labelledby="about-manufacturing-title">
      <div className={styles.inner}>
        <h2 id="about-manufacturing-title">Every pouch.<br />One standard.</h2>
        <p className={styles.manufacturingLead}>{CATALOG_PRODUCTS.length} categories, one factory, one quality bar. Every product leaves the line made, checked and packed the same way.</p>
        <div className={styles.packs} aria-label="THE BASE beverage base range">
          {PACK_SLUGS.map((slug) => <Image key={slug} src={`/images/pack-${slug}.webp`} alt={`THE BASE ${slug.replaceAll("-", " ")} pouch`} width={400} height={540} sizes="(max-width: 767px) 26vw, 13vw" />)}
        </div>
        <div className={styles.manufacturingDetails}>
          <div className={styles.brandImage}>
            <Image src="/images/tild6663-3864-4961-b139-316164363938__mask_group_1.jpg" alt="THE BASE branded shipping carton" width={906} height={993} sizes="(max-width: 767px) 90vw, 30vw" />
          </div>
          <div><h3>One recipe, every batch</h3><p>Each batch is made to the approved reference sample, so a drink tastes the same in Dubai, Riyadh or Almaty.</p></div>
          <div><h3>Branded to the last detail</h3><p>Pouch, carton and tape carry the Base identity, so every delivery is recognised the moment it arrives.</p></div>
        </div>
      </div>
    </section>
  );
}

export function AboutPage() {
  return (
    <main className={styles.page}>
      <AboutHero />
      <div id="quality-control"><AboutQuality /></div>
      <AboutLocation />
      <Lab />
      <Logistics />
      <Manufacturing />
      <CareersSection />
      <AboutFaq />
      <section className={`${styles.section} ${styles.partner}`} aria-labelledby="about-partner-title">
        <div className={styles.partnerInner}>
          <div><h2 id="about-partner-title">Let’s partner</h2><p>Unlock new opportunities by partnering with us. Whether you&apos;re a distributor, retailer, or business looking for premium products, let&apos;s collaborate for success.</p><SiteLink className={styles.primaryButton} href="/contacts">Join us today</SiteLink></div>
          <Image src="/images/tild3665-6262-4465-b138-356434326663__rectangle_1087.png" alt="THE BASE meeting room in Dubai" width={640} height={460} sizes="(max-width: 767px) 90vw, 45vw" />
        </div>
      </section>
    </main>
  );
}
