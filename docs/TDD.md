# Technical Design Document (TDD)
## SplitBill — Arsitektur Sistem & Rancangan Teknis

| Field            | Detail                                      |
|------------------|---------------------------------------------|
| **Versi**        | 1.0                                         |
| **Tanggal**      | 7 September 2026                            |
| **Author**       | Software Architect                          |
| **Status**       | Draft                                       |

---

## 1. Arsitektur Layering (Clean Architecture)

### 1.1 Mengapa Clean Architecture?

Proyek ini mengadopsi **Layered/Clean Architecture** karena beberapa alasan:

| Alasan                     | Penjelasan                                                                  |
|----------------------------|-----------------------------------------------------------------------------|
| **Separation of Concerns** | Setiap layer punya tanggung jawab tunggal, mudah diubah tanpa efek samping  |
| **Testability**            | Business logic di layer Service bisa di-unit test tanpa DB/HTTP             |
| **Maintainability**        | Kode terorganisir, developer baru bisa onboard dengan cepat                 |
| **Flexibility**            | Bisa ganti database atau framework tanpa mengubah business logic            |
| **Portfolio Value**        | Menunjukkan pemahaman arsitektur enterprise-grade                           |

### 1.2 Diagram Alur Request

```
┌─────────────────────────────────────────────────────────────────────────┐
│                          CLIENT (React SPA)                             │
│  ┌───────────┐  ┌──────────┐  ┌──────────────┐  ┌──────────────────┐   │
│  │   Pages   │→ │  Hooks   │→ │  API Service │→ │  Axios Instance  │   │
│  │           │  │(useState)│  │  (api.ts)    │  │  (+ JWT Header)  │   │
│  └───────────┘  └──────────┘  └──────────────┘  └────────┬─────────┘   │
└──────────────────────────────────────────────────────────┬──────────────┘
                                                           │ HTTP Request
                                                           ▼
┌──────────────────────────────────────────────────────────────────────────┐
│                       GOLANG BACKEND SERVER                              │
│                                                                          │
│  ┌────────────────────────────────────────────────────────────────────┐  │
│  │ MIDDLEWARE LAYER                                                    │  │
│  │ ┌──────────┐ ┌──────────┐ ┌───────────┐ ┌────────────┐           │  │
│  │ │  CORS    │→│  Logger  │→│ Rate Limit│→│ JWT Auth   │           │  │
│  │ │          │ │(ReqID)   │ │           │ │(Validate)  │           │  │
│  │ └──────────┘ └──────────┘ └───────────┘ └──────┬─────┘           │  │
│  └────────────────────────────────────────────────┼──────────────────┘  │
│                                                    │                     │
│  ┌────────────────────────────────────────────────┼──────────────────┐  │
│  │ HANDLER LAYER (Controller)                      ▼                  │  │
│  │ ┌───────────────┐ ┌───────────────┐ ┌───────────────┐             │  │
│  │ │ AuthHandler   │ │ GroupHandler  │ │  TxnHandler   │  ...        │  │
│  │ │ - Register    │ │ - Create     │ │  - Create     │             │  │
│  │ │ - Login       │ │ - Join       │ │  - List       │             │  │
│  │ └───────┬───────┘ └───────┬──────┘ └───────┬───────┘             │  │
│  │         │ Parse & Validate│ Request         │                     │  │
│  └─────────┼─────────────────┼─────────────────┼─────────────────────┘  │
│            ▼                 ▼                 ▼                         │
│  ┌──────────────────────────────────────────────────────────────────┐    │
│  │ SERVICE LAYER (Business Logic)                                    │    │
│  │ ┌───────────────┐ ┌───────────────┐ ┌───────────────┐            │    │
│  │ │ AuthService   │ │ GroupService  │ │  TxnService   │  ...       │    │
│  │ │ - HashPwd     │ │ - GenInvCode │ │  - SplitCalc  │            │    │
│  │ │ - GenJWT      │ │ - ValidMember│ │  - Settlement │            │    │
│  │ └───────┬───────┘ └───────┬──────┘ └───────┬───────┘            │    │
│  │         │ Domain Logic     │                │                    │    │
│  └─────────┼─────────────────┼────────────────┼────────────────────┘    │
│            ▼                 ▼                ▼                          │
│  ┌──────────────────────────────────────────────────────────────────┐    │
│  │ REPOSITORY LAYER (Data Access)                                    │    │
│  │ ┌───────────────┐ ┌───────────────┐ ┌───────────────┐            │    │
│  │ │ UserRepo      │ │ GroupRepo     │ │  TxnRepo      │  ...       │    │
│  │ │ - Create      │ │ - Create     │ │  - Create     │            │    │
│  │ │ - FindByEmail │ │ - FindByCode │ │  - FindByGroup│            │    │
│  │ └───────┬───────┘ └───────┬──────┘ └───────┬───────┘            │    │
│  └─────────┼─────────────────┼────────────────┼────────────────────┘    │
│            ▼                 ▼                ▼                          │
│  ┌──────────────────────────────────────────────────────────────────┐    │
│  │                         MySQL DATABASE                            │    │
│  └──────────────────────────────────────────────────────────────────┘    │
│                                                                          │
│  ┌──────────────────────────────────────────────────────────────────┐    │
│  │ EXTERNAL SERVICES                                                 │    │
│  │ ┌──────────────────┐ ┌──────────────────┐                        │    │
│  │ │ Telegram Bot API │ │ PDF Generator    │                        │    │
│  │ └──────────────────┘ └──────────────────┘                        │    │
│  └──────────────────────────────────────────────────────────────────┘    │
└──────────────────────────────────────────────────────────────────────────┘
```

### 1.3 Penjelasan Setiap Layer

| Layer          | Tanggung Jawab                                                             | Dependency          |
|----------------|----------------------------------------------------------------------------|---------------------|
| **Middleware** | Cross-cutting concerns: auth, logging, CORS, rate limiting                 | —                   |
| **Handler**    | Parse HTTP request, validasi input, panggil service, format response       | Service (interface) |
| **Service**    | Business logic murni, orchestration, kalkulasi split bill                  | Repository (iface)  |
| **Repository** | Data access, query builder, CRUD operations                                | Database driver     |
| **Model**      | Struct definition, validation tags, DTO (Data Transfer Object)             | —                   |

> [!IMPORTANT]
> **Dependency Rule**: Layer atas boleh depend ke layer bawah, tapi TIDAK sebaliknya. Service TIDAK BOLEH import handler. Repository TIDAK BOLEH import service. Gunakan **interface** agar layer atas tidak tightly-coupled ke implementasi layer bawah.

---

## 2. Struktur Folder Proyek Golang

```
splitbill-api/
├── cmd/
│   └── server/
│       └── main.go                  # Entry point: init config, DB, router, start server
├── config/
│   ├── config.go                    # Struct config + load from env/file
│   └── .env.example                 # Template environment variables
├── internal/
│   ├── handler/                     # HTTP Handlers (Controllers)
│   │   ├── auth_handler.go          # Register, Login
│   │   ├── group_handler.go         # CRUD Grup
│   │   ├── transaction_handler.go   # CRUD Transaksi
│   │   ├── dashboard_handler.go     # Summary & Charts data
│   │   └── export_handler.go        # PDF/CSV export
│   ├── middleware/                   # HTTP Middleware
│   │   ├── auth_middleware.go       # JWT validation, extract user from token
│   │   ├── logger_middleware.go     # Request logging with request ID
│   │   ├── cors_middleware.go       # CORS configuration
│   │   └── ratelimit_middleware.go  # Rate limiting per IP
│   ├── service/                     # Business Logic Layer
│   │   ├── auth_service.go          # Password hashing, JWT generation
│   │   ├── group_service.go         # Invite code generation, member validation
│   │   ├── transaction_service.go   # Split calculation, settlement logic
│   │   ├── dashboard_service.go     # Aggregation queries
│   │   ├── export_service.go        # PDF/CSV generation logic
│   │   └── notification_service.go  # Telegram notification dispatch
│   ├── repository/                  # Data Access Layer
│   │   ├── user_repository.go
│   │   ├── group_repository.go
│   │   ├── transaction_repository.go
│   │   ├── category_repository.go
│   │   └── notification_repository.go
│   ├── model/                       # Domain Models & DTOs
│   │   ├── user.go                  # User struct + validation tags
│   │   ├── group.go                 # Group struct
│   │   ├── transaction.go           # Transaction + TransactionSplit structs
│   │   ├── category.go              # Category struct
│   │   ├── notification.go          # Notification log struct
│   │   └── dto/                     # Request/Response DTOs
│   │       ├── auth_dto.go          # RegisterRequest, LoginRequest, LoginResponse
│   │       ├── group_dto.go         # CreateGroupRequest, JoinGroupRequest
│   │       ├── transaction_dto.go   # CreateTransactionRequest, etc.
│   │       └── dashboard_dto.go     # SummaryResponse, ChartData
│   └── router/
│       └── router.go                # Route registration, middleware binding
├── pkg/                             # Shared/reusable packages
│   ├── jwt/
│   │   └── jwt.go                   # JWT generate & validate utilities
│   ├── response/
│   │   └── response.go              # Standardized API response helper
│   ├── validator/
│   │   └── validator.go             # Custom validation rules
│   └── telegram/
│       └── telegram.go              # Telegram Bot API client wrapper
├── migrations/                      # Database migration files
│   ├── 001_create_users.sql
│   ├── 002_create_groups.sql
│   ├── 003_create_transactions.sql
│   └── ...
├── docs/                            # API documentation (Swagger/OpenAPI)
│   └── swagger.yaml
├── go.mod
├── go.sum
├── Makefile                         # Build, run, test, migrate commands
├── Dockerfile
├── docker-compose.yml               # MySQL + App container
└── README.md
```

### Penjelasan Folder

| Folder               | Fungsi                                                                              |
|---------------------- |-------------------------------------------------------------------------------------|
| `cmd/server/`         | Entry point aplikasi. Hanya berisi bootstrapping: load config, init DB, start HTTP  |
| `config/`             | Konfigurasi dari env variables (DB host, JWT secret, Telegram token, dll)           |
| `internal/handler/`   | Menerima HTTP request, parse body/query, panggil service, return JSON response      |
| `internal/middleware/` | Cross-cutting: JWT auth check, logging, CORS, rate limiting                        |
| `internal/service/`   | Business logic murni. Bisa di-test tanpa HTTP dan tanpa database                   |
| `internal/repository/` | Query database. Satu file per entity. Return domain model                         |
| `internal/model/`     | Struct Go yang merepresentasikan tabel database dan DTO request/response            |
| `internal/router/`    | Registrasi semua route + middleware ke mux/echo instance                            |
| `pkg/`                | Package yang bisa di-reuse di proyek lain (JWT helper, response formatter)          |
| `migrations/`         | SQL migration files, dijalankan secara berurutan                                   |

> [!TIP]
> Gunakan `internal/` agar package tidak bisa di-import oleh proyek Go lain. Ini adalah konvensi Go standar untuk encapsulation.

---

## 3. Struktur Folder Proyek Next.js (App Router + TypeScript)

`	ext
splitbill-web/
├── public/
│   ├── favicon.ico
│   └── logo.svg
├── src/
│   ├── app/                         # App Router (Pages & Routing)
│   │   ├── (auth)/                  # Route group untuk Auth (tanpa /auth di URL)
│   │   │   ├── login/
│   │   │   │   └── page.tsx         # Akses di /login
│   │   │   └── register/
│   │   │       └── page.tsx         # Akses di /register
│   │   ├── dashboard/
│   │   │   └── page.tsx             # Akses di /dashboard
│   │   ├── groups/
│   │   │   ├── [id]/                # Dynamic route untuk Detail Grup
│   │   │   │   └── page.tsx         # Akses di /groups/123
│   │   │   └── page.tsx             # Akses di /groups
│   │   ├── layout.tsx               # Root layout universal
│   │   └── page.tsx                 # Landing page (/)
│   ├── components/                  # Reusable UI components
│   │   ├── ui/                      # Atomic UI components
│   │   │   ├── Button.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Modal.tsx
│   │   │   └── Toast.tsx
│   │   ├── layout/                  # Layout components
│   │   │   ├── Navbar.tsx
│   │   │   └── Sidebar.tsx
│   │   └── dashboard/               # Fitur spesifik komponen
│   ├── lib/                         # Konfigurasi & Utility
│   │   ├── api.ts                   # Axios instance dengan interceptors
│   │   ├── utils.ts                 # Helper classNames, formatters
│   │   └── constants.ts
│   ├── hooks/                       # Custom React hooks (jika pakai Client Components)
│   └── types/                       # Definisi interface TypeScript
│       ├── user.d.ts
│       └── group.d.ts
`

## 4. Skema Database (ERD)

### 4.1 Entity Relationship Diagram

```mermaid
erDiagram
    USERS {
        bigint id PK "AUTO_INCREMENT"
        varchar(100) name "NOT NULL"
        varchar(255) email "NOT NULL, UNIQUE"
        varchar(255) password_hash "NOT NULL"
        varchar(500) avatar_url "NULLABLE"
        varchar(50) telegram_chat_id "NULLABLE, untuk notifikasi"
        timestamp created_at "DEFAULT CURRENT_TIMESTAMP"
        timestamp updated_at "ON UPDATE CURRENT_TIMESTAMP"
    }

    GROUPS {
        bigint id PK "AUTO_INCREMENT"
        varchar(100) name "NOT NULL"
        varchar(6) invite_code "NOT NULL, UNIQUE"
        bigint created_by FK "→ users.id"
        text description "NULLABLE"
        timestamp created_at "DEFAULT CURRENT_TIMESTAMP"
        timestamp updated_at "ON UPDATE CURRENT_TIMESTAMP"
    }

    GROUP_MEMBERS {
        bigint id PK "AUTO_INCREMENT"
        bigint group_id FK "→ groups.id"
        bigint user_id FK "→ users.id"
        enum role "('admin','member') DEFAULT 'member'"
        timestamp joined_at "DEFAULT CURRENT_TIMESTAMP"
    }

    CATEGORIES {
        bigint id PK "AUTO_INCREMENT"
        varchar(50) name "NOT NULL, UNIQUE"
        varchar(50) icon "NULLABLE, emoji/icon name"
        varchar(7) color "NULLABLE, hex color"
    }

    TRANSACTIONS {
        bigint id PK "AUTO_INCREMENT"
        bigint group_id FK "→ groups.id"
        bigint paid_by FK "→ users.id (creditor)"
        decimal(15,2) total_amount "NOT NULL"
        varchar(255) description "NOT NULL"
        bigint category_id FK "→ categories.id"
        enum split_type "('equal','custom','settlement')"
        timestamp transaction_date "NOT NULL"
        timestamp created_at "DEFAULT CURRENT_TIMESTAMP"
    }

    TRANSACTION_SPLITS {
        bigint id PK "AUTO_INCREMENT"
        bigint transaction_id FK "→ transactions.id"
        bigint user_id FK "→ users.id (debtor)"
        decimal(15,2) amount "NOT NULL, jumlah hutang user ini"
        boolean is_settled "DEFAULT FALSE"
        timestamp settled_at "NULLABLE"
    }

    NOTIFICATION_LOGS {
        bigint id PK "AUTO_INCREMENT"
        bigint user_id FK "→ users.id"
        bigint transaction_id FK "→ transactions.id, NULLABLE"
        varchar(20) channel "('telegram','email')"
        text message "NOT NULL"
        varchar(20) status "('pending','sent','failed')"
        timestamp sent_at "NULLABLE"
        timestamp created_at "DEFAULT CURRENT_TIMESTAMP"
    }

    USERS ||--o{ GROUP_MEMBERS : "belongs to"
    GROUPS ||--o{ GROUP_MEMBERS : "has"
    USERS ||--o{ GROUPS : "creates"
    GROUPS ||--o{ TRANSACTIONS : "contains"
    USERS ||--o{ TRANSACTIONS : "pays"
    CATEGORIES ||--o{ TRANSACTIONS : "categorizes"
    TRANSACTIONS ||--o{ TRANSACTION_SPLITS : "splits into"
    USERS ||--o{ TRANSACTION_SPLITS : "owes"
    USERS ||--o{ NOTIFICATION_LOGS : "receives"
    TRANSACTIONS ||--o{ NOTIFICATION_LOGS : "triggers"
```

### 4.2 Detail Tabel & Relasi

#### Tabel `users`
```sql
CREATE TABLE users (
    id          BIGINT AUTO_INCREMENT PRIMARY KEY,
    name        VARCHAR(100) NOT NULL,
    email       VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    avatar_url  VARCHAR(500) DEFAULT NULL,
    telegram_chat_id VARCHAR(50) DEFAULT NULL,
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    INDEX idx_users_email (email)
);
```

#### Tabel `groups`
```sql
CREATE TABLE `groups` (
    id          BIGINT AUTO_INCREMENT PRIMARY KEY,
    name        VARCHAR(100) NOT NULL,
    invite_code VARCHAR(6) NOT NULL UNIQUE,
    created_by  BIGINT NOT NULL,
    description TEXT DEFAULT NULL,
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    INDEX idx_groups_invite_code (invite_code),
    CONSTRAINT fk_groups_created_by FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE
);
```

#### Tabel `group_members`
```sql
CREATE TABLE group_members (
    id          BIGINT AUTO_INCREMENT PRIMARY KEY,
    group_id    BIGINT NOT NULL,
    user_id     BIGINT NOT NULL,
    role        ENUM('admin', 'member') DEFAULT 'member',
    joined_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    UNIQUE INDEX idx_gm_unique (group_id, user_id),
    INDEX idx_gm_user (user_id),
    CONSTRAINT fk_gm_group FOREIGN KEY (group_id) REFERENCES `groups`(id) ON DELETE CASCADE,
    CONSTRAINT fk_gm_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

#### Tabel `categories`
```sql
CREATE TABLE categories (
    id    BIGINT AUTO_INCREMENT PRIMARY KEY,
    name  VARCHAR(50) NOT NULL UNIQUE,
    icon  VARCHAR(50) DEFAULT NULL,
    color VARCHAR(7) DEFAULT NULL
);

-- Seed data
INSERT INTO categories (name, icon, color) VALUES
('Makanan', '🍔', '#FF6B6B'),
('Transport', '🚗', '#4ECDC4'),
('Iuran', '💰', '#45B7D1'),
('Belanja', '🛒', '#96CEB4'),
('Hiburan', '🎮', '#FFEAA7'),
('Lainnya', '📦', '#A0A0A0');
```

#### Tabel `transactions`
```sql
CREATE TABLE transactions (
    id               BIGINT AUTO_INCREMENT PRIMARY KEY,
    group_id         BIGINT NOT NULL,
    paid_by          BIGINT NOT NULL,
    total_amount     DECIMAL(15,2) NOT NULL,
    description      VARCHAR(255) NOT NULL,
    category_id      BIGINT NOT NULL,
    split_type       ENUM('equal', 'custom', 'settlement') NOT NULL DEFAULT 'equal',
    transaction_date TIMESTAMP NOT NULL,
    created_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    INDEX idx_txn_group (group_id),
    INDEX idx_txn_paid_by (paid_by),
    INDEX idx_txn_date (transaction_date),
    INDEX idx_txn_group_date (group_id, transaction_date),
    CONSTRAINT fk_txn_group FOREIGN KEY (group_id) REFERENCES `groups`(id) ON DELETE CASCADE,
    CONSTRAINT fk_txn_paid_by FOREIGN KEY (paid_by) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_txn_category FOREIGN KEY (category_id) REFERENCES categories(id)
);
```

#### Tabel `transaction_splits`
```sql
CREATE TABLE transaction_splits (
    id              BIGINT AUTO_INCREMENT PRIMARY KEY,
    transaction_id  BIGINT NOT NULL,
    user_id         BIGINT NOT NULL,
    amount          DECIMAL(15,2) NOT NULL,
    is_settled      BOOLEAN DEFAULT FALSE,
    settled_at      TIMESTAMP NULL DEFAULT NULL,

    INDEX idx_ts_transaction (transaction_id),
    INDEX idx_ts_user (user_id),
    INDEX idx_ts_user_settled (user_id, is_settled),
    CONSTRAINT fk_ts_transaction FOREIGN KEY (transaction_id) REFERENCES transactions(id) ON DELETE CASCADE,
    CONSTRAINT fk_ts_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

#### Tabel `notification_logs`
```sql
CREATE TABLE notification_logs (
    id              BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id         BIGINT NOT NULL,
    transaction_id  BIGINT DEFAULT NULL,
    channel         VARCHAR(20) NOT NULL DEFAULT 'telegram',
    message         TEXT NOT NULL,
    status          VARCHAR(20) NOT NULL DEFAULT 'pending',
    sent_at         TIMESTAMP NULL DEFAULT NULL,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    INDEX idx_nl_user (user_id),
    INDEX idx_nl_status (status),
    CONSTRAINT fk_nl_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_nl_transaction FOREIGN KEY (transaction_id) REFERENCES transactions(id) ON DELETE SET NULL
);
```

### 4.3 Strategi Indexing

| Index                                  | Tujuan                                                    | Query Pattern                                |
|----------------------------------------|-----------------------------------------------------------|----------------------------------------------|
| `idx_users_email`                      | Lookup cepat saat login                                   | `WHERE email = ?`                            |
| `idx_groups_invite_code`               | Join grup via kode undangan                               | `WHERE invite_code = ?`                      |
| `idx_gm_unique(group_id, user_id)`     | Prevent duplicate membership + lookup cepat               | `WHERE group_id = ? AND user_id = ?`         |
| `idx_gm_user(user_id)`                 | List semua grup yang diikuti user                         | `WHERE user_id = ?`                          |
| `idx_txn_group_date(group_id, date)`   | List transaksi per grup dengan filter tanggal             | `WHERE group_id = ? AND date BETWEEN ? AND ?`|
| `idx_ts_user_settled(user_id, settled)`| Dashboard: hitung total utang belum lunas                 | `WHERE user_id = ? AND is_settled = FALSE`   |

---

## 5. API Blueprint (RESTful)

### 5.1 Konvensi API

| Aspek              | Konvensi                                                              |
|--------------------|-----------------------------------------------------------------------|
| **Base URL**       | `/api/v1`                                                             |
| **Content-Type**   | `application/json`                                                    |
| **Auth Header**    | `Authorization: Bearer <jwt_token>`                                   |
| **Pagination**     | Query params: `?page=1&limit=20`                                      |
| **Date Format**    | ISO 8601: `2026-09-07T15:00:00Z`                                      |
| **Response Wrap**  | `{ "success": bool, "message": string, "data": object/array }`        |
| **Error Response** | `{ "success": false, "message": "Error detail", "errors": [] }`       |

### 5.2 Endpoint List

---

#### 🔐 Authentication

##### `POST /api/v1/auth/register`
Mendaftarkan user baru.

**Request Body:**
```json
{
  "name": "Dimas Prasetyo",
  "email": "dimas@example.com",
  "password": "securePass123"
}
```

**Response `201 Created`:**
```json
{
  "success": true,
  "message": "Registration successful",
  "data": {
    "user": {
      "id": 1,
      "name": "Dimas Prasetyo",
      "email": "dimas@example.com",
      "created_at": "2026-09-07T15:00:00Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

**Error Responses:**
- `400 Bad Request` — Validasi gagal (email format, password terlalu pendek)
- `409 Conflict` — Email sudah terdaftar

---

##### `POST /api/v1/auth/login`
Login dan mendapatkan JWT token.

**Request Body:**
```json
{
  "email": "dimas@example.com",
  "password": "securePass123"
}
```

**Response `200 OK`:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": 1,
      "name": "Dimas Prasetyo",
      "email": "dimas@example.com",
      "avatar_url": null
    },
    "token": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

**Error Responses:**
- `400 Bad Request` — Field kosong
- `401 Unauthorized` — Email/password salah

---

##### `GET /api/v1/auth/profile`  🔒
Mendapatkan profil user yang sedang login.

**Response `200 OK`:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Dimas Prasetyo",
    "email": "dimas@example.com",
    "avatar_url": null,
    "telegram_chat_id": "123456789",
    "created_at": "2026-09-07T15:00:00Z"
  }
}
```

---

##### `PUT /api/v1/auth/profile`  🔒
Update profil user.

**Request Body:**
```json
{
  "name": "Dimas P.",
  "avatar_url": "https://example.com/avatar.jpg"
}
```

**Response `200 OK`:**
```json
{
  "success": true,
  "message": "Profile updated",
  "data": { "id": 1, "name": "Dimas P.", "avatar_url": "https://..." }
}
```

---

#### 👥 Groups

##### `POST /api/v1/groups`  🔒
Membuat grup baru. Creator otomatis jadi admin.

**Request Body:**
```json
{
  "name": "Kost Gang Mangga",
  "description": "Patungan penghuni kost"
}
```

**Response `201 Created`:**
```json
{
  "success": true,
  "message": "Group created",
  "data": {
    "id": 1,
    "name": "Kost Gang Mangga",
    "description": "Patungan penghuni kost",
    "invite_code": "A1B2C3",
    "created_by": 1,
    "member_count": 1,
    "created_at": "2026-09-07T15:00:00Z"
  }
}
```

---

##### `GET /api/v1/groups`  🔒
List semua grup yang diikuti user.

**Response `200 OK`:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Kost Gang Mangga",
      "invite_code": "A1B2C3",
      "member_count": 5,
      "my_balance": -150000,
      "role": "admin"
    }
  ]
}
```

---

##### `GET /api/v1/groups/:id`  🔒
Detail grup beserta daftar anggota.

**Response `200 OK`:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Kost Gang Mangga",
    "description": "Patungan penghuni kost",
    "invite_code": "A1B2C3",
    "created_by": { "id": 1, "name": "Rina" },
    "members": [
      { "id": 1, "name": "Rina", "role": "admin", "joined_at": "..." },
      { "id": 2, "name": "Dimas", "role": "member", "joined_at": "..." }
    ],
    "created_at": "2026-09-07T15:00:00Z"
  }
}
```

**Error:** `403 Forbidden` — User bukan anggota grup

---

##### `POST /api/v1/groups/join`  🔒
Bergabung ke grup via invite code.

**Request Body:**
```json
{
  "invite_code": "A1B2C3"
}
```

**Response `200 OK`:**
```json
{
  "success": true,
  "message": "Successfully joined group",
  "data": { "group_id": 1, "name": "Kost Gang Mangga", "role": "member" }
}
```

**Error Responses:**
- `404 Not Found` — Kode undangan tidak valid
- `409 Conflict` — User sudah menjadi anggota

---

##### `DELETE /api/v1/groups/:id/members/:userId`  🔒
Admin menghapus anggota dari grup.

**Response `200 OK`:**
```json
{
  "success": true,
  "message": "Member removed from group"
}
```

**Error:** `403 Forbidden` — Hanya admin yang bisa remove

---

##### `PUT /api/v1/groups/:id/regenerate-code`  🔒
Admin me-regenerate invite code.

**Response `200 OK`:**
```json
{
  "success": true,
  "data": { "invite_code": "X9Y8Z7" }
}
```

---

#### 💰 Transactions

##### `POST /api/v1/transactions`  🔒
Catat transaksi baru (termasuk split).

**Request Body:**
```json
{
  "group_id": 1,
  "total_amount": 100000,
  "description": "Makan siang nasi padang",
  "category_id": 1,
  "split_type": "equal",
  "transaction_date": "2026-09-07T12:00:00Z",
  "split_with": [1, 2, 3, 4]
}
```

> [!NOTE]
> Untuk `split_type: "equal"` → `split_with` berisi array user IDs (termasuk pembayar). Amount otomatis dibagi rata.
> Untuk `split_type: "custom"` → gunakan format: `"splits": [{"user_id": 2, "amount": 30000}, ...]`
> Untuk `split_type: "settlement"` → hanya ada satu user di splits (orang yang melunasi utang).

**Response `201 Created`:**
```json
{
  "success": true,
  "message": "Transaction created",
  "data": {
    "id": 1,
    "group_id": 1,
    "paid_by": { "id": 1, "name": "Rina" },
    "total_amount": 100000,
    "description": "Makan siang nasi padang",
    "category": { "id": 1, "name": "Makanan", "icon": "🍔" },
    "split_type": "equal",
    "splits": [
      { "user_id": 1, "name": "Rina", "amount": 25000, "is_settled": true },
      { "user_id": 2, "name": "Dimas", "amount": 25000, "is_settled": false },
      { "user_id": 3, "name": "Budi", "amount": 25000, "is_settled": false },
      { "user_id": 4, "name": "Ani", "amount": 25000, "is_settled": false }
    ],
    "transaction_date": "2026-09-07T12:00:00Z",
    "created_at": "2026-09-07T12:05:00Z"
  }
}
```

---

##### `GET /api/v1/transactions?group_id=1&page=1&limit=20&start_date=...&end_date=...&user_id=...&category_id=...`  🔒
List transaksi dengan filter dan pagination.

**Query Parameters:**

| Param         | Type   | Required | Description                       |
|---------------|--------|----------|-----------------------------------|
| `group_id`    | int    | Yes      | Filter by grup                    |
| `page`        | int    | No       | Default: 1                        |
| `limit`       | int    | No       | Default: 20, Max: 100             |
| `start_date`  | string | No       | ISO 8601 datetime                 |
| `end_date`    | string | No       | ISO 8601 datetime                 |
| `user_id`     | int    | No       | Filter by specific user           |
| `category_id` | int    | No       | Filter by category                |

**Response `200 OK`:**
```json
{
  "success": true,
  "data": {
    "transactions": [
      {
        "id": 1,
        "paid_by": { "id": 1, "name": "Rina" },
        "total_amount": 100000,
        "description": "Makan siang nasi padang",
        "category": { "id": 1, "name": "Makanan", "icon": "🍔" },
        "split_type": "equal",
        "split_count": 4,
        "my_share": 25000,
        "is_my_share_settled": false,
        "transaction_date": "2026-09-07T12:00:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total_items": 45,
      "total_pages": 3
    }
  }
}
```

---

##### `GET /api/v1/transactions/:id`  🔒
Detail transaksi lengkap dengan semua splits.

**Response `200 OK`:** (format sama dengan response POST di atas)

---

##### `POST /api/v1/transactions/:id/settle`  🔒
Menandai split sebagai lunas (settlement oleh debtor).

**Request Body:**
```json
{
  "user_id": 2
}
```

**Response `200 OK`:**
```json
{
  "success": true,
  "message": "Settlement recorded",
  "data": {
    "transaction_id": 1,
    "user_id": 2,
    "amount": 25000,
    "is_settled": true,
    "settled_at": "2026-09-08T10:00:00Z"
  }
}
```

---

#### 📊 Dashboard

##### `GET /api/v1/dashboard/summary?group_id=1`  🔒
Ringkasan utang-piutang user di suatu grup.

**Response `200 OK`:**
```json
{
  "success": true,
  "data": {
    "total_owed_to_me": 150000,
    "total_i_owe": 75000,
    "net_balance": 75000,
    "debts": [
      { "user": { "id": 2, "name": "Dimas" }, "amount": 50000 },
      { "user": { "id": 3, "name": "Budi" }, "amount": 100000 }
    ],
    "credits": [
      { "user": { "id": 4, "name": "Ani" }, "amount": 75000 }
    ]
  }
}
```

---

##### `GET /api/v1/dashboard/chart/category?group_id=1&month=2026-09`  🔒
Data chart pengeluaran per kategori.

**Response `200 OK`:**
```json
{
  "success": true,
  "data": [
    { "category": "Makanan", "icon": "🍔", "color": "#FF6B6B", "total": 500000, "percentage": 45.5 },
    { "category": "Transport", "icon": "🚗", "color": "#4ECDC4", "total": 300000, "percentage": 27.3 },
    { "category": "Iuran", "icon": "💰", "color": "#45B7D1", "total": 300000, "percentage": 27.2 }
  ]
}
```

---

##### `GET /api/v1/dashboard/chart/monthly?group_id=1&year=2026`  🔒
Data chart tren bulanan.

**Response `200 OK`:**
```json
{
  "success": true,
  "data": [
    { "month": "2026-01", "total_spent": 1200000, "total_owed": 400000, "total_paid": 800000 },
    { "month": "2026-02", "total_spent": 950000, "total_owed": 200000, "total_paid": 750000 }
  ]
}
```

---

#### 📤 Export

##### `GET /api/v1/export/csv?group_id=1&start_date=...&end_date=...`  🔒
Export transaksi ke CSV.

**Response `200 OK`:** `Content-Type: text/csv`
```
Date,Paid By,Amount,Description,Category,Split Type
2026-09-07,Rina,100000,Makan siang nasi padang,Makanan,equal
...
```

---

##### `GET /api/v1/export/pdf?group_id=1&start_date=...&end_date=...`  🔒
Export laporan ke PDF.

**Response `200 OK`:** `Content-Type: application/pdf`
Binary PDF file download.

---

#### 🔔 Notifications

##### `POST /api/v1/notifications/telegram/connect`  🔒
Menghubungkan akun Telegram user.

**Request Body:**
```json
{
  "telegram_chat_id": "123456789"
}
```

**Response `200 OK`:**
```json
{
  "success": true,
  "message": "Telegram connected successfully"
}
```

---

##### `GET /api/v1/notifications?page=1&limit=20`  🔒
Riwayat notifikasi yang diterima user.

**Response `200 OK`:**
```json
{
  "success": true,
  "data": {
    "notifications": [
      {
        "id": 1,
        "message": "Rina mencatat transaksi Rp 100.000 untuk Makan siang nasi padang",
        "channel": "telegram",
        "status": "sent",
        "sent_at": "2026-09-07T12:05:10Z"
      }
    ],
    "pagination": { "page": 1, "limit": 20, "total_items": 5, "total_pages": 1 }
  }
}
```

---

#### 🏥 System

##### `GET /health`
Health check endpoint.

**Response `200 OK`:**
```json
{
  "status": "healthy",
  "database": "connected",
  "uptime": "2h30m15s",
  "version": "1.0.0"
}
```

---

### 5.3 Summary: Semua Endpoint

| Method   | Path                                          | Auth | Description                           |
|----------|-----------------------------------------------|------|---------------------------------------|
| `POST`   | `/api/v1/auth/register`                       | ❌   | Register user baru                    |
| `POST`   | `/api/v1/auth/login`                          | ❌   | Login + get JWT                       |
| `GET`    | `/api/v1/auth/profile`                        | ✅   | Get my profile                        |
| `PUT`    | `/api/v1/auth/profile`                        | ✅   | Update my profile                     |
| `POST`   | `/api/v1/groups`                              | ✅   | Create group                          |
| `GET`    | `/api/v1/groups`                              | ✅   | List my groups                        |
| `GET`    | `/api/v1/groups/:id`                          | ✅   | Get group detail + members            |
| `POST`   | `/api/v1/groups/join`                         | ✅   | Join group via invite code            |
| `DELETE` | `/api/v1/groups/:id/members/:userId`          | ✅   | Remove member (admin only)            |
| `PUT`    | `/api/v1/groups/:id/regenerate-code`          | ✅   | Regenerate invite code (admin only)   |
| `POST`   | `/api/v1/transactions`                        | ✅   | Create transaction + splits           |
| `GET`    | `/api/v1/transactions`                        | ✅   | List transactions (with filters)      |
| `GET`    | `/api/v1/transactions/:id`                    | ✅   | Get transaction detail                |
| `POST`   | `/api/v1/transactions/:id/settle`             | ✅   | Mark split as settled                 |
| `GET`    | `/api/v1/dashboard/summary`                   | ✅   | Balance summary                       |
| `GET`    | `/api/v1/dashboard/chart/category`            | ✅   | Category pie chart data               |
| `GET`    | `/api/v1/dashboard/chart/monthly`             | ✅   | Monthly bar chart data                |
| `GET`    | `/api/v1/export/csv`                          | ✅   | Export CSV                            |
| `GET`    | `/api/v1/export/pdf`                          | ✅   | Export PDF                            |
| `POST`   | `/api/v1/notifications/telegram/connect`      | ✅   | Connect Telegram account              |
| `GET`    | `/api/v1/notifications`                       | ✅   | List notification history             |
| `GET`    | `/health`                                     | ❌   | Health check                          |
