# Order Now button + top-bar fulfillment switcher

All changes stay on the landing page in this project. The menu site (damascene.vercel.app) is not touched.

## 1. Hero: "Order Now" button above "Change Order Mode"

Once a choice is saved, the hero shows two stacked buttons:

- **Order Now** (primary, gold) — goes straight to the menu site using the saved choice: the selected branch's ordering URL for pickup/drive-thru, or the main menu URL for delivery. No modal, no re-picking.
- **Change Order Mode** (secondary, outlined gold) — opens the selector as it does today.

Before any choice exists, only one button shows: **Order Now**, which opens the selector first (current behaviour).

## 2. Top bar: fulfillment icon + white-themed switcher

The top status bar keeps the saved mode, but tapping it no longer opens the dark modal. Instead:

- Left side of the bar shows the mode icon — car for Drive-Thru, storefront for counter Pickup, scooter for Delivery — next to the mode name and branch/address, with a chevron.
- Tapping it opens a small **light/white popover** panel (matching the menu site's white look, not the dark hero theme): white surface, soft shadow, dark text, gold accent on the active row.
- Panel contents: two rows, "Pickup / Drive-Thru" and "Delivery", with the current one marked active. Choosing a row opens the matching step of the existing selector (branch list or map picker) so the user can change branch or address.
- Panel closes on outside click and Escape.

## 3. Selector shows on every visit

The selector currently appears only once per browser session. It will open on every page load, pre-filled with the saved choice so returning users can just confirm or close it.

## Technical notes

- Single file for the hero/bar/popover work: `src/routes/index.tsx`. The white popover goes in a new small component file, `src/components/FulfillmentSwitcher.tsx`, with its own light-surface classes so it doesn't inherit the dark tokens.
- Existing `PickupFulfillment` and `DeliveryLocationPicker` components are reused unchanged; the popover only sets which step the modal opens on.
- Reuse the stored `alkhal_fulfillment` object in localStorage for the Order Now destination; drop the `alkhal_fulfillment_seen` sessionStorage gate for item 3.
