/**
 * The two legal documents, word for word as the Tilda export carries them
 * (`page68443503.html` record `rec2430715951` for Privacy,
 * `page68443067.html` record `rec2546753201` for Terms). Only the markup
 * around the words changed; the text, the headings, their numbering (gaps
 * included) and the Privacy in-page anchors (`#section-1` …) are the source's.
 *
 * Do not edit the copy here without the owner's legal sign-off.
 */

/** A run of text, optionally with a bold lead-in (`<strong>` in the source). */
export type LegalText = { strong?: string; text: string };

export type LegalBlock =
  | { kind: "p"; text: LegalText[] }
  | { kind: "ul"; items: LegalText[] }
  | { kind: "cards"; items: string[] }
  | { kind: "contact"; name: string; rows: { label: string; value: string; href?: string }[] };

export type LegalSection = { id?: string; heading: string; blocks: LegalBlock[] };

export type LegalDocument = {
  badge: string;
  title: string;
  meta?: { label: string; value: string }[];
  nav?: { href: string; label: string }[];
  intro: LegalText[];
  sections: LegalSection[];
};

const p = (text: string): LegalBlock => ({ kind: "p", text: [{ text }] });

export const PRIVACY_POLICY: LegalDocument = {
  badge: "THE BASE BEVERAGE / COMPLIANCE",
  title: "Privacy Policy",
  meta: [
    { label: "Effective Date:", value: "January 15, 2026" },
    { label: "Jurisdiction:", value: "Dubai, United Arab Emirates" },
  ],
  nav: [
    { href: "#section-1", label: "1. Definitions" },
    { href: "#section-2", label: "2. Legal Framework" },
    { href: "#section-3", label: "3. Data Categories" },
    { href: "#section-4", label: "4. Purposes" },
    { href: "#section-6", label: "6. Cookies & Analytics" },
    { href: "#section-11", label: "11. Your Rights" },
  ],
  intro: [
    {
      text: 'The Base Beverage LLC (referred to as the "Company", "we", or "us") respects your privacy and is committed to protecting the personal data of our customers, business partners, and website visitors. This policy outlines our procedures regarding data collection, processing, and protection under applicable UAE legislation.',
    },
  ],
  sections: [
    {
      id: "section-1",
      heading: "1. Definitions",
      blocks: [
        {
          kind: "ul",
          items: [
            { strong: "Personal Data", text: " — Any information relating to an identified or identifiable natural person." },
            { strong: "Data Processing", text: " — Operations performed on personal data, including collection, storage, use, or deletion." },
            { strong: "User", text: " — Any individual or corporate entity accessing our website or placing commercial orders." },
          ],
        },
      ],
    },
    {
      id: "section-2",
      heading: "2. Legal Framework",
      blocks: [
        p("Data processing complies strictly with applicable regulations:"),
        {
          kind: "ul",
          items: [
            { text: "UAE Federal Decree Law No. 45 of 2021 on Personal Data Protection (UAE PDPL);" },
            { text: "Applicable commercial, trade, and food safety standards in the United Arab Emirates." },
          ],
        },
      ],
    },
    {
      id: "section-3",
      heading: "3. Data Categories",
      blocks: [
        p("We process the following categories of business and personal information:"),
        {
          kind: "ul",
          items: [
            { strong: "Contact Information:", text: " Name, phone number, corporate email address, and delivery location." },
            { strong: "Order History:", text: " Selected SKUs, volume history, and commercial specifications." },
            { strong: "Corporate Data:", text: " Company entity name, trade license, and professional title." },
            { strong: "Technical Logs:", text: " IP addresses, browser specifications, and cookie preferences." },
          ],
        },
      ],
    },
    {
      id: "section-4",
      heading: "4. Purposes of Processing",
      blocks: [
        p("Collected data is used strictly for commercial execution:"),
        {
          kind: "cards",
          items: [
            "Order fulfillment, dispatch, and custom formulation support.",
            "B2B client communications and technical product support.",
            "Logistics, route optimization, and delivery verification.",
            "Compliance with food safety regulations and tax standards.",
            "Platform infrastructure security and fraud prevention.",
            "Direct business communications and commercial updates.",
          ],
        },
      ],
    },
    {
      id: "section-5",
      heading: "5. Legal Basis",
      blocks: [
        p("Processing is executed based on contractual performance, statutory compliance with UAE law, and explicit consent provided during commercial inquiries."),
      ],
    },
    {
      id: "section-6",
      heading: "6. Cookies & Analytics",
      blocks: [
        p("Essential cookies are deployed to support platform navigation, authentication, and session handling. Analytical tracking is managed via browser settings."),
      ],
    },
    {
      id: "section-7",
      heading: "7. Third-Party Disclosure",
      blocks: [
        p("Information is shared exclusively with authorized operational partners:"),
        {
          kind: "ul",
          items: [
            { text: "Contracted logistics partners for order delivery;" },
            { text: "Enterprise CRM and cloud infrastructure providers;" },
            { text: "UAE regulatory bodies upon statutory request." },
          ],
        },
      ],
    },
    {
      id: "section-8",
      heading: "8. Data Retention & Security",
      blocks: [
        p("Information is stored securely using enterprise encryption protocols and retained only for periods mandated by UAE commercial regulations."),
      ],
    },
    {
      id: "section-11",
      heading: "11. Rights & Access",
      blocks: [
        p("Users maintain full rights to inspect, update, or request the deletion of their personal records under UAE PDPL standards."),
      ],
    },
    {
      id: "section-13",
      heading: "13. Corporate Contacts",
      blocks: [
        p("Direct inquiries regarding compliance and data governance:"),
        {
          kind: "contact",
          name: "The Base Beverage LLC",
          rows: [
            { label: "Email:", value: "info@thebasebev.com", href: "mailto:info@thebasebev.com" },
            { label: "Address:", value: "Al Quoz Industrial Area 2, 26th Street, Dubai, UAE" },
          ],
        },
      ],
    },
  ],
};

const TERMS_SECTIONS: { heading: string; paragraphs: string[] }[] = [
  {
    heading: "1. INTRODUCTION",
    paragraphs: [
      "You agree to the terms and conditions outlined in this online Terms and Conditions (“Terms and Conditions”) with respect to the Products and information provided by or through the Site. These Terms and Conditions constitute the entire and only agreement between You and the Company, and supersedes any and all prior or contemporaneous agreements, representations, warranties, and understandings with respects to the Products and information provided by or through the Site, and the subject matter of these Terms and Conditions. You agree to review these Terms and Conditions prior to any purchase, and purchase of a product shall be deemed acceptance of these Terms and Conditions.",
    ],
  },
  {
    heading: "2. SETUP AND PAYMENT",
    paragraphs: [
      "You represent and warrant that (i) the credit/debit card information supplied by You for the purpose of the purchase of Products is true, correct complete and (ii) charges incurred by You will be honored by your credit card company and (iii) You shall pay charges incurred by yourself at the amounts in effect at the time incurred, including all applicable taxes. The Site accepts Cash on Delivery. You shall be responsible for all charges incurred through the use of your password. You agree to keep your password confidential and to notify the Company within 24 hours of any breach of these Terms and Conditions or unauthorized use of the password. You shall be responsible for any unauthorized use of your account, credit card/debit card, etc., for any purchase from the Site irrespective of whether the checkout was made a guest or through a user account on the Site.",
    ],
  },
  {
    heading: "3. BUYING PRODUCTS AS A GUEST",
    paragraphs: [
      "The functionality of buying the Products as a guest is available on the Site. By buying Products as a guest, only such data that is necessary to process your order will be requested from You. Upon concluding the process of purchase, you will be offered the chance/possibility to register as a user or continue as a non-registered user (as a guest).",
    ],
  },
  {
    heading: "4. AVAILABILITY OF PRODUCTS",
    paragraphs: [
      "All orders are subject to availability. Therefore, in the event of difficulties regarding the supply of Products for reasons including but not limited to low stock, We reserve the right to provide You with details and information on substitute Products of the same (or higher) quality and value that you may order. In the event You do not wish to proceed with ordering substitute Products, We shall reimburse any amount that You may have paid.",
    ],
  },
  {
    heading: "5. DELIVERY",
    paragraphs: [
      "Notwithstanding Clause 4 with regards to Availability of Products, and except in case of Force Majeure event or extraordinary circumstances, we shall endeavor to process all orders at the earliest. All orders, except in case of a Force Majeure event, shall be delivered within (1) to (3) working days once the order has been processed.",
      "The delivery shall be made to the shipping address specified in your order.",
      "A valid tracking number is provided for all shipped orders. You shall receive an email to their chosen email address which shall contain the tracking information for your order.",
      "All orders above AED 99 shall be eligible for free delivery. All orders under AED 99 shall have a delivery charge applicable at the rate of AED 15 per order.",
    ],
  },
  {
    heading: "6. TRANSFER OF RISK AND OWNERSHIP OF THE PRODUCTS",
    paragraphs: [
      "The Products shall be under your responsibility from the moment of delivery to You. You shall take ownership of the Products when the Company receives full payment of all the due amounts, including delivery fee, or at the moment of delivery, if that were to take place at a different/later time.",
    ],
  },
  {
    heading: "7. COPYRIGHT",
    paragraphs: [
      "The content, organization, gathering, compilation, magnetic translation, digital conversion, and other matters related to the Site are protected under applicable copyrights, trademarks, and other proprietary (including but not limited to intellectual property) rights, and, the copying, redistribution, use or publication by You of any such content or any part of the Site is strictly prohibited.",
    ],
  },
  {
    heading: "8. COLORS",
    paragraphs: [
      "The Company has made every effort to display the colors of all Products as accurately as possible on the Site. However, since the actual colors You see will depend on your monitor, amongst other factors, we cannot guarantee that your monitor or screen’s display of any of the colors will be accurate.",
    ],
  },
  {
    heading: "9. ORDERS PLACED/DELAYED ORDERS",
    paragraphs: [
      "Kindly note that:",
      "• Deliveries are subjected to certain delays in the event the information is incorrect/incomplete.",
      "• Orders may be put on hold in case the bank raises concerns for authentication of the transaction.",
    ],
  },
  {
    heading: "10. EDITING, DELETING, AND MODIFICATION",
    paragraphs: [
      "Company reserves all the right in its sole discretion to edit or delete any information or content appearing on the Site and to remove any Products for sale. The Company may modify these Terms and Conditions, or prices, and may discontinue or revise any or all aspects of the Site in its sole discretion and without prior notice. Modification of these Terms and Conditions will be deemed effective upon publication on the Site with respect to transactions occurring after said date.",
    ],
  },
  {
    heading: "11. RIGHT TO REFUSE",
    paragraphs: [
      "Company reserves the right in its sole discretion to refuse sale of Products at any time. Sale of any Products is subject to availability.",
    ],
  },
  {
    heading: "12. SUGGESTIONS/COMPLAINTS",
    paragraphs: [
      "In the event You would like to submit any suggestion and/or complaint, You can contact our Customer Service at 042-873451. Our representative shall get in touch with you within 24 hours or the earliest working day.",
    ],
  },
  {
    heading: "13. PROHIBITED USES",
    paragraphs: [
      "The Site may only be used for lawful purposes, and in accordance with these Terms and Conditions. You agree not to use the Site:",
      "• In a way which violates prevalent federal, state, local, and/or international laws and regulations.",
      "• To impersonate (or attempt to impersonate) the Company or its employees, another user, person or entity.",
      "• To transmit advertising or promoting material, or any other similar solicitation.",
      "• To engage in any other conduct which prevents or constricts anyone’s enjoyment or use of the Site, or which, as may be determined by the Company, may damage/harm the Company or users of the Site, or expose them to liability.",
      "• In a manner which could overburden, disable, impair, or damage the Site, or interfere with any other party’s use of the Site, which includes their ability to engage in real time activities through the Site.",
      "• Vide a spider, robot or other automatic means, processes, devices to access the Site for any purpose, including copying or monitoring the Site.",
      "• By attempting to gain unauthorized access, interfere with, disrupt, or damage any parts of the Site or the service on which the Site is stored, or any database, computer or server connected to the Site.",
    ],
  },
  {
    heading: "14. INDEMNIFICATION",
    paragraphs: [
      "You agree to indemnify, defend, and hold the Company and its affiliates, licensors, and suppliers, harmless from any liability, loss, claim and expense, including reasonable attorney’s fees, related to your violation of these Terms and Conditions or use of the Site.",
    ],
  },
  {
    heading: "15. NON-TRANSFERABLE",
    paragraphs: [
      "Your right to use the service is not transferable and is subject to any limits established by Company or by your credit card company.",
    ],
  },
  {
    heading: "16. CURRENCY OF TRANSACTION",
    paragraphs: [
      "The standard transaction currency on portal is UAE Dirhams (AED). If You are using a credit card (or other payment methods) supplied by banks others than those in the UAE, the amount on the credit card bill may differ due to exchange rate fluctuations and any charges that the bank/card issuer may have debited. Therefore, You hereby acknowledge, confirm, and undertake to pay the difference resulting exchange rate difference as explained above and any other charges or fees charged by any bank in return of the foreign exchange.",
    ],
  },
  {
    heading: "17. DISCLAIMER",
    paragraphs: [
      "THE CONTENT, PRODUCTS ARE PROVIDED “AS-IS,” “AS AVAILABLE,” AND ALL WARRANTIES, EXPRESS OR IMPLIED, ARE DISCLAIMED (INCLUDING BUT NOT LIMITED TO THE DISCLAIMER OF ANY IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE). THE SOLE AND ENTIRE MAXIMUM LIABILITY OF COMPANY, FOR ANY REASON, AND YOUR SOLE AND EXCLUSIVE REMEDY FOR ANY CAUSE WHATSOEVER, SHALL BE LIMITED TO THE AMOUNT PAID BY YOU FOR THE PARTICULAR ITEM/ITEMS PURCHASED. COMPANY AND ANY OF ITS AFFILIATES, DEALERS, OR SUPPLIERS ARE NOT LIABLE FOR ANY INDIRECT, SPECIAL, INCIDENTAL, OR CONSEQUENTIAL DAMAGES (INCLUDING DAMAGES FOR LOSS OF BUSINESS, LOSS OF PROFITS, LITIGATION, OR THE LIKE), WHETHER BASED ON BREACH OF TERMS AND CONDITIONS, BREACH OF WARRANTY, TORT (INCLUDING NEGLIGENCE), PRODUCT LIABILITY OR OTHERWISE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGES. THE LIMITATIONS OF DAMAGES SET FORTH ABOVE ARE FUNDAMENTAL ELEMENTS OF THE BASIS OF THE BARGAIN BETWEEN YOU AND THE COMPANY. THIS SITE AND PRODUCTS WOULD NOT BE PROVIDED WITHOUT SUCH LIMITATIONS. SOME STATE STATUES MAY APPLY REGARDING LIMITATION OF LIABILITY.",
    ],
  },
  {
    heading: "18. RETURN AND REFUND POLICY",
    paragraphs: [
      "If a product purchased is defective and/or of low quality, You can return the product in its original condition and packing within (07) days of receipt by contacting the Customer Service at 042-873451. Any claim brought to the Company:",
      "• upon the completion of limitation period of (07) days of receipt,",
      "• for partially used or opened packages, shall not be eligible for Return or Refund.",
      "This Clause 18 sets forth your sole and exclusive right to refund.",
    ],
  },
  {
    heading: "19. USE OF INFORMATION",
    paragraphs: [
      "Company reserves the right, and You authorize the Company, to the use and assign all information regarding your use of the Site and all information provided by You, subject to applicable law.",
    ],
  },
  {
    heading: "20. TERMINATION",
    paragraphs: [
      "These Terms and Conditions are effective unless terminated by either You or the Company. You may terminate these Terms and Conditions at any time, provided that You discontinue any further use of the Site. The Company may terminate Terms and Conditions at any time (and may do so immediately without notice), and accordingly deny your access to the Site. Such termination shall be without any liability to the Company.",
      "Upon the termination by You or the Company, You must promptly destroy all materials downloaded or otherwise obtained from the Site. Additionally, You must destroy copies of all materials, whether made under these Terms and Conditions or otherwise. The Company’s right to any comments shall survive these Terms and Conditions. Any such termination of the Terms and Conditions shall not cancel your obligation to pay for the Products already ordered from the Site or affect any liability that may have arisen under these Terms and Conditions.",
    ],
  },
  {
    heading: "21. GOVERNING LAW",
    paragraphs: [
      "These Terms and Conditions shall be treated as though it were executed and performed in Dubai and shall be governed by and construed in accordance with the laws of United Arab Emirates (without regard to conflict of law principles). The language in these Terms and Conditions shall be interpreted as to its fair meaning and not strictly for or against any party.",
    ],
  },
  {
    heading: "22. LITIGATION",
    paragraphs: [
      "All legal proceedings arising out of or in connection with these Terms and Conditions, their interpretation, and / or their application, shall be brought solely in front of Dubai Courts, and You expressly submit to the jurisdiction of said courts. You consent to extra-territorial service of process.",
    ],
  },
  {
    heading: "23. SEVERABILITY",
    paragraphs: [
      "Should any part of these Terms and Conditions be held invalid or unenforceable, that portion shall be construed consistent with applicable law as nearly as possible to reflect to original intentions of the parties and the remaining portions shall remain in full force and effect.",
    ],
  },
  {
    heading: "24. FORCE MAJEURE",
    paragraphs: [
      "Neither party is liable to the other for any delay in performance or failure to perform due to causes beyond its reasonable control including, but not limited to, acts of God, acts of civil authorities, acts of military authorities, riots, embargoes, acts of nature and natural disasters, and other acts which may be due to unforeseen circumstances.",
    ],
  },
  {
    heading: "25. ACKNOWLEDGEMENT",
    paragraphs: [
      "To the extent that anything in or associated with the Site or the Company is in conflict or inconsistent with these Terms and Conditions, these Terms and Conditions shall take precedence. Failure of Company to enforce any provision of these Terms and Conditions shall not be deemed a waiver of such provision nor of the right to enforce such provision.",
      "This Agreement represents the entire understanding between You and the Company regarding your relationship and supersedes any prior statements or representations.",
    ],
  },
];

export const TERMS_AND_CONDITIONS: LegalDocument = {
  badge: "Legal & Compliance",
  title: "Terms and Conditions",
  intro: [
    { text: "The following are the terms of the agreement between " },
    { strong: "“The Base Beverage LLC”", text: "" },
    {
      text: " referred to as the (“Company”) and/or (“We”) and the purchaser (“You”) of products (“Products”) that are offered through the Company’s Website (“Site”). If you do not agree to these terms, you will not be able to purchase the Products and/or access and preview the information provided by or through the Site, so please review these terms carefully:",
    },
  ],
  sections: TERMS_SECTIONS.map(({ heading, paragraphs }) => ({
    heading,
    blocks: paragraphs.map(p),
  })),
};
