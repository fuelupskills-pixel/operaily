// OMNI-SIGMA 360 — Message Template Service
// Industry-focused WhatsApp and Email templates with variable interpolation

export interface MessageTemplate {
  id: string;
  name: string;
  channel: "whatsapp" | "email";
  industry: string;
  subject?: string; // Email only
  body: string;
  variables: string[];
  calendarLink: string;
}

const CALENDAR_LINK = "https://cal.com/omnisigma/30min";

export const templates: MessageTemplate[] = [
  // ─── PHARMA WhatsApp Templates ─────────────────────────────
  {
    id: "wa_pharma_intro",
    name: "Pharma - First Touch",
    channel: "whatsapp",
    industry: "pharmaceutical",
    body: `Hello {{firstName}},

Greetings from *OMNI-SIGMA Exports* 🌍

I came across *{{companyName}}* and your impressive work in pharmaceutical imports in {{country}}.

We are a leading *exporter of Pharmaceutical & Nutraceutical products* with a wide range of therapeutic categories including:

💊 Antibiotics & Anti-infectives
💉 Cardiovascular & Diabetic care
🧬 Nutraceuticals & Supplements
🏥 Oncology & Immunology
🩺 Dermatology & Ophthalmology

We supply to 40+ countries with WHO-GMP certified manufacturing and competitive pricing.

Would you be available for a quick 15-minute call to discuss potential collaboration?

📅 *Book a call directly:* {{calendarLink}}

Looking forward to connecting!

Best regards,
OMNI-SIGMA Exports Team`,
    variables: ["firstName", "companyName", "country", "calendarLink"],
    calendarLink: CALENDAR_LINK,
  },
  {
    id: "wa_pharma_followup",
    name: "Pharma - Follow Up",
    channel: "whatsapp",
    industry: "pharmaceutical",
    body: `Hi {{firstName}},

Just following up on my previous message about *{{companyName}}*.

We recently added new therapeutic lines that are seeing strong demand in {{country}}:

✅ Generic formulations (WHO prequalified)
✅ Contract manufacturing
✅ Nutraceutical range (Vitamins, Minerals, Probiotics)

I'd love to share our latest product catalog and pricing.

📅 *Schedule a call:* {{calendarLink}}

Or simply reply here and I'll send over the details!

Warm regards,
OMNI-SIGMA Team`,
    variables: ["firstName", "companyName", "country", "calendarLink"],
    calendarLink: CALENDAR_LINK,
  },
  {
    id: "wa_pharma_catalog",
    name: "Pharma - Catalog Share",
    channel: "whatsapp",
    industry: "pharmaceutical",
    body: `Dear {{firstName}},

Thank you for your interest! Here's a quick overview of what we offer:

*OMNI-SIGMA Product Categories:*

1️⃣ *Antibiotics* — Amoxicillin, Azithromycin, Ciprofloxacin
2️⃣ *Cardiovascular* — Amlodipine, Atorvastatin, Losartan
3️⃣ *Diabetes* — Metformin, Glimepiride, Insulin analogs
4️⃣ *Nutraceuticals* — Multivitamins, Omega-3, Probiotics, Iron supplements
5️⃣ *Pain & Inflammation* — Ibuprofen, Diclofenac, Paracetamol
6️⃣ *Dermatology* — Topical creams, Antifungals

All products come with complete regulatory documentation for {{country}} market.

📅 Let's discuss further: {{calendarLink}}

Best,
OMNI-SIGMA Exports`,
    variables: ["firstName", "country", "calendarLink"],
    calendarLink: CALENDAR_LINK,
  },

  // ─── PHARMA Email Templates ────────────────────────────────
  {
    id: "email_pharma_intro",
    name: "Pharma - Introduction Email",
    channel: "email",
    industry: "pharmaceutical",
    subject: "Partnership Opportunity — Pharma & Nutra Export to {{country}}",
    body: `<div style="font-family: Arial, sans-serif; color: #333; max-width: 600px;">
  <p>Dear {{firstName}},</p>

  <p>Warm greetings from <strong>OMNI-SIGMA Exports</strong>!</p>

  <p>I came across <strong>{{companyName}}</strong> and was impressed by your presence in the pharmaceutical import sector in {{country}}. I'm reaching out to explore a potential partnership.</p>

  <p>We are a WHO-GMP certified <strong>exporter of Pharmaceutical & Nutraceutical products</strong> with a wide range of therapeutic categories:</p>

  <table style="width: 100%; border-collapse: collapse; margin: 16px 0;">
    <tr style="background: #f8f9fa;">
      <td style="padding: 10px; border: 1px solid #e9ecef;">💊 Antibiotics & Anti-infectives</td>
      <td style="padding: 10px; border: 1px solid #e9ecef;">💉 Cardiovascular & Diabetic Care</td>
    </tr>
    <tr>
      <td style="padding: 10px; border: 1px solid #e9ecef;">🧬 Nutraceuticals & Supplements</td>
      <td style="padding: 10px; border: 1px solid #e9ecef;">🏥 Oncology & Immunology</td>
    </tr>
    <tr style="background: #f8f9fa;">
      <td style="padding: 10px; border: 1px solid #e9ecef;">🩺 Dermatology & Ophthalmology</td>
      <td style="padding: 10px; border: 1px solid #e9ecef;">💪 Pain Management & Anti-inflammatory</td>
    </tr>
  </table>

  <p><strong>Why partner with us?</strong></p>
  <ul>
    <li>WHO-GMP & ISO certified manufacturing facilities</li>
    <li>Competitive pricing with flexible MOQs</li>
    <li>Complete regulatory documentation for {{country}}</li>
    <li>Exporting to 40+ countries worldwide</li>
    <li>Dedicated account manager for your region</li>
  </ul>

  <p>I'd love to schedule a brief call to discuss how we can support <strong>{{companyName}}</strong>'s sourcing needs.</p>

  <p style="text-align: center; margin: 24px 0;">
    <a href="{{calendarLink}}" style="display: inline-block; padding: 12px 32px; background: linear-gradient(135deg, #6366f1, #8b5cf6); color: white; text-decoration: none; border-radius: 8px; font-weight: bold;">📅 Schedule a Call</a>
  </p>

  <p>Looking forward to hearing from you!</p>

  <p>
    Best regards,<br/>
    <strong>OMNI-SIGMA Exports Team</strong><br/>
    <span style="color: #666; font-size: 13px;">International Pharmaceutical & Nutraceutical Exports</span>
  </p>
</div>`,
    variables: ["firstName", "companyName", "country", "calendarLink"],
    calendarLink: CALENDAR_LINK,
  },
  {
    id: "email_pharma_followup",
    name: "Pharma - Follow Up Email",
    channel: "email",
    industry: "pharmaceutical",
    subject: "Quick follow up — Pharma export catalog for {{companyName}}",
    body: `<div style="font-family: Arial, sans-serif; color: #333; max-width: 600px;">
  <p>Hi {{firstName}},</p>

  <p>I wanted to follow up on my previous email regarding a potential partnership between <strong>OMNI-SIGMA Exports</strong> and <strong>{{companyName}}</strong>.</p>

  <p>We've recently expanded our product range with new formulations that are seeing strong demand in the {{country}} market:</p>

  <ul>
    <li><strong>Generic formulations</strong> — WHO prequalified, competitive pricing</li>
    <li><strong>Contract manufacturing</strong> — Custom formulations with your branding</li>
    <li><strong>Nutraceutical range</strong> — Vitamins, Minerals, Probiotics, Herbal supplements</li>
    <li><strong>Specialty products</strong> — Oncology, Cardiology, Neurology</li>
  </ul>

  <p>I'd be happy to share our detailed product catalog and pricing sheet for your review.</p>

  <p style="text-align: center; margin: 24px 0;">
    <a href="{{calendarLink}}" style="display: inline-block; padding: 12px 32px; background: linear-gradient(135deg, #10b981, #059669); color: white; text-decoration: none; border-radius: 8px; font-weight: bold;">📅 Book a 15-Min Call</a>
  </p>

  <p>Or simply reply to this email and I'll send the catalog right away.</p>

  <p>
    Warm regards,<br/>
    <strong>OMNI-SIGMA Exports Team</strong>
  </p>
</div>`,
    variables: ["firstName", "companyName", "country", "calendarLink"],
    calendarLink: CALENDAR_LINK,
  },

  // ─── NUTRA-SPECIFIC Templates ──────────────────────────────
  {
    id: "wa_nutra_intro",
    name: "Nutraceutical - First Touch",
    channel: "whatsapp",
    industry: "nutraceutical",
    body: `Hello {{firstName}},

Greetings from *OMNI-SIGMA Nutra Exports* 🌿

We noticed *{{companyName}}* is active in the nutraceutical/health supplement market in {{country}}.

We specialize in *exporting premium Nutraceutical products*:

🌿 Herbal & Ayurvedic formulations
💊 Vitamins & Minerals (A, B-complex, C, D3, E, Zinc)
🦴 Bone & Joint health (Calcium, Glucosamine)
🧠 Brain & Cognitive health (Omega-3, Ginkgo)
💪 Sports nutrition & Protein supplements
🫀 Heart health (CoQ10, Fish Oil, Garlic extract)

All manufactured in GMP-certified facilities with export documentation.

Would you be open to a quick call to discuss?

📅 *Book a slot:* {{calendarLink}}

Best regards,
OMNI-SIGMA Nutra Team`,
    variables: ["firstName", "companyName", "country", "calendarLink"],
    calendarLink: CALENDAR_LINK,
  },
];

/**
 * Interpolate template variables with lead data
 */
export function interpolateTemplate(
  template: MessageTemplate,
  leadData: Record<string, string>
): { subject?: string; body: string } {
  let body = template.body;
  let subject = template.subject || "";

  const vars: Record<string, string> = {
    ...leadData,
    calendarLink: template.calendarLink,
  };

  for (const [key, value] of Object.entries(vars)) {
    const regex = new RegExp(`\\{\\{${key}\\}\\}`, "g");
    body = body.replace(regex, value || key);
    subject = subject.replace(regex, value || key);
  }

  return { subject: subject || undefined, body };
}

/**
 * Get templates for an industry
 */
export function getTemplatesForIndustry(industry: string, channel?: "whatsapp" | "email"): MessageTemplate[] {
  const lower = industry.toLowerCase();
  let filtered = templates;

  // Match industry
  if (lower.includes("pharma") || lower.includes("medical") || lower.includes("drug") || lower.includes("health")) {
    filtered = templates.filter((t) => t.industry === "pharmaceutical" || t.industry === "nutraceutical");
  } else if (lower.includes("nutra") || lower.includes("supplement") || lower.includes("vitamin")) {
    filtered = templates.filter((t) => t.industry === "nutraceutical" || t.industry === "pharmaceutical");
  } else {
    // Return pharma templates as default (most versatile)
    filtered = templates;
  }

  if (channel) {
    filtered = filtered.filter((t) => t.channel === channel);
  }

  return filtered;
}

/**
 * In-memory templates store that starts with the pre-seeded ones.
 */
let customTemplates: MessageTemplate[] = [...templates];

export async function listTemplates(industry?: string, channel?: "whatsapp" | "email"): Promise<MessageTemplate[]> {
  const isSupabaseConfigured = () => {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    return !!(url && url.startsWith("http") && key && !key.startsWith("your_"));
  };

  if (isSupabaseConfigured()) {
    try {
      const { createClient } = await import("@supabase/supabase-js");
      const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
      let query = sb.from("templates").select();
      if (channel) {
        query = query.eq("channel", channel);
      }
      const { data, error } = await query;
      if (!error && data) {
        return data.map((t: any) => ({
          id: t.id,
          name: t.name,
          channel: t.channel,
          industry: t.industry,
          subject: t.subject || undefined,
          body: t.body,
          variables: t.variables || [],
          calendarLink: t.calendar_link || t.calendarLink || CALENDAR_LINK,
        }));
      }
    } catch (e) {
      console.warn("[TemplatesService] Supabase list failed, using in-memory:", e);
    }
  }

  // Fallback to in-memory
  let list = customTemplates;
  if (channel) {
    list = list.filter((t) => t.channel === channel);
  }
  if (industry) {
    const lower = industry.toLowerCase();
    list = list.filter((t) => t.industry.toLowerCase().includes(lower) || lower.includes(t.industry.toLowerCase()));
  }
  return list;
}

export async function getTemplateById(id: string): Promise<MessageTemplate | null> {
  const isSupabaseConfigured = () => {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    return !!(url && url.startsWith("http") && key && !key.startsWith("your_"));
  };

  if (isSupabaseConfigured()) {
    try {
      const { createClient } = await import("@supabase/supabase-js");
      const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
      const { data, error } = await sb.from("templates").select().eq("id", id).single();
      if (!error && data) {
        return {
          id: data.id,
          name: data.name,
          channel: data.channel,
          industry: data.industry,
          subject: data.subject || undefined,
          body: data.body,
          variables: data.variables || [],
          calendarLink: data.calendar_link || data.calendarLink || CALENDAR_LINK,
        };
      }
    } catch (e) {
      console.warn("[TemplatesService] Supabase get failed, using in-memory:", e);
    }
  }

  return customTemplates.find((t) => t.id === id) || null;
}

export async function createTemplate(templateData: Omit<MessageTemplate, "id">): Promise<MessageTemplate> {
  const id = `tpl_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
  const newTpl: MessageTemplate = {
    ...templateData,
    id,
    calendarLink: templateData.calendarLink || CALENDAR_LINK,
  };

  const isSupabaseConfigured = () => {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    return !!(url && url.startsWith("http") && key && !key.startsWith("your_"));
  };

  if (isSupabaseConfigured()) {
    try {
      const { createClient } = await import("@supabase/supabase-js");
      const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
      const { error } = await sb.from("templates").insert({
        id,
        name: newTpl.name,
        channel: newTpl.channel,
        industry: newTpl.industry,
        subject: newTpl.subject || null,
        body: newTpl.body,
        variables: newTpl.variables,
        calendar_link: newTpl.calendarLink,
      });
      if (!error) {
        console.log("[TemplatesService] Created template in Supabase:", id);
      } else {
        console.warn("[TemplatesService] Supabase insert failed:", error.message);
      }
    } catch (e) {
      console.warn("[TemplatesService] Supabase create failed, using in-memory:", e);
    }
  }

  customTemplates.push(newTpl);
  return newTpl;
}

export async function updateTemplate(id: string, updates: Partial<MessageTemplate>): Promise<MessageTemplate | null> {
  const isSupabaseConfigured = () => {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    return !!(url && url.startsWith("http") && key && !key.startsWith("your_"));
  };

  if (isSupabaseConfigured()) {
    try {
      const { createClient } = await import("@supabase/supabase-js");
      const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
      const { error } = await sb.from("templates").update({
        name: updates.name,
        channel: updates.channel,
        industry: updates.industry,
        subject: updates.subject || null,
        body: updates.body,
        variables: updates.variables,
        calendar_link: updates.calendarLink,
      }).eq("id", id);
      if (!error) {
        console.log("[TemplatesService] Updated template in Supabase:", id);
      } else {
        console.warn("[TemplatesService] Supabase update failed:", error.message);
      }
    } catch (e) {
      console.warn("[TemplatesService] Supabase update failed, using in-memory:", e);
    }
  }

  const idx = customTemplates.findIndex((t) => t.id === id);
  if (idx !== -1) {
    customTemplates[idx] = {
      ...customTemplates[idx],
      ...updates,
      id, // Preserve ID
    };
    return customTemplates[idx];
  }

  return null;
}

export async function deleteTemplate(id: string): Promise<boolean> {
  const isSupabaseConfigured = () => {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    return !!(url && url.startsWith("http") && key && !key.startsWith("your_"));
  };

  if (isSupabaseConfigured()) {
    try {
      const { createClient } = await import("@supabase/supabase-js");
      const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
      const { error } = await sb.from("templates").delete().eq("id", id);
      if (!error) {
        console.log("[TemplatesService] Deleted template in Supabase:", id);
      } else {
        console.warn("[TemplatesService] Supabase delete failed:", error.message);
      }
    } catch (e) {
      console.warn("[TemplatesService] Supabase delete failed, using in-memory:", e);
    }
  }

  const idx = customTemplates.findIndex((t) => t.id === id);
  if (idx !== -1) {
    customTemplates.splice(idx, 1);
    return true;
  }
  return false;
}

