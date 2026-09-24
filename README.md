<div align="center">
  <img src="https://raw.githubusercontent.com/lucide-icons/lucide/main/icons/wallet.svg" width="100" height="100" alt="SplitBill Logo">
  <h1>💸 SplitBill</h1>
  <p><strong>Smart & Modern Bill Splitting Calculator App</strong></p>
  
  [![Go Version](https://img.shields.io/badge/Go-1.22+-00ADD8?style=flat-square&logo=go)](https://golang.org/)
  [![Next.js](https://img.shields.io/badge/Next.js-14+-000000?style=flat-square&logo=next.js)](https://nextjs.org/)
  [![Docker](https://img.shields.io/badge/Docker-Ready-2496ED?style=flat-square&logo=docker)](https://www.docker.com/)
  [![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)](LICENSE)
</div>

---

**SplitBill** is a modern full-stack application designed to help you and your friends easily track and split shared expenses during holidays, dining out, or roommating. The system automatically calculates who owes whom fairly and transparently!

## ✨ Key Features

- 🔐 **Secure Authentication**: Registration and Login using JWT encryption.
- 👥 **Group Management**: Create bill-splitting groups or join via Invite Code.
- 💰 **Expense Tracking (Split)**: Log expenses and let the system divide them equally or specifically.
- 📊 **Smart Dashboard**: View summaries of debts/receivables and monthly expense charts (powered by *Recharts*).
- 🧾 **Export Reports**: Download expense recaps in **CSV** and **PDF** formats.
- 🔔 **Modern Notifications**: Interactive UI experience with *Skeleton Loading* & *Toast Notifications*.
- 🐳 **Dockerized**: Spin up the entire infrastructure (Backend, Frontend, Database) with a single command.
- 📚 **Swagger API Docs**: Fully interactive, auto-generated OpenAPI documentation.

## 🛠️ Tech Stack

### Backend (Go)
- **Framework**: [Echo v4](https://echo.labstack.com/)
- **Database**: MySQL 8.0
- **Libraries**: `sqlx`, `swaggo/swag`, `golang-jwt`, `go-sql-driver/mysql`, `x/time/rate` (Rate Limiting)
- **Special Features**: *Graceful Shutdown*, *Health Checks*, *Rate Limiting*, *Swagger UI*.

### Frontend (Next.js)
- **Framework**: [Next.js](https://nextjs.org/) (App Router)
- **Styling**: Tailwind CSS & Lucide Icons
- **Advanced Components**: `recharts` (Charts), `react-hot-toast` (Pop-ups), *Custom Skeleton Loading*.
- **Data Fetching**: Axios

---

## 🚀 How to Run (Local Development)

This project is fully configured with **Docker Compose**. You don't need to install Node.js or Go locally!

### Prerequisites:
Make sure you have [Docker Desktop](https://www.docker.com/products/docker-desktop/) installed on your machine.

### Steps:
1. **Clone this repository:**
   ```bash
   git clone https://github.com/your-username/SplitBill.git
   cd SplitBill
   ```

2. **Run Docker Compose:**
   Navigate to the `splitbill-api` directory (where the docker-compose file is located) and run:
   ```bash
   cd splitbill-api
   docker compose up -d --build
   ```

3. **Open the Application:**
   - 🌐 **Frontend (Web)**: Open [http://localhost:3000](http://localhost:3000) in your browser.
   - ⚙️ **Backend (API)**: API is running on `http://localhost:8080`.
   - 📚 **API Documentation (Swagger)**: View interactive API docs at [http://localhost:8080/swagger/index.html](http://localhost:8080/swagger/index.html).
   - 🩺 **API Health Check**: Test connectivity at [http://localhost:8080/health](http://localhost:8080/health).

4. **How to Stop:**
   ```bash
   docker compose down
   ```

## 📂 Directory Structure

```text
SplitBill/
├── splitbill-api/          # Golang Backend Code
│   ├── cmd/server/         # Application entry point (main.go)
│   ├── internal/           # Business logic (handler, service, repository, etc)
│   ├── docs/               # Auto-generated Swagger documentation
│   ├── docker-compose.yml  # Container orchestration for MySQL, API, and Web
│   └── Dockerfile          # Build script for Backend
└── splitbill-web/          # Next.js Frontend Code
    ├── src/
    │   ├── app/            # App routing (Next.js App Router)
    │   ├── features/       # Feature-specific modular components
    │   ├── lib/            # Utilities (Axios instance, Confirm Modal)
    │   └── components/     # Basic UI components (Skeleton, etc)
    └── Dockerfile          # Build script for Frontend
```

## 📸 Screenshots

*(Add screenshots of your application here. You can place images in a `docs/` folder or simply drag & drop them directly into GitHub when editing this file later).*

<details>
<summary><b>Click to view screenshots</b></summary>
<br>

- **Dashboard Page:**
  *(Image URL)*
- **Group Details & Expenses Page:**
  *(Image URL)*

</details>

## 🛡️ License
This project is licensed under the MIT License.
