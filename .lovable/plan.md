

# Fix: WhatsApp Notifications Not Arriving (Wrong Phone Format)

## Problem Found

Looking at the Z-API logs, the messages are being sent to phone number **`55351961395247`** which is WRONG.

- Admin phone is `351961395247` (Portugal, country code +351)
- The `send-whatsapp-notification` function automatically prepends `55` (Brazil code) to any number not starting with `55`
- Result: `55` + `351961395247` = `55351961395247` -- an invalid number
- Z-API accepts the request (returns success + messageId) but the message never arrives because the destination number doesn't exist

## Root Cause

In `supabase/functions/send-whatsapp-notification/index.ts`, line ~80:

```typescript
const phoneFormatted = phoneClean.startsWith("55") ? phoneClean : `55${phoneClean}`;
```

This logic assumes ALL numbers are Brazilian. Portuguese numbers (or any international number) get incorrectly prefixed with `55`.

## Solution

### Option A (Recommended): Smart country code detection

Update the phone formatting logic to handle international numbers properly:

- If number already starts with a known country code (e.g., `351` for Portugal, `55` for Brazil), use it as-is
- If number starts with `55` (Brazil), keep as-is
- If number has 10-11 digits (Brazilian format without country code), prepend `55`
- Otherwise, use number as-is (assume it already includes country code)

### Changes

**File: `supabase/functions/send-whatsapp-notification/index.ts`**

Replace the phone formatting block with:

```typescript
// Format phone: remove non-digits
const phoneClean = phone.replace(/\D/g, "");

// Smart country code detection:
// - If starts with "55" and has 12-13 digits: Brazilian number, keep as-is
// - If has 10-11 digits (no country code): assume Brazilian, prepend "55"  
// - Otherwise: international number, keep as-is (already has country code)
let phoneFormatted: string;
if (phoneClean.startsWith("55") && (phoneClean.length === 12 || phoneClean.length === 13)) {
  phoneFormatted = phoneClean; // Brazilian with country code
} else if (phoneClean.length === 10 || phoneClean.length === 11) {
  phoneFormatted = `55${phoneClean}`; // Brazilian without country code
} else {
  phoneFormatted = phoneClean; // International or already formatted
}
```

This ensures:
- `351961395247` (Portugal) stays as `351961395247` (12 digits, not starting with 55)
- `18997427195` (Brazil, 11 digits) becomes `5518997427195`
- `5518997427195` (Brazil with code) stays as-is

### Also update `notify-admin-registration/index.ts`

The `ADMIN_PHONE` constant is already correct (`351961395247`), no change needed there.

## Expected Result

After this fix, the Z-API will send to `351961395247` instead of `55351961395247`, and the messages will arrive on the Portuguese WhatsApp number.

