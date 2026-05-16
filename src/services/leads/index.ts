// OMNI-SIGMA 360 — Lead CRUD Service
// Handles all lead database operations
import { getNotificationService } from "../notifications";

export interface LeadInput {
  firstName: string;
  lastName: string;
  email: string | null;
  phone: string | null;
  whatsapp: string | null;
  designation: string | null;
  companyName: string | null;
  website: string | null;
  address: string | null;
  city: string | null;
  country: string | null;
  industry: string | null;
  linkedinUrl: string | null;
  twitterHandle: string | null;
  facebookUrl: string | null;
  leadScore: number;
  status: string;
  source: string;
  sourceId: string | null;
  personalizedHook: string | null;
  aiSummary: string | null;
}

export interface LeadRecord extends LeadInput {
  id: string;
  orgId: string;
  assignedTo: string | null;
  fullName: string;
  lastContactedAt: string | null;
  archivedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface LeadFilters {
  status?: string;
  source?: string;
  country?: string;
  industry?: string;
  minScore?: number;
  maxScore?: number;
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

// In-memory store for demo mode (replaced with Supabase when configured)
const memoryStore: LeadRecord[] = [];
let idCounter = 1;

export class LeadService {
  /**
   * Create a single lead
   */
  async create(input: LeadInput, orgId: string = "demo-org"): Promise<LeadRecord> {
    const now = new Date().toISOString();
    const record: LeadRecord = {
      ...input,
      id: `lead_${String(idCounter++).padStart(6, "0")}`,
      orgId,
      assignedTo: null,
      fullName: `${input.firstName} ${input.lastName}`.trim(),
      lastContactedAt: null,
      archivedAt: null,
      createdAt: now,
      updatedAt: now,
    };

    memoryStore.push(record);
    
    // Trigger notification for admin
    getNotificationService().notifyAdminOnNewLead(record).catch(console.error);

    return record;
  }

  /**
   * Batch create leads (for Hunter import)
   */
  async createBatch(inputs: LeadInput[], orgId: string = "demo-org"): Promise<LeadRecord[]> {
    const results: LeadRecord[] = [];
    for (const input of inputs) {
      // Skip duplicates by email
      if (input.email) {
        const existing = memoryStore.find(
          (l) => l.email?.toLowerCase() === input.email?.toLowerCase() && l.orgId === orgId
        );
        if (existing) continue;
      }
      results.push(await this.create(input, orgId));
    }
    return results;
  }

  /**
   * Get a single lead by ID
   */
  async getById(id: string): Promise<LeadRecord | null> {
    return memoryStore.find((l) => l.id === id) || null;
  }

  /**
   * List leads with filters
   */
  async list(filters: LeadFilters = {}, orgId: string = "demo-org"): Promise<{
    leads: LeadRecord[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    let results = memoryStore.filter((l) => l.orgId === orgId && !l.archivedAt);

    // Apply filters
    if (filters.status) results = results.filter((l) => l.status === filters.status);
    if (filters.source) results = results.filter((l) => l.source === filters.source);
    if (filters.country) results = results.filter((l) => l.country?.toLowerCase().includes(filters.country!.toLowerCase()));
    if (filters.industry) results = results.filter((l) => l.industry?.toLowerCase().includes(filters.industry!.toLowerCase()));
    if (filters.minScore !== undefined) results = results.filter((l) => l.leadScore >= filters.minScore!);
    if (filters.maxScore !== undefined) results = results.filter((l) => l.leadScore <= filters.maxScore!);
    if (filters.search) {
      const q = filters.search.toLowerCase();
      results = results.filter(
        (l) =>
          l.fullName.toLowerCase().includes(q) ||
          l.email?.toLowerCase().includes(q) ||
          l.companyName?.toLowerCase().includes(q) ||
          l.designation?.toLowerCase().includes(q)
      );
    }

    // Sort
    const sortBy = filters.sortBy || "leadScore";
    const sortOrder = filters.sortOrder || "desc";
    results.sort((a, b) => {
      const aVal = (a as unknown as Record<string, unknown>)[sortBy];
      const bVal = (b as unknown as Record<string, unknown>)[sortBy];
      if (typeof aVal === "number" && typeof bVal === "number") {
        return sortOrder === "desc" ? bVal - aVal : aVal - bVal;
      }
      return sortOrder === "desc"
        ? String(bVal || "").localeCompare(String(aVal || ""))
        : String(aVal || "").localeCompare(String(bVal || ""));
    });

    // Paginate
    const page = filters.page || 1;
    const limit = filters.limit || 25;
    const total = results.length;
    const totalPages = Math.ceil(total / limit);
    const start = (page - 1) * limit;
    const paginated = results.slice(start, start + limit);

    return { leads: paginated, total, page, totalPages };
  }

  /**
   * Update a lead
   */
  async update(id: string, updates: Partial<LeadInput>): Promise<LeadRecord | null> {
    const idx = memoryStore.findIndex((l) => l.id === id);
    if (idx === -1) return null;

    const oldStatus = memoryStore[idx].status;
    const newStatus = updates.status || oldStatus;

    memoryStore[idx] = {
      ...memoryStore[idx],
      ...updates,
      fullName: `${updates.firstName || memoryStore[idx].firstName} ${updates.lastName || memoryStore[idx].lastName}`.trim(),
      updatedAt: new Date().toISOString(),
    };

    if (newStatus !== oldStatus) {
      getNotificationService().notifyAdminOnStatusChange(memoryStore[idx], oldStatus, newStatus).catch(console.error);
    }

    return memoryStore[idx];
  }

  /**
   * Archive a lead (soft delete)
   */
  async archive(id: string): Promise<boolean> {
    const idx = memoryStore.findIndex((l) => l.id === id);
    if (idx === -1) return false;
    memoryStore[idx].archivedAt = new Date().toISOString();
    return true;
  }

  /**
   * Get lead counts by status
   */
  async getStatusCounts(orgId: string = "demo-org"): Promise<Record<string, number>> {
    const leads = memoryStore.filter((l) => l.orgId === orgId && !l.archivedAt);
    const counts: Record<string, number> = {};
    for (const lead of leads) {
      counts[lead.status] = (counts[lead.status] || 0) + 1;
    }
    return counts;
  }

  /**
   * Get total lead count
   */
  async getCount(orgId: string = "demo-org"): Promise<number> {
    return memoryStore.filter((l) => l.orgId === orgId && !l.archivedAt).length;
  }
}

// Singleton
let leadServiceInstance: LeadService | null = null;

export function getLeadService(): LeadService {
  if (!leadServiceInstance) {
    leadServiceInstance = new LeadService();
  }
  return leadServiceInstance;
}
