# DentaScan AI — Project Specification

> **Version:** 1.0 · **Last updated:** 2026-03-22  
> **Stack:** React 18 · Vite · TypeScript · Tailwind CSS · Lovable Cloud (Supabase)

---

## Table of Contents

1. [Folder Structure](#folder-structure)
2. [Main Features](#main-features)
3. [Database Schema](#database-schema)
4. [Edge Functions (Backend)](#edge-functions)
5. [Authentication & Access Control](#authentication--access-control)
6. [Payment Gate Flow](#payment-gate-flow)
7. [Storage Buckets](#storage-buckets)

---

## Folder Structure

```
├── public/
│   ├── placeholder.svg
│   └── robots.txt
├── src/
│   ├── App.tsx                        # Root router + providers
│   ├── main.tsx                       # Entry point
│   ├── index.css                      # Design tokens + Tailwind base
│   ├── components/
│   │   ├── ui/                        # shadcn/ui primitives (button, card, dialog, etc.)
│   │   ├── dashboard/                 # Doctor dashboard widgets
│   │   │   ├── ActionCenter.tsx
│   │   │   ├── AIOverrule.tsx
│   │   │   ├── AuditTrail.tsx
│   │   │   ├── ChiefComplaint.tsx
│   │   │   ├── ClinicalView.tsx
│   │   │   ├── ComparisonSlider.tsx
│   │   │   ├── ConsultationInbox.tsx
│   │   │   ├── DoctorWelcomeModal.tsx
│   │   │   ├── KillSwitch.tsx
│   │   │   ├── PaymentClaimsPanel.tsx
│   │   │   ├── PaymentGate.tsx
│   │   │   ├── ReceiptApprovalPanel.tsx
│   │   │   ├── RecoveryPhrase.tsx
│   │   │   ├── RevenueLedger.tsx
│   │   │   ├── SecureVault.tsx
│   │   │   ├── TriageQueue.tsx
│   │   │   └── mockData.ts
│   │   ├── monster-hunter/            # Kids' brushing game
│   │   │   ├── AgeGateCamera.tsx
│   │   │   ├── BattleScreen.tsx
│   │   │   ├── BrushingHeatMap.tsx
│   │   │   ├── CommandCards.tsx
│   │   │   ├── DailyMissions.tsx
│   │   │   ├── FamilySyncPanel.tsx
│   │   │   ├── GuildBriefing.tsx
│   │   │   ├── HunterFTUE.tsx
│   │   │   ├── LootDropCeremony.tsx
│   │   │   ├── ParentCommandCenter.tsx
│   │   │   ├── ParentPortal.tsx
│   │   │   ├── TrophyRoom.tsx
│   │   │   └── ... (more)
│   │   ├── lesion-tracker/            # Oral lesion monitoring
│   │   │   ├── BiopsyAlert.tsx
│   │   │   ├── CircularCountdown.tsx
│   │   │   ├── DayTimeline.tsx
│   │   │   └── LesionGalleryCard.tsx
│   │   ├── onboarding/               # First-time user experience
│   │   │   ├── CalibrationScreen.tsx
│   │   │   ├── OnboardingFlow.tsx
│   │   │   ├── PracticeScan.tsx
│   │   │   └── WelcomeCards.tsx
│   │   ├── share-report/             # Report sharing components
│   │   ├── AnalysisResults.tsx
│   │   ├── CameraCapture.tsx
│   │   ├── ConsultationPayment.tsx
│   │   ├── ConsultationRequest.tsx
│   │   ├── DailyRoutineGenerator.tsx
│   │   ├── DentalRemedies.tsx
│   │   ├── EmergencyDrawer.tsx
│   │   ├── InviteDentist.tsx
│   │   ├── LanguageSelector.tsx
│   │   ├── LesionGrowthTracker.tsx
│   │   ├── MedicalDisclaimer.tsx
│   │   ├── PlaqueHeatmapToggle.tsx
│   │   ├── ProGate.tsx
│   │   ├── ProtectedRoute.tsx
│   │   ├── SaveReportPDF.tsx
│   │   ├── ScannerInterface.tsx
│   │   ├── ShareReport.tsx
│   │   ├── ToothMapVisualization.tsx
│   │   ├── ToothNavigator.tsx
│   │   ├── TongueComparison.tsx
│   │   ├── TongueReminder.tsx
│   │   └── TriagePriorityCard.tsx
│   ├── hooks/
│   │   ├── useAuth.tsx                # Auth context + role/payment state
│   │   ├── useFamilySync.ts           # Parent-child pairing
│   │   ├── useI18n.tsx                # Internationalization
│   │   ├── useLesionTracker.ts        # 14-day lesion log
│   │   ├── useMonsterHunter.ts        # Game state
│   │   └── use-mobile.tsx
│   ├── pages/
│   │   ├── Auth.tsx                   # Login / Sign-up
│   │   ├── BiteForceAnalysis.tsx
│   │   ├── ClinicFlyer.tsx
│   │   ├── Dashboard.tsx              # Dentist dashboard
│   │   ├── DentistInfo.tsx
│   │   ├── DoctorSignup.tsx
│   │   ├── DoctorWalkthrough.tsx
│   │   ├── FlossingCoach.tsx
│   │   ├── Index.tsx                  # Main patient home
│   │   ├── Install.tsx                # PWA install prompt
│   │   ├── Landing.tsx
│   │   ├── MonsterHunter.tsx          # Kids' game page
│   │   ├── Onboarding.tsx
│   │   ├── PaymentGate.tsx            # Payment verification gate
│   │   ├── PhPredictor.tsx            # Tongue pH analysis
│   │   ├── PitchDeck.tsx
│   │   ├── Pricing.tsx
│   │   ├── PrivacyPolicy.tsx
│   │   ├── Revenue.tsx                # Revenue dashboard
│   │   ├── Reviews.tsx
│   │   ├── Tools.tsx
│   │   └── ToolsDashboard.tsx
│   ├── integrations/supabase/
│   │   ├── client.ts                  # Auto-generated Supabase client
│   │   └── types.ts                   # Auto-generated DB types
│   └── lib/utils.ts
├── supabase/
│   ├── config.toml
│   ├── migrations/                    # SQL migrations (read-only)
│   └── functions/
│       ├── analyze-bite-force/        # AI bite force analysis
│       ├── analyze-dental/            # AI dental scan analysis
│       ├── analyze-flossing/          # AI flossing technique analysis
│       ├── analyze-ph/               # AI tongue pH analysis
│       ├── approve-payment/           # Admin payment claim approval
│       ├── detect-age/               # Face age detection
│       ├── notify-payment/            # Email notification (Resend)
│       ├── parse-receipt/             # AI receipt field extraction
│       └── welcome-doctor/            # Doctor welcome email
├── spec.md                            # ← This file
├── tailwind.config.ts
├── vite.config.ts
└── index.html
```

---

## Main Features

### 1. AI Dental Scanner
- Capture oral photo via camera
- AI analysis via `analyze-dental` edge function
- Generates findings: cavities, gum health, plaque, overall score
- Emergency drawer for critical findings
- PDF report export & sharing

### 2. Tongue pH Predictor
- 4-step flow: capture → symptoms → diet → results
- AI-powered tongue analysis via `analyze-ph` edge function
- Estimated oral pH, defects, conditions, vitamin deficiencies
- History comparison (`TongueComparison`) and reminders

### 3. Lesion Growth Tracker
- 14-day monitoring protocol
- Daily size/color scoring with trend detection
- Biopsy alert when lesion persists >10 days
- Gallery view with timeline

### 4. Monster Hunter (Kids' Brushing Game)
- Age-gated via camera face detection
- Battle mode: defeat "plaque monsters" by brushing
- Loot drops, crystal shards, weekly diamonds
- Parent Command Center with family sync
- Trophy room, daily missions, guild briefings

### 5. Dentist Dashboard
- Triage queue with urgency sorting
- Clinical view with AI analysis overlay
- AI overrule capability with audit trail
- Consultation inbox (video/chat via Jitsi)
- Receipt approval panel (bulk approve/reject)
- Payment claims management
- Kill switch + recovery phrase security

### 6. Consultation System
- Patient requests consultation from registered dentists
- Mode selection: video / chat / in-person
- UPI payment integration per consultation
- Realtime status updates

### 7. Payment Gate
- QR code display (UPI ID: `shreenira@axl`, ₹100)
- Screenshot upload to Supabase Storage
- AI receipt parsing (name, date, time, amount, ref ID, txn ID)
- Email notification to admin (`shreemaganesh01@gmail.com`)
- App locked until `is_approved = true` in `profiles`

### 8. Additional Tools
- Bite Force Analysis
- Flossing Coach
- Plaque Heatmap Toggle
- Tooth Navigator / Tooth Map
- Daily Routine Generator
- Dental Remedies

---

## Database Schema

### `profiles`
| Column | Type | Default | Notes |
|---|---|---|---|
| `id` | uuid (PK) | — | Matches `auth.users.id` |
| `full_name` | text | `''` | |
| `role` | text | `'patient'` | `patient` or `dentist` |
| `avatar_url` | text | null | |
| `upi_id` | text | null | Doctor's UPI ID |
| `consultation_fee` | integer | `100` | |
| `screenshot_url` | text | null | Payment proof URL |
| `is_approved` | boolean | `false` | Payment verified by admin |
| `created_at` | timestamptz | `now()` | |

### `user_roles`
| Column | Type | Default | Notes |
|---|---|---|---|
| `id` | uuid (PK) | `gen_random_uuid()` | |
| `user_id` | uuid | — | |
| `role` | enum (`dentist`, `patient`) | — | |

### `payment_receipts`
| Column | Type | Default | Notes |
|---|---|---|---|
| `id` | uuid (PK) | `gen_random_uuid()` | |
| `user_id` | uuid | — | |
| `name` | text | `''` | AI-extracted payer name |
| `payment_date` | text | `''` | AI-extracted |
| `payment_time` | text | `''` | AI-extracted |
| `amount` | text | `''` | AI-extracted |
| `reference_id` | text | `''` | AI-extracted |
| `transaction_id` | text | `''` | AI-extracted |
| `image_url` | text | null | Storage path |
| `status` | text | `'pending'` | `pending` / `approved` / `rejected` |
| `created_at` | timestamptz | `now()` | |

### `payment_claims`
| Column | Type | Default | Notes |
|---|---|---|---|
| `id` | uuid (PK) | `gen_random_uuid()` | |
| `user_id` | uuid | — | |
| `user_email` | text | — | |
| `user_name` | text | `''` | |
| `upi_transaction_id` | text | null | |
| `status` | text | `'pending'` | |
| `reviewed_at` | timestamptz | null | |
| `reviewed_by` | uuid | null | |
| `created_at` | timestamptz | `now()` | |

### `patient_scans`
| Column | Type | Default | Notes |
|---|---|---|---|
| `id` | uuid (PK) | `gen_random_uuid()` | |
| `patient_id` | uuid | — | |
| `patient_name` | text | `'Anonymous'` | |
| `scan_type` | text | `'General Scan'` | |
| `image_url` | text | null | |
| `ai_analysis` | jsonb | null | Full AI output |
| `urgency` | text | `'green'` | `green` / `yellow` / `red` |
| `status` | text | `'pending'` | |
| `notes` | text | null | |
| `reviewed_at` | timestamptz | null | |
| `reviewed_by` | uuid | null | |
| `submitted_at` | timestamptz | `now()` | |

### `consultation_requests`
| Column | Type | Default | Notes |
|---|---|---|---|
| `id` | uuid (PK) | `gen_random_uuid()` | |
| `patient_id` | uuid | — | |
| `doctor_id` | uuid | null | |
| `patient_name` | text | `'Anonymous'` | |
| `preferred_mode` | text | `'video'` | |
| `contact_phone` | text | null | |
| `message` | text | null | |
| `scan_id` | uuid (FK → patient_scans) | null | |
| `jitsi_room` | text | null | |
| `payment_status` | text | `'unpaid'` | |
| `status` | text | `'pending'` | |
| `accepted_at` | timestamptz | null | |
| `completed_at` | timestamptz | null | |
| `created_at` | timestamptz | `now()` | |

### `consultation_payments`
| Column | Type | Default | Notes |
|---|---|---|---|
| `id` | uuid (PK) | `gen_random_uuid()` | |
| `consultation_id` | uuid (FK → consultation_requests) | — | |
| `patient_id` | uuid | — | |
| `doctor_id` | uuid | — | |
| `amount` | integer | — | |
| `upi_transaction_id` | text | null | |
| `status` | text | `'pending'` | |
| `verified_at` | timestamptz | null | |
| `created_at` | timestamptz | `now()` | |

### `tongue_analyses`
| Column | Type | Default | Notes |
|---|---|---|---|
| `id` | uuid (PK) | `gen_random_uuid()` | |
| `user_id` | uuid | — | |
| `estimated_ph` | float | `7.0` | |
| `ph_range` | text | `'neutral'` | |
| `confidence` | integer | `0` | |
| `tongue_analysis` | jsonb | `{}` | |
| `tongue_defects` | jsonb | `[]` | |
| `diseases` | jsonb | `[]` | |
| `vitamin_deficiencies` | jsonb | `[]` | |
| `recovery` | jsonb | `[]` | |
| `summary` | text | `''` | |
| `symptoms` | text[] | `{}` | |
| `dietary_log` | text[] | `{}` | |
| `image_url` | text | null | |
| `created_at` | timestamptz | `now()` | |

### `lesion_entries`
| Column | Type | Default | Notes |
|---|---|---|---|
| `id` | uuid (PK) | `gen_random_uuid()` | |
| `lesion_id` | uuid | `gen_random_uuid()` | Groups entries |
| `patient_id` | uuid | — | |
| `entry_day` | integer | — | Day 1–14 |
| `size_mm` | float | — | |
| `color_score` | float | `50` | |
| `is_flagged` | boolean | `false` | Auto-flagged at 10+ days |
| `size_delta` | text | null | `growing` / `shrinking` / `unchanged` |
| `status` | text | `'unchanged'` | |
| `image_url` | text | null | |
| `notes` | text | null | |
| `created_at` | timestamptz | `now()` | |

### `battle_events` (Monster Hunter)
| Column | Type | Default | Notes |
|---|---|---|---|
| `id` | uuid (PK) | `gen_random_uuid()` | |
| `child_id` | uuid | — | |
| `hunter_name` | text | `'Hunter'` | |
| `event_type` | text | `'battle_complete'` | |
| `monsters_defeated` | integer | `0` | |
| `total_monsters` | integer | `0` | |
| `duration_seconds` | integer | `0` | |
| `streak` | integer | `0` | |
| `loot_collected` | text[] | `{}` | |
| `metadata` | jsonb | `{}` | |
| `created_at` | timestamptz | `now()` | |

### `family_links`
| Column | Type | Default |
|---|---|---|
| `id` | uuid (PK) | `gen_random_uuid()` |
| `parent_id` | uuid | — |
| `child_id` | uuid | — |
| `link_code` | text | — |
| `status` | text | `'active'` |
| `created_at` | timestamptz | `now()` |

### `pairing_codes`
| Column | Type | Default |
|---|---|---|
| `id` | uuid (PK) | `gen_random_uuid()` |
| `child_id` | uuid | — |
| `code` | text | — |
| `hunter_name` | text | `'Hunter'` |
| `claimed` | boolean | `false` |
| `expires_at` | timestamptz | `now() + 24h` |
| `created_at` | timestamptz | `now()` |

### `subscriptions`
| Column | Type | Default |
|---|---|---|
| `id` | uuid (PK) | `gen_random_uuid()` |
| `user_id` | uuid | — |
| `plan` | text | `'pro'` |
| `status` | text | `'active'` |
| `started_at` | timestamptz | `now()` |
| `expires_at` | timestamptz | null |
| `notes` | text | null |

### `reviews`
| Column | Type | Default |
|---|---|---|
| `id` | uuid (PK) | `gen_random_uuid()` |
| `user_id` | uuid | — |
| `user_name` | text | `''` |
| `rating` | integer | `5` |
| `feedback` | text | `''` |
| `created_at` | timestamptz | `now()` |

### `guardian_lockdowns`
| Column | Type | Default |
|---|---|---|
| `id` | uuid (PK) | `gen_random_uuid()` |
| `doctor_id` | uuid | — |
| `trigger_type` | text | `'manual'` |
| `device_id` | text | `'all'` |
| `is_active` | boolean | `true` |
| `recovery_hash` | text | null |
| `triggered_at` | timestamptz | `now()` |
| `recovered_at` | timestamptz | null |

---

## Edge Functions

| Function | Purpose |
|---|---|
| `analyze-dental` | AI dental scan analysis from camera image |
| `analyze-ph` | AI tongue pH estimation from image + symptoms |
| `analyze-bite-force` | AI bite force analysis |
| `analyze-flossing` | AI flossing technique feedback |
| `parse-receipt` | AI extraction of payment receipt fields |
| `detect-age` | Face age detection for kids' game gate |
| `notify-payment` | Email notification via Resend to admin |
| `approve-payment` | Dentist-only payment claim approval/rejection |
| `welcome-doctor` | Welcome email for new dentist signups |

---

## Authentication & Access Control

- **Auth provider:** Email/password via Supabase Auth
- **Roles:** `patient` (default), `dentist` — stored in `user_roles` table
- **Role check:** `has_role(_user_id, _role)` SQL function (SECURITY DEFINER)
- **Auto-profile:** `handle_new_user()` trigger creates `profiles` + `user_roles` on signup
- **RLS:** All tables have row-level security enabled with role-based policies

---

## Payment Gate Flow

```
User signs up → is_approved = false → /payment-gate
    ↓
Shows QR code (UPI: shreenira@axl, ₹100)
    ↓
User uploads screenshot → saved to 'payments' bucket
    ↓
profiles.screenshot_url updated → notify-payment emails admin
    ↓
Admin sets is_approved = true → app unlocked
```

---

## Storage Buckets

| Bucket | Public | Purpose |
|---|---|---|
| `payments` | Yes | Payment screenshots |
| `receipt-uploads` | Yes | Parsed receipt images |
| `tongue-photos` | Yes | Tongue analysis images |
