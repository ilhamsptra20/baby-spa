# Build Interactive Prototype — Baby Spa Management System

You are a senior frontend engineer responsible for building an interactive prototype for a **Baby Spa Management System**.

Before writing code, read the entire `PRD.md` in the repository root.

Treat `PRD.md` as the **primary source of truth** for product requirements, business flow, role boundaries, domain concepts, and scope.

Do not implement features that contradict the PRD.

---

# Main Objective

Build a polished, responsive, interactive prototype that can be demonstrated directly to a client.

This is **not a production implementation yet**.

The primary goal is to validate:

* business workflow;
* booking experience;
* administrator workflow;
* therapist workflow;
* treatment/package concept;
* therapist assignment process;
* scheduling visibility;
* visual direction;
* client expectations.

The prototype should feel like a real application even though the data may be mocked.

---

# Technology

Use:

* Next.js App Router
* TypeScript
* React
* Tailwind CSS
* mock/static data
* client-side interaction where needed

Use the latest stable versions already available in the project.

Do not introduce a backend unless one already exists and is required.

Do not introduce:

* Prisma
* PostgreSQL
* Redis
* authentication providers
* queues
* payment gateway
* real WhatsApp API

for this prototype.

---

# TypeScript Requirements

Use:

```text
strict: true
```

Do not use:

```text
any
```

Use explicit domain types.

Prefer:

```ts
Booking
BookingAssignment
Treatment
Package
Therapist
Customer
Baby
```

over generic untyped objects.

---

# Architecture Principles

Do not put all code inside pages.

Keep page files thin.

Prefer a structure similar to:

```text
src/
├── app/
│   ├── (customer)/
│   ├── admin/
│   └── therapist/
│
├── modules/
│   ├── booking/
│   ├── baby/
│   ├── customer/
│   ├── therapist/
│   ├── treatment/
│   ├── package/
│   └── notification/
│
├── ui/
├── mocks/
├── services/
├── repositories/
├── types/
├── utils/
└── constants/
```

Feature-specific code should stay close to its domain.

Avoid unnecessary abstraction.

Do not create architecture only for theoretical future use.

---

# Important Domain Rule

A **Booking** and a **Therapist Assignment** are separate concepts.

Do not design the prototype assuming every booking immediately has a therapist.

Correct conceptual flow:

```text
Booking
   ↓
Admin Review
   ↓
Therapist Assignment
```

A booking can remain pending without a therapist.

---

# Core Roles

Build three distinct experiences.

## 1. Customer

Customer can:

* view home page;
* browse treatments;
* browse packages;
* view treatment/package detail;
* create a booking;
* select baby;
* select date;
* select time;
* add optional notes;
* submit booking;
* see booking success;
* view booking history;
* view booking detail/status.

Customer **must not choose a therapist**.

---

## 2. Admin

Admin can:

* view dashboard;
* view booking statistics;
* view booking list;
* filter bookings;
* open booking detail;
* see customer information;
* see baby information;
* see selected treatment/package;
* see booking date/time;
* inspect therapist availability;
* assign therapist;
* change assigned therapist;
* simulate booking confirmation;
* simulate WhatsApp notification;
* mark booking as in progress;
* mark booking as completed;
* view therapist list;
* view basic therapist schedules;
* view treatments;
* view packages;
* view calendar/schedule.

Admin is the operational controller.

---

## 3. Therapist

Therapist can:

* view dashboard;
* view today's appointments;
* view upcoming schedule;
* open assigned booking detail;
* view relevant baby/customer information;
* view treatment/package detail;
* view customer notes;
* view personal treatment history.

Therapist cannot:

* edit bookings;
* manage prices;
* create treatments;
* assign therapists;
* see other therapists' private schedules;
* access administrative features.

---

# Primary Demo Scenario

This scenario must work end-to-end.

Use the following example data.

Customer:

```text
Nadia
```

Baby:

```text
Aisyah
```

Package:

```text
Happy Baby Package
```

Date:

```text
12 August 2026
```

Time:

```text
10:00
```

Therapist:

```text
Siti Rahma
```

Expected flow:

```text
1. Customer opens landing page.

2. Customer browses packages.

3. Customer opens Happy Baby Package.

4. Customer clicks Book Now.

5. Customer selects baby Aisyah.

6. Customer selects 12 August 2026.

7. Customer selects 10:00.

8. Customer optionally enters a note.

9. Customer reviews booking.

10. Customer submits booking.

11. Booking is created as PENDING.

12. Show booking success screen.

13. Booking appears in Admin → Bookings.

14. Admin opens booking detail.

15. Admin sees available therapists.

16. Siti Rahma is available.

17. At least one other therapist must be unavailable due to schedule conflict.

18. Admin assigns Siti Rahma.

19. Booking becomes CONFIRMED.

20. Show simulated notification result:

    ✓ Therapist assigned
    ✓ Booking confirmed
    ✓ WhatsApp notification sent

21. Siti opens therapist dashboard.

22. The new booking appears in her schedule.

23. Booking detail is accessible from therapist dashboard.

24. Admin marks treatment as COMPLETED.

25. Completed booking appears in customer's history.

26. Completed treatment appears in Siti's history.
```

This is the most important prototype flow.

Prioritize this before secondary screens.

---

# Booking Status

Use:

```ts
type BookingStatus =
  | "PENDING"
  | "CONFIRMED"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "CANCELLED"
  | "NO_SHOW";
```

UI labels should use Indonesian:

```text
PENDING       → Menunggu Konfirmasi
CONFIRMED     → Dikonfirmasi
IN_PROGRESS   → Sedang Berlangsung
COMPLETED     → Selesai
CANCELLED     → Dibatalkan
NO_SHOW       → Tidak Hadir
```

Use reusable status badges.

---

# Treatments

Create realistic baby spa treatments.

Minimum example treatments:

```text
Baby Massage
Baby Swim
Baby Gym
Baby Haircut / Grooming
Mom & Baby Relaxation
```

Each treatment should have:

* id;
* slug;
* name;
* description;
* duration;
* price;
* image;
* active status.

Use realistic Indonesian Rupiah prices.

---

# Packages

Packages must be separate from treatments.

Example:

```text
Happy Baby Package
```

contains:

```text
1. Baby Gym
2. Baby Swim
3. Baby Massage
```

Display:

* package name;
* description;
* included treatments;
* treatment sequence;
* total duration;
* original combined value if useful;
* package price;
* booking CTA.

Create at least 3 sample packages.

---

# Customer UI

Create the following customer-facing routes.

```text
/
```

Landing page.

Sections:

* navigation;
* hero;
* short baby spa introduction;
* featured treatments;
* featured packages;
* why choose us;
* simple booking CTA;
* footer.

Do not make the interface excessively childish.

---

```text
/treatments
```

Treatment listing.

---

```text
/treatments/[slug]
```

Treatment detail.

---

```text
/packages
```

Package listing.

---

```text
/packages/[slug]
```

Package detail.

---

```text
/booking
```

Create a multi-step booking interface.

Preferred steps:

```text
1. Layanan
2. Anak
3. Tanggal & Waktu
4. Catatan
5. Konfirmasi
```

Do not include therapist selection.

---

```text
/booking/success
```

Display:

* success state;
* booking number;
* baby;
* package/treatment;
* schedule;
* current status.

Include message:

```text
Admin akan mengkonfirmasi jadwal dan menentukan terapis.
```

---

```text
/bookings
```

Customer booking history.

---

```text
/bookings/[id]
```

Booking detail.

Display a timeline similar to:

```text
Booking Dibuat
      ↓
Menunggu Konfirmasi
      ↓
Jadwal Dikonfirmasi
      ↓
Terapis Ditentukan
      ↓
Treatment Selesai
```

---

# Admin UI

Admin UI should prioritize clarity and operational speed.

Create a dedicated admin layout with:

```text
Sidebar
Header
Page title
Main content
```

Navigation:

```text
Dashboard
Bookings
Calendar
Customers
Babies
Therapists
Treatments
Packages
```

---

# Admin Dashboard

Route:

```text
/admin/dashboard
```

Create summary cards:

```text
Booking Hari Ini
Menunggu Konfirmasi
Treatment Selesai
Terapis Bertugas
```

Also show:

* today's bookings;
* pending booking list;
* therapist availability summary.

Use charts only if they provide clear value.

Do not clutter the prototype.

---

# Admin Booking List

Route:

```text
/admin/bookings
```

Include filters:

```text
Semua
Pending
Dikonfirmasi
Hari Ini
Selesai
Dibatalkan
```

Columns:

```text
Booking
Baby
Customer
Layanan
Tanggal
Jam
Terapis
Status
Action
```

Use mock interaction for filtering.

---

# Admin Booking Detail

Route:

```text
/admin/bookings/[id]
```

Sections:

```text
Booking Information
Customer
Baby
Service
Schedule
Customer Notes
Assigned Therapist
Timeline
```

Primary admin actions:

```text
Konfirmasi
Assign Terapis
Ganti Terapis
Mulai Treatment
Selesaikan Treatment
Batalkan Booking
```

Use dialogs/drawers where appropriate.

---

# Therapist Assignment Interaction

This is one of the key demo moments.

When admin clicks:

```text
Assign Terapis
```

show a dialog or side panel containing therapists.

Example:

```text
Siti Rahma
Available
08:00 - 12:00

Rina Putri
Available
10:00 - 16:00

Dewi Lestari
Tidak tersedia
09:30 - 11:00
```

Unavailable therapists should:

* appear disabled;
* show why they are unavailable.

Example:

```text
Bentrok dengan booking BS-000119
09:30 - 11:00
```

After successful assignment show:

```text
Terapis berhasil ditugaskan

✓ Siti Rahma assigned
✓ Booking dikonfirmasi
✓ Notifikasi WhatsApp terkirim
```

This is simulated.

---

# Availability Logic

Implement simple reusable mock business logic.

Do not put the logic directly inside UI components.

Create something conceptually similar to:

```ts
getAvailableTherapists({
  date,
  startTime,
  durationMinutes,
});
```

A therapist is unavailable when an existing active booking overlaps.

Basic overlap:

```text
newStart < existingEnd
AND
newEnd > existingStart
```

Do not overcomplicate availability rules in the prototype.

---

# Admin Calendar

Route:

```text
/admin/calendar
```

Provide a useful operational schedule.

Prefer:

```text
Day
Week
```

Month view is optional.

Display:

* time;
* baby;
* service;
* therapist;
* status.

The calendar does not need an enterprise-grade scheduling library unless already available.

A clean custom prototype is acceptable.

---

# Therapist Management

Route:

```text
/admin/therapists
```

Show therapist cards/table:

* photo/avatar;
* name;
* active status;
* today's appointments;
* availability;
* view schedule;
* view history.

Use realistic mock data.

---

# Treatment Management

Route:

```text
/admin/treatments
```

Prototype CRUD interactions:

* create;
* edit;
* disable.

These can operate on local state/mock data.

---

# Package Management

Route:

```text
/admin/packages
```

Display packages and package items.

Prototype editor should demonstrate:

* name;
* description;
* included treatments;
* order;
* price;
* active status.

Full persistence is not required.

---

# Therapist Dashboard

Route:

```text
/therapist/dashboard
```

Design mobile-first.

Primary content:

```text
Jadwal Hari Ini
```

Example:

```text
10:00
Aisyah
Happy Baby Package
90 menit

13:30
Rafa
Baby Massage
45 menit
```

Also show:

```text
Jadwal Berikutnya
Treatment Selesai Bulan Ini
```

Avoid unnecessary business metrics.

---

# Therapist Schedule

Route:

```text
/therapist/schedule
```

Display:

* date;
* start time;
* end time;
* baby;
* service;
* status.

Allow switching between:

```text
Hari Ini
Mendatang
```

or a simple calendar/list view.

---

# Therapist Booking Detail

Display only information needed to perform treatment.

Include:

* baby name;
* baby age;
* customer/guardian name;
* treatment/package;
* duration;
* treatment sequence;
* schedule;
* customer notes;
* admin notes if applicable.

Do not expose unnecessary sensitive information.

---

# Therapist History

Route:

```text
/therapist/history
```

Display completed treatments.

Example:

```text
8 Aug 2026
Baby Massage
Naira
Selesai

7 Aug 2026
Baby Swim
Rafa
Selesai

5 Aug 2026
Happy Baby Package
Aisyah
Selesai
```

Do not implement therapist ratings yet.

However, design the history structure so it can eventually support:

```text
rating
reviews
total treatments
therapist performance
```

---

# WhatsApp Notification

Do not integrate a real WhatsApp service.

Create a mock notification service.

Concept:

```text
assignTherapist()
       ↓
sendTherapistAssignmentNotification()
```

Simulate:

```ts
{
  success: true,
  channel: "whatsapp",
  message: "Notification sent"
}
```

Keep the mock implementation separate from the UI.

This should make it easy to replace later with a real WhatsApp provider.

---

# Mock Data

Create realistic Indonesian sample data.

Minimum:

```text
5 customers
7 babies
5 therapists
5 treatments
3 packages
15+ bookings
```

Use Indonesian names.

Example therapists:

```text
Siti Rahma
Rina Putri
Dewi Lestari
Ayu Maharani
Fitri Nuraini
```

Example customers:

```text
Nadia Pratama
Rani Amelia
Putri Maharani
Dinda Saputri
Salsabila Rahma
```

Booking statuses must vary.

Ensure at least one therapist has an intentional scheduling conflict.

---

# Data State

For prototype interaction, use one clear in-memory/mock state strategy.

Do not scatter independent copies of booking data across pages.

State changes such as:

```text
PENDING → CONFIRMED
therapist assignment
CONFIRMED → COMPLETED
```

should be reflected throughout the prototype during the active browser session when practical.

Use the simplest clean solution.

Do not add Redux just because state exists.

---

# Visual Design Direction

This is a baby spa product.

Customer-facing design should feel:

```text
clean
calm
soft
warm
premium
trustworthy
modern
```

Avoid:

```text
cartoon-heavy
toy-like
overly pink
excessive gradients
excessive rounded cards
excessive shadows
```

Suggested visual palette:

```text
Ivory
Warm White
Soft Sage
Beige
Dusty Pink
Muted Baby Blue
Dark Neutral Text
```

Maintain good contrast.

---

# Typography

Use a clean modern sans-serif.

Headings may have slightly softer character.

Do not use decorative children's fonts.

Typography hierarchy must be clear.

---

# Customer Responsive Strategy

Customer interface:

```text
Mobile First
```

Prioritize:

* easy booking;
* large tap targets;
* readable service cards;
* simple booking stepper;
* fixed booking CTA where appropriate.

---

# Therapist Responsive Strategy

Therapist interface:

```text
Mobile First
```

Therapists should immediately understand:

```text
Who?
What?
When?
How long?
Any notes?
```

within seconds.

---

# Admin Responsive Strategy

Admin interface:

```text
Desktop First
```

But must remain usable on tablets and smaller screens.

Use responsive tables or card conversion when appropriate.

---

# UX Rules

Use:

* loading states;
* empty states;
* success states;
* disabled states;
* confirmation dialogs;
* toast notifications;
* clear validation.

Forms should not fail silently.

Avoid excessive confirmation prompts.

---

# Formatting

Use Indonesian formatting:

Currency:

```text
Rp175.000
```

Dates:

```text
12 Agustus 2026
```

Time:

```text
10.00
```

Use reusable format utilities.

---

# Images

Use appropriate royalty-free placeholder baby spa imagery or high-quality remote placeholder images.

Do not use random unrelated stock photos.

The prototype should visually communicate:

```text
baby care
massage
relaxation
professional treatment
warm parent experience
```

If external images introduce technical complexity, use stable placeholder assets locally.

---

# Reusable UI

Create reusable components where clear repetition exists.

Examples:

```text
StatusBadge
ServiceCard
PackageCard
BookingCard
PageHeader
EmptyState
TherapistAvailabilityCard
BookingTimeline
StatCard
ConfirmDialog
Toast
```

Do not create a component abstraction for every small HTML element.

---

# Important Non-Goals

Do not implement:

* payment gateway;
* real WhatsApp;
* production authentication;
* OAuth;
* registration verification;
* email verification;
* password recovery;
* accounting;
* inventory;
* payroll;
* memberships;
* promo engine;
* automatic scheduling;
* therapist review;
* therapist rating;
* customer therapist selection;
* multi-branch;
* complex permissions;
* backend infrastructure.

Unless explicitly requested later.

---

# Future Compatibility

Although these features are out of scope, do not make decisions that make them impossible later:

```text
therapist rating
therapist reviews
request preferred therapist
multi-session packages
automatic scheduling
multiple branches
payment integration
```

Do not build them now.

Just keep reasonable domain boundaries.

---

# Route Summary

Implement at minimum:

```text
/
├── treatments
│   └── [slug]
│
├── packages
│   └── [slug]
│
├── booking
│   └── success
│
├── bookings
│   └── [id]
│
├── admin
│   ├── dashboard
│   ├── bookings
│   │   └── [id]
│   ├── calendar
│   ├── customers
│   ├── babies
│   ├── therapists
│   ├── treatments
│   └── packages
│
└── therapist
    ├── dashboard
    ├── schedule
    └── history
```

---

# Implementation Priority

Build in this order.

## Priority 1 — Foundation

* layouts;
* types;
* mocks;
* reusable UI;
* navigation.

## Priority 2 — Customer Flow

* homepage;
* treatment/package discovery;
* booking flow;
* booking success;
* booking history.

## Priority 3 — Admin Flow

* dashboard;
* booking list;
* booking detail;
* therapist availability;
* therapist assignment;
* booking status update.

## Priority 4 — Therapist Flow

* dashboard;
* schedule;
* booking detail;
* history.

## Priority 5 — Polish

* responsive behavior;
* transitions;
* loading states;
* empty states;
* toast;
* realistic mock data;
* client-demo polish.

---

# Acceptance Criteria

Do not consider the task finished until:

1. Application runs without TypeScript errors.
2. Main routes render correctly.
3. Responsive navigation works.
4. Customer can complete the booking flow.
5. Booking starts as PENDING.
6. Admin can locate the new booking.
7. Admin can assign an available therapist.
8. Conflicting therapist is shown as unavailable.
9. Assignment updates booking status.
10. Mock WhatsApp notification appears successful.
11. Therapist can see assigned booking.
12. Admin can mark booking completed.
13. Completed booking appears in relevant history.
14. All three role interfaces are visually distinct.
15. Customer UI works well on mobile.
16. Therapist UI works well on mobile.
17. Admin UI works well on desktop.
18. No use of TypeScript `any`.
19. No major console errors.
20. No dead links in the main demo flow.
21. No fake buttons on the main demo flow.
22. UI looks polished enough to present directly to a client.

---

# Final Development Instruction

Do not stop after generating a skeleton.

Implement the prototype completely enough that the primary client demo scenario can actually be clicked through.

Do not spend time building production infrastructure.

When there is a trade-off, prioritize:

```text
business flow clarity
> client demo quality
> usability
> maintainable frontend structure
> infrastructure sophistication
```

Read `PRD.md` first, then inspect the existing repository before making changes.

Reuse existing project conventions where they are reasonable.

If the repository is empty, initialize the necessary application structure and build the prototype according to this specification.

After implementation:

1. run lint;
2. run TypeScript checks;
3. fix visible runtime errors;
4. verify the primary demo flow manually;
5. summarize what was implemented;
6. list any intentionally mocked functionality.
