// OMNI-SIGMA 360 — Vyapaar API Integration Service
// Handles synchronization of invoices and payments with Vyapaar App

export interface VyapaarInvoice {
  invoice_number: string;
  client_name: string;
  amount: number;
  date: string;
  status: string;
  items?: Array<{ name: string; quantity: number; price: number }>;
}

export class VyapaarService {
  private apiEndpoint: string = "https://api.vyapaarapp.com/v1";

  private getApiKey(): string | null {
    return process.env.VYAPAAR_API_KEY || null;
  }

  /**
   * Sync a local invoice to Vyapaar
   */
  async syncInvoice(invoice: any): Promise<boolean> {
    const apiKey = this.getApiKey();
    if (!apiKey || apiKey === "your_vyapaar_api_key") {
      console.warn("[Vyapaar] API Key not set or default placeholder. Skipping live sync.");
      return false;
    }

    try {
      console.log(`[Vyapaar] Syncing invoice ${invoice.number || invoice.invoice_number}...`);
      
      const payload = {
        invoice_number: invoice.number || invoice.invoice_number,
        customer_name: invoice.client || invoice.client_name,
        amount: invoice.amount,
        invoice_date: invoice.date || new Date().toISOString().split("T")[0],
        status: invoice.status === "paid" ? "PAID" : "UNPAID",
        items: invoice.items || [
          {
            item_name: "B2B Outreach / Sales CRM services",
            quantity: 1,
            price: invoice.amount
          }
        ]
      };

      const response = await fetch(`${this.apiEndpoint}/invoices`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`[Vyapaar] API error (${response.status}):`, errorText);
        return false;
      }

      const resData = await response.json();
      console.log("[Vyapaar] Invoice synced successfully:", resData);
      return true;
    } catch (error) {
      console.error("[Vyapaar] Sync error:", error);
      return false;
    }
  }

  /**
   * Fetch latest status for invoices
   */
  async fetchStatusUpdates(): Promise<any[]> {
    const apiKey = this.getApiKey();
    if (!apiKey || apiKey === "your_vyapaar_api_key") return [];

    try {
      console.log("[Vyapaar] Fetching status updates from Vyapaar...");
      const response = await fetch(`${this.apiEndpoint}/invoices`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json"
        }
      });

      if (!response.ok) return [];
      const data = await response.json();
      return data.invoices || [];
    } catch (err) {
      console.error("[Vyapaar] Fetch status error:", err);
      return [];
    }
  }
}

let vyapaarServiceInstance: VyapaarService | null = null;

export function getVyapaarService(): VyapaarService {
  if (!vyapaarServiceInstance) {
    vyapaarServiceInstance = new VyapaarService();
  }
  return vyapaarServiceInstance;
}
