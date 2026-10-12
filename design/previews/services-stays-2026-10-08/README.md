# ThinThai Services + lodging — UX/UI concepts

Created 2026-10-08 with built-in imagegen. Eight mobile screens in three raster boards; design concepts only, no application code or real integrations changed.

## Boards
- thinthai-services-discovery-v1.png: discover services, cleaning details, package and appointment. Fixed-price example: 500 THB/room, room 101, 20 October 2026 10:00–12:00. Availability requires provider acceptance.
- thinthai-services-quotation-v1.png: describe repair, review quote, confirm agreed appointment. Room 102, 21 October 2026 13:00–14:00. Labor 500 + materials 250 + travel 100 = 850 THB. Quote QT-DEMO-001.
- thinthai-services-tracking-v1.png: work progress and inspection. Booking SV-DEMO-001. Work status and payment status must remain separate; acceptance does not automatically charge the customer.

## Design direction / generation specifications
Thai-first, large readable controls, complete front-on mobile screens, ivory background, teal #00695C, deep green #123F37 and gold #F2B66D. Discovery covers cleaning, repair, laundry and rental. Lodging is the service location for a property manager, not room accommodation sold in the service price. Scope, travel costs, appointment status and changes requiring quotation approval are explicit. Final boards use previous generated boards as visual references.

## Implementation notes
All people, providers, properties, photos, prices and timestamps are illustrative. Confirm Thai text and date formatting during implementation. Use the actual project logo and design-system assets rather than extracting generated logo pixels. The tracking illustration says closing after payment: implement independent work-completion and payment state machines, with separate settlement status. Guest requests must respect property permissions. Tablet and desktop responsive layouts still require implementation and validation. These raster images are not interactive prototypes.
