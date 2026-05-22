// OMNI-SIGMA 360 — Lead CRUD Service
// Handles all lead database operations
import { getNotificationService } from "../notifications";
import { createServerClient } from "@/lib/supabase/server";

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

// Helper to determine if Supabase connection is active
function isSupabaseConfigured(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  return !!(
    url &&
    url.startsWith("http") &&
    key &&
    key !== "your_service_role_key" &&
    key !== "your_supabase_service_role_key"
  );
}

// Helper to resolve an orgId to a valid Supabase Organization UUID
async function getOrResolveOrgUuid(supabase: any, orgId: string): Promise<string> {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (uuidRegex.test(orgId)) {
    return orgId;
  }
  // Try to find the first organization
  const { data: orgs } = await supabase.from("organizations").select("id").limit(1);
  if (orgs && orgs.length > 0) {
    return orgs[0].id;
  }
  // If none exists, create a default one
  const { data: newOrg } = await supabase
    .from("organizations")
    .insert({ name: "OperAIly Headquarters", slug: "operaily-hq" })
    .select("id")
    .single();
  if (newOrg) return newOrg.id;
  throw new Error("Could not resolve or create a valid organization in Supabase.");
}

// Mapping functions between camelCase LeadRecord and snake_case Database table columns
function dbToLeadRecord(row: any): LeadRecord {
  return {
    id: row.id,
    orgId: row.org_id,
    assignedTo: row.assigned_to,
    firstName: row.first_name || "",
    lastName: row.last_name || "",
    fullName: row.full_name || "",
    email: row.email,
    phone: row.phone,
    whatsapp: row.whatsapp,
    designation: row.designation,
    companyName: row.company_name,
    website: row.website,
    address: row.address,
    city: row.city,
    country: row.country,
    industry: row.industry,
    linkedinUrl: row.linkedin_url,
    twitterHandle: row.twitter_handle,
    facebookUrl: row.facebook_url,
    leadScore: row.lead_score || 0,
    status: row.status || "new",
    source: row.source || "manual",
    sourceId: row.source_id,
    personalizedHook: row.personalized_hook,
    aiSummary: row.ai_summary,
    lastContactedAt: row.last_contacted_at,
    archivedAt: row.archived_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function leadInputToDb(input: LeadInput | Partial<LeadInput>) {
  const dbRow: any = {};
  if (input.firstName !== undefined) dbRow.first_name = input.firstName;
  if (input.lastName !== undefined) dbRow.last_name = input.lastName;
  if (input.email !== undefined) dbRow.email = input.email;
  if (input.phone !== undefined) dbRow.phone = input.phone;
  if (input.whatsapp !== undefined) dbRow.whatsapp = input.whatsapp;
  if (input.designation !== undefined) dbRow.designation = input.designation;
  if (input.companyName !== undefined) dbRow.company_name = input.companyName;
  if (input.website !== undefined) dbRow.website = input.website;
  if (input.address !== undefined) dbRow.address = input.address;
  if (input.city !== undefined) dbRow.city = input.city;
  if (input.country !== undefined) dbRow.country = input.country;
  if (input.industry !== undefined) dbRow.industry = input.industry;
  if (input.linkedinUrl !== undefined) dbRow.linkedin_url = input.linkedinUrl;
  if (input.twitterHandle !== undefined) dbRow.twitter_handle = input.twitterHandle;
  if (input.facebookUrl !== undefined) dbRow.facebook_url = input.facebookUrl;
  if (input.leadScore !== undefined) dbRow.lead_score = input.leadScore;
  if (input.status !== undefined) dbRow.status = input.status;
  if (input.source !== undefined) dbRow.source = input.source;
  if (input.sourceId !== undefined) dbRow.source_id = input.sourceId;
  if (input.personalizedHook !== undefined) dbRow.personalized_hook = input.personalizedHook;
  if (input.aiSummary !== undefined) dbRow.ai_summary = input.aiSummary;
  return dbRow;
}

export class LeadService {
  /**
   * Create a single lead
   */
  async create(input: LeadInput, orgId: string = "demo-org"): Promise<LeadRecord> {
    const currentCount = await this.getCount(orgId);
    if (currentCount >= 100) {
      throw new Error("Free version allows a maximum of 100 leads. Please upgrade your subscription to add more leads.");
    }

    if (isSupabaseConfigured()) {
      const supabase = createServerClient();
      const uuidOrgId = await getOrResolveOrgUuid(supabase, orgId);
      const dbRow = {
        ...leadInputToDb(input),
        org_id: uuidOrgId,
      };
      const { data, error } = await supabase.from("leads").insert(dbRow).select().single();
      if (error) throw new Error(error.message);
      const record = dbToLeadRecord(data);
      getNotificationService().notifyAdminOnNewLead(record).catch(console.error);
      return record;
    }

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
    const currentCount = await this.getCount(orgId);
    if (currentCount + inputs.length > 100) {
      throw new Error(`Free version allows a maximum of 100 leads. You currently have ${currentCount} leads and are trying to add ${inputs.length} more.`);
    }

    if (isSupabaseConfigured()) {
      const supabase = createServerClient();
      const uuidOrgId = await getOrResolveOrgUuid(supabase, orgId);
      const results: LeadRecord[] = [];
      for (const input of inputs) {
        if (input.email) {
          const { data: existing } = await supabase
            .from("leads")
            .select("id")
            .eq("org_id", uuidOrgId)
            .eq("email", input.email.toLowerCase())
            .is("archived_at", null)
            .limit(1);
          if (existing && existing.length > 0) continue;
        }
        const dbRow = {
          ...leadInputToDb(input),
          org_id: uuidOrgId,
        };
        const { data, error } = await supabase.from("leads").insert(dbRow).select().single();
        if (!error && data) {
          results.push(dbToLeadRecord(data));
        }
      }
      return results;
    }

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
    if (isSupabaseConfigured()) {
      const supabase = createServerClient();
      const { data, error } = await supabase.from("leads").select().eq("id", id).single();
      if (error || !data) return null;
      return dbToLeadRecord(data);
    }
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
    if (isSupabaseConfigured()) {
      const supabase = createServerClient();
      const uuidOrgId = await getOrResolveOrgUuid(supabase, orgId);
      let query = supabase.from("leads").select("*", { count: "exact" }).eq("org_id", uuidOrgId).is("archived_at", null);

      if (filters.status) query = query.eq("status", filters.status);
      if (filters.source) query = query.eq("source", filters.source);
      if (filters.country) query = query.ilike("country", `%${filters.country}%`);
      if (filters.industry) query = query.ilike("industry", `%${filters.industry}%`);
      if (filters.minScore !== undefined) query = query.gte("lead_score", filters.minScore);
      if (filters.maxScore !== undefined) query = query.lte("lead_score", filters.maxScore);
      if (filters.search) {
        const q = `%${filters.search.toLowerCase()}%`;
        query = query.or(`first_name.ilike.${q},last_name.ilike.${q},email.ilike.${q},company_name.ilike.${q},designation.ilike.${q}`);
      }

      const sortBy = filters.sortBy || "leadScore";
      const sortOrder = filters.sortOrder || "desc";
      const dbSortBy = sortBy === "leadScore" ? "lead_score" : sortBy === "fullName" ? "full_name" : sortBy === "companyName" ? "company_name" : sortBy;
      query = query.order(dbSortBy, { ascending: sortOrder === "asc" });

      const page = filters.page || 1;
      const limit = filters.limit || 25;
      const start = (page - 1) * limit;
      const end = start + limit - 1;
      query = query.range(start, end);

      const { data, count, error } = await query;
      if (error) throw new Error(error.message);

      const leads = (data || []).map(dbToLeadRecord);
      const total = count || 0;
      const totalPages = Math.ceil(total / limit);

      return { leads, total, page, totalPages };
    }

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
    if (isSupabaseConfigured()) {
      const supabase = createServerClient();
      const { data: existing, error: getErr } = await supabase.from("leads").select("status").eq("id", id).single();
      if (getErr || !existing) return null;

      const oldStatus = existing.status;
      const newStatus = updates.status || oldStatus;

      const dbRow = leadInputToDb(updates);
      const { data, error } = await supabase.from("leads").update(dbRow).eq("id", id).select().single();
      if (error || !data) return null;

      const record = dbToLeadRecord(data);
      if (newStatus !== oldStatus) {
        getNotificationService().notifyAdminOnStatusChange(record, oldStatus, newStatus).catch(console.error);
      }
      return record;
    }

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
    if (isSupabaseConfigured()) {
      const supabase = createServerClient();
      const { error } = await supabase.from("leads").update({ archived_at: new Date().toISOString() }).eq("id", id);
      return !error;
    }

    const idx = memoryStore.findIndex((l) => l.id === id);
    if (idx === -1) return false;
    memoryStore[idx].archivedAt = new Date().toISOString();
    return true;
  }

  /**
   * Get lead counts by status
   */
  async getStatusCounts(orgId: string = "demo-org"): Promise<Record<string, number>> {
    if (isSupabaseConfigured()) {
      const supabase = createServerClient();
      const uuidOrgId = await getOrResolveOrgUuid(supabase, orgId);
      const { data, error } = await supabase.from("leads").select("status").eq("org_id", uuidOrgId).is("archived_at", null);
      if (error) return {};
      const counts: Record<string, number> = {};
      for (const lead of data || []) {
        counts[lead.status] = (counts[lead.status] || 0) + 1;
      }
      return counts;
    }

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
    if (isSupabaseConfigured()) {
      const supabase = createServerClient();
      const uuidOrgId = await getOrResolveOrgUuid(supabase, orgId);
      const { count, error } = await supabase.from("leads").select("id", { count: "exact", head: true }).eq("org_id", uuidOrgId).is("archived_at", null);
      if (error) return 0;
      return count || 0;
    }

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
