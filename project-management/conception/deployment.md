# Deployment

## Objectif

Ce document decrit la cible de deploiement de Scorpanion pour la V1.

Il formalise :
- la topologie de deploiement
- les services du `docker compose`
- les reseaux et flux de communication
- la place de `Traefik`
- les principes de persistance
- les points d'attention lies a la Raspberry Pi

Ce document reste un document de conception, mais il decrit l'etat actuel des fichiers `compose` presents dans le repository.

## Contexte retenu

- L'application sera deployee sur une Raspberry Pi.
- `Traefik` est deja installe sur la machine.
- Le deploiement applicatif utilisera un `docker compose`.
- Trois conteneurs applicatifs sont prevus :
  - `frontend`
  - `backend`
  - `postgres`
- Le frontend et l'API seront exposes sous le meme domaine.
- Le backend et la base ne seront pas exposes publiquement.
- Le redeploiement automatique sera declenche sur `push` vers `prod` via GitHub Actions.
- Le deploiement sera execute sur la Raspberry Pi via un `self-hosted runner`.

## Vue d'ensemble

```mermaid
flowchart LR
    U["Utilisateur / Navigateur"] --> T["Traefik"]
    T --> F["frontend"]
    F -->|"/api"| B["backend"]
    B --> P["postgres"]
```

## Topologie cible

### frontend

Responsabilites :
- servir la SPA React buildee
- exposer l'application sous le domaine public
- relayer les appels `/api` vers le conteneur `backend`

Notes :
- le frontend est le seul service applicatif accessible publiquement via `Traefik`
- les appels API du navigateur utilisent une URL relative de type `/api`
- cela evite d'avoir un domaine ou sous-domaine separe pour l'API

### backend

Responsabilites :
- exposer l'API REST JSON de Scorpanion
- appliquer les validations metier minimales
- persister les donnees dans `postgres`

Notes :
- le backend n'est pas expose directement au public
- il est uniquement joignable sur le reseau interne du `compose`
- il recoit les requetes proxifiees par le frontend

### postgres

Responsabilites :
- stocker les donnees de l'application
- conserver les donnees dans un volume persistant

Notes :
- `postgres` n'est pas expose publiquement
- il n'est accessible que par le backend sur le reseau interne

## Reseaux

La topologie reseau cible repose sur deux reseaux :

- un reseau partage avec `Traefik`
- un reseau interne applicatif

Principe recommande :
- `frontend` est connecte au reseau `Traefik` et au reseau interne applicatif
- `backend` est connecte uniquement au reseau interne applicatif
- `postgres` est connecte uniquement au reseau interne applicatif

Ce choix permet :
- a `Traefik` d'atteindre `frontend`
- a `frontend` d'atteindre `backend`
- a `backend` d'atteindre `postgres`
- d'eviter toute exposition publique inutile du backend et de la base

## Routage HTTP

Le domaine public unique pointe vers `frontend`.

Strategie retenue :
- le navigateur charge la SPA sur le domaine principal
- la SPA appelle l'API via `/api`
- le serveur web du conteneur `frontend` proxy `/api` vers `backend` sur le reseau Docker interne

Consequences :
- pas de `CORS` a gerer en V1
- pas d'URL publique separee pour l'API
- configuration frontend simplifiee

## Services du docker compose

Le `docker compose` de la V1 definit au minimum :

- `frontend`
- `backend`
- `postgres`

Chaque service a :
- un nom stable
- une image compatible `arm64`
- des variables d'environnement explicites
- un redemarrage automatique adapte au contexte serveur

## Fichiers compose actuellement utilises

Le deploiement s'appuie sur trois fichiers :

- `docker-compose.yml`
  - base commune de la stack
  - mode local simple avec publication de port du `frontend`
  - `backend` et `postgres` restent internes au reseau compose
- `docker-compose.traefik.yml`
  - override de deploiement via `Traefik`
  - suppression de la publication de port `frontend` (`ports: !reset []`)
  - ajout du reseau externe `traefik` et des labels de routage
  - ajout des limites CPU/memoire pour `backend`, `frontend` et `postgres`
- `docker-compose.secrets.yml`
  - override de secrets runtime
  - montage du secret `scorpanion_db_password`
  - utilisation de `POSTGRES_PASSWORD_FILE` pour `postgres`
  - suppression de l'injection explicite de mot de passe DB dans l'environnement runtime du `backend`

Commandes usuelles :

- local :
  - `docker compose -f docker-compose.yml up -d`
- deploiement avec Traefik + secrets :
  - `docker compose -f docker-compose.yml -f docker-compose.traefik.yml -f docker-compose.secrets.yml up -d`

## CI/CD et redeploiement automatique

La V1 retient un pipeline GitHub Actions avec execution du deploiement sur la Raspberry Pi.

Principe :
- `push` sur la branche `prod`
- declenchement du workflow GitHub Actions
- execution du job de deploiement sur un `self-hosted runner` installe sur la Raspberry Pi
- relance de la stack applicative via `docker compose`

Repartition recommandee :
- jobs de verification (lint/tests) sur runner GitHub heberge
- job de deploiement sur runner `self-hosted` (labels `linux`, `arm64`, `rpi-prod`)

Actions de deploiement attendues sur la Pi :
- recuperation de la version cible du code
- reconstruction et/ou mise a jour des conteneurs applicatifs
- redemarrage de la stack en mode detache
- verification basique de disponibilite post-deploiement

## Securite CI/CD

Points d'attention minimum :
- runner `self-hosted` dedie au repo Scorpanion
- deploiement autorise uniquement sur `push` de `prod`
- protection de branche `prod` recommandee avant deploiement auto
- secrets GitHub limites au strict necessaire
- permissions minimales pour l'utilisateur systeme du runner

## Variables d'environnement

### frontend

Le frontend ne doit pas dependre d'une URL publique differente selon l'environnement pour joindre l'API.

Principe recommande :
- utiliser une base d'API relative de type `/api`

### backend

Le backend devra recevoir au minimum :
- l'URL de connexion a `postgres`
- l'utilisateur de base de donnees
- le mot de passe de base de donnees (via secret runtime en deploiement Traefik + secrets)
- les parametres utiles a `Spring Boot`

### postgres

Le service `postgres` devra recevoir au minimum :
- le nom de la base
- l'utilisateur
- le mot de passe (via `POSTGRES_PASSWORD_FILE` en deploiement Traefik + secrets)

### Secret DB actuel

Le secret de mot de passe DB est fourni via fichier :

- variable : `SCORPANION_DB_PASSWORD_FILE_PATH`
- cible runtime : `/run/secrets/scorpanion_db_password`
- fichier local attendu pour execution manuelle : `.secrets/scorpanion_db_password.txt`

## Persistance

La base `postgres` doit utiliser un volume persistant.

Principes retenus :
- les donnees ne doivent pas dependre du cycle de vie du conteneur
- la recreation du conteneur `postgres` ne doit pas supprimer les donnees
- les migrations de schema sont gerees par `Flyway`

## Migrations et operations DB

Principes retenus :
- les migrations applicatives standard passent par `Flyway`
- les operations DB lourdes ou sensibles ne font pas partie du flux automatique de redeploiement standard
- ces operations sont preparees et executees de facon controlee, avec intervention manuelle si necessaire

## Demarrage et robustesse

Le deploiement devra tenir compte des points suivants :

- `backend` depend de `postgres`
- les services doivent supporter les redemarrages
- des `healthchecks` sont recommandes au minimum pour `backend` et `postgres`
- l'application doit pouvoir redemarrer proprement apres reboot de la Raspberry Pi

## Contraintes Raspberry Pi

Points d'attention :
- les images Docker doivent etre compatibles `arm64`
- la consommation memoire du backend Java doit etre surveillee
- la base de donnees doit rester raisonnable en consommation disque et memoire
- le nombre de services doit rester limite pour conserver un deploiement simple

Limites de ressources actuellement configurees dans l'override Traefik :

- `backend` : `mem_reservation=512m`, `mem_limit=768m`, `cpus=1.0`
- `postgres` : `mem_reservation=256m`, `mem_limit=512m`, `cpus=1.0`
- `frontend` : `mem_reservation=64m`, `mem_limit=128m`, `cpus=0.25`

Ces valeurs sont une base de depart et doivent etre ajustees selon la charge reelle observee.

## Choix retenus pour la V1

- un seul domaine public
- `Traefik` deja present hors du `compose` applicatif
- `frontend`, `backend` et `postgres` en conteneurs distincts
- `frontend` expose publiquement via `Traefik`
- `backend` accessible uniquement en interne
- `postgres` accessible uniquement en interne
- proxy `/api` depuis `frontend` vers `backend`
- volume persistant pour `postgres`

## Hors perimetre pour l'instant

Ce document ne couvre pas encore :
- la strategie de sauvegarde de la base
- la rotation centralisee des secrets (Vault, manager cloud, etc.)
- la supervision et l'observabilite
