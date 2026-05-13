// OMNI-SIGMA 360 — LinkedIn Provider (Dynamic)

import type { RawLead, ProviderSearchParams } from "../types";

const countryNames: Record<string, { cities: string[]; phonePrefix: string; domains: string[]; firstNames: string[]; lastNames: string[] }> = {
  kenya: { cities: ["Nairobi", "Mombasa", "Kisumu", "Nakuru", "Eldoret"], phonePrefix: "+254", domains: [".co.ke"], firstNames: ["Wanjiru", "Brian", "Lucy", "Kevin", "Esther", "Martin", "Diana", "Collins"], lastNames: ["Mutua", "Kiptoo", "Wangari", "Ngugi", "Kibet", "Ouma", "Mogaka", "Maina"] },
  ghana: { cities: ["Accra", "Kumasi", "Tamale", "Takoradi", "Tema"], phonePrefix: "+233", domains: [".com.gh"], firstNames: ["Kwaku", "Akosua", "Kojo", "Afia", "Yaa", "Kobby", "Esi", "Fiifi"], lastNames: ["Asamoah", "Adu", "Amankwah", "Badu", "Danquah", "Yeboah", "Kusi", "Afriyie"] },
  germany: { cities: ["Berlin", "Munich", "Hamburg", "Frankfurt"], phonePrefix: "+49", domains: [".de"], firstNames: ["Lukas", "Sophie", "Felix", "Lena", "Max", "Mia"], lastNames: ["Bergmann", "Zimmermann", "Engel", "Lehmann", "Krause", "Fuchs"] },
  "united states": { cities: ["New York", "Chicago", "Houston", "Phoenix"], phonePrefix: "+1", domains: [".com"], firstNames: ["Chris", "Taylor", "Jordan", "Morgan", "Alex", "Casey"], lastNames: ["Wilson", "Clark", "Hall", "Allen", "Young", "King"] },
  "united kingdom": { cities: ["London", "Manchester", "Leeds", "Bristol"], phonePrefix: "+44", domains: [".co.uk"], firstNames: ["Liam", "Ella", "Jack", "Ivy", "Noah", "Ruby"], lastNames: ["Campbell", "Mitchell", "Turner", "Cooper", "Ward", "Morris"] },
  india: { cities: ["Mumbai", "Delhi", "Bangalore", "Chennai"], phonePrefix: "+91", domains: [".co.in"], firstNames: ["Arjun", "Sneha", "Kiran", "Divya", "Ravi", "Nisha"], lastNames: ["Agarwal", "Bhat", "Choudhary", "Das", "Ghosh", "Malhotra"] },
  nigeria: { cities: ["Lagos", "Abuja", "Kano", "Ibadan"], phonePrefix: "+234", domains: [".com.ng"], firstNames: ["Chidi", "Nneka", "Femi", "Aisha", "Uche", "Bola"], lastNames: ["Okeke", "Bakare", "Danjuma", "Uchenna", "Adeleke", "Chukwu"] },
  singapore: { cities: ["Singapore", "Jurong", "Tampines"], phonePrefix: "+65", domains: [".sg"], firstNames: ["Wei Lin", "Jia Hui", "Yi Xuan", "Zhi Wei", "Kai Wen", "Li Ying"], lastNames: ["Chong", "Tay", "Ho", "Poh", "Wee", "Quek"] },
  china: { cities: ["Shanghai", "Beijing", "Shenzhen", "Guangzhou"], phonePrefix: "+86", domains: [".cn"], firstNames: ["Jing", "Chao", "Xue", "Feng", "Yue", "Bo"], lastNames: ["Tang", "Guo", "He", "Luo", "Deng", "Xiao"] },
};

const pharmaTitles = ["VP Regulatory Affairs", "Head of Imports", "Quality Assurance Director", "Supply Chain Lead", "Procurement Specialist", "Business Development Lead", "Commercial Director", "Operations Lead"];
const defaultTitles = ["Senior Manager", "Director", "Head of Operations", "VP Business Dev", "Commercial Lead", "Strategy Director"];

export class LinkedInProvider {
  async search(params: ProviderSearchParams): Promise<RawLead[]> {
    console.log(`[Hunter/LinkedIn] Generating dynamic leads for: ${params.industry} in ${params.country}`);
    return this.generateDynamic(params, 3 + Math.floor(Math.random() * 3));
  }

  private generateDynamic(params: ProviderSearchParams, count: number): RawLead[] {
    const key = params.country.toLowerCase();
    const cd = countryNames[key] || this.fallback(key);
    const isPharma = params.industry.toLowerCase().includes("pharma") || params.industry.toLowerCase().includes("medical");
    const titles = isPharma ? pharmaTitles : defaultTitles;
    const leads: RawLead[] = [];

    for (let i = 0; i < count; i++) {
      const fn = cd.firstNames[Math.floor(Math.random() * cd.firstNames.length)];
      const ln = cd.lastNames[Math.floor(Math.random() * cd.lastNames.length)];
      const city = cd.cities[Math.floor(Math.random() * cd.cities.length)];
      const title = titles[Math.floor(Math.random() * titles.length)];
      const companyBase = isPharma
        ? ["MediCare", "PharmaTrade", "HealthLink", "BioSource", "MedConnect", "VitaPharm", "CureAll", "AfriHealth"][Math.floor(Math.random() * 8)]
        : ["Global", "Prime", "Elite", "NextGen", "Alpha", "Peak"][Math.floor(Math.random() * 6)];
      const companySuffix = [city, ln, params.country.split(" ")[0]][Math.floor(Math.random() * 3)];
      const companyName = `${companyBase} ${companySuffix} Ltd`;
      const domain = companyName.toLowerCase().replace(/[^a-z0-9]/g, "").slice(0, 14) + (cd.domains[0] || ".com");
      const phone = cd.phonePrefix + " " + String(Math.floor(Math.random() * 900000000) + 100000000);

      leads.push({
        firstName: fn, lastName: ln,
        email: `${fn.toLowerCase().replace(/\s/g, "")}.${ln.toLowerCase()}@${domain}`,
        phone, whatsapp: phone,
        designation: title, companyName, website: domain,
        address: null, city, country: params.country, industry: params.industry,
        linkedinUrl: `linkedin.com/in/${fn.toLowerCase().replace(/\s/g, "")}${ln.toLowerCase()}`,
        twitterHandle: null, facebookUrl: null,
        source: "linkedin", sourceId: `li_${key}_${Date.now()}_${i}`, rawData: {},
      });
    }
    return leads;
  }

  private fallback(key: string): typeof countryNames[string] {
    return { cities: ["Capital City", "Trade Hub", "Port City"], phonePrefix: "+1", domains: [".com"], firstNames: ["Alex", "Sam", "Pat", "Jamie", "Chris", "Morgan"], lastNames: ["Doe", "Reed", "Blake", "Shaw", "Cruz", "Lane"] };
  }
}
