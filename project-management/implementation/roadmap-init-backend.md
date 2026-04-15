# Roadmap Init Backend (Guide Pas a Pas Debutant)

## Objectif

Ce document decrit un guide pas a pas pour initialiser le backend du projet Scorpanion.

Le principe est simple:

1. Avancer et valider une etape a la fois.
2. Ne passer a l'etape suivante que lorsque la precedente est stable.
3. Garder les regles `.cursor/` comme garde-fous pendant toute l'implementation.

---

## Etape 0 - Preparation (une seule fois)

1. Verifier que la branche courante est `init-backend`.
2. Installer:
   - JDK `Java 26`
   - Docker Desktop
   - Un IDE Java (IntelliJ Community suffit)
3. Verifier les commandes dans PowerShell:
   - `java -version`
   - `docker version`
   - `git --version`
4. Ouvrir le repository a la racine:
   - `C:\Users\Arnaud\Documents\Perso\Projects\Workspace\scorpanion`

Resultat attendu:
- L'environnement local est pret pour lancer un backend Java/Spring.

---

## Etape 1 - Bootstrap Spring Boot

1. Aller sur Spring Initializr.
2. Creer un projet:
   - Type: `Gradle`
   - Language: `Java`
   - Spring Boot: `4.x`
   - Group: `com.scorpanion`
   - Artifact/Name: `backend`
   - Package: `com.scorpanion.backend`
3. Ajouter les dependances:
   - Spring Web
   - Validation
   - Spring Data JPA
   - Flyway
   - PostgreSQL Driver
   - Spring Boot Actuator
   - Spring Boot Test
4. Decompresser le projet dans `backend/` (en remplacant `.gitkeep`).
5. Lancer dans PowerShell:
   - `.\gradlew.bat clean build`
6. Demarrer l'application:
   - `.\gradlew.bat bootRun`
7. Verifier le endpoint de sante:
   - `/actuator/health`

Resultat attendu:
- Le backend compile et demarre.

---

## Etape 2 - Configuration et profils

1. Creer les fichiers:
   - `application.yml`
   - `application-local.yml`
   - `application-test.yml`
   - `application-prod.yml`
2. Mettre le commun dans `application.yml`.
3. Mettre la configuration locale dans `application-local.yml`.
4. Mettre une configuration de test isolee dans `application-test.yml`.
5. Mettre la configuration production via variables d'environnement dans `application-prod.yml`.
6. Demarrer avec le profil local:
   - `.\gradlew.bat bootRun --args="--spring.profiles.active=local"`

Resultat attendu:
- Les profils sont separes et lisibles.
- L'application demarre avec le profil local.

---

## Etape 3 - Entites JPA et repositories (Entity First)

1. Creer l'enumeration `ResultType`:
   - `NO_SCORE`
   - `HIGHEST_SCORE`
   - `LOWEST_SCORE`
2. Creer les entites:
   - `GameEntity`
   - `PlayerEntity`
   - `GameSessionEntity`
   - `SessionPlayerResultEntity`
3. Mapper les relations JPA correctement.
4. Creer les repositories Spring Data adaptes aux cas d'usage.
5. Verifier la separation:
   - entites != DTO API
6. Lancer les tests:
   - `.\gradlew.bat test`

Resultat attendu:
- Le modele de persistance est en place et coherent.

---

## Etape 4 - Base PostgreSQL et Flyway (alignee sur les entites)

1. Demarrer PostgreSQL en local (Docker recommande).
2. Connecter le backend a PostgreSQL via `application-local.yml`.
3. Creer la migration Flyway initiale:
   - `V1__init_schema.sql`
4. Creer les tables alignees sur les entites:
   - `game`
   - `player`
   - `game_session`
   - `session_player_result`
5. Ajouter les contraintes:
   - UUID comme cles primaires
   - cles etrangeres
   - unicite nom `game` et `player` (insensible a la casse + trim)
   - unicite `(game_session_id, player_id)`
6. Garder `ddl-auto=validate` pour verifier l'alignement schema <-> entites.
7. Redemarrer l'application avec le profil local et verifier l'application de la migration.

Resultat attendu:
- Le schema est versionne, reproductible et coherent avec les entites.

---

## Etape 5 - API socle Games et Players

1. Creer les DTO request/response pour `Game` et `Player`.
2. Creer les mappers:
   - `GameMapper`
   - `PlayerMapper`
3. Creer les services:
   - `GameService`
   - `PlayerService`
4. Creer les controllers:
   - `GameController`
   - `PlayerController`
5. Implementer:
   - `GET /games`
   - `POST /games`
   - `GET /players`
   - `POST /players`
6. Ajouter la validation d'entree (`@Valid`).
7. Appliquer la normalisation des noms (trim) avant persistance.
8. Ajouter une gestion centralisee des erreurs (`400`, `409`).
9. Tester les cas:
   - succes
   - payload invalide
   - conflit d'unicite

Resultat attendu:
- Les endpoints de referentiel V1 sont operationnels.

---

## Etape 6 - Endpoint POST /game-sessions

1. Creer les DTO:
   - `CreateGameSessionRequest`
   - `SessionPlayerResultRequest`
   - `GameSessionResponse`
   - `SessionPlayerResultResponse`
2. Implementer `GameSessionService` avec transaction unique (`@Transactional`).
3. Verifier l'existence du `Game` et des `Player`.
4. Verifier l'absence de doublon de `playerId` dans `playerResults`.
5. Verifier la regle metier:
   - si `NO_SCORE`, `score` est interdit
6. Garder:
   - `rank` optionnel
   - `isWinner` obligatoire
7. Persister `GameSession` puis `SessionPlayerResult` dans la meme transaction.
8. Retourner `201 Created` avec la reponse finale.
9. Tester les cas:
   - succes
   - `404` game non trouve
   - `404` player non trouve
   - `409` doublon player
   - `400` payload invalide

Resultat attendu:
- Le flux metier principal est en place et atomique.

---

## Etape 7 - Tests par couche

1. Ajouter des tests `@WebMvcTest` pour les controllers.
2. Ajouter des tests `@DataJpaTest` pour les repositories.
3. Ajouter un test `@SpringBootTest` cible pour `POST /game-sessions`.
4. Ajouter des tests de regression pour les regles metier critiques.
5. Lancer:
   - `.\gradlew.bat test`
6. Corriger tout test instable avant de continuer.

Resultat attendu:
- La qualite est securisee par une base de tests claire.

---

## Etape 8 - Execution locale complete et prepa deploiement

1. Creer un Dockerfile backend propre:
   - multi-stage
   - runtime non-root
2. Completer `docker compose` pour `backend` + `postgres`.
3. Ajouter des `healthcheck`.
4. Configurer la dependance de readiness (`depends_on` avec condition de sante).
5. Lancer:
   - `docker compose up -d --build`
6. Verifier:
   - logs backend
   - migrations Flyway appliquees
   - endpoints principaux accessibles
7. Ajouter un workflow CI backend minimal:
   - build
   - tests

Resultat attendu:
- Le backend tourne localement en mode proche production.

---

## Methode de travail recommandee

1. Une etape a la fois.
2. Un commit propre apres chaque etape stable.
3. Build et tests verts avant de passer a l'etape suivante.
4. Aucun melange de refactor non demande avec l'etape en cours.

---

## Checkpoint final

Le backend est considere initialise quand:

1. Le projet Spring Boot demarre localement.
2. La base PostgreSQL est migree automatiquement par Flyway.
3. Les endpoints V1 (`games`, `players`, `game-sessions`) fonctionnent selon le contrat.
4. Les tests principaux sont verts.
5. Le backend peut tourner en Docker Compose avec PostgreSQL.
