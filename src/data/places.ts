import { DISTRIBUTOR_MARKETS } from "@/data/distributor-markets";

/**
 * Suggestions for the country and city fields of the lead forms. They are
 * only suggestions: a visitor can always type a place that is not here.
 *
 * Country names come from the browser's own region names (ISO 3166-1), so
 * they need no translation table. Cities are listed for the markets the Base
 * serves, the larger ones first; anywhere else the city is typed freely.
 */

const REGION_CODES = (
  "AD AE AF AG AI AL AM AO AR AS AT AU AW AX AZ BA BB BD BE BF BG BH BI BJ BL BM BN BO BQ BR BS BT BW BY BZ " +
  "CA CC CD CF CG CH CI CK CL CM CN CO CR CU CV CW CX CY CZ DE DJ DK DM DO DZ EC EE EG EH ER ES ET FI FJ FK FM " +
  "FO FR GA GB GD GE GF GG GH GI GL GM GN GP GQ GR GT GU GW GY HK HN HR HT HU ID IE IL IM IN IO IQ IR IS IT JE " +
  "JM JO JP KE KG KH KI KM KN KP KR KW KY KZ LA LB LC LI LK LR LS LT LU LV LY MA MC MD ME MF MG MH MK ML MM MN " +
  "MO MP MQ MR MS MT MU MV MW MX MY MZ NA NC NE NF NG NI NL NO NP NR NU NZ OM PA PE PF PG PH PK PL PM PN PR PS " +
  "PT PW PY QA RE RO RS RU RW SA SB SC SD SE SG SH SI SK SL SM SN SO SR SS ST SV SX SY SZ TC TD TG TH TJ TK TL " +
  "TM TN TO TR TT TV TW TZ UA UG US UY UZ VA VC VE VG VI VN VU WF WS YE YT ZA ZM ZW"
).split(" ");

/** What people type for a country that its official name does not start with. */
const COUNTRY_ALIASES: Readonly<Record<string, string>> = {
  UAE: "AE",
  Emirates: "AE",
  KSA: "SA",
  Saudi: "SA",
  Turkey: "TR",
  USA: "US",
  America: "US",
  UK: "GB",
  England: "GB",
  Britain: "GB",
  Russia: "RU",
  Korea: "KR",
};

let countryNames: ReadonlyMap<string, string> | null = null;

/** Country code → English name, built once on first use. */
function names(): ReadonlyMap<string, string> {
  if (countryNames) return countryNames;
  const display = new Intl.DisplayNames(["en"], { type: "region" });
  countryNames = new Map(REGION_CODES.map((code) => [code, display.of(code) ?? code]));
  return countryNames;
}

export type PlaceOption = Readonly<{ value: string; hint?: string }>;

/** For matching: lower case, no accents ("Türkmenabat" is found by "turkm"). */
export function fold(text: string) {
  return text
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[’'`]/g, "")
    .toLowerCase()
    .trim();
}

/** The markets the Base serves, offered before anything is typed. */
export function marketCountryOptions(): PlaceOption[] {
  return DISTRIBUTOR_MARKETS.map((market) => ({ value: names().get(market.code) ?? market.name }));
}

/** Every country, by name, with the aliases people type for some of them. */
export function countryOptions(): PlaceOption[] {
  const byName = [...names().values()].map((value) => ({ value }));
  const aliases = Object.entries(COUNTRY_ALIASES).map(([alias, code]) => ({
    value: names().get(code) ?? alias,
    hint: alias,
  }));
  return [...byName, ...aliases];
}

/** The code of a country typed or chosen by name or alias, if it is one. */
export function countryCode(name: string): string | undefined {
  const wanted = fold(name);
  if (!wanted) return undefined;
  for (const [code, value] of names()) if (fold(value) === wanted) return code;
  for (const [alias, code] of Object.entries(COUNTRY_ALIASES)) if (fold(alias) === wanted) return code;
  return DISTRIBUTOR_MARKETS.find((market) => fold(market.name) === wanted)?.code;
}

/** The country's English name, for a market code. */
export function countryName(code: string) {
  return names().get(code.toUpperCase()) ?? "";
}

/** Cities by market, the larger first. */
const CITIES: Readonly<Record<string, readonly string[]>> = {
  AE: ["Dubai", "Abu Dhabi", "Sharjah", "Al Ain", "Ajman", "Ras Al Khaimah", "Fujairah", "Umm Al Quwain", "Khor Fakkan", "Kalba", "Dibba", "Hatta", "Ruwais", "Madinat Zayed"],
  SA: ["Riyadh", "Jeddah", "Mecca", "Medina", "Dammam", "Khobar", "Dhahran", "Taif", "Tabuk", "Buraidah", "Abha", "Khamis Mushait", "Hail", "Najran", "Jazan", "Yanbu", "Jubail", "Al Ahsa", "Hafar Al Batin", "Qatif", "Unaizah", "Arar", "Sakaka", "Al Baha"],
  QA: ["Doha", "Al Rayyan", "Al Wakrah", "Lusail", "Al Khor", "Umm Salal", "Mesaieed", "Dukhan", "Al Shamal"],
  KW: ["Kuwait City", "Hawalli", "Salmiya", "Farwaniya", "Jahra", "Ahmadi", "Fahaheel", "Mangaf", "Jabriya", "Mubarak Al-Kabeer", "Sabah Al-Salem"],
  OM: ["Muscat", "Seeb", "Salalah", "Sohar", "Nizwa", "Sur", "Ibri", "Barka", "Rustaq", "Buraimi", "Ibra", "Bahla", "Duqm", "Khasab"],
  BH: ["Manama", "Muharraq", "Riffa", "Hamad Town", "Isa Town", "Sitra", "Seef", "Juffair", "Budaiya", "Jidhafs", "A'ali", "Zallaq"],
  EG: ["Cairo", "Giza", "Alexandria", "New Cairo", "6th of October City", "Sheikh Zayed City", "Shubra El Kheima", "Port Said", "Suez", "Mansoura", "Tanta", "Zagazig", "Ismailia", "Damietta", "Faiyum", "Minya", "Asyut", "Sohag", "Luxor", "Aswan", "Hurghada", "Sharm El Sheikh", "El Gouna", "Marsa Alam", "Damanhur", "Beni Suef", "Qena", "Kafr El Sheikh", "Banha", "Arish"],
  IQ: ["Baghdad", "Basra", "Mosul", "Erbil", "Sulaymaniyah", "Duhok", "Kirkuk", "Najaf", "Karbala", "Nasiriyah", "Hillah", "Ramadi", "Fallujah", "Amarah", "Kut", "Diwaniyah", "Samawah", "Baqubah", "Zakho", "Tikrit", "Samarra"],
  JO: ["Amman", "Zarqa", "Irbid", "Aqaba", "Salt", "Madaba", "Jerash", "Mafraq", "Karak", "Russeifa", "Ajloun", "Ma'an", "Tafilah"],
  PS: ["Ramallah", "Al-Bireh", "Nablus", "Hebron", "Bethlehem", "Jenin", "Tulkarm", "Qalqilya", "Jericho", "Beit Jala", "Beit Sahour", "Gaza", "Khan Yunis", "Rafah"],
  LB: ["Beirut", "Tripoli", "Sidon", "Tyre", "Jounieh", "Byblos", "Zahle", "Baalbek", "Nabatieh", "Batroun", "Aley", "Broummana", "Jdeideh", "Dbayeh", "Baabda"],
  TR: ["Istanbul", "Ankara", "Izmir", "Bursa", "Antalya", "Adana", "Konya", "Gaziantep", "Mersin", "Kayseri", "Eskişehir", "Diyarbakır", "Samsun", "Denizli", "Şanlıurfa", "Kocaeli", "Sakarya", "Tekirdağ", "Trabzon", "Malatya", "Erzurum", "Van", "Hatay", "Manisa", "Balıkesir", "Aydın", "Muğla", "Bodrum", "Alanya", "Fethiye"],
  KZ: ["Almaty", "Astana", "Shymkent", "Karaganda", "Aktobe", "Taraz", "Pavlodar", "Oskemen", "Semey", "Atyrau", "Kostanay", "Kyzylorda", "Oral", "Petropavl", "Aktau", "Turkistan", "Taldykorgan", "Kokshetau", "Ekibastuz", "Temirtau", "Konaev", "Zhezkazgan"],
  UZ: ["Tashkent", "Samarkand", "Bukhara", "Namangan", "Andijan", "Fergana", "Nukus", "Qarshi", "Kokand", "Margilan", "Termez", "Jizzakh", "Navoi", "Urgench", "Khiva", "Gulistan", "Chirchiq", "Angren", "Almalyk"],
  KG: ["Bishkek", "Osh", "Jalal-Abad", "Karakol", "Tokmok", "Kara-Balta", "Naryn", "Talas", "Batken", "Uzgen", "Cholpon-Ata", "Balykchy", "Kant"],
  TM: ["Ashgabat", "Türkmenabat", "Daşoguz", "Mary", "Balkanabat", "Türkmenbaşy", "Tejen", "Bayramaly", "Serdar", "Abadan", "Arkadag"],
  AZ: ["Baku", "Ganja", "Sumgait", "Mingachevir", "Lankaran", "Shirvan", "Nakhchivan", "Shaki", "Yevlakh", "Quba", "Gabala", "Khachmaz", "Shamakhi", "Sabirabad", "Khirdalan", "Shusha"],
};

/** The cities offered for a country, by its name; none when it is not a market. */
export function cityOptions(country: string): PlaceOption[] {
  const code = countryCode(country);
  return (code ? CITIES[code] ?? [] : []).map((value) => ({ value }));
}
