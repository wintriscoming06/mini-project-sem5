# Sports Stats & Scouting Platform (SSSP)

SSSP is an end-to-end sports analytics, tournament management, and scouting system catering to three primary stakeholders: **Players**, **Organizers**, and **Scouts**.

---

## Architecture Overview

The system is organized around clean architectural boundaries with strict inward dependency flow:

```
[ Presentation / API ]  -->  [ Application / Services ]  -->  [ Domain & Business Rules ]
       ^                                                                ^
       |                                                                |
[ HTTP Controllers, DTOs ]                                     [ Entities, GPI Engine ]
                                                                        ^
                                                                        |
                                                           [ Infrastructure / Repositories ]
```

### Layer Responsibilities
- **Domain**: Entities (`PlayerProfile`, `Tournament`, `TournamentApplication`, `Match`, `PlayerMatchStatistics`, `ScoutObservation`, `User`) and pure calculation rules (`GPIEngine`, `ObservationScoreCalculator`, `TieBreaker`).
- **Application**: Business use-case orchestrators (`PlayerService`, `TournamentService`, `MatchService`, `GPIService`, `RankingService`, `ScoutService`, `AdminService`, `AuthService`).
- **Infrastructure**: Spring Data JPA repositories, database transactions, PostgreSQL configuration, JWT provider, and Spring Security filter chains.
- **Presentation / API**: REST endpoints, request/response DTOs with validation annotations, and centralized exception handling (`GlobalExceptionHandler`).

---

## Directory Structure

```
mini-project-sem5/
├── .env.example
├── .gitignore
├── README.md
├── sssp-backend/
│   ├── pom.xml
│   └── src/
│       ├── main/
│       │   ├── java/com/sssp/
│       │   │   ├── admin/             # Admin console services & controllers
│       │   │   ├── alert/             # Scout alert entities & repositories
│       │   │   ├── audit/             # Audit logging
│       │   │   ├── auth/              # JWT authentication endpoints
│       │   │   ├── common/            # BaseEntity, Enums, GlobalExceptionHandler
│       │   │   ├── config/            # SecurityConfig, CorsConfig, OpenApiConfig
│       │   │   ├── correction/        # Stat correction request tracking
│       │   │   ├── gpi/               # GPI calculation engine, weights, history
│       │   │   ├── match/             # Match scheduling, events, & participation
│       │   │   ├── player/            # Player profiles, attributes, FUT card customization
│       │   │   ├── ranking/           # Leaderboards & eligibility engines
│       │   │   ├── scout/             # Player search, shortlists, observations, notes, filters
│       │   │   ├── security/          # JWT filters, UserDetailsService
│       │   │   ├── stats/             # Match performance statistics & aggregation
│       │   │   ├── team/              # Team creation & rosters
│       │   │   ├── tournament/        # Tournament creation, applications & decisions
│       │   │   └── user/              # User entity & role repository
│       │   └── resources/
│       │       ├── application.yml
│       │       └── application.properties
│       └── test/
│           └── java/com/sssp/
│               └── CoreBusinessLogicTest.java   # GPI calculation & regression tests
└── sssp-frontend/
    ├── package.json
    ├── tailwind.config.js
    ├── public/
    │   └── index.html
    └── src/
        ├── components/        # Reusable UI, layout, pitch widgets, & cards
        ├── context/           # AuthContext & ThemeContext
        ├── pages/
        │   ├── auth/          # Login & Registration
        │   ├── player/        # Player dashboard, profile, card studio, stats
        │   ├── organizer/     # Tournament & match management, live scoring
        │   ├── scout/         # Player search, comparisons, shortlists, dossier
        │   └── admin/         # User management, audit logs, GPI config
        ├── services/
        │   └── api.js         # Centralized API client & HTTP interceptors
        └── utils/             # Theme tokens, formatters, and card designs
```

---

## Setup & Running the Platform

### Prerequisites
- Java 25 LTS (Eclipse Adoptium / OpenJDK 25)
- Maven 3.8+
- Node.js 18+ and npm
- PostgreSQL 14+ running locally on port 5432

### 1. Database Configuration
Create the database in PostgreSQL:
```sql
CREATE DATABASE sssp_db;
```

Copy `.env.example` to configure local variables:
```bash
cp .env.example .env
```

### 2. Backend Setup
```bash
cd sssp-backend
JAVA_HOME=/path/to/jdk-25 mvn clean compile
JAVA_HOME=/path/to/jdk-25 mvn spring-boot:run
```
The backend API server will start on `http://localhost:8080`.

### 3. Frontend Setup
```bash
cd sssp-frontend
npm install
npm start
```
The frontend UI will start on `http://localhost:3000`.

---

## Environment Variables

| Variable | Default Value | Description |
| :--- | :--- | :--- |
| `PORT` | `8080` | Backend HTTP port |
| `DB_HOST` | `localhost` | PostgreSQL host |
| `DB_PORT` | `5432` | PostgreSQL port |
| `DB_NAME` | `sssp_db` | PostgreSQL database name |
| `DB_USER` | `postgres` | Database username |
| `DB_PASSWORD` | `postgres` | Database password |
| `JWT_SECRET` | `404E63...` | 256-bit HMAC secret key for JWT tokens |
| `JWT_EXPIRATION_MS` | `86400000` | Token validity duration (24 hours) |
| `REACT_APP_API_BASE_URL` | `http://localhost:8080/api` | API base URL consumed by frontend |

---

## API Endpoints Reference

### Authentication
- `POST /api/auth/register` - Create new Player, Organiser, or Scout account
- `POST /api/auth/login` - Authenticate and acquire JWT token
- `GET /api/auth/me` - Retrieve current session user

### Player
- `GET /api/players/me` - Get current player profile
- `PUT /api/players/me` - Update player profile details
- `PUT /api/players/me/card` - Customize FUT-style player card
- `PUT /api/players/me/attributes` - Update player attributes
- `GET /api/players/me/gpi` - Retrieve player GPI, confidence, and observation breakdown
- `GET /api/players/me/match-stats` - Get individual match statistics history
- `GET /api/players/me/performance` - Retrieve overall player performance stats
- `GET /api/players/me/ranking` - Get player rankings across categories

### Tournaments & Applications
- `GET /api/tournaments` - List all tournaments
- `GET /api/tournaments/{id}` - Get tournament details
- `POST /api/tournaments` - Create tournament (*Organizer only*)
- `PUT /api/tournaments/{id}` - Update tournament (*Organizer only*)
- `PATCH /api/tournaments/{id}/status` - Advance tournament status (*Organizer only*)
- `POST /api/tournaments/{id}/applications` - Player registers for tournament (*Player only*)
- `GET /api/tournaments/my-applications` - Get player application status history (*Player only*)
- `GET /api/tournaments/{id}/applications` - List applicants for tournament (*Organizer only*)
- `PATCH /api/applications/{id}` - Accept or reject applicant (*Organizer only*)
- `GET /api/tournaments/{tournamentId}/teams` - List teams for a tournament
- `POST /api/teams` - Create a team in a tournament (*Organizer only*)
- `POST /api/teams/{teamId}/members` - Add registered player to a team (*Organizer only*)
- `DELETE /api/teams/{teamId}/members/{playerId}` - Remove player from a team (*Organizer only*)

### Matches & Scoring
- `GET /api/matches` - List matches
- `GET /api/matches/{id}` - Get match details
- `POST /api/matches` - Schedule a match with home/away teams (*Organizer only*)
- `PATCH /api/matches/{id}/status` - Change match status to LIVE or COMPLETED (*Organizer only*)
- `POST /api/matches/{id}/events` - Record goal, assist, yellow/red card events (*Organizer only*)
- `GET /api/matches/{id}/events` - List match timeline events
- `POST /api/matches/{id}/participations` - Record player lineup & minutes (*Organizer only*)
- `GET /api/matches/{id}/participations` - Get match roster participations
- `POST /api/matches/{id}/confirm` - Finalize match score and automatically trigger GPI recalculation (*Organizer only*)
- `GET /api/matches/{id}/stats` - Get consolidated player stats for a match

### Scouting & Rankings
- `GET /api/scouts/players/search` - Search & filter players with pagination and sorting
- `GET /api/scouts/shortlist` - View scout's saved player shortlist
- `POST /api/scouts/players/{playerId}/shortlist` - Add player to shortlist
- `DELETE /api/scouts/players/{playerId}/shortlist` - Remove player from shortlist
- `POST /api/scouts/players/{playerId}/observations` - Log scouting observation & rating
- `GET /api/scouts/players/{playerId}/observations` - View observations for a player
- `GET /api/scouts/observations/my` - View all observations authored by the scout
- `POST /api/scouts/players/{playerId}/notes` - Save private scouting note
- `GET /api/scouts/players/{playerId}/notes` - Retrieve notes on a player
- `GET /api/scouts/filters` - Retrieve scout's saved search criteria
- `POST /api/scouts/filters` - Save search criteria
- `DELETE /api/scouts/filters/{id}` - Delete saved filter
- `GET /api/scouts/alerts` - Get scouting notification alerts
- `PATCH /api/scouts/alerts/{id}/read` - Mark alert as read
- `GET /api/rankings` - Contextual GPI leaderboards (Overall, Position-based)
- `GET /api/rankings/contexts` - List available leaderboard contexts
- `POST /api/rankings/calculate` - Recalculate rankings batch

### Admin
- `GET /api/admin/users` - View system users (*Admin only*)
- `PATCH /api/admin/users/{id}` - Update user roles or status (*Admin only*)
- `GET /api/admin/corrections` - View pending stat correction disputes (*Admin only*)
- `PATCH /api/admin/corrections/{id}` - Approve or reject correction (*Admin only*)
- `GET /api/admin/audit-logs` - System audit log trail (*Admin only*)
- `GET /api/admin/gpi-config` - View active GPI weight configuration (*Admin only*)
- `PUT /api/admin/gpi-config` - Update GPI weights and constants (*Admin only*)
