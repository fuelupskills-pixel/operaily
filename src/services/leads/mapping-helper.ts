// Column mapping helper for dynamic Excel/CSV imports

export interface CRMField {
  key: string;
  label: string;
  description: string;
  required?: boolean;
  synonyms: string[];
}

export const CRM_FIELDS: CRMField[] = [
  {
    key: "firstName",
    label: "First Name",
    description: "The lead's first or given name",
    required: true,
    synonyms: ["first name", "firstname", "first", "fname", "f name", "given name", "given_name", "first_name"],
  },
  {
    key: "lastName",
    label: "Last Name",
    description: "The lead's last name or surname",
    synonyms: ["last name", "lastname", "last", "lname", "l name", "surname", "family name", "family_name", "last_name"],
  },
  {
    key: "email",
    label: "Email Address",
    description: "The primary email address for communication",
    required: true,
    synonyms: ["email", "email address", "email_address", "e-mail", "e_mail", "mail", "emailaddr", "email_addr"],
  },
  {
    key: "phone",
    label: "Phone Number",
    description: "Primary telephone/phone number",
    synonyms: ["phone", "phone number", "phonenumber", "phone_number", "telephone", "tel", "mobile", "cell", "contact number", "contact_number"],
  },
  {
    key: "whatsapp",
    label: "WhatsApp Number",
    description: "WhatsApp phone number for direct chat sync",
    synonyms: ["whatsapp", "whats app", "wa", "whatsapp number", "whatsapp_number", "whatsappnumber", "wa_number"],
  },
  {
    key: "companyName",
    label: "Company Name",
    description: "The organization or employer name",
    synonyms: ["company", "company name", "companyname", "company_name", "organization", "org", "business", "business name", "business_name", "employer"],
  },
  {
    key: "designation",
    label: "Designation / Role",
    description: "Job title, role, or position at the company",
    synonyms: ["designation", "role", "title", "job title", "jobtitle", "job_title", "position", "occupation"],
  },
  {
    key: "website",
    label: "Website",
    description: "Company or personal website URL",
    synonyms: ["website", "web", "url", "site", "website url", "website_url", "domain", "company website", "homepage"],
  },
  {
    key: "city",
    label: "City",
    description: "City of residence or operations",
    synonyms: ["city", "town", "locality", "city/town", "billing city", "shipping city"],
  },
  {
    key: "country",
    label: "Country",
    description: "Country of residence or operations",
    synonyms: ["country", "nation", "region", "billing country", "shipping country"],
  },
  {
    key: "industry",
    label: "Industry",
    description: "Business sector or vertical",
    synonyms: ["industry", "sector", "vertical", "business sector", "business type"],
  },
  {
    key: "address",
    label: "Full Address",
    description: "Street address or full location details",
    synonyms: ["address", "street", "street address", "street_address", "location", "full address", "billing address"],
  },
  {
    key: "linkedinUrl",
    label: "LinkedIn Profile",
    description: "URL link to their LinkedIn profile",
    synonyms: ["linkedin", "linkedin url", "linkedin_url", "linkedin profile", "linkedin_profile", "linkedin link"],
  },
];

/**
 * Automatically suggests a CRM field mapping for a given file header
 */
export function detectFieldMapping(header: string): string | null {
  const cleanHeader = header.trim().toLowerCase().replace(/[^a-z0-9\s-_]/g, "");

  // 1. Exact match with clean header or key
  for (const field of CRM_FIELDS) {
    if (field.key.toLowerCase() === cleanHeader) return field.key;
  }

  // 2. Exact match with synonyms
  for (const field of CRM_FIELDS) {
    if (field.synonyms.includes(cleanHeader)) return field.key;
  }

  // 3. Partial match (e.g. contains "email" or "phone")
  for (const field of CRM_FIELDS) {
    for (const synonym of field.synonyms) {
      if (
        cleanHeader.includes(synonym) &&
        synonym.length > 3 // Avoid matching tiny fragments
      ) {
        return field.key;
      }
    }
  }

  return null;
}
