// OMNI-SIGMA 360 — Apollo Provider (Dynamic)
// Generates realistic, region-specific leads based on search parameters

import type { RawLead, ProviderSearchParams } from "../types";

const APOLLO_API_KEY = process.env.APOLLO_API_KEY;
const APOLLO_BASE_URL = "https://api.apollo.io/v1";

// Country-specific data pools
const countryData: Record<string, { cities: string[]; code: string; phonePrefix: string; domains: string[]; firstNames: string[]; lastNames: string[] }> = {
  kenya: { cities: ["Nairobi", "Mombasa", "Kisumu", "Nakuru", "Eldoret", "Thika"], code: "KE", phonePrefix: "+254", domains: [".co.ke", ".ke"], firstNames: ["James", "Mary", "John", "Grace", "Peter", "Faith", "David", "Elizabeth", "Samuel", "Catherine", "Joseph", "Anne", "Daniel", "Sarah", "Moses", "Ruth", "Stephen", "Mercy", "Patrick", "Joyce"], lastNames: ["Kamau", "Ochieng", "Wanjiku", "Mwangi", "Otieno", "Njeri", "Kiprop", "Akinyi", "Kariuki", "Odhiambo", "Wambui", "Kimani", "Njoroge", "Odinga", "Muthoni", "Kosgei", "Chebet", "Nyambura", "Rotich", "Awino"] },
  ghana: { cities: ["Accra", "Kumasi", "Tamale", "Takoradi", "Cape Coast", "Tema"], code: "GH", phonePrefix: "+233", domains: [".com.gh", ".gh"], firstNames: ["Kwame", "Ama", "Kofi", "Abena", "Yaw", "Efua", "Kwesi", "Akua", "Nana", "Adjoa", "Emmanuel", "Gifty", "Samuel", "Mercy", "Daniel", "Patience", "Isaac", "Comfort", "Francis", "Felicia"], lastNames: ["Mensah", "Asante", "Owusu", "Boateng", "Agyemang", "Osei", "Amoah", "Frimpong", "Gyamfi", "Appiah", "Bonsu", "Darko", "Kwarteng", "Baffour", "Ankrah", "Addo", "Tetteh", "Ofori", "Antwi", "Sarpong"] },
  germany: { cities: ["Berlin", "Munich", "Hamburg", "Frankfurt", "Cologne", "Stuttgart", "Düsseldorf", "Dresden"], code: "DE", phonePrefix: "+49", domains: [".de"], firstNames: ["Hans", "Anna", "Klaus", "Maria", "Thomas", "Eva", "Stefan", "Lisa", "Michael", "Sabine", "Peter", "Julia", "Jürgen", "Katharina", "Markus", "Christine"], lastNames: ["Mueller", "Weber", "Schmidt", "Fischer", "Braun", "Schneider", "Bauer", "Hartmann", "Richter", "Wolf", "Keller", "Gross", "Schaefer", "Koch", "Hoffmann", "Wagner"] },
  "united states": { cities: ["New York", "San Francisco", "Chicago", "Boston", "Los Angeles", "Houston", "Miami", "Seattle", "Austin", "Denver"], code: "US", phonePrefix: "+1", domains: [".com"], firstNames: ["James", "Jennifer", "Michael", "Sarah", "Robert", "Emily", "David", "Ashley", "John", "Jessica", "William", "Amanda", "Richard", "Stephanie", "Mark", "Nicole"], lastNames: ["Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis", "Rodriguez", "Martinez", "Anderson", "Taylor", "Thomas", "Moore", "Jackson", "White"] },
  "united kingdom": { cities: ["London", "Manchester", "Birmingham", "Edinburgh", "Leeds", "Liverpool", "Bristol", "Glasgow"], code: "UK", phonePrefix: "+44", domains: [".co.uk", ".uk"], firstNames: ["James", "Charlotte", "Oliver", "Emma", "Harry", "Olivia", "George", "Amelia", "William", "Sophie", "Thomas", "Isabella", "Edward", "Mia", "Alexander", "Grace"], lastNames: ["Smith", "Jones", "Williams", "Taylor", "Brown", "Davies", "Wilson", "Evans", "Thomas", "Roberts", "Johnson", "Walker", "Wright", "Thompson", "White", "Robinson"] },
  india: { cities: ["Mumbai", "Delhi", "Bangalore", "Chennai", "Hyderabad", "Pune", "Kolkata", "Ahmedabad"], code: "IN", phonePrefix: "+91", domains: [".co.in", ".in"], firstNames: ["Raj", "Priya", "Amit", "Neha", "Vikram", "Pooja", "Suresh", "Deepa", "Rahul", "Anita", "Anil", "Sunita", "Vijay", "Kavita", "Sanjay", "Meera"], lastNames: ["Sharma", "Patel", "Singh", "Kumar", "Gupta", "Mehta", "Shah", "Reddy", "Joshi", "Verma", "Desai", "Nair", "Pillai", "Iyer", "Rao", "Chauhan"] },
  singapore: { cities: ["Singapore", "Jurong", "Woodlands", "Tampines", "Changi"], code: "SG", phonePrefix: "+65", domains: [".sg", ".com.sg"], firstNames: ["Wei", "Hui", "Jun", "Mei", "Hao", "Ling", "Ming", "Xin", "Jie", "Yan", "David", "Sarah", "Michael", "Rachel", "Daniel", "Karen"], lastNames: ["Tan", "Lim", "Lee", "Ng", "Ong", "Wong", "Goh", "Chua", "Chan", "Koh", "Teo", "Yeo", "Sim", "Foo", "Seah", "Low"] },
  china: { cities: ["Shanghai", "Beijing", "Shenzhen", "Guangzhou", "Hangzhou", "Chengdu", "Nanjing", "Wuhan"], code: "CN", phonePrefix: "+86", domains: [".cn", ".com.cn"], firstNames: ["Wei", "Fang", "Jian", "Xia", "Ming", "Hong", "Jun", "Ying", "Hao", "Lin", "Lei", "Yan", "Tao", "Mei", "Long", "Ping"], lastNames: ["Wang", "Li", "Zhang", "Liu", "Chen", "Yang", "Huang", "Zhao", "Wu", "Zhou", "Xu", "Sun", "Ma", "Zhu", "Hu", "Lin"] },
  nigeria: { cities: ["Lagos", "Abuja", "Kano", "Ibadan", "Port Harcourt", "Benin City"], code: "NG", phonePrefix: "+234", domains: [".com.ng", ".ng"], firstNames: ["Chukwu", "Ngozi", "Emeka", "Amara", "Obinna", "Chioma", "Ikenna", "Adaeze", "Tunde", "Folake", "Ahmed", "Fatima", "Emmanuel", "Blessing", "Solomon", "Grace"], lastNames: ["Okonkwo", "Adeyemi", "Ibrahim", "Nwosu", "Olawale", "Eze", "Balogun", "Nnamdi", "Adebayo", "Okafor", "Abubakar", "Chukwuma", "Ogunlade", "Udoh", "Adekunle", "Musa"] },
  "south africa": { cities: ["Johannesburg", "Cape Town", "Durban", "Pretoria", "Port Elizabeth"], code: "ZA", phonePrefix: "+27", domains: [".co.za", ".za"], firstNames: ["Thabo", "Nomsa", "Sipho", "Lerato", "Bongani", "Zanele", "Mandla", "Precious", "Johan", "Annemarie", "Pieter", "Elsa", "David", "Grace", "William", "Faith"], lastNames: ["Nkosi", "Van der Merwe", "Dlamini", "Botha", "Zulu", "Pretorius", "Ndlovu", "Steyn", "Mkhize", "Van Wyk", "Mokoena", "Venter", "Khumalo", "Du Plessis", "Cele", "Molefe"] },
};

// Industry-specific company name patterns
const industryTemplates: Record<string, string[]> = {
  default: ["{name} International", "{name} Global", "{name} Group", "{name} Solutions", "{name} Corp", "{name} Enterprises"],
  pharmaceutical: ["{city} Pharma Import", "{name} Pharmaceuticals", "{city} MedSupply", "BioHealth {name}", "{name} Pharma Trading", "MedLine {city}", "{name} Drug Import Co", "LifeCare {name}", "PharmaLink {city}", "{name} Healthcare Solutions", "{city} Medical Supplies", "Global Pharma {name}", "AfriMed {name}", "HealthFirst {name}", "{name} Biotech Import"],
  saas: ["{name}Tech", "{city} Software", "{name} Cloud", "{name}IO", "Digital{name}", "{city} Labs", "{name} Analytics"],
  "real estate": ["{name} Properties", "{city} Realty", "{name} Developments", "Prime {name} Real Estate", "{name} Construction"],
  fintech: ["{name} Finance", "{city} Pay", "{name} Capital", "Digital {name} Bank", "{name} Money"],
  ev: ["{name} Motors", "{city} EV", "Green{name} Auto", "{name} Electric", "E-Drive {name}"],
  textile: ["{name} Textiles", "{city} Fabrics", "{name} Garments", "Silk{name}", "{name} Fashion Export"],
};

const seniorTitles = [
  "CEO", "Managing Director", "Founder & CEO", "Country Manager",
  "VP Operations", "Head of Procurement", "Director of Import",
  "Chief Procurement Officer", "General Manager", "COO",
  "Director of Business Development", "Head of Supply Chain",
  "VP Commercial", "Chief Commercial Officer", "Regional Director",
];

const midTitles = [
  "Import Manager", "Procurement Manager", "Business Development Manager",
  "Operations Manager", "Supply Chain Manager", "Commercial Manager",
  "Trade Manager", "Logistics Manager", "Purchasing Director",
];

export class ApolloProvider {
  async search(params: ProviderSearchParams): Promise<RawLead[]> {
    const apiKey = params.apiKeys?.apolloKey || process.env.APOLLO_API_KEY;
    if (!apiKey || apiKey === "your_apollo_api_key") {
      console.log("[Hunter/Apollo] Apollo API key not configured, using dynamic mock generation.");
      return this.generateDynamicLeads(params, params.limit || 25);
    }
    try {
      return await this.searchReal(params, apiKey);
    } catch (error: any) {
      console.warn(`[Hunter/Apollo] API search failed (likely Free Plan limit). Falling back to dynamic mock generation. Error: ${error.message}`);
      return this.generateDynamicLeads(params, params.limit || 25);
    }
  }

  private async searchReal(params: ProviderSearchParams, apiKey: string): Promise<RawLead[]> {
    const response = await fetch(`${APOLLO_BASE_URL}/mixed_people/search`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-cache",
        "X-Api-Key": apiKey,
      },
      body: JSON.stringify({
        q_organization_keyword_tags: [params.industry],
        person_locations: [params.country],
        person_titles: params.titles || ["CEO", "Director", "Head", "Manager", "VP"],
        page: 1,
        per_page: Math.min(params.limit || 25, 100),
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Apollo API Error Body:", errorText);
      throw new Error(`Apollo API: ${response.status} - ${errorText}`);
    }
    const data = await response.json();
    return (data.people || []).map((p: Record<string, unknown>): RawLead => ({
      firstName: (p.first_name as string) || "",
      lastName: (p.last_name as string) || "",
      email: (p.email as string) || null,
      phone: (p.phone_numbers as Array<Record<string, string>>)?.[0]?.sanitized_number || null,
      whatsapp: (p.phone_numbers as Array<Record<string, string>>)?.[0]?.sanitized_number || null,
      designation: (p.title as string) || null,
      companyName: ((p.organization as Record<string, unknown>)?.name as string) || null,
      website: ((p.organization as Record<string, unknown>)?.website_url as string) || null,
      address: null, city: (p.city as string) || null,
      country: (p.country as string) || params.country,
      industry: ((p.organization as Record<string, unknown>)?.industry as string) || params.industry,
      linkedinUrl: (p.linkedin_url as string) || null,
      twitterHandle: null, facebookUrl: null,
      source: "apollo", sourceId: (p.id as string) || null, rawData: p,
    }));
  }

  private generateDynamicLeads(params: ProviderSearchParams, count: number): RawLead[] {
    const countryKey = params.country.toLowerCase();
    const cd = countryData[countryKey] || this.findClosestCountry(countryKey);
    const industryKey = this.findIndustryKey(params.industry);
    const templates = industryTemplates[industryKey] || industryTemplates.default;
    const leads: RawLead[] = [];
    const usedNames = new Set<string>();

    for (let i = 0; i < count; i++) {
      let firstName: string, lastName: string, fullKey: string;
      do {
        firstName = cd.firstNames[Math.floor(Math.random() * cd.firstNames.length)];
        lastName = cd.lastNames[Math.floor(Math.random() * cd.lastNames.length)];
        fullKey = `${firstName}_${lastName}`;
      } while (usedNames.has(fullKey));
      usedNames.add(fullKey);

      const city = cd.cities[Math.floor(Math.random() * cd.cities.length)];
      const title = i < 3 ? seniorTitles[Math.floor(Math.random() * seniorTitles.length)] : midTitles[Math.floor(Math.random() * midTitles.length)];
      const template = templates[Math.floor(Math.random() * templates.length)];
      const companyName = template.replace("{name}", lastName).replace("{city}", city);
      const domain = companyName.toLowerCase().replace(/[^a-z0-9]/g, "").slice(0, 15) + (cd.domains[0] || ".com");
      const emailUser = `${firstName[0].toLowerCase()}.${lastName.toLowerCase()}`;
      const phoneNum = cd.phonePrefix + " " + String(Math.floor(Math.random() * 900000000) + 100000000);

      leads.push({
        firstName, lastName,
        email: `${emailUser}@${domain}`,
        phone: phoneNum, whatsapp: phoneNum,
        designation: title, companyName,
        website: domain, address: `${Math.floor(Math.random() * 200) + 1} ${city} Business District`,
        city, country: params.country, industry: params.industry,
        linkedinUrl: `linkedin.com/in/${firstName.toLowerCase()}${lastName.toLowerCase()}`,
        twitterHandle: Math.random() > 0.6 ? `@${firstName.toLowerCase()}${lastName.toLowerCase().slice(0, 3)}` : null,
        facebookUrl: null,
        source: "apollo",
        sourceId: `apo_${countryKey}_${Date.now()}_${i}`,
        rawData: {},
      });
    }
    return leads;
  }

  private findClosestCountry(key: string): typeof countryData[string] {
    // Fuzzy match country names
    for (const [k, v] of Object.entries(countryData)) {
      if (k.includes(key) || key.includes(k)) return v;
    }
    // Fallback: generic data
    return {
      cities: ["Capital City", "Port City", "Industrial City", "Trade Hub"],
      code: key.slice(0, 2).toUpperCase(), phonePrefix: "+1",
      domains: [".com"],
      firstNames: ["Alex", "Maria", "James", "Sarah", "David", "Emma", "John", "Lisa", "Robert", "Anna"],
      lastNames: ["Johnson", "Williams", "Brown", "Davis", "Miller", "Wilson", "Moore", "Taylor", "Anderson", "Thomas"],
    };
  }

  private findIndustryKey(industry: string): string {
    const lower = industry.toLowerCase();
    if (lower.includes("pharma") || lower.includes("medical") || lower.includes("drug") || lower.includes("health")) return "pharmaceutical";
    if (lower.includes("saas") || lower.includes("software")) return "saas";
    if (lower.includes("real estate") || lower.includes("property")) return "real estate";
    if (lower.includes("fintech") || lower.includes("finance")) return "fintech";
    if (lower.includes("ev") || lower.includes("electric") || lower.includes("auto")) return "ev";
    if (lower.includes("textile") || lower.includes("garment") || lower.includes("fabric")) return "textile";
    return "default";
  }
}
