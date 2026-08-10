# Product Requirements Document — Baby Spa Management System

**Document Version:** 1.0
**Product Stage:** Interactive Prototype / MVP Validation
**Primary Goal:** Validate business workflow with client before production development
**Target Platform:** Responsive Web Application
**Prototype Stack Recommendation:** Next.js App Router + TypeScript + Mock Data

---

# 1. Product Overview

## 1.1 Product Name

Temporary name:

**Baby Spa Management System**

Product name may be replaced later with the client's actual business/brand name.

---

## 1.2 Background

Baby spa businesses commonly provide individual treatments and treatment packages that customers can reserve based on available dates and time slots.

The business needs a centralized system to handle:

* customer reservations;
* baby/customer information;
* treatment and package management;
* therapist scheduling;
* therapist assignment;
* therapist work schedules;
* treatment history;
* WhatsApp notifications.

In the initial version, customers **do not select therapists directly**.

Customers only select:

* treatment/package;
* baby;
* date;
* time;
* additional notes.

Therapists are assigned by an administrator after verifying therapist availability.

After assignment, the therapist receives a WhatsApp notification and can view the assigned schedule through the therapist dashboard.

The system architecture should allow future expansion into:

* therapist ratings;
* therapist reviews;
* therapist performance history;
* customer-requested therapists;
* automatic therapist recommendations;
* automatic scheduling.

---

# 2. Product Objectives

The product must simplify the operational workflow of a baby spa.

Primary objectives:

1. Allow customers to make reservations online.
2. Allow administrators to manage reservations centrally.
3. Prevent therapist scheduling conflicts.
4. Allow administrators to assign available therapists.
5. Allow therapists to see their work schedules.
6. Store therapist treatment history.
7. Store customer and baby treatment history.
8. Support treatments and treatment packages.
9. Notify therapists when they receive new assignments.
10. Prepare the system architecture for future therapist rating and selection features.

---

# 3. Prototype Objectives

The first implementation is an **interactive prototype**, not a production-ready system.

The prototype exists to validate:

* business process;
* user flow;
* screen structure;
* terminology;
* administrator workflow;
* therapist workflow;
* booking workflow;
* client expectations.

The prototype should feel like a working application but may use mock data.

Real integrations are not mandatory.

Examples:

* WhatsApp notification may be simulated.
* authentication may be simplified;
* database may be replaced with static/mock data;
* payment gateway is not required.

---

# 4. User Roles

The system contains three primary roles.

## 4.1 Customer

Customer is the parent or guardian who books baby spa services.

Customer capabilities:

* browse treatments;
* browse packages;
* view treatment details;
* view package details;
* create baby profiles;
* select baby during booking;
* select treatment/package;
* choose booking date;
* choose booking time;
* add notes;
* submit booking;
* view booking status;
* view booking history.

Customer cannot assign therapists.

Customer cannot select therapists in V1.

---

## 4.2 Administrator

Administrator manages baby spa operations.

Administrator capabilities:

* access dashboard;
* view bookings;
* review pending reservations;
* confirm bookings;
* manage therapist assignments;
* see therapist availability;
* manage therapist profiles;
* manage therapist schedules;
* manage customers;
* manage baby profiles;
* manage treatments;
* manage packages;
* manage booking statuses;
* view treatment history.

Administrator is the primary operational controller.

---

## 4.3 Therapist

Therapist is the person performing baby spa treatments.

Therapist capabilities in V1:

* login;
* view today's schedule;
* view upcoming schedules;
* view booking details assigned to them;
* view treatment/package details;
* view customer/baby information relevant to treatment;
* view treatment notes;
* view personal treatment history.

Therapists cannot:

* create bookings;
* edit customer bookings;
* modify prices;
* manage customers;
* assign themselves;
* assign other therapists;
* edit packages;
* edit treatments;
* access financial reports.

---

# 5. Core Business Flow

Primary booking flow:

```text
Customer
    ↓
Browse Treatment / Package
    ↓
Select Treatment / Package
    ↓
Select Baby
    ↓
Select Date
    ↓
Select Time
    ↓
Submit Booking
    ↓
Booking Status: PENDING
    ↓
Administrator Reviews Booking
    ↓
Administrator Checks Therapist Availability
    ↓
Administrator Assigns Therapist
    ↓
Booking Status: CONFIRMED
    ↓
Therapist Receives WhatsApp Notification
    ↓
Schedule Appears on Therapist Dashboard
    ↓
Treatment Takes Place
    ↓
Booking Status: COMPLETED
    ↓
Treatment Stored in Customer History
    ↓
Treatment Stored in Therapist History
```

---

# 6. Booking Statuses

The system should use explicit booking statuses.

Minimum statuses:

```text
PENDING
CONFIRMED
IN_PROGRESS
COMPLETED
CANCELLED
NO_SHOW
```

Optional future statuses:

```text
WAITING_PAYMENT
RESCHEDULED
```

For prototype UI, labels may be translated into Indonesian.

Example:

| Internal Status | UI Label            |
| --------------- | ------------------- |
| PENDING         | Menunggu Konfirmasi |
| CONFIRMED       | Dikonfirmasi        |
| IN_PROGRESS     | Sedang Berlangsung  |
| COMPLETED       | Selesai             |
| CANCELLED       | Dibatalkan          |
| NO_SHOW         | Tidak Hadir         |

---

# 7. Treatment Management

A treatment represents one baby spa service.

Example:

```text
Baby Massage

Duration: 45 minutes
Price: Rp80.000
```

Required treatment fields:

```text
id
name
slug
description
duration_minutes
price
image
active
created_at
updated_at
```

Example treatments:

* Baby Massage
* Baby Swim
* Baby Gym

Treatments must be manageable by administrators.

---

# 8. Package Management

A package combines one or more treatments.

Example:

```text
Happy Baby Package

Baby Gym
Baby Swim
Baby Massage

Total Duration: 90 minutes
Package Price: Rp175.000
```

Required package fields:

```text
id
name
slug
description
price
image
active
created_at
updated_at
```

Package-treatment relation:

```text
package_items

id
package_id
treatment_id
sequence
quantity
```

The package must preserve treatment ordering.

Example:

```text
Happy Baby Package

1. Baby Gym
2. Baby Swim
3. Baby Massage
```

---

# 9. Package Types

The architecture should support two package concepts.

## 9.1 Single Visit Bundle

Multiple treatments completed during one visit.

Example:

```text
Complete Baby Spa

Baby Gym
Baby Swim
Baby Massage
```

All treatments belong to one booking.

---

## 9.2 Multi-Session Package

A package purchased once but used across multiple visits.

Example:

```text
Baby Massage 4 Sessions

Baby Massage × 4
```

Multi-session package implementation is **not required for prototype V1**, but the domain model should not prevent it from being implemented later.

---

# 10. Baby Profile

Bookings belong to a baby profile.

A customer may have multiple babies.

Example:

```text
Customer:
Siti Rahma

Children:
- Aisyah
- Rafa
```

Suggested baby profile fields:

```text
id
customer_id
name
birth_date
gender
notes
medical_notes
created_at
updated_at
```

Sensitive medical information should only be collected if genuinely required by the baby spa business.

Prototype may use general treatment notes only.

---

# 11. Booking Model

Suggested booking fields:

```text
id
booking_number
customer_id
baby_id

booking_type
treatment_id
package_id

booking_date
start_time
end_time
duration_minutes

status

customer_notes
admin_notes

created_at
updated_at
```

`booking_type` values:

```text
TREATMENT
PACKAGE
```

When:

```text
booking_type = TREATMENT
```

`treatment_id` must be populated.

When:

```text
booking_type = PACKAGE
```

`package_id` must be populated.

---

# 12. Booking Number

Every booking should have a human-readable identifier.

Example:

```text
BS-20260812-001
```

or:

```text
BS-000123
```

The exact format may be finalized later.

---

# 13. Therapist Management

Suggested therapist fields:

```text
id
user_id
name
phone
photo
active
notes
created_at
updated_at
```

Future fields may include:

```text
rating
total_reviews
total_treatments
specializations
```

Calculated values such as rating should preferably not become the primary source of truth.

---

# 14. Therapist Assignment

Booking and therapist assignment must be separate domain concepts.

Do not permanently store therapist assignment only as:

```text
bookings.therapist_id
```

Use an assignment entity.

Suggested structure:

```text
booking_assignments

id
booking_id
therapist_id
status
assigned_by
assigned_at
cancelled_at
notes
created_at
updated_at
```

Suggested assignment statuses:

```text
ASSIGNED
CANCELLED
REASSIGNED
COMPLETED
```

This allows future reassignment history.

Example:

```text
Booking BS-000123

Assignment #1
Therapist: Siti
Status: REASSIGNED

Assignment #2
Therapist: Rina
Status: ASSIGNED
```

---

# 15. Therapist Availability

Therapist availability is a core business rule.

The system must prevent assigning one therapist to overlapping bookings.

Example:

Existing booking:

```text
10:00 - 11:00
```

Invalid new booking:

```text
10:30 - 11:30
```

The same therapist must not be assigned.

---

# 16. Therapist Working Schedule

The architecture should support therapist working schedules.

Suggested structure:

```text
therapist_schedules

id
therapist_id
day_of_week
start_time
end_time
active
```

Example:

```text
Siti

Monday
08:00 - 16:00

Tuesday
08:00 - 16:00

Wednesday
OFF
```

---

# 17. Therapist Time-Off

Future scheduling should support:

```text
therapist_time_off

id
therapist_id
start_datetime
end_datetime
reason
status
```

Examples:

* leave;
* sick;
* personal permission;
* unavailable.

This feature is optional for the prototype but should be considered in architecture.

---

# 18. Therapist Availability Rules

A therapist is considered available if all conditions are true:

1. therapist is active;
2. therapist is scheduled to work;
3. therapist has no overlapping booking;
4. therapist is not on leave/time-off;
5. therapist can perform the requested treatment;
6. enough time exists for the booking duration.

For prototype V1, rules 1 and 3 are mandatory.

Other checks may be simulated.

---

# 19. Therapist Qualification

Future versions may restrict treatments based on therapist qualification.

Possible structure:

```text
therapist_treatments

therapist_id
treatment_id
```

Example:

```text
Siti
✓ Baby Massage
✓ Baby Gym
✗ Baby Swim
```

Qualification enforcement is optional in prototype V1.

---

# 20. WhatsApp Notification

After an administrator assigns a therapist, the system should trigger a notification event.

Logical flow:

```text
Booking Assigned
      ↓
Notification Service
      ↓
WhatsApp Provider
      ↓
Therapist
```

Example therapist message:

```text
Halo Siti,

Anda mendapatkan jadwal Baby Spa baru.

Tanggal: 12 Agustus 2026
Jam: 10:00
Treatment: Happy Baby Package

Silakan buka aplikasi untuk melihat detail jadwal.
```

Prototype may simulate this action.

Example UI:

```text
✓ Therapist assigned
✓ WhatsApp notification sent
```

No real WhatsApp integration is required for prototype V1.

---

# 21. Customer Pages

Required prototype pages:

```text
/
```

Homepage.

Should contain:

* hero section;
* introduction;
* featured treatments;
* featured packages;
* booking CTA.

---

## 21.1 Treatment List

Route:

```text
/treatments
```

Contains:

* treatment image;
* treatment name;
* duration;
* price;
* short description;
* detail button.

---

## 21.2 Treatment Detail

Route:

```text
/treatments/[slug]
```

Contains:

* image;
* title;
* description;
* duration;
* price;
* booking CTA.

---

## 21.3 Package List

Route:

```text
/packages
```

Contains:

* package image;
* package name;
* treatments included;
* duration;
* price;
* booking CTA.

---

## 21.4 Package Detail

Route:

```text
/packages/[slug]
```

Contains:

* package image;
* package name;
* description;
* treatment list;
* total duration;
* package price;
* booking CTA.

---

# 22. Booking Page

Route:

```text
/booking
```

Recommended booking process:

```text
Step 1
Choose Service

Step 2
Choose Baby

Step 3
Choose Date

Step 4
Choose Time

Step 5
Additional Notes

Step 6
Review Booking

Step 7
Submit
```

Customer does **not** choose therapist.

---

# 23. Booking Success

Route:

```text
/booking/success
```

Example:

```text
Booking berhasil dibuat.

Booking ID
BS-000123

Happy Baby Package

12 Agustus 2026
10:00

Status:
Menunggu Konfirmasi

Admin akan mengkonfirmasi jadwal dan menentukan terapis.
```

---

# 24. Customer Booking History

Route:

```text
/bookings
```

Display:

* booking number;
* baby;
* service;
* date;
* time;
* therapist if assigned;
* status.

---

# 25. Customer Booking Detail

Route:

```text
/bookings/[id]
```

Suggested UI timeline:

```text
Booking dibuat
      ↓
Menunggu konfirmasi
      ↓
Jadwal dikonfirmasi
      ↓
Terapis ditentukan
      ↓
Treatment selesai
```

---

# 26. Admin Dashboard

Route:

```text
/admin/dashboard
```

Suggested cards:

```text
Booking Hari Ini
Booking Pending
Booking Selesai Hari Ini
Terapis Bertugas
```

Suggested additional sections:

* today's bookings;
* upcoming bookings;
* pending confirmation;
* therapist status.

---

# 27. Admin Booking Management

Route:

```text
/admin/bookings
```

Filters:

```text
All
Pending
Confirmed
Today
Completed
Cancelled
```

Suggested columns:

```text
Booking ID
Baby
Customer
Service
Date
Time
Therapist
Status
Action
```

---

# 28. Admin Booking Detail

Route:

```text
/admin/bookings/[id]
```

Display:

```text
Booking Information
Customer Information
Baby Information
Service Information
Booking Schedule
Customer Notes
Assigned Therapist
Booking Timeline
```

Available actions:

```text
Confirm Booking
Assign Therapist
Change Therapist
Change Schedule
Cancel Booking
Mark In Progress
Mark Completed
```

Not all actions need to be fully functional in prototype.

---

# 29. Therapist Assignment UI

Administrator should see available therapists.

Example:

```text
Assign Therapist

Siti Rahma
Available
08:00 - 12:00

Rina Putri
Available
10:00 - 16:00

Dewi
Unavailable
09:30 - 11:00
```

Unavailable therapists should be visually disabled.

After selection:

```text
[Assign Therapist]
```

Successful result:

```text
✓ Therapist assigned
✓ Booking confirmed
✓ WhatsApp notification sent
```

---

# 30. Admin Calendar

Route:

```text
/admin/calendar
```

Calendar should provide operational visibility.

Possible views:

```text
Day
Week
Month
```

Prototype only needs a useful day/week schedule visualization.

Bookings should show:

* time;
* baby;
* treatment/package;
* therapist;
* booking status.

---

# 31. Admin Therapist Management

Route:

```text
/admin/therapists
```

Display:

* photo;
* therapist name;
* status;
* today's appointments;
* active/inactive status.

Actions:

```text
View
Edit
View Schedule
View History
```

---

# 32. Admin Treatment Management

Route:

```text
/admin/treatments
```

CRUD prototype:

```text
Create
Read
Update
Disable
```

Hard delete is not required.

---

# 33. Admin Package Management

Route:

```text
/admin/packages
```

Administrator should be able to define:

```text
Package Name
Description
Package Price
Included Treatments
Treatment Order
Active Status
```

---

# 34. Therapist Dashboard

Route:

```text
/therapist/dashboard
```

Dashboard should prioritize today's schedule.

Example:

```text
Jadwal Hari Ini

10:00
Aisyah
Happy Baby Package

13:30
Rafa
Baby Massage
```

Additional information:

```text
Upcoming Schedule
Completed Today
```

---

# 35. Therapist Schedule

Route:

```text
/therapist/schedule
```

Display:

* date;
* time;
* baby;
* treatment/package;
* duration;
* status.

Therapist should only see bookings assigned to them.

---

# 36. Therapist Booking Detail

Suggested data:

```text
Baby Name
Baby Age
Customer Name
Date
Time
Treatment / Package
Treatment Sequence
Customer Notes
Admin Notes
```

Therapist should not see unnecessary sensitive customer information.

---

# 37. Therapist History

Route:

```text
/therapist/history
```

Example:

```text
August 2026

8 Aug
Baby Massage
Naira
Completed

7 Aug
Baby Swim
Rafa
Completed

5 Aug
Happy Baby Package
Aisyah
Completed
```

This history will later become one of the data sources for therapist performance metrics.

---

# 38. Future Therapist Rating

Not part of V1 implementation.

Future flow:

```text
Booking Completed
      ↓
Customer Can Review
      ↓
Rating + Review
      ↓
Stored Against Booking
      ↓
Therapist Aggregate Rating
```

Suggested structure:

```text
therapist_reviews

id
booking_id
therapist_id
customer_id
rating
review
created_at
updated_at
```

Business rules:

1. review requires a completed booking;
2. customer must own the booking;
3. one booking can have at most one customer review;
4. rating range is 1-5;
5. therapist rating should be calculated from legitimate completed bookings.

---

# 39. Future Customer Therapist Request

Customers should not directly choose therapists in V1.

Future feature:

```text
Request Therapist
```

Preferred terminology:

**Request Therapist**

rather than:

**Choose Therapist**

because therapist availability may change.

Future flow:

```text
Customer Requests Therapist
        ↓
Check Availability
        ↓

Available
    ↓
Assign Therapist

Unavailable
    ↓
Offer Different Time
or
Offer Another Therapist
```

A customer should also retain the option:

```text
No Preference
```

This allows admin/system assignment.

---

# 40. Future Automatic Scheduling

Future scheduler may consider:

```text
therapist working hours
therapist leave
existing bookings
treatment duration
treatment qualification
branch
buffer time
customer therapist preference
therapist workload
```

Automatic scheduling is explicitly out of scope for prototype V1.

---

# 41. Navigation Structure

Recommended customer navigation:

```text
Home
Treatments
Packages
My Bookings
Profile
```

Recommended admin sidebar:

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

Recommended therapist navigation:

```text
Dashboard
Schedule
History
Profile
```

---

# 42. Suggested Route Structure

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
├── profile
│   └── babies
│
├── admin
│   ├── dashboard
│   ├── bookings
│   │   └── [id]
│   ├── calendar
│   ├── customers
│   ├── babies
│   ├── therapists
│   │   └── [id]
│   ├── treatments
│   └── packages
│
└── therapist
    ├── dashboard
    ├── schedule
    ├── history
    └── profile
```

---

# 43. Prototype Technical Architecture

Recommended stack:

```text
Next.js
App Router
TypeScript
React
Mock Data
```

Prototype should not require a backend.

Example architecture:

```text
Browser
   ↓
Next.js App Router
   ↓
Mock Services
   ↓
Mock Repository
   ↓
Static JSON / TypeScript Data
```

The UI should not directly depend on hardcoded arrays inside pages.

Prefer:

```text
Page
 ↓
Service
 ↓
Repository
 ↓
Mock Data
```

This will make replacement with a real API easier later.

---

# 44. Recommended Frontend Structure

```text
src/
├── app/
│   ├── (customer)/
│   ├── admin/
│   └── therapist/
│
├── modules/
│   ├── booking/
│   ├── customer/
│   ├── baby/
│   ├── therapist/
│   ├── treatment/
│   ├── package/
│   └── notification/
│
├── components/
├── services/
├── repositories/
├── mocks/
├── types/
├── utils/
└── constants/
```

Feature-specific components should remain inside their respective modules where practical.

---

# 45. TypeScript Rules

Prototype implementation should use:

```text
TypeScript strict mode
```

Avoid:

```text
any
```

Prefer explicit domain types.

Example:

```ts
type BookingStatus =
  | "PENDING"
  | "CONFIRMED"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "CANCELLED"
  | "NO_SHOW";
```

---

# 46. Suggested Core Domain Types

```ts
interface Customer {
  id: string;
  name: string;
  phone: string;
}

interface Baby {
  id: string;
  customerId: string;
  name: string;
  birthDate: string;
}

interface Treatment {
  id: string;
  name: string;
  description: string;
  durationMinutes: number;
  price: number;
  active: boolean;
}

interface Package {
  id: string;
  name: string;
  description: string;
  price: number;
  treatmentIds: string[];
  active: boolean;
}

interface Therapist {
  id: string;
  name: string;
  phone: string;
  active: boolean;
}

interface Booking {
  id: string;
  bookingNumber: string;
  customerId: string;
  babyId: string;
  bookingType: "TREATMENT" | "PACKAGE";
  treatmentId?: string;
  packageId?: string;
  date: string;
  startTime: string;
  endTime: string;
  durationMinutes: number;
  status: BookingStatus;
  customerNotes?: string;
}

interface BookingAssignment {
  id: string;
  bookingId: string;
  therapistId: string;
  status: "ASSIGNED" | "REASSIGNED" | "CANCELLED" | "COMPLETED";
  assignedAt: string;
}
```

These types are conceptual and may evolve during implementation.

---

# 47. UI Design Direction

Customer-facing UI should feel:

```text
calm
clean
premium
warm
trustworthy
modern
```

Avoid overly childish styling.

Recommended visual direction:

* white or ivory backgrounds;
* pastel sage;
* soft beige;
* dusty pink;
* subtle baby blue accents;
* professional baby photography;
* clean typography;
* moderate rounded corners;
* subtle shadows only when useful;
* generous whitespace.

Baby spa branding should communicate care and professionalism, not a children's game interface.

---

# 48. Admin UI Direction

Admin interface should prioritize information density and operational speed.

Recommended structure:

```text
Sidebar
Top Bar
Page Header
Filters
Tables
Cards
Calendar
Dialogs
Forms
```

Avoid excessive decorative styling.

Admin must be able to identify booking status and therapist availability quickly.

---

# 49. Therapist UI Direction

Therapist interface should be mobile-friendly.

Most important information:

```text
Who?
What treatment?
What time?
How long?
Any notes?
```

Today's schedule should be immediately visible after login.

---

# 50. Responsive Requirements

Prototype must support:

```text
Desktop
Tablet
Mobile
```

Priority:

```text
Customer → Mobile First

Therapist → Mobile First

Admin → Desktop First, Responsive
```

---

# 51. Mock Data Requirements

Prototype should contain realistic sample data.

Minimum:

```text
5 customers
7 baby profiles
5 therapists
5 treatments
3 packages
15+ bookings
```

Bookings should include multiple statuses.

Example:

```text
PENDING
CONFIRMED
COMPLETED
CANCELLED
```

At least one therapist must have a schedule conflict so the prototype can demonstrate unavailable therapist behavior.

---

# 52. Demo Scenario

The prototype must support this complete demo flow.

## Scenario

Customer:

```text
Name:
Nadia

Baby:
Aisyah

Package:
Happy Baby Package

Date:
12 August 2026

Time:
10:00
```

Flow:

```text
1. Nadia opens the website.

2. Nadia opens Happy Baby Package.

3. Nadia selects Book Now.

4. Nadia selects baby Aisyah.

5. Nadia selects 12 August 2026.

6. Nadia selects 10:00.

7. Nadia submits the booking.

8. Booking BS-000123 is created.

9. Booking appears in Admin → Pending Booking.

10. Admin opens BS-000123.

11. Admin sees available therapists.

12. Admin assigns Siti.

13. Booking changes to CONFIRMED.

14. Prototype displays:
    "WhatsApp notification sent."

15. Siti opens therapist dashboard.

16. BS-000123 appears in today's/upcoming schedule.

17. Admin marks booking as COMPLETED.

18. Booking appears in customer booking history.

19. Booking appears in Siti's therapist history.
```

This is the primary acceptance scenario for prototype V1.

---

# 53. Prototype Out of Scope

Do not implement the following unless explicitly requested:

```text
Real Payment Gateway
Real WhatsApp API
Complex Authentication
OAuth
Accounting
Payroll
Inventory
Automatic Scheduling
Therapist Rating
Therapist Review
Customer Therapist Selection
Multi-Branch
Membership System
Promo Engine
Complex RBAC
Finance Reporting
Push Notifications
```

These features may be added later.

---

# 54. Development Principles

The coding agent must follow these principles.

## 54.1 Do Not Overbuild

This is a business-flow prototype.

Prioritize:

```text
usable UI
working navigation
realistic interaction
clear workflow
mock data
business validation
```

over production infrastructure.

---

## 54.2 Preserve Future Domain Boundaries

Even though the implementation is a prototype:

Do not merge:

```text
Treatment
Package
Booking
Therapist
Assignment
```

into one model.

They represent different business concepts.

---

## 54.3 Booking Is Not Therapist Assignment

A booking can exist before a therapist is assigned.

Therefore:

```text
Booking
```

and:

```text
BookingAssignment
```

must remain conceptually separate.

---

## 54.4 Avoid Hardcoding Business Logic in UI

Do not implement availability checks directly inside React components.

Prefer:

```text
UI
 ↓
Service
 ↓
Business Rule
```

Example:

```ts
therapistAvailabilityService.getAvailableTherapists(...)
```

rather than large scheduling logic inside page components.

---

# 55. Prototype Acceptance Criteria

Prototype is considered successful when:

* customer can browse treatments;
* customer can browse packages;
* customer can create a booking;
* customer does not select therapist;
* submitted booking appears in admin;
* admin can inspect booking;
* admin can see therapist availability;
* admin can assign therapist;
* assigned therapist appears on booking;
* WhatsApp notification is simulated;
* therapist can see assigned schedule;
* admin can complete booking;
* completed booking appears in history;
* navigation works;
* UI is responsive;
* mock data feels realistic;
* no major broken user flows exist.

---

# 56. Future Roadmap

## Phase 1 — Prototype

```text
Interactive UI
Mock Data
Customer Booking
Admin Assignment
Therapist Schedule
Treatment History
Simulated WhatsApp
```

---

## Phase 2 — MVP

```text
Real Database
Authentication
Role Authorization
Booking API
Treatment Management
Package Management
Therapist Management
Scheduling Validation
Real WhatsApp Notification
Deployment
```

---

## Phase 3 — Customer Experience

```text
Customer Account
Booking Reminder
Reschedule
Cancellation
Customer Reviews
Therapist Ratings
```

---

## Phase 4 — Smart Therapist Selection

```text
Customer Therapist Request
Therapist Availability Engine
Therapist Qualification
Preferred Therapist
Alternative Therapist Recommendation
```

---

## Phase 5 — Advanced Operations

Potential features:

```text
Automatic Scheduling
Multiple Branches
Membership
Package Sessions
Payment Gateway
Promotions
Operational Reports
Revenue Reports
Therapist Performance
CRM
Inventory
```

Only implement these after validated business demand.

---

# 57. Key Product Decisions

These decisions should be treated as current product requirements unless explicitly changed.

### Decision 1

Customer does not select therapist in V1.

### Decision 2

Administrator assigns therapist.

### Decision 3

Therapist does not need to accept/reject assignments in V1.

### Decision 4

Therapist receives assignment notification through WhatsApp.

### Decision 5

Therapist only needs access to schedule and personal treatment history.

### Decision 6

Treatment history should be retained because it will support future therapist ratings.

### Decision 7

Future therapist selection should preferably use a `Request Therapist` model rather than an unconditional therapist selection model.

### Decision 8

Treatments and packages are separate business entities.

### Decision 9

Booking and therapist assignment are separate business entities.

### Decision 10

Prototype should validate the workflow before production architecture is built.

---

# 58. Instructions for Coding Agent

When implementing this PRD:

1. Read the entire PRD before generating code.
2. Do not add features outside scope without explicit instruction.
3. Preserve the domain model described in this document.
4. Use mock repositories/services instead of embedding mock arrays directly throughout pages.
5. Keep business rules outside presentation components.
6. Build reusable UI components when there is clear repetition.
7. Use TypeScript strict mode.
8. Do not use `any`.
9. Prioritize a complete demo flow over secondary screens.
10. Ensure all three role experiences are distinguishable:

    * Customer
    * Admin
    * Therapist
11. Use realistic Indonesian baby spa sample data.
12. Use Indonesian Rupiah formatting.
13. Use Indonesian date/time formatting in the UI where appropriate.
14. Customer and therapist interfaces must work well on mobile.
15. Admin interface should prioritize desktop usability.
16. Do not implement real external services unless explicitly requested.
17. Simulate WhatsApp delivery at the service layer so it can later be replaced with an actual provider.
18. Do not redesign the defined business workflow without explicit approval.
19. When requirements appear ambiguous, prefer the simplest implementation consistent with this PRD.
20. Treat this document as the product source of truth for the prototype.

---

# 59. Definition of Done — Prototype

The prototype is ready to present to the client when the following end-to-end story works without explanation from the developer:

```text
Customer chooses a baby spa package
        ↓
Customer books date and time
        ↓
Booking enters pending queue
        ↓
Admin reviews booking
        ↓
Admin sees therapist availability
        ↓
Admin assigns therapist
        ↓
System simulates WhatsApp notification
        ↓
Therapist sees new schedule
        ↓
Treatment is completed
        ↓
Booking enters customer history
        ↓
Treatment enters therapist history
```

If this flow feels natural to the client, the prototype has achieved its primary objective.
