# FinNova-AI

## AI-Powered Investment Research & Portfolio Management Platform

FinNova-AI is a full-stack, AI-powered investment research and portfolio management platform designed to help users analyze stocks, manage investment portfolios, track watchlists, understand financial metrics, and interact with an AI assistant for investment-related research.

The system follows a **microservice-oriented architecture**, combining a React frontend, Spring Boot backend, and Python FastAPI AI service with PostgreSQL and Redis.

> **Disclaimer:** FinNova-AI is an educational and research-oriented application. Its AI-generated insights should not be considered professional financial advice or a guarantee of investment performance.

---

## Features

* User authentication with JWT
* Portfolio and holdings management
* Stock search and analysis
* Watchlist management
* AI-powered financial analysis
* AI chat assistant
* Risk and financial ratio analysis
* Interactive charts and reports
* Real-time notifications using WebSocket

---

# System Architecture

```text
                        ┌───────────────────────┐
                        │       User            │
                        │    Web Browser        │
                        └───────────┬───────────┘
                                    │
                                    ▼
                        ┌───────────────────────┐
                        │   React Frontend      │
                        │   Vite + React        │
                        │   Tailwind CSS        │
                        └───────────┬───────────┘
                                    │
                       REST API / WebSocket
                                    │
                                    ▼
                ┌──────────────────────────────────┐
                │      Spring Boot Backend          │
                │                                  │
                │  Authentication                  │
                │  Portfolio Management            │
                │  Holdings                        │
                │  Watchlist                       │
                │  Transactions                    │
                │  AI API Gateway                  │
                │  Security                        │
                └───────────────┬──────────────────┘
                                │
                 ┌──────────────┼───────────────┐
                 │              │               │
                 ▼              ▼               ▼
          ┌───────────┐   ┌───────────┐   ┌──────────────┐
          │PostgreSQL │   │   Redis   │   │ AI Service   │
          │           │   │           │   │ FastAPI      │
          │ User      │   │ Caching   │   │              │
          │ Portfolio │   │ Sessions/ │   │ AI Analysis  │
          │ Holdings  │   │ Data      │   │ Risk Analysis│
          │ Watchlist │   │           │   │ Chat         │
          └───────────┘   └───────────┘   └──────┬───────┘
                                                  │
                                      ┌───────────┴──────────┐
                                      │                      │
                                      ▼                      ▼
                              ┌──────────────┐       ┌──────────────┐
                              │ Google Gemini│       │    Groq      │
                              │     API      │       │     API      │
                              └──────────────┘       └──────────────┘
```

---
# Architecture Flow

```text
User
 ↓
React Frontend
 ↓
Spring Boot REST API
 ↓
Business Service Layer
 ↓
 ┌───────────────┬─────────────────┐
 ↓               ↓                 ↓
PostgreSQL      Redis          FastAPI AI
                                      ↓
                           Financial Data / News
                                      ↓
                              AI Analysis Engine
                                      ↓
                             Gemini / Groq
                                      ↓
                              AI Response
                                      ↓
                              Spring Boot
                                      ↓
                              React Frontend
```

---

# Technology Stack

## Frontend

* React 18
* Vite
* JavaScript
* Tailwind CSS
* React Router
* Axios
* Recharts
* Lucide React
* React Hot Toast
* jsPDF
* html2canvas

## Backend

* Java 21
* Spring Boot 3.3.0
* Spring MVC
* Spring Data JPA
* Spring Security
* Spring WebSocket
* Spring Validation
* Spring Actuator
* Spring Mail
* JWT
* Lombok
* SpringDoc OpenAPI

## AI Service

* Python
* FastAPI
* Uvicorn
* Google Generative AI
* Groq
* Pydantic
* Pandas
* NumPy
* yfinance
* HTTPX

## Database & Infrastructure

* PostgreSQL 15
* Redis 7
* Docker
* Docker Compose

---

# Project Structure

```text
FinNova-AI/
│
├── ai-service/
│   ├── api/
│   │   └── routes/
│   │       ├── analysis.py
│   │       ├── chat.py
│   │       ├── health.py
│   │       └── research.py
│   │
│   ├── config/
│   │   └── settings.py
│   │
│   ├── models/
│   │   ├── analysis_models.py
│   │   ├── request_models.py
│   │   └── response_models.py
│   │
│   ├── prompts/
│   │   ├── chat_prompt.txt
│   │   ├── portfolio_prompt.txt
│   │   ├── risk_prompt.txt
│   │   └── stock_analysis_prompt.txt
│   │
│   ├── services/
│   │   ├── financial_data_service.py
│   │   ├── gemini_service.py
│   │   ├── groq_service.py
│   │   ├── news_service.py
│   │   ├── ratio_analyzer.py
│   │   ├── recommendation_engine.py
│   │   ├── risk_analyzer.py
│   │   └── sentiment_service.py
│   │
│   ├── utils/
│   ├── tests/
│   ├── main.py
│   ├── requirements.txt
│   └── Dockerfile
│
├── backend/
│   ├── src/
│   │   └── main/
│   │       └── java/
│   │           └── com/
│   │               └── investmentresearch/
│   │                   ├── config/
│   │                   ├── controller/
│   │                   ├── dto/
│   │                   ├── entity/
│   │                   ├── exception/
│   │                   ├── repository/
│   │                   ├── security/
│   │                   └── service/
│   │
│   ├── pom.xml
│   └── Dockerfile
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── constants/
│   │   ├── context/
│   │   ├── hooks/
│   │   ├── layouts/
│   │   ├── pages/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── styles/
│   │   └── utils/
│   │
│   ├── package.json
│   └── Dockerfile
│
├── .github/
│   └── workflows/
│       ├── ci-ai-service.yml
│       ├── ci-backend.yml
│       ├── ci-frontend.yml
│       └── deploy.yml
│
├── docker-compose.yml
├── .env.example
└── README.md
```

---

# How the Application Works

FinNova-AI separates the application into three primary layers.

### 1. React Frontend

The React frontend provides the user interface.

Users can:

1. Register or log in.
2. Access their dashboard.
3. Create portfolios.
4. Add holdings.
5. Track stocks.
6. Add companies to their watchlist.
7. Perform stock research.
8. Ask questions through the AI assistant.
9. View charts and reports.

The frontend communicates with the Spring Boot backend through REST APIs and WebSocket connections.

---

### 2. Spring Boot Backend

The Spring Boot backend acts as the primary application server.

It handles:

* Authentication
* Authorization
* User management
* Portfolio management
* Holdings
* Transactions
* Watchlists
* Database operations
* API validation
* AI-service communication
* WebSocket communication

The backend follows a layered architecture:

```text
Controller
    ↓
Service
    ↓
Repository
    ↓
Database
```

For example:

```text
Frontend
   ↓
PortfolioController
   ↓
PortfolioService
   ↓
PortfolioRepository
   ↓
PostgreSQL
```

---

### 3. FastAPI AI Service

The AI service is separated from the main backend so that AI-specific processing can be independently developed and scaled.

The AI service provides APIs for:

* Financial analysis
* Stock research
* Risk analysis
* AI chat
* Portfolio analysis

It contains separate services for:

```text
Financial Data
      ↓
Ratio Analysis
      ↓
Risk Analysis
      ↓
Sentiment Analysis
      ↓
AI Model
      ↓
Generated Response
```

This separation allows the Java backend to focus on application/business logic while Python handles AI and data-analysis workloads.

---

# AI Architecture

The AI service contains multiple specialized components.

### Financial Data Service

Retrieves financial market information using financial-data sources such as `yfinance`.

### Ratio Analyzer

Processes financial metrics and ratios to provide structured financial analysis.

### Risk Analyzer

Evaluates financial information and generates risk-oriented analysis.

### Sentiment Service

Processes relevant financial/news information for sentiment-oriented analysis.

### Recommendation Engine

Combines analyzed information to generate structured research-oriented recommendations.

### AI Model Services

The application contains integrations for:

* Google Gemini
* Groq

Prompt templates are maintained separately:

```text
prompts/
├── chat_prompt.txt
├── portfolio_prompt.txt
├── risk_prompt.txt
└── stock_analysis_prompt.txt
```

Keeping prompts separate makes them easier to modify and maintain without changing the core service implementation.

---

# Authentication Flow

FinNova-AI uses JWT-based authentication.

```text
User
 │
 │ Login
 ▼
React Frontend
 │
 │ POST /auth/login
 ▼
Spring Boot
 │
 │ Validate credentials
 ▼
Authentication Service
 │
 │ Generate JWT
 ▼
Frontend
 │
 │ Store token
 ▼
Authenticated API Requests
 │
 │ Authorization: Bearer <JWT>
 ▼
JwtAuthenticationFilter
 │
 ▼
Protected Controller
```

The backend validates the JWT before allowing access to protected resources.

---

# Portfolio Flow

```text
User
  │
  ▼
Frontend
  │
  ▼
Portfolio API
  │
  ▼
Portfolio Service
  │
  ├── Portfolio Repository
  │
  ├── Holding Repository
  │
  └── Transaction Repository
  │
  ▼
PostgreSQL
```

This allows portfolio-related information to remain associated with the authenticated user.

---

# WebSocket Notifications

The application includes WebSocket support for real-time notifications.

Instead of repeatedly polling the backend for new events, the frontend can maintain a WebSocket connection.

```text
Backend Event
     │
     ▼
WebSocket
     │
     ▼
Connected Client
     │
     ▼
Notification Panel
```

The frontend contains dedicated notification and WebSocket hooks for handling real-time updates.

---

# Database Model

The main backend entities include:

```text
User
 │
 ├── Portfolio
 │      │
 │      ├── Holding
 │      │
 │      └── Transaction
 │
 ├── WatchlistItem
 │
 └── AiQuery
```

### Main Entities

**User**

Stores authentication and user-related information.

**Portfolio**

Represents an investment portfolio owned by a user.

**Holding**

Represents an asset held inside a portfolio.

**Transaction**

Stores portfolio-related transaction information.

**WatchlistItem**

Stores stocks that a user wants to monitor.

**AiQuery**

Stores information related to AI queries.

---

# API Documentation

The backend uses SpringDoc OpenAPI.

Once the backend is running, the Swagger UI can be accessed at:

```text
http://localhost:8080/swagger-ui/index.html
```

The exact endpoint configuration may vary depending on the application's runtime configuration.

---

# Requirements

Before running FinNova-AI locally, install:

* Java 21+
* Maven
* Node.js 18+
* npm
* Python 3.10+
* PostgreSQL 15+
* Redis 7+
* Docker and Docker Compose

You also need API credentials for the AI providers used by the project.

---

# Environment Variables

Create the required environment configuration before starting the services.

Typical variables include:

```env
GOOGLE_API_KEY=your_google_api_key
GROQ_API_KEY=your_groq_api_key
JWT_SECRET=your_secure_jwt_secret
```

For local development, configure the database and Redis connection values according to your environment.

> Never commit real API keys, passwords, JWT secrets, or other credentials to Git.

---

# Running with Docker Compose

The easiest way to start the complete application infrastructure is Docker Compose.

From the project root:

```bash
docker compose up --build
```

This starts:

| Service    |   Port | Purpose              |
| ---------- | -----: | -------------------- |
| Frontend   | `3000` | React application    |
| Backend    | `8080` | Spring Boot REST API |
| AI Service | `8001` | FastAPI AI service   |
| PostgreSQL | `5432` | Relational database  |
| Redis      | `6379` | Cache/data store     |

After startup:

```text
Frontend:
http://localhost:3000

Backend:
http://localhost:8080

AI Service:
http://localhost:8001
```

To stop the services:

```bash
docker compose down
```

To stop services and remove persistent volumes:

```bash
docker compose down -v
```

---

# Running Without Docker

## 1. Start PostgreSQL

Create the database:

```text
investment_db
```

Configure the backend database properties accordingly.

---

## 2. Start Redis

Make sure Redis is running on:

```text
localhost:6379
```

---

## 3. Start the AI Service

Navigate to the AI service:

```bash
cd ai-service
```

Create a virtual environment:

```bash
python -m venv venv
```

Activate it on Windows:

```bash
venv\Scripts\activate
```

Install dependencies:

```bash
pip install -r requirements.txt
```

Start FastAPI:

```bash
uvicorn main:app --host 0.0.0.0 --port 8001
```

---

## 4. Start the Spring Boot Backend

Navigate to:

```bash
cd backend
```

Run:

```bash
./mvnw spring-boot:run
```

On Windows:

```bash
mvnw.cmd spring-boot:run
```

The backend runs on:

```text
http://localhost:8080
```

---

## 5. Start the React Frontend

Navigate to:

```bash
cd frontend
```

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

The Vite development server will display the local URL in the terminal.

---

# Testing

### Backend

The backend uses Spring Boot testing infrastructure.

Run:

```bash
cd backend
./mvnw test
```

Windows:

```bash
mvnw.cmd test
```

### AI Service

The AI service contains tests for selected financial and AI-related services.

Run:

```bash
cd ai-service
pytest
```

---

# CI/CD

The project contains GitHub Actions workflows for:

* AI service CI
* Backend CI
* Frontend CI
* Deployment

Located under:

```text
.github/workflows/
```

```text
.github/
└── workflows/
    ├── ci-ai-service.yml
    ├── ci-backend.yml
    ├── ci-frontend.yml
    └── deploy.yml
```

This enables automated validation and deployment workflows when changes are pushed to the repository.

---

# Security

Security mechanisms implemented in the application include:

* Spring Security
* JWT authentication
* Password-based authentication
* Role-based authorization
* Protected REST APIs
* Request validation
* Environment-based secret configuration

Sensitive credentials should always be supplied through environment variables rather than hard-coded into source code.

---

# Future Improvements

Potential improvements include:

* More advanced portfolio optimization
* Improved financial forecasting models
* Additional financial data providers
* More sophisticated RAG-based financial research
* Personalized portfolio insights
* Advanced risk scoring
* Automated market alerts
* Expanded real-time market monitoring
* Improved AI response evaluation
* Comprehensive integration testing
* Cloud-native deployment
* Horizontal scaling of AI services

---

# Project Highlights

* Full-stack investment research platform
* Microservice-oriented architecture
* React-based responsive frontend
* Spring Boot enterprise backend
* Python FastAPI AI service
* JWT authentication and Spring Security
* PostgreSQL relational database
* Redis caching
* WebSocket real-time notifications
* AI-powered financial analysis
* Financial market data integration
* Interactive data visualization
* Dockerized services
* GitHub Actions CI/CD

---

# Author

**Kabilan Jayabalan**

Software Developer | Java | Spring Boot | React | AI

---

# License

This project is licensed under the terms specified in the project's `LICENSE` file.
