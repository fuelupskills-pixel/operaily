// OMNI-SIGMA 360 — Lead Deduplication Engine
// Matches on email (exact) or fuzzy company+name match

import type { RawLead } from "./types";

/**
 * Trigram-based fuzzy similarity (0-1)
 */
function trigramSimilarity(a: string, b: string): number {
  if (!a || !b) return 0;
  const aNorm = a.toLowerCase().trim();
  const bNorm = b.toLowerCase().trim();
  if (aNorm === bNorm) return 1;

  const aGrams = new Set<string>();
  const bGrams = new Set<string>();

  for (let i = 0; i <= aNorm.length - 3; i++) aGrams.add(aNorm.slice(i, i + 3));
  for (let i = 0; i <= bNorm.length - 3; i++) bGrams.add(bNorm.slice(i, i + 3));

  if (aGrams.size === 0 || bGrams.size === 0) return 0;

  let intersection = 0;
  for (const gram of aGrams) {
    if (bGrams.has(gram)) intersection++;
  }

  return intersection / Math.max(aGrams.size, bGrams.size);
}

/**
 * Check if two leads are duplicates
 */
function isDuplicate(a: RawLead, b: RawLead): boolean {
  // Exact email match
  if (a.email && b.email && a.email.toLowerCase() === b.email.toLowerCase()) {
    return true;
  }

  // Fuzzy: company name + person name
  const companySim = trigramSimilarity(a.companyName || "", b.companyName || "");
  const nameSim = trigramSimilarity(
    `${a.firstName} ${a.lastName}`,
    `${b.firstName} ${b.lastName}`
  );

  return companySim > 0.7 && nameSim > 0.85;
}

/**
 * Merge two duplicate leads, keeping the richest data from each
 */
function mergeLeads(primary: RawLead, secondary: RawLead): RawLead {
  return {
    firstName: primary.firstName || secondary.firstName,
    lastName: primary.lastName || secondary.lastName,
    email: primary.email || secondary.email,
    phone: primary.phone || secondary.phone,
    whatsapp: primary.whatsapp || secondary.whatsapp,
    designation: primary.designation || secondary.designation,
    companyName: primary.companyName || secondary.companyName,
    website: primary.website || secondary.website,
    address: primary.address || secondary.address,
    city: primary.city || secondary.city,
    country: primary.country || secondary.country,
    industry: primary.industry || secondary.industry,
    linkedinUrl: primary.linkedinUrl || secondary.linkedinUrl,
    twitterHandle: primary.twitterHandle || secondary.twitterHandle,
    facebookUrl: primary.facebookUrl || secondary.facebookUrl,
    source: primary.source, // keep primary source
    sourceId: primary.sourceId,
    rawData: { ...secondary.rawData, ...primary.rawData },
  };
}

/**
 * Deduplicate an array of raw leads
 * Returns unique leads with merged data from duplicates
 */
export function deduplicateLeads(leads: RawLead[]): RawLead[] {
  const unique: RawLead[] = [];

  for (const lead of leads) {
    let merged = false;
    for (let i = 0; i < unique.length; i++) {
      if (isDuplicate(lead, unique[i])) {
        unique[i] = mergeLeads(unique[i], lead);
        merged = true;
        break;
      }
    }
    if (!merged) {
      unique.push({ ...lead });
    }
  }

  return unique;
}
