<!-- ============================================================
  README du dépôt ssalmarezgui/medical-platform-pfa
  Source : rapport de stage d'été II2 (ENSI / RIADI, 2025-2026).
============================================================ -->

<div align="center">

# 🏥 NephroCare

**Plateforme sécurisée de suivi clinique de la transplantation rénale**
*Secure clinical follow-up platform for kidney transplantation*

![Java](https://img.shields.io/badge/Java-17-ED8B00?logo=openjdk&logoColor=white)
![Spring Boot](https://img.shields.io/badge/Spring%20Boot-6DB33F?logo=springboot&logoColor=white)
![React](https://img.shields.io/badge/React-TypeScript-61DAFB?logo=react&logoColor=black)
![MySQL](https://img.shields.io/badge/MySQL-InnoDB-4479A1?logo=mysql&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-009688?logo=fastapi&logoColor=white)
![Ollama](https://img.shields.io/badge/Ollama-Mistral--7B-000000?logo=ollama&logoColor=white)
![Docker](https://img.shields.io/badge/Docker%20Compose-2496ED?logo=docker&logoColor=white)
![Terraform](https://img.shields.io/badge/Terraform-844FBA?logo=terraform&logoColor=white)

[![CI](https://github.com/ssalmarezgui/medical-platform-pfa/actions/workflows/ci.yml/badge.svg)](https://github.com/ssalmarezgui/medical-platform-pfa/actions)
![SonarCloud](https://img.shields.io/badge/SonarCloud-A%20%2F%20A%20%2F%20A-F3702A?logo=sonarcloud&logoColor=white)
![Coverage](https://img.shields.io/badge/backend%20coverage-74%25-brightgreen)
![Snyk](https://img.shields.io/badge/Snyk-0%20high%20vulnerabilities-4C4A73?logo=snyk&logoColor=white)

</div>

> **Contexte.** Réingénierie, automatisation et sécurisation DevSecOps de la plateforme médicale NephroCare,
> dédiée au recueil et au suivi clinique de la transplantation rénale à l'**Hôpital Charles Nicolle**,
> dans le cadre du consortium de recherche **KTOuIP** (laboratoire **RIADI**, ENSI).
> Une version locale est utilisée à l'hôpital et au CIMS ; la plateforme monte en maturité vers le déploiement.
>
> ⚠️ Tous les patients, identifiants et données illustrés ici sont **strictement fictifs**.

---

## 📌 Pourquoi ce projet ?

L'audit du prototype hérité a révélé des problèmes sérieux pour une application médicale. Une réingénierie complète a été menée :

| Constat de l'audit | Réponse apportée |
|---|---|
| Schéma MySQL incomplet, mappages JPA défaillants | Modèle conceptuel de données normalisé en 6 modules, intégrité référentielle renforcée |
| CIN stocké en entier (le zéro initial est perdu), risque de doublons | CIN requalifié en `String` + algorithme d'**identito-vigilance** anti-doublon |
| Entités de base exposées à l'interface | Architecture en couches étanche avec **DTO** |
| Secrets en clair dans le code, aucune traçabilité | Hook **Gitleaks**, variables d'environnement, **journal d'audit** des actes cliniques |
| Aucun test, aucune CI/CD | Pipeline **GitHub Actions** : tests, SAST, SCA, scan de conteneurs, DAST |
| Préparation longue des dossiers de commission de greffe | **Assistant clinique** à LLM local, avec relecture médicale obligatoire |

## ✨ Fonctionnalités

**Quatre portails cliniques** : *Receveurs*, *Donneurs d'organes*, *Suivi & Thérapeutique*, *Gestion Système*.

- Registre d'admission avec **identito-vigilance** (mode pédiatrique, détection de doublons, identifiant clinique unique)
- Parcours pré-greffe : néphropathie, dialyses, biopsie, 7 catégories d'antécédents
- Analyses de laboratoire, compte-rendu opératoire, immunosuppresseurs, dosages et complications
- **Assistant clinique IA** : synthèse rapide ou rapport structuré, exportable en PDF, à relire par le médecin
- **Authentification à double facteur** (OTP par e-mail), verrouillage après 5 échecs
- **RBAC** appliqué côté serveur pour 5 rôles (administrateur, médecin investigateur, médecin de suivi, agent de laboratoire, agent d'immunologie)
- Journal d'audit non modifiable depuis l'application

## 🏗️ Architecture

![Architecture de déploiement](docs/architecture-deployment.png)

| Service | Technologie | Exposition |
|---|---|---|
| `frontend-app` | React + TypeScript | Oui (5173 en développement) |
| `backend-app` | Spring Boot, Java 17 | Oui (8081) |
| `mysql-db` | MySQL (InnoDB) | Non, réseau Docker interne |
| `microservice-llm` | FastAPI + Ollama (Mistral-7B) | Non, accessible par le backend uniquement |
| `prometheus` / `grafana` | Supervision | Restreint |
| `elasticsearch` / `kibana` / `logstash` | Journaux techniques | Restreint |

<details>
<summary>Architecture logique (backend en couches, frontend par fonctionnalités)</summary>

![Architecture logique](docs/architecture-logical.png)

</details>

## 🔐 Pipeline DevSecOps (Shift Left)

Pipeline **GitHub Actions** exécuté en environ **6 minutes** (5 min 57 s lors de la dernière validation du rapport).

![Chaîne de sécurité](docs/security-chain.png)

| Contrôle | Outil | Résultat mesuré | Bloquant |
|---|---|---|---|
| Tests unitaires et d'intégration | JUnit / Mockito | Identito-vigilance et RBAC au vert | Oui |
| Secrets | Gitleaks (hook pre-commit + CI) | Aucun secret détecté | Oui |
| SAST | SonarCloud | Notes **A / A / A**, couverture **74,0 %**, duplication 2,7 % | Oui (Quality Gate) |
| SCA | Snyk | **200 dépendances** auditées, 0 faille haute | Oui |
| IaC | Checkov + LocalStack | Règles CIS (chiffrement S3/EBS), syntaxe validée | Checkov : non, LocalStack : oui |
| Conteneurs | Trivy | 0 vulnérabilité système critique non corrigée | Non (avertissement) |
| DAST | OWASP ZAP (baseline) | 0 alerte haute | Non (avertissement) |

<details>
<summary>Voir les captures du pipeline</summary>

![Pipeline](docs/pipeline-success.png)
![SonarCloud](docs/sonarcloud.png)
![Snyk](docs/snyk.png)

</details>

> Les images Docker validées (`medical-backend`, `medical-frontend`) sont publiées sur Docker Hub, sans secret ni donnée médicale.

## 🖼️ Aperçu de l'application

| Double authentification | Assistant clinique (LLM local) |
|---|---|
| ![2FA](docs/login-2fa.png) | ![Assistant](docs/clinical-assistant.png) |

| Registre des patients | Journal d'audit |
|---|---|
| ![Registre](docs/patient-registry.png) | ![Audit](docs/audit-log.png) |

<details>
<summary>Gestion des comptes cliniques</summary>

![Comptes](docs/accounts-validation.png)

</details>

## 🧠 Assistant clinique à inférence locale

- **Mistral-7B** quantifié en 4 bits, servi par **Ollama** et exposé par un microservice **FastAPI**
- Traitement **100 % local** : aucune donnée de santé ne quitte l'infrastructure (loi organique tunisienne n° 2004-63)
- Environ **4,5 Go** de RAM ; **45 à 75 s** pour un rapport complet sur un CPU grand public sans GPU (Intel Core i5, 16 Go)
- Deux modes : *synthèse rapide* des alertes cliniques et *rapport officiel* à valider par le médecin

## 📊 Observabilité

- **Prometheus + Grafana** : métriques JVM et JDBC via Spring Boot Actuator

![Grafana](docs/grafana.png)

- **Suite ELK** : journaux applicatifs centralisés, distincts de la table d'audit médico-légale MySQL

<details>
<summary>Console Kibana</summary>

![Kibana](docs/kibana.png)

</details>

## 📁 Structure du dépôt

```
medical-platform-pfa/
├── backend/          API Spring Boot (controllers, services, entities, dto, repositories, security)
├── frontend/         React + TypeScript, organisé par portails cliniques
├── ai-service/       Microservice FastAPI + Ollama (assistant clinique)
├── terraform/        Preuve de concept IaC (stockage chiffré AES-256, IAM restreint)
├── prometheus/       Configuration de la collecte de métriques
├── logstash/         Pipeline de journaux
├── .github/workflows CI/CD DevSecOps
├── docker-compose.yml
└── .env.example      Variables d'environnement (noms uniquement, aucun secret)
```

## 🚀 Démarrage rapide

**Prérequis :** Docker Desktop, JDK 17, Node.js 18+.

```bash
# 1. Variables d'environnement (ne jamais committer .env)
cp .env.example .env

# 2. Lancer les services
docker-compose up -d

# 3. (développement) backend puis frontend
cd backend  && ./mvnw spring-boot:run
cd frontend && npm install && npm run dev
```

## ⚠️ Limites connues

Pour rester transparente sur l'état du projet :

- Les échanges sont en **HTTP** dans le package de démonstration ; le **TLS via reverse proxy Nginx** est un prérequis avant toute mise en production.
- Le jeton JWT (2 h) n'est pas révoqué côté serveur à la déconnexion ; la suspension d'un compte prend effet dès la requête suivante.
- Le frontend n'a pas encore de tests unitaires automatisés ; le scan ZAP ne couvre que les routes publiques.
- Pas encore de sauvegarde automatisée MySQL, ni d'interopérabilité **HL7 FHIR**.
- Testé uniquement sur des données fictives, sans test de charge en conditions réelles.

## 🗺️ Feuille de route

- [ ] HTTPS (Nginx) et sauvegarde/restauration automatisée de MySQL
- [ ] Trivy en mode bloquant sur les vulnérabilités critiques
- [ ] Scan ZAP authentifié (simulation du 2FA)
- [ ] Passerelle HL7 FHIR et comparaison approchée pour l'identito-vigilance
- [ ] Évaluation clinique des synthèses de l'assistant avec les praticiens
- [ ] Intégration de modèles prédictifs explicables (XAI) du consortium KTOuIP

## 👩‍💻 Auteure

**Salma Rezgui**, élève ingénieure à l'ENSI.
Réalisé au sein du laboratoire RIADI (ENSI), dans le cadre du consortium KTOuIP.

[LinkedIn](https://www.linkedin.com/in/salma-rezgui) · [GitHub](https://github.com/ssalmarezgui)
