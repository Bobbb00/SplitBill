# Product Requirements Document (PRD)

## SplitBill — Sistem Manajemen Hutang Piutang & Patungan

| Field          | Detail                                    |
| -------------- | ----------------------------------------- |
| **Versi**      | 1.0                                       |
| **Tanggal**    | 7 September 2026                          |
| **Author**     | Software Architect                        |
| **Status**     | Draft — Menunggu Review                   |
| **Tech Stack** | Golang, React (Vite), MySQL, Telegram Bot |

---

## 1. Latar Belakang & Tujuan

### 1.1 Masalah yang Diselesaikan

Di lingkungan kantor dan kost, aktivitas patungan (makan siang bersama, iuran WiFi, langganan bersama, dll.) terjadi hampir setiap hari. Pencatatan manual — baik lewat chat group, catatan kertas, maupun spreadsheet — menimbulkan beberapa masalah kritis:

| Masalah              | Dampak                                                        |
| -------------------- | ------------------------------------------------------------- |
| **Data tersebar**    | Catatan utang ada di chat, notes, spreadsheet — sulit dilacak |
| **Lupa bayar/tagih** | Tidak ada reminder otomatis, hubungan sosial terganggu        |
| **Kalkulasi manual** | Split bill manual rawan salah hitung                          |
| **Tidak ada rekap**  | Akhir bulan tidak tahu total utang/piutang                    |
| **Tidak transparan** | Anggota tidak bisa lihat status utang secara real-time        |

### 1.2 Tujuan Produk

SplitBill hadir sebagai **single source of truth** untuk semua transaksi hutang-piutang dalam sebuah grup. Aplikasi ini bertujuan untuk:

1. **Mendigitalisasi pencatatan** utang-piutang secara terpusat dan terstruktur.
2. **Mengotomasi pembagian** biaya (split bill) secara adil dan transparan.
3. **Memberikan visibilitas** real-time atas posisi keuangan setiap anggota dalam grup.
4. **Mengirimkan notifikasi** otomatis saat ada transaksi baru, sehingga tidak ada yang "lupa".
5. **Menghasilkan laporan** bulanan untuk rekonsiliasi dan transparansi keuangan grup.

### 1.3 Success Metrics (KPI)

| Metric                         | Target                             |
| ------------------------------ | ---------------------------------- |
| User Activation Rate           | > 70% register → create/join group |
| Weekly Active Users (WAU)      | > 60% dari total registered users  |
| Average transaction recording  | < 30 detik per transaksi           |
| Dispute rate (sengketa manual) | Turun 80% dibanding manual         |
| NPS Score                      | > 40                               |

---

## 2. User Persona

### 2.1 Persona 1: Admin/Keuangan Grup — "Rina"

```
Nama        : Rina Susanti
Usia        : 28 tahun
Pekerjaan   : Staff Administrasi Kantor
Konteks     : Sering ditunjuk jadi "bendahara" patungan makan siang tim
Pain Points :
  - Capek mencatat manual siapa yang sudah bayar/belum di group chat
  - Sering lupa siapa yang belum bayar iuran bulan lalu
  - Tidak enak nagih terus-terusan lewat chat
Goals       :
  - Bisa mencatat transaksi dengan cepat dari HP
  - Bisa melihat siapa saja yang masih berutang
  - Ada fitur reminder otomatis supaya tidak perlu nagih manual
  - Bisa export laporan di akhir bulan untuk transparansi
```

### 2.2 Persona 2: Member Biasa — "Dimas"

```
Nama        : Dimas Prasetyo
Usia        : 24 tahun
Pekerjaan   : Junior Developer, tinggal di kost
Konteks     : Ikut patungan WiFi, listrik, dan sering makan bareng teman kost
Pain Points :
  - Sering lupa berapa total utangnya ke siapa saja
  - Tidak tahu kapan terakhir kali sudah bayar
  - Merasa canggung kalau ditagih, padahal memang lupa
Goals       :
  - Bisa cek utang kapan saja dari HP
  - Mendapat notifikasi otomatis kalau ada tagihan baru
  - Bisa melihat riwayat transaksi lengkap
  - Proses pembayaran/pelunasan tercatat dengan jelas
```

### 2.3 Persona 3 (Opsional): Super Admin / Owner Sistem

```
Nama        : System Administrator
Konteks     : Mengelola keseluruhan platform (jika di-deploy untuk multi-tenant)
Goals       :
  - Monitor jumlah grup dan user aktif
  - Melihat log aktivitas sistem
  - Mengelola konfigurasi global (rate limit, maintenance mode)
```

> [!NOTE]
> Untuk MVP, fokus pada Persona 1 (Admin Grup) dan Persona 2 (Member). Persona 3 bisa ditambahkan di fase post-MVP.

---

## 3. Fitur Fungsional (User Stories)

### 3.1 Modul Autentikasi

| ID     | User Story                                                                       | Priority | Acceptance Criteria                                                                                     |
| ------ | -------------------------------------------------------------------------------- | -------- | ------------------------------------------------------------------------------------------------------- |
| AUTH-1 | Sebagai pengguna baru, saya ingin **mendaftar** dengan nama, email, dan password | P0       | - Email unik, password min 8 karakter<br>- Password di-hash bcrypt<br>- Return JWT token + user profile |
| AUTH-2 | Sebagai pengguna terdaftar, saya ingin **login** dengan email dan password       | P0       | - Validasi credential<br>- Return JWT (exp: 24 jam)<br>- Error 401 jika salah                           |
| AUTH-3 | Sebagai pengguna, saya ingin **logout** dan token saya di-invalidasi             | P1       | - Token dihapus di client-side<br>- (Opsional) blacklist token di server                                |
| AUTH-4 | Sebagai pengguna, saya ingin **melihat dan edit profil** saya (nama, avatar)     | P2       | - GET /profile menampilkan data user<br>- PUT /profile mengupdate nama/avatar                           |

### 3.2 Modul Manajemen Grup

| ID    | User Story                                                                          | Priority | Acceptance Criteria                                                                                |
| ----- | ----------------------------------------------------------------------------------- | -------- | -------------------------------------------------------------------------------------------------- |
| GRP-1 | Sebagai pengguna, saya ingin **membuat grup baru** dengan nama grup                 | P0       | - Grup dibuat dengan invite_code unik (6 char alfanumerik)<br>- Creator otomatis jadi admin grup   |
| GRP-2 | Sebagai pengguna, saya ingin **bergabung ke grup** menggunakan kode undangan        | P0       | - Validasi kode undangan<br>- User ditambahkan sebagai member<br>- Error jika kode invalid/expired |
| GRP-3 | Sebagai admin grup, saya ingin **melihat daftar anggota** grup saya                 | P0       | - Menampilkan semua member dengan role (admin/member)                                              |
| GRP-4 | Sebagai admin grup, saya ingin **menghapus anggota** dari grup                      | P1       | - Hanya admin yang bisa remove member<br>- Member yang dihapus tidak bisa mengakses grup           |
| GRP-5 | Sebagai admin grup, saya ingin **me-regenerate kode undangan** jika kode lama bocor | P2       | - Kode lama di-invalidasi<br>- Kode baru digenerate                                                |
| GRP-6 | Sebagai pengguna, saya ingin **melihat semua grup** yang saya ikuti                 | P0       | - List grup dengan nama, jumlah anggota, dan saldo ringkasan                                       |

### 3.3 Modul Transaksi & Split Bill

| ID    | User Story                                                                                     | Priority | Acceptance Criteria                                                                                                   |
| ----- | ---------------------------------------------------------------------------------------------- | -------- | --------------------------------------------------------------------------------------------------------------------- |
| TXN-1 | Sebagai anggota, saya ingin **mencatat transaksi baru** (siapa bayar, berapa, untuk apa)       | P0       | - Input: amount, description, category, paid_by, split_with[]<br>- Validasi: semua user dalam split harus member grup |
| TXN-2 | Sebagai anggota, saya ingin **membagi tagihan rata** ke semua anggota grup (Split Equally)     | P0       | - Otomatis bagi amount / jumlah anggota<br>- Handle pembulatan (sisa ke pembayar)                                     |
| TXN-3 | Sebagai anggota, saya ingin **membagi tagihan custom** (Split Unequally)                       | P1       | - Input split amount per user<br>- Validasi: total split = total amount                                               |
| TXN-4 | Sebagai anggota, saya ingin **menandai utang sebagai lunas** (Settlement)                      | P0       | - Catat pembayaran dari debtor ke creditor<br>- Update saldo kedua user                                               |
| TXN-5 | Sebagai anggota, saya ingin **melihat riwayat transaksi** grup dengan filter tanggal & anggota | P0       | - Filter: date_from, date_to, user_id, category<br>- Pagination (limit/offset)<br>- Sort by date desc                 |
| TXN-6 | Sebagai anggota, saya ingin **melihat detail transaksi** termasuk siapa saja yang di-split     | P0       | - Tampilkan detail pembagian per user<br>- Status: lunas/belum                                                        |

### 3.4 Modul Dashboard & Laporan

| ID    | User Story                                                                           | Priority | Acceptance Criteria                                                                                           |
| ----- | ------------------------------------------------------------------------------------ | -------- | ------------------------------------------------------------------------------------------------------------- |
| DSH-1 | Sebagai anggota, saya ingin melihat **ringkasan utang-piutang saya** di dashboard    | P0       | - Total utang saya (ke semua orang)<br>- Total piutang saya (dari semua orang)<br>- Net balance               |
| DSH-2 | Sebagai anggota, saya ingin melihat **daftar siapa berutang ke saya** dan sebaliknya | P0       | - List user + jumlah utang/piutang<br>- Klik untuk lihat detail transaksi                                     |
| DSH-3 | Sebagai anggota, saya ingin melihat **grafik pengeluaran per kategori** (pie chart)  | P1       | - Grafik Recharts: pie chart per kategori<br>- Filter per bulan                                               |
| DSH-4 | Sebagai anggota, saya ingin melihat **tren pengeluaran bulanan** (line/bar chart)    | P1       | - Grafik Recharts: bar chart per bulan<br>- Perbandingan utang vs piutang                                     |
| DSH-5 | Sebagai admin, saya ingin **meng-export laporan** transaksi grup ke PDF atau CSV     | P1       | - Format PDF: tabel transaksi + ringkasan<br>- Format CSV: raw data untuk spreadsheet<br>- Filter per periode |

### 3.5 Modul Notifikasi

| ID    | User Story                                                                           | Priority | Acceptance Criteria                                                                                 |
| ----- | ------------------------------------------------------------------------------------ | -------- | --------------------------------------------------------------------------------------------------- |
| NTF-1 | Sebagai anggota, saya ingin **menerima notifikasi Telegram** saat ada transaksi baru | P1       | - Bot mengirim pesan ke user/group chat<br>- Isi: "{nama} mencatat transaksi {amount} untuk {desc}" |
| NTF-2 | Sebagai anggota, saya ingin **menghubungkan akun Telegram** saya untuk notifikasi    | P1       | - Flow: user klik link → start bot → bot simpan chat_id<br>- Verifikasi via OTP/deep link           |
| NTF-3 | Sebagai admin, saya ingin **mengirim reminder** utang ke anggota yang belum bayar    | P2       | - Trigger manual atau otomatis (misal setiap Jumat)<br>- Pesan berisi ringkasan utang               |
| NTF-4 | Sebagai anggota, saya ingin melihat **log notifikasi** yang pernah dikirim ke saya   | P2       | - Riwayat notifikasi dengan status (sent/failed)                                                    |

---

## 4. Fitur Non-Fungsional

### 4.1 Performa

| Requirement                        | Target                 | Pengukuran                      |
| ---------------------------------- | ---------------------- | ------------------------------- |
| Response time API (query standar)  | < 200ms (p95)          | Load testing dengan k6/wrk      |
| Response time API (query agregasi) | < 500ms (p95)          | Dashboard summary endpoint      |
| Concurrent users                   | Minimal 100 concurrent | Stress test                     |
| Database query efficiency          | Tidak ada N+1 query    | Query logging + explain analyze |
| Frontend initial load (LCP)        | < 2.5 detik            | Lighthouse audit                |

### 4.2 Keamanan

| Requirement              | Implementasi                                                     |
| ------------------------ | ---------------------------------------------------------------- |
| Password hashing         | bcrypt dengan cost factor 12                                     |
| JWT Token                | Expiration 24 jam, signed dengan HS256, secret dari env variable |
| Input validation         | Validasi di semua endpoint (struct tags + custom validator)      |
| SQL Injection prevention | Parameterized queries (GORM/sqlx prepared statements)            |
| CORS                     | Whitelist origin (frontend domain only)                          |
| Rate limiting            | 100 req/menit per IP untuk auth endpoints                        |
| HTTPS                    | Wajib di production (via reverse proxy nginx/caddy)              |
| XSS Prevention           | React auto-escaping + Content-Security-Policy header             |

### 4.3 UI/UX

| Requirement                    | Detail                                                        |
| ------------------------------ | ------------------------------------------------------------- |
| Mobile-first responsive design | Breakpoints: 320px (mobile), 768px (tablet), 1024px (desktop) |
| Accessibility (a11y)           | Semantic HTML, ARIA labels, keyboard navigation               |
| Loading states                 | Skeleton loader untuk semua data-fetching                     |
| Error handling                 | Toast notification untuk error, dengan pesan user-friendly    |
| Offline indicator              | Banner ketika koneksi terputus                                |

### 4.4 Reliabilitas & Observabilitas

| Requirement           | Detail                                                    |
| --------------------- | --------------------------------------------------------- |
| Logging               | Structured logging (JSON) dengan level: INFO, WARN, ERROR |
| Request tracing       | Request ID di setiap log entry                            |
| Health check endpoint | `GET /health` → return DB connection status               |
| Graceful shutdown     | Handle SIGTERM, tunggu in-flight requests selesai         |

---

## 5. Batasan & Asumsi

### Batasan (Constraints)

- Aplikasi ini **bukan** e-wallet atau payment gateway — tidak ada transfer uang real.
- Tidak ada fitur multi-currency (hanya Rupiah / IDR).
- Maximum 50 anggota per grup (untuk menjaga performa split calculation).
- File upload (avatar/receipt) dibatasi maksimal 2MB.

### Asumsi (Assumptions)

- User memiliki akun Telegram untuk menerima notifikasi.
- User memiliki browser modern (Chrome 90+, Firefox 88+, Safari 14+).
- Deployment awal di single server (monolith), scaling horizontal jika dibutuhkan.
- Semua user dalam satu timezone (WIB) untuk simplicity.

---

## 6. Prioritas Rilis

```
┌──────────────────────────────────────────────────────────────────┐
│                        RELEASE STRATEGY                          │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  MVP (v1.0)                                                      │
│  ├── Auth (Register, Login, JWT)                                 │
│  ├── Grup (Create, Join, List Members)                           │
│  ├── Transaksi (Create, Split Equally, List, Settlement)         │
│  └── Dashboard (Summary utang/piutang)                           │
│                                                                  │
│  v1.1 — Enhanced                                                 │
│  ├── Notifikasi Telegram                                         │
│  ├── Export PDF/CSV                                              │
│  ├── Grafik Dashboard (Recharts)                                 │
│  └── Split Unequally                                             │
│                                                                  │
│  v2.0 — Advanced (Post-MVP)                                      │
│  ├── Reminder otomatis                                           │
│  ├── Multi-grup dashboard                                        │
│  ├── Activity feed / timeline                                    │
│  ├── Dark mode                                                   │
│  └── PWA support (offline-first)                                 │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

---

## 7. Glosarium

| Istilah         | Definisi                                                          |
| --------------- | ----------------------------------------------------------------- |
| **Split Bill**  | Membagi tagihan secara merata atau custom ke beberapa orang       |
| **Settlement**  | Proses pelunasan utang dari debtor ke creditor                    |
| **Creditor**    | Orang yang membayarkan (dan menjadi pihak yang "diutangi")        |
| **Debtor**      | Orang yang berhutang karena ikut dalam split                      |
| **Net Balance** | Selisih antara total piutang dan total utang seseorang dalam grup |
| **Invite Code** | Kode alfanumerik unik 6 karakter untuk bergabung ke grup          |
