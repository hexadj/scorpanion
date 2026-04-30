# Scorpanion — CLAUDE.md

Application de suivi de parties de jeux de société. Permet de créer des jeux et des joueurs, saisir des parties, et enregistrer les résultats validés.

Stack : React + TypeScript (frontend), Java 26 + Spring Boot 4 (backend), PostgreSQL 18, Docker Compose.

---

## Lancer le projet

**Dev (séparé) :**
```bash
# Frontend
cd frontend && pnpm dev

# Backend
cd backend && ./gradlew bootRun
```

**Stack complète (Docker) :**
```bash
# Copier .env.example → .env et remplir les variables
docker compose up --build
```

---

## Documentation

| Sujet | Fichier |
|---|---|
| Stack & dépendances | `project-management/conception/stack.md` |
| Architecture générale | `project-management/conception/architecture.md` |
| Modèle de données | `project-management/conception/database.md` |
| API REST | `project-management/conception/api.md` |
| Statistiques (contrat détaillé) | `project-management/conception/statistics.md` |
| Structure frontend | `project-management/conception/frontend-structure.md` |
| Structure backend | `project-management/conception/backend-structure.md` |
| Déploiement | `project-management/conception/deployment.md` |
