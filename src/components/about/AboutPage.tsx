import Image from "next/image";
import { AboutHero } from "@/components/about/AboutHero";
import { AboutLocation } from "@/components/about/AboutLocation";
import { AboutQuality } from "@/components/about/AboutQuality";
import { SiteLink } from "@/components/site/SiteLink";
import styles from "./AboutPage.module.css";

const stories = [
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

function AboutFacility() {
  return (
    <>
      <AboutQuality />

      {/* The map block takes the first story slot, so the stories keep the
          backgrounds (odd children warm) and sides they had beside it. */}
      <div className={styles.stories}>
        <AboutLocation />
        {stories.map((story, index) => {
          const position = index + 1;
          return (
            <section
              className={`${styles.story} ${position % 2 === 1 ? styles.storyReverse : ""}`}
              key={story.title}
              aria-labelledby={`story-${position}`}
            >
              <div className={styles.storyInner}>
                <div className={styles.storyCopy}>
                  <h2 id={`story-${position}`}>{story.title}</h2>
                  <p>{story.body}</p>
                </div>
                <div className={styles.storyImage}>
                  <Image
                    src={story.image}
                    alt={story.alt}
                    fill
                    sizes="(max-width: 767px) calc(100vw - 48px), 50vw"
                  />
                </div>
              </div>
            </section>
          );
        })}
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
      <AboutFacility />
      <Careers />
      <AboutEngage />
    </main>
  );
}
