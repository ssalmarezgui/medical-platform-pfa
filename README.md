# 🏥 MedPortal-Omics : Post-Kidney Transplant Recommendation System

## 📝 Project Description
This project is a **Secure Centralized Data Management and Recommendation System** designed for the follow-up of patients after a kidney transplant. 
It integrates heterogeneous data sources:
- **Clinical Data:** Patient history, laboratory results, and follow-up indicators.
- **Omics Data:** Genomic, transcriptomics, and proteomics analysis.
- **Pharmacological Data:** Treatments and drug dosages.

The system leverages a **dual-database architecture** (MySQL for relational data and Neo4j for complex correlations) to provide data-driven insights and monitoring recommendations for clinicians.

---

## 🚀 Tech Stack
- **Backend:** Java 17, Spring Boot 3, Spring Data JPA, Spring Data Neo4j, Spring Security (JWT).
- **Frontend:** React.js (Vite), Tailwind CSS, Lucide Icons, Axios.
- **Databases:** MySQL 8 (Relational), Neo4j 5 (Graph database).
- **DevOps:** Docker, Docker Compose, Hugging Face Spaces (Deployment).

---

## 🛠️ Installation & Setup

### 1. Prerequisites
Ensure you have the following installed:
- [Docker Desktop](https://www.docker.com/products/docker-desktop/)
- [JDK 17](https://adoptium.net/temurin/releases/?version=17)
- [Node.js (v18+)](https://nodejs.org/)

### 2. Database Setup (Docker)
Run the databases using Docker Compose:
``` docker-compose up -d ```

### 3. Backend Setup
cd backend
- Run the Spring Boot application
./mvnw spring-boot:run

### 4. Frontend Setup

cd frontend
npm install
npm run dev