# Rencana Implementasi (Roadmap)

## SplitBill — Sprint/Milestone Breakdown

| Field              | Detail                                 |
| ------------------ | -------------------------------------- |
| **Total Estimasi** | 8–10 minggu (part-time, ~3-4 jam/hari) |
| **Milestones**     | 5 Milestone                            |
| **Approach**       | Backend-first, lalu Frontend per fitur |

---

## Overview Timeline

```
Minggu   1   2   3   4   5   6   7   8   9   10
         ████████                                    Milestone 1: Setup & Auth
                 ████████                            Milestone 2: Grup & Member
                         ████████████                Milestone 3: Transaksi & Split
                                     ████████████    Milestone 4: Dashboard & Laporan
                                                 ████████    Milestone 5: Integrasi & Polish
```

---

## Milestone 1: Setup & Autentikasi ⚙️

**Durasi:** 1.5 minggu | **Priority:** P0

### Goal

Fondasi proyek siap: backend running, database terhubung, auth JWT berfungsi, dan halaman login/register di frontend.

### Task Breakdown

#### Backend (Hari 1-4) DONE

| #   | Task                                                     | Est    | Status |
| --- | -------------------------------------------------------- | ------ | ------ |
| 1   | Inisialisasi project Go: `go mod init`, folder structure | 2 jam  | ok     |
| 2   | Setup config loader (env variables via godotenv/viper)   | 1 jam  | ok     |
| 3   | Setup koneksi MySQL (database/sql + sqlx atau GORM)      | 2 jam  | ok     |
| 4   | Buat migration `001_create_users.sql` dan jalankan       | 1 jam  | ok     |
| 5   | Implementasi `UserRepository`: Create, FindByEmail       | 2 jam  | ok     |
| 6   | Implementasi `AuthService`: HashPassword, VerifyPassword | 1 jam  | ok     |
| 7   | Implementasi `pkg/jwt`: GenerateToken, ValidateToken     | 2 jam  | ok     |
| 8   | Implementasi `AuthHandler`: Register endpoint            | 2 jam  | ok     |
| 9   | Implementasi `AuthHandler`: Login endpoint               | 1 jam  | ok     |
| 10  | Implementasi `AuthMiddleware`: JWT validation            | 2 jam  | ok     |
| 11  | Implementasi `GET /profile` (protected endpoint)         | 1 jam  | ok     |
| 12  | Implementasi `pkg/response`: Standardized JSON response  | 1 jam  | ok     |
| 13  | Setup logger middleware (request ID, duration)           | 1 jam  | ok     |
| 14  | Setup CORS middleware                                    | 30 min | ok     |
| 15  | Setup `docker-compose.yml` (MySQL container)             | 1 jam  | ok     |
| 16  | Test manual semua endpoint via Postman/cURL              | 1 jam  | ok     |

#### Frontend (Hari 5-7)

| #   | Task                                                          | Est    | Status |
| --- | ------------------------------------------------------------- | ------ | ------ |
| 17  | Inisialisasi project React + Vite + Tailwind CSS              | 1 jam  | ☐      |
| 18  | Setup folder structure (pages, components, services, etc.)    | 30 min | ☐      |
| 19  | Setup Axios instance (`services/api.js`) + interceptor JWT    | 1 jam  | ☐      |
| 20  | Buat `AuthContext` (state: user, token, isAuthenticated)      | 2 jam  | ☐      |
| 21  | Buat `AuthLayout` (layout untuk halaman auth)                 | 1 jam  | ☐      |
| 22  | Buat halaman `RegisterPage` (form + validasi + API call)      | 2 jam  | ☐      |
| 23  | Buat halaman `LoginPage` (form + validasi + API call)         | 2 jam  | ☐      |
| 24  | Implement Protected Route (redirect ke login jika belum auth) | 1 jam  | ☐      |
| 25  | Buat halaman `DashboardPage` (placeholder, untuk test auth)   | 1 jam  | ☐      |
| 26  | Setup React Router (public vs protected routes)               | 1 jam  | ☐      |
| 27  | Buat komponen UI dasar: Button, Input, Toast                  | 2 jam  | ☐      |
| 28  | Integration test: register → login → lihat dashboard          | 1 jam  | ☐      |

### ✅ Definisi "Done" Milestone 1

- [ ] User bisa register dengan validasi (email unik, password min 8 char)
- [ ] User bisa login dan mendapat JWT token
- [ ] Token tersimpan di localStorage/context di React
- [ ] Protected route redirect ke login jika belum auth
- [ ] API response menggunakan format standar
- [ ] MySQL berjalan via Docker Compose

### Deliverables

- Backend running di `localhost:8080`
- Frontend running di `localhost:3000`
- Postman collection untuk auth endpoints
- Migration file: `001_create_users.sql`

---

## Milestone 2: Manajemen Grup & Member 👥

**Durasi:** 1.5 minggu | **Priority:** P0

### Goal

User bisa membuat grup, mengundang anggota via invite code, dan melihat daftar grup yang diikuti.

### Task Breakdown

#### Backend (Hari 1-4)

| #   | Task                                                                                             | Est   | Status |
| --- | ------------------------------------------------------------------------------------------------ | ----- | ------ |
| 1   | Buat migration `002_create_groups.sql` dan `003_create_group_members.sql`                        | 1 jam | ☐      |
| 2   | Implementasi `GroupRepository`: Create, FindByID, FindByInviteCode, ListByUserID                 | 3 jam | ☐      |
| 3   | Implementasi `GroupMemberRepository`: AddMember, RemoveMember, ListMembers, IsMember             | 2 jam | ☐      |
| 4   | Implementasi `GroupService`: CreateGroup (+ generate invite code), JoinGroup, ValidateMembership | 3 jam | ☐      |
| 5   | Implementasi invite code generator (6 char alphanumeric, collision check)                        | 1 jam | ☐      |
| 6   | Implementasi `GroupHandler`: POST /groups, GET /groups, GET /groups/:id                          | 3 jam | ☐      |
| 7   | Implementasi `GroupHandler`: POST /groups/join, DELETE /groups/:id/members/:userId               | 2 jam | ☐      |
| 8   | Implementasi `GroupHandler`: PUT /groups/:id/regenerate-code                                     | 1 jam | ☐      |
| 9   | Buat membership middleware (cek apakah user adalah member grup)                                  | 2 jam | ☐      |
| 10  | Unit test untuk GroupService (invite code generation, join validation)                           | 2 jam | ☐      |

#### Frontend (Hari 5-7)

| #   | Task                                                        | Est     | Status |
| --- | ----------------------------------------------------------- | ------- | ------ |
| 11  | Buat `GroupListPage` (list semua grup user + tombol Create) | 2 jam   | ☐      |
| 12  | Buat `GroupCard` component (nama, member count, balance)    | 1 jam   | ☐      |
| 13  | Buat modal `CreateGroupForm` (nama + deskripsi)             | 1.5 jam | ☐      |
| 14  | Buat `JoinGroupPage` atau modal (input invite code)         | 1 jam   | ☐      |
| 15  | Buat `GroupDetailPage` (info grup + member list)            | 2 jam   | ☐      |
| 16  | Buat `MemberList` component (avatar, nama, role, action)    | 1 jam   | ☐      |
| 17  | Buat `InviteModal` (tampilkan invite code + copy button)    | 1 jam   | ☐      |
| 18  | Buat `MainLayout` (Navbar + Sidebar + Content area)         | 2 jam   | ☐      |
| 19  | Update routing: grup list → detail → transactions           | 1 jam   | ☐      |
| 20  | Integration test: create → invite → join → view members     | 1 jam   | ☐      |

### ✅ Definisi "Done" Milestone 2

- [ ] User bisa membuat grup dan mendapat invite code
- [ ] User lain bisa join via invite code
- [ ] Admin bisa remove member
- [ ] Admin bisa regenerate invite code
- [ ] Halaman list grup dan detail grup berfungsi
- [ ] Membership validation di semua endpoint yang membutuhkan

### Deliverables

- Migration: `002_create_groups.sql`, `003_create_group_members.sql`
- 6 endpoint grup baru berfungsi
- Halaman frontend: GroupList, GroupDetail, JoinGroup

---

## Milestone 3: Transaksi & Split Bill 💰

**Durasi:** 2 minggu | **Priority:** P0

### Goal

Core feature: user bisa mencatat transaksi, split bill ke anggota grup, dan melakukan settlement.

### Task Breakdown

#### Backend (Hari 1-6)

| #   | Task                                                                                              | Est    | Status |
| --- | ------------------------------------------------------------------------------------------------- | ------ | ------ |
| 1   | Buat migration `004_create_categories.sql` (+ seed data)                                          | 30 min | ☐      |
| 2   | Buat migration `005_create_transactions.sql`, `006_create_transaction_splits.sql`                 | 1 jam  | ☐      |
| 3   | Implementasi `CategoryRepository`: FindAll, FindByID                                              | 1 jam  | ☐      |
| 4   | Implementasi `TransactionRepository`: Create, FindByID, FindByGroupID (with filters & pagination) | 4 jam  | ☐      |
| 5   | Implementasi `TransactionSplitRepository`: CreateBatch, FindByTransactionID, UpdateSettlement     | 2 jam  | ☐      |
| 6   | Implementasi `TransactionService`: **CreateTransaction** — logika utama                           | 4 jam  | ☐      |
|     | - Validasi semua user di split_with adalah member grup                                            |        |        |
|     | - Split equally: `amount / len(users)`, handle pembulatan                                         |        |        |
|     | - Split custom: validasi total = amount                                                           |        |        |
|     | - Pembayar (paid_by) otomatis settled                                                             |        |        |
|     | - Gunakan DB transaction (BEGIN/COMMIT/ROLLBACK)                                                  |        |        |
| 7   | Implementasi `TransactionService`: **SettleTransaction**                                          | 2 jam  | ☐      |
|     | - Validasi: debtor hanya bisa settle utang sendiri                                                |        |        |
|     | - Update is_settled = true, set settled_at                                                        |        |        |
| 8   | Implementasi `TransactionHandler`: POST /transactions                                             | 2 jam  | ☐      |
| 9   | Implementasi `TransactionHandler`: GET /transactions (filters)                                    | 2 jam  | ☐      |
| 10  | Implementasi `TransactionHandler`: GET /transactions/:id                                          | 1 jam  | ☐      |
| 11  | Implementasi `TransactionHandler`: POST /transactions/:id/settle                                  | 1 jam  | ☐      |
| 12  | Implementasi query optimasi: composite index, EXPLAIN analyze                                     | 2 jam  | ☐      |
| 13  | Unit test untuk split calculation (edge cases: pembulatan, 1 user, etc.)                          | 3 jam  | ☐      |

#### Frontend (Hari 7-10)

| #   | Task                                                            | Est     | Status |
| --- | --------------------------------------------------------------- | ------- | ------ |
| 14  | Buat `TransactionListPage` (list transaksi per grup)            | 2 jam   | ☐      |
| 15  | Buat `TransactionCard` component (paid by, amount, category)    | 1.5 jam | ☐      |
| 16  | Buat `TransactionFilter` component (date range, user, category) | 2 jam   | ☐      |
| 17  | Buat `TransactionForm` — form utama untuk catat transaksi       | 4 jam   | ☐      |
|     | - Input: jumlah, deskripsi, kategori (dropdown)                 |         |        |
|     | - SplitSelector: pilih anggota + mode (equal/custom)            |         |        |
|     | - Preview pembagian sebelum submit                              |         |        |
| 18  | Buat `SplitSelector` component (multi-select members)           | 2 jam   | ☐      |
| 19  | Buat `TransactionDetailPage` (semua splits + status lunas)      | 2 jam   | ☐      |
| 20  | Implementasi settlement button (mark as paid)                   | 1 jam   | ☐      |
| 21  | Pagination component (reusable)                                 | 1 jam   | ☐      |
| 22  | Format currency helper (Rp 100.000)                             | 30 min  | ☐      |
| 23  | Integration test: create transaction → view list → settle       | 1 jam   | ☐      |

### ✅ Definisi "Done" Milestone 3

- [ ] User bisa mencatat transaksi dengan split equally
- [ ] User bisa mencatat transaksi dengan split custom
- [ ] Pembulatan split equally ditangani (sisa ke pembayar)
- [ ] Settlement berfungsi (mark as paid)
- [ ] List transaksi dengan filter dan pagination berfungsi
- [ ] Semua operasi menggunakan DB transaction

### Deliverables

- Migration: `004-006` (categories, transactions, transaction_splits)
- 4 endpoint transaksi baru berfungsi
- Split calculation logic dengan unit test
- Halaman frontend: TransactionList, TransactionForm, TransactionDetail

---

## Milestone 4: Dashboard & Laporan 📊

**Durasi:** 2 minggu | **Priority:** P1

### Goal

Dashboard visual dengan grafik ringkasan utang-piutang dan fitur export laporan ke PDF/CSV.

### Task Breakdown

#### Backend (Hari 1-5)

| #   | Task                                                                                           | Est   | Status |
| --- | ---------------------------------------------------------------------------------------------- | ----- | ------ |
| 1   | Implementasi `DashboardRepository`: GetBalanceSummary — aggregate query utang/piutang per user | 3 jam | ☐      |
| 2   | Implementasi `DashboardRepository`: GetCategoryBreakdown                                       | 2 jam | ☐      |
| 3   | Implementasi `DashboardRepository`: GetMonthlyTrend                                            | 2 jam | ☐      |
| 4   | Implementasi `DashboardService`: format data untuk charts                                      | 2 jam | ☐      |
| 5   | Implementasi `DashboardHandler`: GET /dashboard/summary                                        | 1 jam | ☐      |
| 6   | Implementasi `DashboardHandler`: GET /dashboard/chart/category                                 | 1 jam | ☐      |
| 7   | Implementasi `DashboardHandler`: GET /dashboard/chart/monthly                                  | 1 jam | ☐      |
| 8   | Implementasi `ExportService`: GenerateCSV (encoding/csv)                                       | 2 jam | ☐      |
| 9   | Implementasi `ExportService`: GeneratePDF (wkhtmltopdf / go-pdf)                               | 4 jam | ☐      |
| 10  | Implementasi `ExportHandler`: GET /export/csv, GET /export/pdf                                 | 2 jam | ☐      |
| 11  | Optimasi query dashboard (pastikan menggunakan index)                                          | 2 jam | ☐      |
| 12  | Benchmark: verifikasi response < 500ms untuk aggregate query                                   | 1 jam | ☐      |

#### Frontend (Hari 6-10)

| #   | Task                                                               | Est     | Status |
| --- | ------------------------------------------------------------------ | ------- | ------ |
| 13  | Buat `DashboardPage` layout (cards + charts area)                  | 2 jam   | ☐      |
| 14  | Buat `BalanceSummary` cards (total utang, piutang, net)            | 1.5 jam | ☐      |
| 15  | Buat `DebtList` component (siapa berutang ke saya, dan sebaliknya) | 2 jam   | ☐      |
| 16  | Install & setup Recharts                                           | 30 min  | ☐      |
| 17  | Buat `CategoryPieChart` (Recharts PieChart)                        | 2 jam   | ☐      |
| 18  | Buat `MonthlyBarChart` (Recharts BarChart)                         | 2 jam   | ☐      |
| 19  | Implementasi group selector (dropdown pilih grup di dashboard)     | 1 jam   | ☐      |
| 20  | Implementasi month/year picker untuk chart filter                  | 1 jam   | ☐      |
| 21  | Buat tombol & flow export CSV (trigger download)                   | 1 jam   | ☐      |
| 22  | Buat tombol & flow export PDF (trigger download)                   | 1 jam   | ☐      |
| 23  | Responsive design review: test di 320px, 768px, 1024px             | 2 jam   | ☐      |
| 24  | Integration test: dashboard data → charts → export                 | 1 jam   | ☐      |

### ✅ Definisi "Done" Milestone 4

- [ ] Dashboard menampilkan ringkasan utang/piutang akurat
- [ ] Pie chart kategori dan bar chart bulanan berfungsi
- [ ] Export CSV bisa di-download dan dibuka di Excel
- [ ] Export PDF terformat rapi
- [ ] Dashboard responsive di mobile
- [ ] Aggregate query < 500ms

### Deliverables

- 5 endpoint dashboard + export berfungsi
- Charts interaktif dengan Recharts
- Export CSV & PDF berfungsi
- Halaman frontend: Dashboard lengkap

---

## Milestone 5: Integrasi & Polish 🚀

**Durasi:** 1.5 minggu | **Priority:** P1

### Goal

Notifikasi Telegram terhubung, performance dioptimasi, dan aplikasi siap di-showcase.

### Task Breakdown

#### Telegram Integration (Hari 1-3)

| #   | Task                                                                      | Est     | Status |
| --- | ------------------------------------------------------------------------- | ------- | ------ |
| 1   | Setup Telegram Bot via BotFather (get bot token)                          | 30 min  | ☐      |
| 2   | Implementasi `pkg/telegram`: SendMessage wrapper                          | 2 jam   | ☐      |
| 3   | Implementasi flow connect: deep link → start bot → save chat_id           | 3 jam   | ☐      |
| 4   | Implementasi `NotificationService`: kirim notif saat transaksi baru       | 2 jam   | ☐      |
| 5   | Buat migration `007_create_notification_logs.sql`                         | 30 min  | ☐      |
| 6   | Implementasi `NotificationRepository`: Create, FindByUserID               | 1 jam   | ☐      |
| 7   | Implementasi async notification (goroutine, agar tidak blocking response) | 2 jam   | ☐      |
| 8   | Implementasi `NotificationHandler`: GET /notifications                    | 1 jam   | ☐      |
| 9   | Frontend: tombol "Connect Telegram" di profile page                       | 1 jam   | ☐      |
| 10  | Frontend: notification history page/modal                                 | 1.5 jam | ☐      |

#### Optimasi & Polish (Hari 4-7)

| #   | Task                                                   | Est    | Status |
| --- | ------------------------------------------------------ | ------ | ------ |
| 11  | Audit semua query: identifikasi dan fix N+1 queries    | 3 jam  | ☐      |
| 12  | Tambahkan EXPLAIN ANALYZE di query-query kritis        | 1 jam  | ☐      |
| 13  | (Opsional) Setup Redis untuk caching dashboard summary | 3 jam  | ☐      |
| 14  | Implementasi rate limiting di auth endpoints           | 1 jam  | ☐      |
| 15  | Implementasi graceful shutdown                         | 1 jam  | ☐      |
| 16  | Implementasi health check endpoint                     | 30 min | ☐      |
| 17  | Frontend: loading states (skeleton) di semua pages     | 2 jam  | ☐      |
| 18  | Frontend: error handling + toast notifications         | 1 jam  | ☐      |
| 19  | Frontend: empty states (no groups, no transactions)    | 1 jam  | ☐      |
| 20  | Frontend: responsive final review + fix                | 2 jam  | ☐      |
| 21  | Tulis README.md lengkap (setup, API docs, screenshots) | 2 jam  | ☐      |
| 22  | Buat Dockerfile + docker-compose (app + MySQL + Redis) | 2 jam  | ☐      |
| 23  | (Opsional) Deploy ke VPS / Railway / Render            | 3 jam  | ☐      |
| 24  | Final testing: full user flow end-to-end               | 2 jam  | ☐      |

### ✅ Definisi "Done" Milestone 5

- [ ] Telegram bot mengirim notifikasi saat transaksi baru
- [ ] User bisa connect Telegram dari profile page
- [ ] Tidak ada N+1 query
- [ ] Semua halaman punya loading state dan error handling
- [ ] Aplikasi bisa di-run via `docker-compose up`
- [ ] README lengkap dengan screenshot

### Deliverables

- Telegram bot integration berfungsi
- Docker setup lengkap
- README.md untuk portfolio showcase
- (Opsional) Live demo URL

---

## Checklist Portfolio Showcase

Setelah semua milestone selesai, pastikan:

| Item                                             | Status |
| ------------------------------------------------ | ------ |
| README.md dengan badges, screenshots, tech stack | ☐      |
| Clean commit history (conventional commits)      | ☐      |
| Docker Compose one-command setup                 | ☐      |
| API documentation (Swagger / Postman collection) | ☐      |
| Unit test coverage > 60% untuk service layer     | ☐      |
| No hardcoded secrets (semua dari env)            | ☐      |
| Mobile responsive UI                             | ☐      |
| Live demo link (jika deploy)                     | ☐      |
