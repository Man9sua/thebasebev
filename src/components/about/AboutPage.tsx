import Image from "next/image";
import { SiteLink } from "@/components/site/SiteLink";
import styles from "./AboutPage.module.css";

const benefits = [
  { icon: "/images/about/icon-laboratory.svg", text: "Own laboratory and production" },
  {
    icon: "/images/about/icon-deadlines.svg",
    text: "The deadlines and volumes are discussed individually",
  },
  { icon: "/images/about/icon-implementation.svg", text: "The implementation in 14 days" },
  {
    icon: "/images/about/icon-certified.svg",
    text: "Certified production according to HACCP & Halal",
  },
] as const;

const team = [
  ["Sally Bobis", "QA - Research and Development Manager", "team-sally.webp"],
  ["Chippy Prathapan", "Quality Assurance Executive", "team-chippy.webp"],
  ["Chethana Fernando", "Research and Development Executive", "team-chethana.webp"],
  ["Michael Figueroa", "Digital Marketing Manager", "team-michael.webp"],
  ["Elce Trajano", "Project Manager", "team-elce.webp"],
  ["Gary Porquez", "Beverage Expert", "team-gary.webp"],
  ["Habeebudheen M A", "Supply Chain Manager", "team-habeebudheen.webp"],
  ["Waqar Ahmed", "Accountant", "team-waqar.webp"],
  ["Yakovleva Irina", "Strategy Brand Designer", "team-irina.webp"],
] as const;

const processes = [
  "Incoming raw material inspection",
  "Finished product verification to ensure compliance with the approved reference",
  "Manufacturing process control",
  "Packaging inspection at the stage of transportation boxing",
] as const;

const stories = [
  {
    title: "Where innovation meets accuracy",
    body: "Our state-of-the-art lab upholds global safety and quality standards, creating dependable solutions with attention to detail.",
    image: "/images/tild6538-3662-4761-b964-396465626431__mask_group.png",
    alt: "THE BASE product development laboratory",
  },
  {
    title: "Our Laboratory",
    body: "The Base products comply with all necessary standards and safety requirements. Their high quality is ensured by the finest raw materials from the world’s leading manufacturers and is confirmed by the relevant certifications.",
    image: "/images/tild3637-3037-4530-b561-386139383037__mask_group.png",
    alt: "THE BASE laboratory in Dubai",
  },
  {
    title: "Reliable Logistics & Quality Assurance",
    body: "Our logistics ensure timely and efficient delivery while complying with all necessary standards and safety requirements. We partner with leading manufacturers to source the finest raw materials, backed by relevant certifications for quality assurance.",
    image: "/images/tild3663-3430-4638-b336-316531626361__mask_group_4.jpg",
    alt: "THE BASE delivery vehicle",
  },
  {
    title: "State-of-the-Art Manufacturing",
    body: "Our manufacturing process meets all industry standards, ensuring safety, consistency, and premium quality. We use the finest raw materials from top global suppliers, backed by certifications that guarantee excellence in every product.",
    image: "/images/tild3635-3534-4562-a230-386630306263__3_1.jpg",
    alt: "THE BASE manufacturing specialist",
  },
] as const;

const faqs = [
  {
    question: "What types of products do you offer?",
    answer:
      "We manufacture beverage premix powders for HoReCa and B2B buyers: matcha bases, milkshake bases, chai latte bases, iced tea bases, sugar syrup powders, cordials, fruit and jam bases, garnish solutions, and sugar-free beverage variations. Each format is designed for commercial use, long shelf life, and consistent taste at scale.",
  },
  {
    question: "How can I become a distributor?",
    answer:
      "Submit our distributor inquiry form with your company details, target markets, and current product portfolio. Our team will review your request and follow up to discuss product range, pricing, and supply terms. You can find the full program details on our Wholesale & Distributors page.",
  },
  {
    question: "Can I request a product demo?",
    answer:
      "Yes. We provide samples for qualified B2B buyers: cafes, restaurant chains, hotels, distributors, franchise networks, and private-label brands. Submit a sample request with your business model and product interest, and we will follow up to align on the right format for your operation.",
  },
  {
    question: "Do you offer bulk or wholesale pricing?",
    answer:
      "Yes. The Base Beverage operates on a B2B model with wholesale and bulk supply for HoReCa, distributors, franchise networks, and private-label partners. Pricing depends on product format, order volume, and supply terms. Contact us for a tailored quote.",
  },
  {
    question: "Do your products meet safety and quality standards?",
    answer:
      "Our products are manufactured in our UAE facility under HACCP-focused production processes and Halal-aligned standards. We work with quality-focused ingredient sourcing and consistent production discipline to support reliable beverage operations across HoReCa, retail, and export markets.",
  },
] as const;

function SectionMark() {
  return (
    <Image
      className={styles.sectionMark}
      src="/images/about/section-mark.svg"
      width={66}
      height={12}
      alt=""
      aria-hidden="true"
    />
  );
}

function AboutHero() {
  return (
    <section className={styles.hero} aria-labelledby="about-title">
      <div className={styles.container}>
        <SectionMark />
        <h1 id="about-title">We Manufacture High-Quality Customizable Premix Powders</h1>
        <div className={styles.heroImage}>
          <Image
            src="/images/about/team-hero.webp"
            alt="THE BASE team at the Dubai production facility"
            fill
            priority
            sizes="(max-width: 767px) calc(100vw - 48px), min(1280px, calc(100vw - 160px))"
          />
        </div>
        <div className={styles.benefitGrid}>
          {benefits.map((benefit) => (
            <article className={styles.benefitCard} key={benefit.text}>
              <Image src={benefit.icon} width={64} height={64} alt="" aria-hidden="true" />
              <p>{benefit.text}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function AboutTeam() {
  return (
    <section className={styles.teamSection} aria-labelledby="team-title" data-surface="dark">
      <div className={styles.container}>
        <SectionMark />
        <h2 id="team-title">Team of Professional</h2>
        <div className={styles.teamGrid}>
          {team.map(([name, role, image]) => (
            <article className={styles.teamCard} key={name}>
              <div className={styles.portrait}>
                <Image
                  src={`/images/about/${image}`}
                  alt={`${name}, ${role}`}
                  fill
                  sizes="(max-width: 767px) 132px, (max-width: 1100px) 28vw, 242px"
                />
              </div>
              <h3>{name}</h3>
              <p>{role}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function AboutFacility() {
  return (
    <>
      <section className={styles.place} aria-labelledby="place-title">
        <div className={styles.container}>
          <SectionMark />
          <h2 id="place-title">Our Place</h2>
          <div className={styles.placeLayout}>
            <div className={styles.processCopy}>
              <h3>The production process integrates four stages of quality control:</h3>
              <ol>
                {processes.map((process) => (
                  <li key={process}>
                    <span aria-hidden="true">✓</span>
                    <p>{process}</p>
                  </li>
                ))}
              </ol>
            </div>
            <div className={styles.placeMosaic} aria-label="THE BASE production facility">
              <div className={`${styles.mosaicPhoto} ${styles.mosaicPhotoOne}`}>
                <Image
                  src="/images/tild6264-6235-4534-b439-356134656163__mask_group-1_1.jpg"
                  alt="Production at THE BASE facility"
                  fill
                  sizes="(max-width: 767px) 152px, 302px"
                />
              </div>
              <div className={`${styles.statCard} ${styles.capacity}`}>
                <strong>25k+</strong>
                <span>Daily Production</span>
              </div>
              <div className={`${styles.statCard} ${styles.quality}`}>
                <strong>Quality Full Team</strong>
                <span>Talented and Experienced</span>
              </div>
              <div className={`${styles.mosaicPhoto} ${styles.mosaicPhotoTwo}`}>
                <Image
                  src="/images/tild6663-3864-4961-b139-316164363938__mask_group_1.jpg"
                  alt="THE BASE finished-product packaging"
                  fill
                  sizes="(max-width: 767px) 152px, 302px"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className={styles.stories}>
        {stories.map((story, index) => (
          <section
            className={`${styles.story} ${index % 2 === 1 ? styles.storyReverse : ""}`}
            key={story.title}
            aria-labelledby={`story-${index}`}
          >
            <div className={styles.storyInner}>
              <div className={styles.storyCopy}>
                <h2 id={`story-${index}`}>{story.title}</h2>
                <p>{story.body}</p>
              </div>
              <div className={styles.storyImage}>
                <Image
                  src={story.image}
                  alt={story.alt}
                  fill
                  sizes="(max-width: 767px) calc(100vw - 48px), 50vw"
                />
                {index === 1 && <span className={styles.labAccent} aria-hidden="true" />}
              </div>
            </div>
          </section>
        ))}
      </div>
    </>
  );
}

function Careers() {
  return (
    <section className={styles.careers} aria-labelledby="careers-title" data-surface="dark">
      <div className={styles.careersInner}>
        <div className={styles.careersCopy}>
          <h2 id="careers-title">WANNA IN OUR TEAM?</h2>
          <p>
            Be part of a dynamic and innovative team! We’re looking for passionate individuals ready to grow,
            collaborate, and make an impact. Apply now and take the next step in your career with us!
          </p>
        </div>
        <form
          id="form909008440"
          className={`t-form js-form-proccess ${styles.careersForm}`}
          data-success-url="/thank-you-form"
        >
          <input type="hidden" name="tildaspec-formname" value="Join Our Team" />
          <div className={`t-form__inputsbox ${styles.formFields}`}>
            <label>
              <span className="tbb-visually-hidden">Full Name</span>
              <input name="name" type="text" autoComplete="name" placeholder="Full Name" required />
            </label>
            <label>
              <span className="tbb-visually-hidden">Email</span>
              <input name="email" type="email" autoComplete="email" placeholder="Email" required />
            </label>
            <label>
              <span className="tbb-visually-hidden">Phone</span>
              <input name="Phone" type="tel" autoComplete="tel" placeholder="Phone" required />
            </label>
            <label>
              <span className="tbb-visually-hidden">Tell us about yourself</span>
              <textarea name="text" rows={5} placeholder="Write something...." required />
            </label>
            <div
              className={`js-errorbox-all t-form__errorbox-wrapper ${styles.formError}`}
              style={{ display: "none" }}
            >
              <span className="js-rule-error js-rule-error-all" />
            </div>
            <button type="submit">Send</button>
          </div>
          <div
            className={`js-successbox t-form__successbox ${styles.formSuccess}`}
            style={{ display: "none" }}
          >
            Thank you. Your application has been sent to THE BASE team.
          </div>
        </form>
      </div>
    </section>
  );
}

function AboutEngage() {
  return (
    <>
      <section className={styles.faq} aria-labelledby="faq-title">
        <div className={styles.container}>
          <SectionMark />
          <h2 id="faq-title">Frequently Asked Questions</h2>
          <div className={styles.faqList}>
            {faqs.map((faq, index) => (
              <details name="about-faq" open={index === 1} key={faq.question}>
                <summary>
                  <span>{faq.question}</span>
                  <i aria-hidden="true" />
                </summary>
                <p>{faq.answer}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section className={styles.partner} aria-labelledby="partner-title">
        <div className={styles.partnerInner}>
          <div className={styles.partnerCopy}>
            <h2 id="partner-title">Let’s Partner!</h2>
            <p>
              Unlock new opportunities by partnering with us. Whether you&apos;re a distributor, retailer, or business
              looking for premium products, let&apos;s collaborate for success. Connect with us today!
            </p>
            <SiteLink className={styles.partnerButton} href="/contacts">
              <span className={styles.desktopButtonText}>Join Us Today!</span>
              <span className={styles.mobileButtonText}>Book a Demo</span>
            </SiteLink>
          </div>
          <div className={styles.partnerImage}>
            <Image
              src="/images/tild3665-6262-4465-b138-356434326663__rectangle_1087.png"
              alt="A meeting space at THE BASE"
              fill
              sizes="(max-width: 767px) 264px, 640px"
            />
          </div>
        </div>
      </section>
    </>
  );
}

export function AboutPage() {
  return (
    <main className={styles.page}>
      <AboutHero />
      <AboutTeam />
      <AboutFacility />
      <Careers />
      <AboutEngage />
    </main>
  );
}
