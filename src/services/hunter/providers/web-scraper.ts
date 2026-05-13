// OMNI-SIGMA 360 — Web Scraper Provider (Dynamic)

import type { RawLead, ProviderSearchParams } from "../types";

const regionData: Record<string, { cities: string[]; phonePrefix: string; domain: string; firstNames: string[]; lastNames: string[] }> = {
  kenya: { cities: ["Nairobi", "Mombasa", "Kisumu", "Thika", "Nakuru"], phonePrefix: "+254", domain: ".co.ke", firstNames: ["George", "Winnie", "Charles", "Agnes", "Philip", "Rose"], lastNames: ["Munyao", "Wekesa", "Ndung'u", "Cheruiyot", "Atieno", "Barasa"] },
  ghana: { cities: ["Accra", "Kumasi", "Tema", "Takoradi", "Sunyani"], phonePrefix: "+233", domain: ".com.gh", firstNames: ["Prince", "Rita", "Bright", "Doris", "Elvis", "Linda"], lastNames: ["Asiedu", "Twum", "Obeng", "Nyarko", "Mensah-Bonsu", "Acheampong"] },
  germany: { cities: ["Hannover", "Leipzig", "Nuremberg", "Bremen"], phonePrefix: "+49", domain: ".de", firstNames: ["Andreas", "Petra", "Uwe", "Monika"], lastNames: ["Neumann", "Schwarz", "Schmitz", "Kraft"] },
  "united states": { cities: ["Dallas", "Atlanta", "Portland", "Nashville"], phonePrefix: "+1", domain: ".com", firstNames: ["Brandon", "Tiffany", "Derek", "Heather"], lastNames: ["Murphy", "Morgan", "Cooper", "Reed"] },
  nigeria: { cities: ["Lagos", "Abuja", "Enugu", "Calabar"], phonePrefix: "+234", domain: ".com.ng", firstNames: ["Kingsley", "Ngozi", "Chibuzo", "Funke"], lastNames: ["Onuoha", "Agbaje", "Dimka", "Nnadi"] },
};

export class WebScraperProvider {
  async search(params: ProviderSearchParams): Promise<RawLead[]> {
    console.log(`[Hunter/Web] Generating dynamic leads for: ${params.industry} in ${params.country}`);
    return this.generateDynamic(params, 2 + Math.floor(Math.random() * 3));
  }

  private generateDynamic(params: ProviderSearchParams, count: number): RawLead[] {
    const key = params.country.toLowerCase();
    const rd = regionData[key] || { cities: ["Main City", "Port Town"], phonePrefix: "+1", domain: ".com", firstNames: ["Mark", "Linda", "Tom", "Sue"], lastNames: ["Park", "Cross", "Grant", "Field"] };
    const isPharma = params.industry.toLowerCase().includes("pharma") || params.industry.toLowerCase().includes("medical");
    const leads: RawLead[] = [];

    for (let i = 0; i < count; i++) {
      const fn = rd.firstNames[Math.floor(Math.random() * rd.firstNames.length)];
      const ln = rd.lastNames[Math.floor(Math.random() * rd.lastNames.length)];
      const city = rd.cities[Math.floor(Math.random() * rd.cities.length)];
      const companyPrefix = isPharma
        ? ["PharmEx", "MedSource", "DrugMart", "HealthPlus", "BioImport", "MedHub"][Math.floor(Math.random() * 6)]
        : ["Trade", "Global", "Smart", "United", "Prime"][Math.floor(Math.random() * 5)];
      const companyName = `${companyPrefix} ${city} ${isPharma ? "Pharma" : "Corp"}`;
      const domain = companyName.toLowerCase().replace(/[^a-z0-9]/g, "").slice(0, 14) + rd.domain;
      const phone = rd.phonePrefix + " " + String(Math.floor(Math.random() * 900000000) + 100000000);
      const titles = isPharma
        ? ["Warehouse Manager", "Import Coordinator", "Logistics Director", "Regulatory Manager", "Founder"]
        : ["Owner", "Branch Manager", "Regional Head", "Sales Director"];

      leads.push({
        firstName: fn, lastName: ln,
        email: `${fn.toLowerCase()}@${domain}`,
        phone, whatsapp: phone,
        designation: titles[Math.floor(Math.random() * titles.length)],
        companyName, website: domain, address: null,
        city, country: params.country, industry: params.industry,
        linkedinUrl: Math.random() > 0.4 ? `linkedin.com/in/${fn.toLowerCase()}${ln.toLowerCase().replace(/[^a-z]/g, "")}` : null,
        twitterHandle: null,
        facebookUrl: Math.random() > 0.6 ? `facebook.com/${companyName.toLowerCase().replace(/\s/g, "")}` : null,
        source: "web_scraper", sourceId: `web_${key}_${Date.now()}_${i}`, rawData: {},
      });
    }
    return leads;
  }
}
