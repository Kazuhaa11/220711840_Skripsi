---
version: alpha
name: SIKEMUDI UI Style Guide
description: A Cal.com-inspired clean SaaS interface adapted for SIKEMUDI. The system keeps SIKEMUDI's existing blue/navy brand color, existing page layout, routing, business flow, and reusable component structure. The visual revision focuses on soft-rounded cards, generous whitespace, clean tables, subtle borders, clear primary actions, consistent inputs, and product-like schedule/booking cards.

source_reference:
  inspiration: "Cal.com Design System"
  adaptation_rule: "Use Cal.com's clean SaaS visual grammar, but do not copy its black-primary color system."
  must_keep:
    - "Existing SIKEMUDI blue/navy color palette"
    - "Existing layout structure"
    - "Existing routing"
    - "Existing API integration"
    - "Existing business flow"
    - "Existing reusable component architecture"

colors:
  primary: "Use existing SIKEMUDI blue/navy token"
  primary-active: "Use darker version of existing SIKEMUDI primary"
  primary-soft: "#eff6ff"
  primary-border: "#bfdbfe"
  ink: "#0f172a"
  body: "#475569"
  muted: "#64748b"
  muted-soft: "#94a3b8"
  hairline: "#e2e8f0"
  hairline-soft: "#f1f5f9"
  canvas: "#ffffff"
  page: "#f8fafc"
  surface-soft: "#f1f5f9"
  surface-card: "#ffffff"
  surface-blue-soft: "#eff6ff"
  surface-strong: "#e2e8f0"
  surface-dark: "Use existing SIKEMUDI navy"
  on-primary: "#ffffff"
  on-dark: "#ffffff"
  on-dark-soft: "#cbd5e1"
  success-soft: "#ecfdf5"
  success-text: "#047857"
  success-border: "#a7f3d0"
  warning-soft: "#fffbeb"
  warning-text: "#b45309"
  warning-border: "#fde68a"
  error-soft: "#fef2f2"
  error-text: "#b91c1c"
  error-border: "#fecaca"
  info-soft: "#eff6ff"
  info-text: "#1d4ed8"
  info-border: "#bfdbfe"
  neutral-soft: "#f1f5f9"
  neutral-text: "#475569"
  neutral-border: "#cbd5e1"

typography:
  fontFamily: "Inter, system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif"
  display-xl:
    fontSize: "48px"
    fontWeight: 700
    lineHeight: 1.05
    letterSpacing: "-1.5px"
    use: "Landing hero title only"
  display-lg:
    fontSize: "40px"
    fontWeight: 700
    lineHeight: 1.1
    letterSpacing: "-1px"
    use: "Large public section title"
  display-md:
    fontSize: "32px"
    fontWeight: 700
    lineHeight: 1.15
    letterSpacing: "-0.75px"
    use: "Page title / dashboard hero"
  display-sm:
    fontSize: "28px"
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: "-0.5px"
    use: "Section headline"
  title-lg:
    fontSize: "22px"
    fontWeight: 600
    lineHeight: 1.3
    use: "Large card title"
  title-md:
    fontSize: "18px"
    fontWeight: 600
    lineHeight: 1.4
    use: "Feature card, modal title"
  title-sm:
    fontSize: "16px"
    fontWeight: 600
    lineHeight: 1.4
    use: "Small card title, table section title"
  body-md:
    fontSize: "16px"
    fontWeight: 400
    lineHeight: 1.6
    use: "Main paragraph"
  body-sm:
    fontSize: "14px"
    fontWeight: 400
    lineHeight: 1.5
    use: "Table cell, description, form helper"
  caption:
    fontSize: "12px"
    fontWeight: 500
    lineHeight: 1.4
    use: "Badge, meta label, small helper"
  button:
    fontSize: "14px"
    fontWeight: 600
    lineHeight: 1
    use: "Button label"
  nav-link:
    fontSize: "14px"
    fontWeight: 500
    lineHeight: 1.4
    use: "Navigation item"

rounded:
  xs: "4px"
  sm: "6px"
  md: "8px"
  lg: "12px"
  xl: "16px"
  xxl: "24px"
  pill: "9999px"
  full: "9999px"

spacing:
  xxs: "4px"
  xs: "8px"
  sm: "12px"
  md: "16px"
  lg: "24px"
  xl: "32px"
  xxl: "48px"
  section: "72px"
  section-lg: "96px"

components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.on-primary}"
    typography: "{typography.button}"
    rounded: "{rounded.md}"
    padding: "12px 20px"
    height: "40px-44px"
  button-secondary:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.ink}"
    border: "1px solid {colors.hairline}"
    typography: "{typography.button}"
    rounded: "{rounded.md}"
    padding: "12px 20px"
    height: "40px-44px"
  button-ghost:
    backgroundColor: "transparent"
    textColor: "{colors.body}"
    typography: "{typography.button}"
    rounded: "{rounded.md}"
    padding: "10px 16px"
    height: "40px"
  button-danger:
    backgroundColor: "#dc2626"
    textColor: "{colors.on-primary}"
    typography: "{typography.button}"
    rounded: "{rounded.md}"
    padding: "12px 20px"
    height: "40px-44px"
  icon-button:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.body}"
    border: "1px solid {colors.hairline}"
    rounded: "{rounded.full}"
    size: "36px-40px"
  top-nav:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.ink}"
    typography: "{typography.nav-link}"
    height: "64px"
    borderBottom: "1px solid {colors.hairline-soft}"
  sidebar:
    backgroundColor: "{colors.surface-dark}"
    textColor: "{colors.on-dark-soft}"
    activeColor: "{colors.on-dark}"
    activeBackground: "rgba(255,255,255,0.10)"
  nav-pill-group:
    backgroundColor: "{colors.surface-soft}"
    textColor: "{colors.body}"
    typography: "{typography.nav-link}"
    rounded: "{rounded.pill}"
    padding: "6px"
  category-tab:
    backgroundColor: "transparent"
    textColor: "{colors.muted}"
    typography: "{typography.nav-link}"
    padding: "8px 14px"
    rounded: "{rounded.md}"
  category-tab-active:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.primary}"
    typography: "{typography.nav-link}"
    rounded: "{rounded.md}"
    shadow: "0 1px 2px rgba(15,23,42,0.08)"
  page-header:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    typography: "{typography.display-md}"
    spacingBottom: "{spacing.lg}"
  hero-band:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.ink}"
    typography: "{typography.display-xl}"
    padding: "72px 0"
  hero-app-mockup-card:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.ink}"
    border: "1px solid {colors.hairline}"
    rounded: "{rounded.xl}"
    shadow: "0 10px 30px rgba(15,23,42,0.08)"
  card:
    backgroundColor: "{colors.surface-card}"
    textColor: "{colors.ink}"
    border: "1px solid {colors.hairline}"
    rounded: "{rounded.lg}"
    padding: "20px-24px"
    shadow: "0 1px 2px rgba(15,23,42,0.04)"
  card-soft:
    backgroundColor: "{colors.surface-soft}"
    textColor: "{colors.ink}"
    border: "1px solid {colors.hairline}"
    rounded: "{rounded.lg}"
    padding: "20px-24px"
  feature-card:
    backgroundColor: "{colors.surface-card}"
    textColor: "{colors.ink}"
    typography: "{typography.title-md}"
    border: "1px solid {colors.hairline}"
    rounded: "{rounded.lg}"
    padding: "24px"
  product-mockup-card:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.ink}"
    border: "1px solid {colors.hairline}"
    rounded: "{rounded.xl}"
    padding: "24px"
  schedule-card:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.ink}"
    border: "1px solid {colors.hairline}"
    rounded: "{rounded.lg}"
    padding: "20px"
    shadow: "0 1px 2px rgba(15,23,42,0.04)"
  booking-card:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.ink}"
    border: "1px solid {colors.hairline}"
    rounded: "{rounded.lg}"
    padding: "20px"
  stats-card:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.ink}"
    border: "1px solid {colors.hairline}"
    rounded: "{rounded.lg}"
    padding: "20px"
  table-wrapper:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.ink}"
    border: "1px solid {colors.hairline}"
    rounded: "{rounded.lg}"
    shadow: "0 1px 2px rgba(15,23,42,0.04)"
  table-header:
    backgroundColor: "{colors.surface-soft}"
    textColor: "{colors.body}"
    typography: "{typography.caption}"
  table-cell:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.body}"
    typography: "{typography.body-sm}"
    padding: "12px 16px"
    borderBottom: "1px solid {colors.hairline-soft}"
  text-input:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.ink}"
    placeholderColor: "{colors.muted-soft}"
    border: "1px solid {colors.hairline}"
    typography: "{typography.body-sm}"
    rounded: "{rounded.md}"
    padding: "10px 14px"
    height: "40px-44px"
  text-input-focused:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.ink}"
    border: "1px solid {colors.primary}"
    ring: "3px {colors.primary-soft}"
    rounded: "{rounded.md}"
  badge-pill:
    backgroundColor: "{colors.neutral-soft}"
    textColor: "{colors.neutral-text}"
    border: "1px solid {colors.neutral-border}"
    typography: "{typography.caption}"
    rounded: "{rounded.pill}"
    padding: "4px 10px"
  modal:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.ink}"
    rounded: "{rounded.xl}"
    shadow: "0 20px 60px rgba(15,23,42,0.16)"
    padding: "24px"
  empty-state:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.body}"
    border: "1px dashed {colors.hairline}"
    rounded: "{rounded.lg}"
    padding: "32px"
  footer:
    backgroundColor: "{colors.surface-dark}"
    textColor: "{colors.on-dark-soft}"
    typography: "{typography.body-sm}"
    padding: "56px 0"
---

# SIKEMUDI UI Style Guide

## Overview

SIKEMUDI menggunakan arah visual **Cal.com-inspired Clean SaaS UI**, tetapi tidak menyalin desain Cal.com secara mentah.

Yang diambil dari Cal.com adalah grammar visualnya:

- white atau soft canvas
- generous whitespace
- soft-rounded cards
- border halus
- shadow ringan
- input dan button konsisten
- table bersih
- schedule/booking UI ditampilkan seperti product cards
- hirarki typography yang jelas
- CTA utama yang mudah dikenali

Yang **tidak boleh diambil mentah** dari Cal.com:

- primary CTA hitam
- dominasi monochrome hitam-putih
- Cal Sans sebagai font wajib
- dark card di banyak area
- perubahan layout besar halaman

Untuk SIKEMUDI, warna utama tetap menggunakan **biru/navy existing**. Layout, route, alur bisnis, API integration, dan struktur reusable component tetap dipertahankan.

## Key Characteristics

- **Clean SaaS dashboard**: cocok untuk sistem kursus mengemudi yang memiliki dashboard peserta, admin, dan instruktur.
- **Calendar/software-first interface**: cocok untuk fitur jadwal tersedia, jadwal saya, booking, sesi latihan, dan assignment instruktur.
- **Soft visual hierarchy**: card putih, border slate, shadow tipis, tidak terlalu ramai.
- **Professional thesis-ready UI**: tampilan formal, rapi, dan mudah dipresentasikan dalam skripsi.
- **Component-first refinement**: perubahan visual dilakukan lewat global components terlebih dahulu, bukan styling ulang per halaman secara acak.

---

# 1. Core Adaptation Rules

## Do

- Pertahankan warna utama biru/navy SIKEMUDI.
- Pertahankan layout halaman yang sudah ada.
- Pertahankan route dan flow bisnis.
- Pertahankan API integration.
- Gunakan reusable components dari `components/ui`, `components/common`, dan `components/feedback`.
- Jika global component sudah ada, gunakan itu terlebih dahulu.
- Jika styling perlu diperbaiki, upgrade global component terlebih dahulu.
- Gunakan card putih dengan border halus dan shadow ringan.
- Gunakan badge status dengan soft background.
- Gunakan spacing yang lebih lega tetapi tidak mengubah struktur besar.
- Gunakan table yang clean dengan header soft dan divider halus.
- Gunakan modal yang rapi, rounded, dan memiliki footer action yang jelas.

## Don't

- Jangan mengganti warna utama SIKEMUDI menjadi hitam.
- Jangan meniru Cal.com 1:1.
- Jangan merombak layout besar halaman.
- Jangan mengubah route.
- Jangan mengubah API call.
- Jangan mengubah flow bisnis.
- Jangan menghapus logic existing.
- Jangan membuat ulang halaman dari nol.
- Jangan membuat komponen baru jika global component sudah cukup.
- Jangan menggunakan gradient berlebihan.
- Jangan menggunakan glassmorphism.
- Jangan menggunakan neumorphism.
- Jangan menggunakan shadow berat.
- Jangan menggunakan radius terlalu besar untuk card biasa.
- Jangan membuat UI terlalu playful atau consumer-app.

---

# 2. Color System

## Brand & Primary

Cal.com menggunakan primary hitam. SIKEMUDI **tidak mengikuti ini**.

SIKEMUDI harus memakai:

- primary: biru/navy existing
- primary hover: biru/navy lebih gelap
- primary soft: blue-50 atau blue-100
- primary border: blue-200
- primary text: blue-700 atau navy

Primary digunakan untuk:

- CTA utama
- button submit
- active menu
- active tab
- icon highlight penting
- link utama
- progress/step aktif

## Surface

- Canvas utama: `#ffffff`
- Page background: `#f8fafc`
- Soft section: `#f1f5f9` atau `#eff6ff`
- Card: `#ffffff`
- Border: `#e2e8f0`
- Soft divider: `#f1f5f9`

Gunakan surface yang bersih. Hindari area background yang terlalu ramai.

## Text

- Main text: `#0f172a`
- Body text: `#475569`
- Muted text: `#64748b`
- Soft muted text: `#94a3b8`
- Text on primary: `#ffffff`

Judul harus tegas, body harus mudah dibaca, dan helper text tidak boleh terlalu gelap.

## Status Colors

Gunakan status badge soft, bukan warna solid yang terlalu mencolok.

| Status Type | Background | Text | Border |
|---|---|---|---|
| Success | `#ecfdf5` | `#047857` | `#a7f3d0` |
| Warning | `#fffbeb` | `#b45309` | `#fde68a` |
| Error | `#fef2f2` | `#b91c1c` | `#fecaca` |
| Info | `#eff6ff` | `#1d4ed8` | `#bfdbfe` |
| Neutral | `#f1f5f9` | `#475569` | `#cbd5e1` |

## Status Mapping

| Domain Status | Visual Type |
|---|---|
| Menunggu Pembayaran | Warning |
| Menunggu Konfirmasi Pembayaran | Info |
| Dikonfirmasi | Success |
| Ditolak | Error |
| Dibatalkan | Neutral/Error |
| Tersedia | Success |
| Penuh | Neutral |
| Berlangsung | Info |
| Selesai | Success |
| Hadir | Success |
| Tidak Hadir | Error |
| Lulus | Success |
| Tidak Lulus | Error |
| Sertifikat Terbit | Success |
| Belum Terbit | Warning |
| Kendaraan Siap | Success |
| Kendaraan Tidak Siap | Error |

---

# 3. Typography

## Font Family

Gunakan font existing. Jika sudah memakai Inter, pertahankan.

Recommended:

- `Inter`
- `system-ui`
- `sans-serif`

Tidak perlu memaksakan Cal Sans karena Cal Sans bukan font publik bebas pakai untuk project ini.

## Display Typography

Gunakan display typography hanya untuk landing page dan hero section.

| Token | Size | Weight | Use |
|---|---:|---:|---|
| display-xl | 48px | 700 | Landing hero |
| display-lg | 40px | 700 | Public large section |
| display-md | 32px | 700 | Page title / dashboard hero |
| display-sm | 28px | 700 | Section title |

Pada mobile, ukuran display harus turun agar tidak terlalu besar.

## UI Typography

| Token | Size | Weight | Use |
|---|---:|---:|---|
| title-lg | 22px | 600 | Large card title |
| title-md | 18px | 600 | Feature card, modal title |
| title-sm | 16px | 600 | Small card title |
| body-md | 16px | 400 | Paragraph |
| body-sm | 14px | 400 | Table, description, helper |
| caption | 12px | 500 | Badge, meta |
| button | 14px | 600 | Button |
| nav-link | 14px | 500 | Navigation |

## Typography Principles

- Heading harus semibold/bold, bukan terlalu tipis.
- Body text jangan terlalu gelap.
- Label form harus jelas.
- Caption dan helper text harus muted.
- Jangan memakai terlalu banyak ukuran font dalam satu card.
- Gunakan `tracking-tight` secukupnya untuk heading besar.
- Jangan menggunakan font dekoratif.

---

# 4. Layout

## General Layout

Layout besar yang sudah ada di SIKEMUDI harus tetap dipertahankan.

Yang boleh diperbaiki:

- spacing antar section
- padding card
- jarak antar field form
- gap antar button
- table density
- empty state
- modal spacing

Yang tidak boleh diubah:

- struktur route
- posisi sidebar
- posisi navbar
- alur halaman
- flow dashboard
- struktur role
- alur booking
- alur upload bukti bayar
- alur input hasil latihan

## Container

Gunakan container yang konsisten:

- public page max-width sekitar `1120px - 1200px`
- dashboard page mengikuti layout existing
- admin table wrapper tidak terlalu penuh
- mobile harus full width dengan padding aman

## Grid

Recommended:

- dashboard stats: 1 column mobile, 2 column tablet, 3/4 column desktop
- feature cards: 1 column mobile, 2 column tablet, 3 column desktop
- schedule cards: 1 column mobile, 2 column desktop jika cocok
- admin table: full width dengan horizontal scroll di mobile

## Whitespace

Gunakan whitespace yang lega tetapi tetap efisien.

- Page section gap: 24px - 32px
- Card padding: 20px - 24px
- Large card padding: 24px - 32px
- Form field gap: 16px
- Button group gap: 8px - 12px
- Table cell padding: 12px - 16px

---

# 5. Elevation & Depth

## Elevation Levels

| Level | Treatment | Use |
|---|---|---|
| Flat | no shadow, no border | page background, simple section |
| Hairline | 1px border | input, table divider, card border |
| Soft Card | border + shadow-sm | dashboard card, schedule card |
| Elevated | border + medium soft shadow | modal, hero mockup |
| Highlight | soft blue background + border | active schedule, selected package |

## Card Shadow

Default card:

- `shadow-sm`
- border `border-slate-200`
- no heavy shadow

Interactive card:

- optional `hover:shadow-md`
- optional `hover:border-blue-200`
- transition ringan

Modal:

- `shadow-xl`
- rounded-2xl
- background white

## Avoid

- heavy dark shadow
- glowing effect berlebihan
- glassmorphism
- neumorphism
- terlalu banyak dark card

---

# 6. Shape & Radius

## Border Radius Scale

| Token | Value | Use |
|---|---:|---|
| xs | 4px | small accent |
| sm | 6px | small dropdown item |
| md | 8px | button, input, select, tab |
| lg | 12px | card, table wrapper |
| xl | 16px | modal, hero mockup, large card |
| xxl | 24px | landing hero visual only, if needed |
| pill | 9999px | badge, pill tab |
| full | 9999px | avatar, icon button |

## Rules

- Button: rounded-lg / 8px
- Input: rounded-lg / 8px
- Select: rounded-lg / 8px
- TextArea: rounded-lg / 8px
- Card: rounded-xl / 12px
- Table wrapper: rounded-xl / 12px
- Modal: rounded-2xl / 16px
- Badge: rounded-full
- Avatar: rounded-full
- Icon button: rounded-full

Jangan membuat semua komponen rounded-3xl. Itu akan membuat sistem terlihat terlalu playful.

---

# 7. Components

## Top Navigation

Public top navigation tetap mengikuti layout existing.

Target style:

- background white
- height sekitar 64px
- border-bottom soft
- text slate/navy
- active link memakai primary blue/navy
- CTA utama memakai primary button
- mobile menu tetap sesuai existing

Do not:

- mengubah route navbar
- mengubah anchor/link behavior
- mengganti warna utama menjadi hitam

## Sidebar

Sidebar dashboard tetap mengikuti warna navy existing.

Target style:

- background navy
- active item punya background white/transparent soft
- active text lebih terang
- icon dan label aligned
- spacing antar menu konsisten
- logout tetap jelas

Do not:

- mengubah struktur menu role
- menghapus menu existing
- mengubah route dashboard

## Button

Semua tombol harus menggunakan global `Button` jika tersedia.

### Primary Button

Use for:

- submit
- booking
- upload
- simpan
- konfirmasi
- download utama
- input hasil latihan

Style:

- background primary blue/navy existing
- text white
- rounded-lg
- height 40px - 44px
- padding x 16px - 20px
- font 14px semibold
- disabled state soft gray

### Secondary Button

Use for:

- batal
- kembali
- detail secondary
- filter reset

Style:

- background white
- text slate/navy
- border slate-200
- rounded-lg
- height 40px - 44px

### Ghost Button

Use for:

- action minor
- icon + text secondary
- navigation helper

Style:

- transparent
- text slate-600
- hover background slate-100
- rounded-lg

### Danger Button

Use for:

- hapus
- batalkan booking
- tolak pembayaran

Style:

- red background or red soft depending severity
- rounded-lg
- clear label

## Card

Semua container utama sebaiknya memakai global `Card`.

Default style:

- bg-white
- border border-slate-200
- rounded-xl
- shadow-sm
- p-5 / p-6

Use for:

- dashboard stats
- jadwal tersedia
- jadwal saya
- riwayat booking
- sertifikat
- form section
- table wrapper
- admin summary
- instruktur schedule card

## Feature Card

Use for landing/public page.

Style:

- bg-white or blue/surface soft
- border slate-200
- rounded-xl
- p-6
- icon in rounded box
- title 18px semibold
- description 14/16px muted

## Schedule Card

Use for:

- jadwal tersedia
- jadwal saya
- jadwal mengajar instruktur
- admin jadwal latihan card, if applicable

Style:

- bg-white
- border slate-200
- rounded-xl
- p-5
- title clear
- meta rows structured
- status badge top/right
- CTA bottom/right
- avoid overcrowding

Recommended information order:

1. Tanggal
2. Jam / slot waktu
3. Paket
4. Instruktur
5. Kendaraan
6. Kuota / status
7. Action

## Booking Card

Use for participant booking state.

Style:

- show booking-level status once
- show sessions as nested rows/list
- payment upload should not repeat per session if one booking contains multiple sessions
- separate upcoming and completed sessions
- use soft badges

## Stats Card

Use for dashboard.

Style:

- icon small rounded box
- label muted
- value large semibold
- optional helper text
- border and shadow-sm

## Table

Table wrapper:

- bg-white
- border slate-200
- rounded-xl
- shadow-sm
- overflow hidden

Table header:

- bg-slate-50
- text-slate-600
- text-xs or text-sm
- font-semibold

Table cell:

- px-4
- py-3
- text-sm
- border-b border-slate-100

Action column:

- small buttons
- consistent gap
- avoid too many solid colors

Mobile:

- allow horizontal scroll
- do not break table layout badly

## Input / Select / TextArea

All form fields should use global component if available.

Style:

- height 40px - 44px
- rounded-lg
- border slate-200
- bg-white
- text-slate-900
- placeholder slate-400
- focus border primary
- focus ring primary soft

Label:

- text-sm
- font-medium
- text-slate-700

Error:

- text-sm
- text-red-600

Do not:

- use raw input if global Input supports it
- create inconsistent field heights
- use harsh focus outline

## Badge

Use badge for status.

Style:

- rounded-full
- px-2.5 / px-3
- py-1
- text-xs
- font-medium
- border

Badge must be soft.

Do not use solid bright badge unless needed for critical action.

## Modal

Target style:

- rounded-2xl
- bg-white
- shadow-xl
- spacing clear
- header title text-lg/text-xl semibold
- body gap 16px - 24px
- footer action aligned right
- optional border top footer

Do not:

- change modal behavior
- remove existing success modal logic
- change upload proof flow
- change confirmation behavior

## Empty State

Use for:

- no schedule
- no booking
- no certificate
- no table data

Style:

- bg-white
- border dashed slate-200
- rounded-xl
- p-8
- icon soft blue/gray
- title semibold
- description muted
- optional CTA

---

# 8. Page-Specific Direction

## Landing / Public Page

Goal:

- make it modern, clean, and professional
- keep existing content and layout
- make hero stronger but not overdesigned

Style:

- hero white/soft blue
- headline navy
- primary CTA blue/navy
- secondary CTA white border
- feature card rounded-xl
- alur kursus as step cards
- schedule/booking mockup as product card if already exists

Do not:

- rebuild landing from scratch
- change public routes
- change content drastically

## Auth Pages

Applies to:

- login
- register

Style:

- centered card
- bg-white
- rounded-2xl
- shadow-sm/medium
- input consistent
- button primary blue/navy
- spacing more comfortable
- checkbox can remain simple if no global checkbox exists

Do not:

- change auth logic
- change validation
- change route after login

## Peserta Dashboard

Style:

- greeting card clean
- stats cards consistent
- upcoming schedule highlighted as product card
- payment/booking status as soft badge
- clear CTA to jadwal tersedia or jadwal saya

Do not:

- add new business flow
- duplicate booking/payment status incorrectly

## Jadwal Tersedia

This page should feel like scheduling software.

Style:

- filter area clean
- schedule slot card rounded-xl
- date/time information easy to scan
- quota/status badge visible
- booking button primary blue
- full schedule disabled soft neutral
- selected/active state soft blue

Do not:

- change booking logic
- change API integration
- show unavailable action as active

## Konfirmasi Booking

Style:

- package and schedule summary card
- participant info card
- payment instruction card if available
- action footer clear
- success modal unchanged if already correct

Do not:

- change success modal behavior
- change payment lifecycle
- change booking payload

## Jadwal Saya

Required grouping:

1. Menunggu Pembayaran / Menunggu Konfirmasi
2. Akan Datang
3. Selesai

Rules:

- If one booking has multiple sessions, payment upload must appear at booking level, not repeated as if each session needs separate payment.
- Completed sessions should move to completed section.
- If session is within H-3, hide cancel/change buttons.
- If no action is allowed, show only detail button.
- Use status badge consistently.

Do not:

- show upload proof button multiple times for the same booking payment.
- mix completed sessions with upcoming sessions.
- show cancel/reschedule button when H-3 rule blocks it.

## Riwayat Booking

Style:

- clean table or card list
- booking status visible
- payment status visible
- detail modal clean
- session list easy to read

Do not:

- duplicate schedule data confusingly
- make payment status appear per session if it is booking-level

## Sertifikat

Style:

- certificate card clean
- status terbit/belum terbit clear
- download button primary/secondary
- public verification info clear
- empty state if no certificate

Do not:

- change certificate download route
- expose private file path directly

## Admin Dashboard

Style:

- stats card grid
- pending payment confirmation highlight
- jadwal hari ini card
- operational status with soft badges
- avoid too many strong colors

Do not:

- change metric logic
- add fake stats if API does not provide it

## Admin CRUD Pages

Applies to:

- peserta
- instruktur
- kendaraan
- paket kursus
- slot waktu
- jadwal latihan
- hasil latihan
- sertifikat
- report

Style:

- PageHeader consistent
- search/filter area clean
- table wrapper rounded-xl
- action buttons small and consistent
- modal form clean
- badge status soft
- empty state reusable

Do not:

- change API endpoints
- change create/edit/delete behavior
- create raw table styles if global Table exists

## Admin Slot Waktu

Style:

- assignment matrix remains inline
- cell table clean
- instructor chips as badge/pill
- multi-select visually clean
- no separate add modal if current design is inline matrix

Do not:

- reintroduce modal tambah if user already rejected it
- change instructor assignment logic

## Admin Jadwal Latihan

Style:

- form remains existing flow
- instructor auto-load based on date + time slot
- if one instructor, auto-select remains
- if many instructors, dropdown remains
- if no instructor, show soft warning and disable submit
- table clean

Do not:

- change backend assignment logic
- manually input instructor ignoring assignment API

## Instruktur Dashboard

Style:

- today schedule highlighted soft blue
- teaching session cards clean
- input hasil latihan CTA clear
- status badge consistent

Do not:

- add route `/instruktur/sesi/baru` if it is dead/unused
- change instructor-only scope

## Instruktur Jadwal Mengajar

Style:

- upcoming sessions separated from completed sessions if applicable
- card/list easy to scan
- detail/input button consistent
- completed status visually clear

Do not:

- mix dummy data with real data
- bypass logged-in instructor API scope

## Instruktur Detail / Input Hasil Latihan

Style:

- participant info card
- session info card
- result form clean
- status kelulusan badge clear
- action footer stable

Do not:

- change validation logic
- allow admin input flow here
- remove update support if existing

---

# 9. Responsive Behavior

## Breakpoints

| Name | Width | Key Changes |
|---|---:|---|
| Mobile | < 768px | single column, card full width, stacked buttons |
| Tablet | 768-1024px | two-column grids where appropriate |
| Desktop | 1024-1440px | full dashboard/table layout |
| Wide | > 1440px | keep max-width, do not stretch content too wide |

## Mobile Rules

- Cards use full width.
- Tables can use horizontal scroll.
- Button groups can stack.
- Modal should fit viewport.
- Padding should remain comfortable.
- Text should not become too small.
- Avoid fixed widths that break mobile.

## Touch Targets

- Primary button minimum height 40px.
- Icon button minimum 36px, preferably 40px.
- Input height 40px - 44px.
- Select height 40px - 44px.
- Tab/pill should be easy to tap.

---

# 10. Implementation Order

Do not restyle all pages at once.

Recommended order:

1. Audit existing global components.
2. Update `Button`.
3. Update `Card`.
4. Update `Input`.
5. Update `Select`.
6. Update `TextArea`.
7. Update `Badge`.
8. Update `Table`.
9. Update `Modal`.
10. Update `EmptyState`.
11. Apply to Landing/Public page.
12. Apply to Auth pages.
13. Apply to Peserta Dashboard.
14. Apply to Jadwal Tersedia.
15. Apply to Konfirmasi Booking.
16. Apply to Jadwal Saya.
17. Apply to Riwayat Booking.
18. Apply to Sertifikat.
19. Apply to Admin Dashboard.
20. Apply to Admin CRUD pages.
21. Apply to Admin Slot Waktu.
22. Apply to Admin Jadwal Latihan.
23. Apply to Instruktur Dashboard.
24. Apply to Instruktur Jadwal Mengajar.
25. Apply to Instruktur Detail/Input Hasil Latihan.

---

# 11. Codex Implementation Rules

When Codex implements this guide:

- Read this entire file first.
- Do not only read the frontmatter.
- Do not change business logic.
- Do not change API integration.
- Do not change routes.
- Do not remove existing validation.
- Do not remove existing state management.
- Do not rebuild pages from scratch.
- Do not create new global components unless necessary.
- Prefer upgrading existing global components.
- Do not bypass global components with raw HTML if global components support the need.
- If a component does not support a required visual feature, upgrade the global component first.
- Keep changes small and testable.
- Implement per page or per component.
- Provide full copy-paste code for changed files.

---

# 12. Prompt Template for Codex

Use this prompt when asking Codex to implement styling on a page:

```txt
Baca dan ikuti seluruh isi file docs/SIKEMUDI_UI_STYLE_GUIDE.md.

Tolong revisi style halaman [NAMA_HALAMAN] agar mengikuti arah Cal.com-inspired clean SaaS UI untuk SIKEMUDI.

Batasan wajib:
- Jangan ubah layout besar.
- Jangan ubah warna utama biru/navy existing.
- Jangan ubah route.
- Jangan ubah API integration.
- Jangan ubah flow bisnis.
- Jangan hapus logic existing.
- Gunakan reusable components yang sudah ada.
- Jika perlu, upgrade global component terlebih dahulu.
- Fokus pada spacing, card, border, radius, typography, button, input, table, badge, modal, dan empty state.
- Berikan kode full copy-paste untuk file yang diubah.
```

Prompt for global component revision:

```txt
Baca dan ikuti seluruh isi file docs/SIKEMUDI_UI_STYLE_GUIDE.md.

Tolong audit dan rapikan global component [NAMA_COMPONENT] agar sesuai style guide SIKEMUDI.

Batasan:
- Jangan breaking existing props.
- Jangan menghapus variant yang sudah dipakai.
- Jika menambah props baru, pastikan backward compatible.
- Jangan ubah logic halaman yang menggunakan component ini.
- Berikan kode full copy-paste untuk component yang diubah.
```

Prompt for page-by-page implementation:

```txt
Baca file docs/SIKEMUDI_UI_STYLE_GUIDE.md sampai selesai.

Implementasikan style guide ini hanya pada halaman [NAMA_HALAMAN] dulu.

Jangan menyentuh halaman lain kecuali perlu memperbaiki global component yang digunakan halaman ini.
Jangan ubah API, route, state, validasi, dan flow bisnis.
Pastikan hasilnya tetap menggunakan warna biru/navy SIKEMUDI dan layout existing.
```

---

# 13. Final Direction

SIKEMUDI should not become a Cal.com clone.

SIKEMUDI should become:

- clean
- modern
- professional
- thesis-ready
- easy to scan
- consistent across roles
- comfortable for admin CRUD
- friendly for participant booking
- clear for instructor session flow

Final visual direction:

```txt
SIKEMUDI = Cal.com-inspired Clean SaaS UI
+ existing SIKEMUDI blue/navy identity
+ existing layout and flow
+ reusable component-first refinement
+ schedule/booking product-card feel
```

The most important rule:

```txt
Ambil prinsip visual Cal.com, bukan warna dan layout mentah Cal.com.
```
