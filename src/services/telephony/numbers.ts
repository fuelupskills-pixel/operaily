import telnyx from "telnyx";

let client: any;
function getClient() {
  if (!client) {
    const apiKey = process.env.TELNYX_API_KEY;
    if (!apiKey || apiKey === "your_telnyx_api_key") {
      throw new Error("TELNYX_API_KEY is not configured.");
    }
    // @ts-ignore
    client = telnyx(apiKey);
  }
  return client;
}

export interface SearchNumbersOptions {
  countryCode?: string;
  limit?: number;
  features?: ("sms" | "voice" | "mms" | "fax")[];
}

/**
 * Search for available phone numbers to purchase.
 */
export async function searchNumbers(options: SearchNumbersOptions = {}) {
  const t = getClient();
  const { countryCode = "US", limit = 10, features = ["sms", "voice"] } = options;

  try {
    const response = await t.availablePhoneNumbers.list({
      filter: {
        country_code: countryCode,
        features,
      },
      page: { size: limit },
    });
    
    return response.data;
  } catch (error: any) {
    console.error("[Telephony/Numbers] Error searching numbers:", error);
    throw new Error(error.message || "Failed to search for available numbers");
  }
}

/**
 * Purchase a specific phone number.
 */
export async function purchaseNumber(phoneNumber: string) {
  const t = getClient();
  try {
    const response = await t.numberOrders.create({
      phone_numbers: [{ phone_number: phoneNumber }],
    });
    return response.data;
  } catch (error: any) {
    console.error("[Telephony/Numbers] Error purchasing number:", error);
    throw new Error(error.message || `Failed to purchase number: ${phoneNumber}`);
  }
}

/**
 * Assign a purchased number to a user or team in the system.
 * (This is a stub for the database logic to link the number to our internal `users` or `teams` table).
 */
export async function assignNumberToUser(phoneNumber: string, userId: string) {
  // TODO: Insert/Update record in the database
  // Example: await db.virtual_numbers.insert({ phone_number: phoneNumber, user_id: userId })
  
  console.log(`[Telephony/Numbers] Mock assigned number ${phoneNumber} to user ${userId}`);
  return { success: true, phoneNumber, userId };
}
