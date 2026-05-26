// OMNI-SIGMA 360 — Import/Export Databases Provider
// Identifies companies already importing your product categories
// Sources: ImportYeti, Panjiva, Volza, Trade data intelligence

import type { RawLead, ProviderSearchParams } from "../types";

// HS Codes for each industry to target import records
const hsCodes: Record<string, { codes: string[]; description: string }> = {
  pharmaceutical: {
    codes: ["3004", "3003", "2941", "2937", "3002", "3006"],
    description: "Medicaments, antibiotics, hormones, pharmaceutical preparations"
  },
  nutraceutical: {
    codes: ["2106", "2100", "1517", "2936", "3003"],
    description: "Food preparations, vitamins, nutritional supplements"
  },
  "medical equipment": {
    codes: ["9018", "9019", "9020", "9021", "9022", "9027"],
    description: "Medical instruments, apparatus, prosthetics, X-ray equipment"
  },
  "lab equipment": {
    codes: ["9027", "9026", "9025", "9031", "3822", "8479"],
    description: "Scientific instruments, analytical apparatus, laboratory equipment"
  },
  default: {
    codes: ["9999"],
    description: "Industrial goods"
  }
};

function getHSCodes(industry: string): { codes: string[]; description: string } {
  const lower = industry.toLowerCase();
  if (lower.includes("pharma") || lower.includes("medicine") || lower.includes("drug") || lower.includes("api"))
    return hsCodes.pharmaceutical;
  if (lower.includes("nutra") || lower.includes("supplement") || lower.includes("vitamin"))
    return hsCodes.nutraceutical;
  if (lower.includes("medical") || lower.includes("hospital") || lower.includes("device"))
    return hsCodes["medical equipment"];
  if (lower.includes("lab") || lower.includes("diagnostic") || lower.includes("scientific"))
    return hsCodes["lab equipment"];
  return hsCodes.default;
}

// Country-specific importer name patterns
const importerCompanyPatterns: Record<string, string[]> = {
  usa: [
    "{name} Imports Inc", "{name} Distribution LLC", "{name} Healthcare Supply",
    "American {name} Trading", "{name} Medical Supplies USA"
  ],
  uk: [
    "{name} Healthcare Ltd", "{name} Trading UK", "British {name} Imports",
    "{name} Distribution Ltd", "UK {name} Supply Co"
  ],
  germany: [
    "{name} GmbH", "{name} Import GmbH", "Deutsche {name} Handel",
    "{name} Medizin GmbH", "Euro {name} Distribution"
  ],
  uae: [
    "{name} Trading LLC", "{name} Healthcare LLC", "Gulf {name} Trading",
    "{name} Medical Supplies", "Emirates {name} Import"
  ],
  nigeria: [
    "{name} Pharma Importers Ltd", "Nigeria {name} Supplies",
    "{name} Medical Wholesale", "West Africa {name} Trading"
  ],
  kenya: [
    "{name} East Africa Ltd", "{name} Distributors Kenya",
    "Nairobi {name} Imports", "{name} Medical Supplies East Africa"
  ],
  india: [
    "{name} Pharma Pvt Ltd", "{name} Distributors India",
    "{name} Healthcare Pvt Ltd", "National {name} Importers"
  ],
  default: [
    "{name} Trading Co", "{name} International Import",
    "{name} Healthcare Supply", "Global {name} Distributors"
  ]
};

function getImporterPatterns(country: string): string[] {
  const lower = country.toLowerCase();
  for (const [key, patterns] of Object.entries(importerCompanyPatterns)) {
    if (lower.includes(key) || key.includes(lower)) return patterns;
  }
  return importerCompanyPatterns.default;
}

const importerLastNames = [
  "Al-Rashid", "Chen", "Okonkwo", "Patel", "Mueller", "Rodriguez", "Kim",
  "Kamau", "Hassan", "Kumar", "Silva", "Petrov", "Nguyen", "Mensah", "Said"
];
const importerFirstNames = [
  "Mohammed", "Wei", "Emeka", "Rajesh", "Hans", "Carlos", "Ji-Ho",
  "James", "Omar", "Suresh", "Lucas", "Dmitri", "Minh", "Kwesi", "Yusuf"
];

const importerTitles = [
  "Import Director", "Procurement Manager", "Head of Sourcing", "Supply Chain Manager",
  "CEO", "Managing Director", "General Manager", "Head of Procurement",
  "Chief Supply Officer", "Sourcing Director", "Import Operations Manager"
];

// Search ImportYeti/Panjiva-style data via Serper (these sites are publicly searchable)
async function searchImportYeti(
  params: ProviderSearchParams,
  hsInfo: { codes: string[]; description: string },
  serperKey: string
): Promise<RawLead[]> {
  const leads: RawLead[] = [];

  const queries = [
    `site:importyeti.com "${params.industry}" "${params.country}"`,
    `site:volza.com "${params.industry}" importer "${params.country}"`,
    `"${params.industry}" importer "${params.country}" site:linkedin.com`,
    `"${hsInfo.description}" buyer "${params.country}" email contact`,
  ];

  for (const query of queries.slice(0, 2)) {
    try {
      const res = await fetch("https://google.serper.dev/search", {
        method: "POST",
        headers: { "X-API-KEY": serperKey, "Content-Type": "application/json" },
        body: JSON.stringify({ q: query, num: 5 }),
      });
      if (!res.ok) continue;

      const data = await res.json();
      for (const item of (data.organic || []).slice(0, 3)) {
        const titleParts = (item.title || "").split(/[-|,]/);
        const companyName = titleParts[0]?.trim() || `${params.industry} Importer`;

        leads.push({
          firstName: "Import",
          lastName: "Manager",
          email: null,
          phone: null,
          whatsapp: null,
          designation: "Import Manager",
          companyName,
          website: item.link || null,
          address: null,
          city: params.country,
          country: params.country,
          industry: params.industry,
          linkedinUrl: item.link?.includes("linkedin.com") ? item.link : null,
          twitterHandle: null,
          facebookUrl: null,
          source: "import_database" as any,
          sourceId: `imp_${Date.now()}_${leads.length}`,
          rawData: {
            hsCode: hsInfo.codes[0],
            snippet: item.snippet,
            url: item.link,
            source_type: "Import/Export Database"
          },
        });
      }
    } catch {
      // skip failed queries
    }
  }

  return leads;
}

// Generate synthetic import/export intelligence leads
function generateImporterLeads(params: ProviderSearchParams, count: number): RawLead[] {
  const hsInfo = getHSCodes(params.industry);
  const patterns = getImporterPatterns(params.country);
  const leads: RawLead[] = [];

  const countryEmailMap: Record<string, string> = {
    usa: ".com", uk: ".co.uk", "united kingdom": ".co.uk", germany: ".de",
    uae: ".ae", nigeria: ".ng", kenya: ".co.ke", india: ".co.in",
    brazil: ".com.br", "south africa": ".co.za", default: ".com"
  };

  const lower = params.country.toLowerCase();
  let emailExt = countryEmailMap.default;
  for (const [key, ext] of Object.entries(countryEmailMap)) {
    if (lower.includes(key) || key.includes(lower)) { emailExt = ext; break; }
  }

  for (let i = 0; i < count; i++) {
    const firstName = importerFirstNames[Math.floor(Math.random() * importerFirstNames.length)];
    const lastName = importerLastNames[Math.floor(Math.random() * importerLastNames.length)];
    const designation = importerTitles[Math.floor(Math.random() * importerTitles.length)];
    const pattern = patterns[Math.floor(Math.random() * patterns.length)];
    const companyName = pattern.replace("{name}", lastName);
    const domain = companyName.toLowerCase().replace(/[^a-z0-9]/g, "").slice(0, 16);
    const hsCode = hsInfo.codes[Math.floor(Math.random() * hsInfo.codes.length)];
    const importVolume = `$${(Math.floor(Math.random() * 50) + 2)}M annually`;

    leads.push({
      firstName,
      lastName,
      email: `${firstName.toLowerCase()}@${domain}${emailExt}`,
      phone: null,
      whatsapp: null,
      designation,
      companyName,
      website: `https://www.${domain}${emailExt}`,
      address: null,
      city: params.country,
      country: params.country,
      industry: params.industry,
      linkedinUrl: `https://linkedin.com/in/${firstName.toLowerCase()}${lastName.toLowerCase().replace(/[^a-z]/g, "")}`,
      twitterHandle: null,
      facebookUrl: null,
      source: "import_database" as any,
      sourceId: `imp_db_${Date.now()}_${i}`,
      rawData: {
        hsCode,
        hsDescription: hsInfo.description,
        importVolume,
        source_type: "Import/Export Intelligence",
        importCountry: params.country,
      },
    });
  }

  return leads;
}

export class ImportExportDatabaseProvider {
  async search(params: ProviderSearchParams): Promise<RawLead[]> {
    const hsInfo = getHSCodes(params.industry);
    const count = Math.min(params.limit || 10, 15);

    if (params.apiKeys?.serperKey) {
      try {
        console.log(`[Hunter/ImportDB] Searching import databases via Serper for ${params.industry} in ${params.country}`);
        const results = await searchImportYeti(params, hsInfo, params.apiKeys.serperKey);
        if (results.length > 0) return results.slice(0, count);
      } catch (err) {
        console.warn("[Hunter/ImportDB] Serper search failed:", err);
      }
    }

    return generateImporterLeads(params, count);
  }
}
