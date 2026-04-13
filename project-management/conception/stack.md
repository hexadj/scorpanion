# Stack

## Objectif

Ce document decrit la stack technique cible de Scorpanion pour la V1.

Il formalise :
- les technologies principales retenues
- leur role dans le projet
- les raisons de ces choix
- les points encore ouverts a preciser plus tard

Ce document reste volontairement plus concret que `architecture.md`, mais ne decrit pas encore l'implementation detaillee.

## Stack retenue

### Frontend

- `React`
- `TypeScript`
- `Vite`

Role :
- implementer la `SPA`
- gerer la saisie des donnees
- calculer la premiere proposition de resultat d'une `GameSession`
- afficher le recapitulatif editable
- envoyer a l'API le resultat final valide

### Backend

- `Java 26`
- `Spring Boot 4`
- `Gradle 9`

Role :
- exposer l'API `REST JSON`
- recevoir les requetes du frontend
- appliquer les validations minimales cote serveur
- orchestrer la persistance des donnees
- garantir les invariants metier minimum de la V1

### Base de donnees

- `PostgreSQL 18`

Role :
- stocker les donnees persistantes du projet
- porter les entites principales :
  - `Game`
  - `Player`
  - `GameSession`
  - `SessionPlayerResult`

### Acces aux donnees

- `JPA / Hibernate`
- `Flyway`

Role :
- faire le lien entre les objets Java et la base relationnelle
- permettre une persistance classique via ORM
- s'integrer naturellement avec `Spring Boot`

## Cohesion avec l'architecture

La stack retenue est coherente avec l'architecture definie dans [architecture.md](/C:/Users/Arnaud/Documents/Perso/Projects/Workspace/scorpanion/project-management/conception/architecture.md:1) :

- `React + TypeScript` pour la couche `SPA`
- `Spring Boot` pour la couche `API`
- une couche `Business` legere dans le backend Java
- `JPA / Hibernate` pour la couche `Persistence`
- `PostgreSQL` comme base relationnelle

Cette stack est egalement coherente avec le modele de donnees defini dans [database.md](/C:/Users/Arnaud/Documents/Perso/Projects/Workspace/scorpanion/project-management/conception/database.md:1) et avec le contrat defini dans [api.md](/C:/Users/Arnaud/Documents/Perso/Projects/Workspace/scorpanion/project-management/conception/api.md:1).

## Raisons des choix

### Pourquoi React + TypeScript

- adapte a une application `SPA`
- bon confort pour construire un flux de saisie interactif
- bien adapte a un tableau recapitulatif editable
- `TypeScript` aide a garder des contrats clairs cote frontend
- `Vite` permet un demarrage simple et rapide du frontend

### Pourquoi Java + Spring Boot

- stack robuste et classique pour une API metier
- bien adaptee a une architecture `API / Business / Persistence`
- bon compromis entre simplicite, lisibilite et evolutivite
- bonne integration avec une base relationnelle et un ORM classique
- choix moderne et pertinent pour un projet neuf
- `Gradle 9` apporte un outillage de build moderne et flexible pour le backend

### Pourquoi PostgreSQL

- tres bon fit pour un modele relationnel simple et solide
- adapte aux entites et contraintes de Scorpanion
- base mature et fiable pour une V1 comme pour les evolutions futures

### Pourquoi JPA / Hibernate

- choix standard dans l'ecosysteme Java
- bon confort pour manipuler un modele de donnees classique
- permet de rester productif sans ecrire tout le SQL a la main
- compatible avec une approche backend simple pour la V1

### Pourquoi Flyway

- permet de versionner explicitement le schema de base de donnees
- facilite l'evolution du schema dans le temps
- s'integre naturellement avec `Spring Boot`
- complete `JPA / Hibernate` sans lui deleguer la gestion complete des migrations

## Principes techniques associes

- le frontend est responsable de la premiere proposition de resultat
- le backend persiste uniquement le resultat final valide
- le backend ne recalcule pas le resultat final en V1
- les donnees persistees sont immuables apres creation en V1
- la persistance d'une `GameSession` et de ses `SessionPlayerResult` doit se faire dans une transaction unique

## Points encore ouverts

Les points suivants ne sont pas encore figes :

- la strategie de tests
- la strategie de deploiement
- l'introduction eventuelle de `Kotlin` plus tard

## Hors perimetre pour l'instant

Ce document ne couvre pas encore :
- les details de configuration de la stack
- l'infrastructure d'hebergement
- l'observabilite
- l'authentification
- les outils de CI/CD
