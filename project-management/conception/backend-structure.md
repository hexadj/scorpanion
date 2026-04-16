# Backend Structure

## Objectif

Ce document decrit la structure cible du backend de Scorpanion pour la V1.

Il formalise :
- l'organisation generale du code backend
- les packages principaux
- les conventions de nommage
- les responsabilites de chaque couche
- les regles de dependance entre packages

Ce document reste au niveau de la conception. Il sert a guider l'implementation du backend Spring Boot sans sur-architecturer le projet.

## Principes generaux

- Le backend suit une structure conventionnelle pour un projet `Spring Boot`.
- Les packages restent plats en V1.
- Le projet reste leger et n'est pas decoupe par feature a ce stade.
- Les responsabilites sont separees par couche :
  - `controller`
  - `service`
  - `repository`
  - `entity`
  - `dto`
  - `mapper`
  - `config`
  - `exception`
- Les classes de persistance portent le suffixe `Entity`.
- Les DTO d'API sont distincts des entites de persistance.

## Structure recommandee

```text
src/main/java/com/scorpanion/backend/
  config/
  controller/
  dto/
  entity/
  exception/
  mapper/
  repository/
  service/
```

## Role des packages

### config

Contient la configuration technique de l'application.

Exemples :
- configuration Spring generale
- configuration REST
- configuration CORS
- configuration de serialisation
- configuration future de securite si necessaire

### controller

Contient les points d'entree HTTP de l'API.

Responsabilites :
- exposer les endpoints REST
- recevoir les requetes
- valider la structure des donnees d'entree
- appeler la couche `service`
- transformer les resultats en reponses API

Le package `controller` ne porte pas de logique metier profonde.

### dto

Contient les objets d'entree et de sortie de l'API.

Responsabilites :
- definir les payloads de requete
- definir les payloads de reponse
- isoler le contrat API des entites JPA

Les DTO ne doivent pas etre utilises comme entites de persistance.

### entity

Contient les entites JPA persistantes.

Responsabilites :
- decrire le mapping entre objets Java et base de donnees
- representer les donnees persistees

Les entites ne doivent pas etre exposees directement comme contrat API.

### mapper

Contient les classes de transformation entre modeles de transport (`dto`), modeles de service (commandes internes) et modeles de persistance (`entity`).

Responsabilites :
- convertir les DTO de requete en objets de couche `service` (commandes internes)
- convertir les objets de couche `service` en entites de persistance
- convertir les entites de persistance en DTO de reponse
- centraliser les transformations d'objets pour alleger les couches `controller` et `service`

Le package `mapper` ne porte pas de logique metier ni d'acces a la base.

### repository

Contient les acces a la base de donnees.

Responsabilites :
- lire les donnees
- ecrire les donnees
- exposer les operations de persistance necessaires a la couche `service`

Le package `repository` ne porte pas de logique metier.

### service

Contient la logique applicative et la logique metier legere de la V1.

Responsabilites :
- orchestrer les cas d'usage
- verifier les invariants metier minimum
- coordonner les appels aux `repository`
- declencher les transactions d'ecriture

Cette couche est le coeur du backend.

### exception

Contient les exceptions et la gestion centralisee des erreurs.

Responsabilites :
- definir les exceptions metier ou techniques
- centraliser la transformation des erreurs en reponses HTTP coherentes

## Regles de dependance

La structure suit les dependances suivantes :

- `controller` depend de `service`, de `dto` et de `mapper`
- `service` depend de `repository`, de `entity` et de `mapper`
- `mapper` depend de `dto`, de `service` (commandes) et de `entity`
- `repository` depend de `entity`
- `exception` peut etre utilise par `controller` et `service`
- `config` peut etre utilise par l'ensemble du backend

Regles importantes :
- `controller` ne depend pas directement de `repository`
- `controller` peut dependre directement de `mapper` pour les transformations request/response
- `repository` ne depend pas de `service`
- `entity` ne depend pas de `controller` ni de `dto`
- `dto` ne remplace pas les entites de persistance
- `mapper` ne porte pas de validation metier

## Conventions de nommage

### Controllers

Les controllers suivent la convention :
- `<BusinessObject>Controller`

Exemples :
- `GameController`
- `PlayerController`
- `GameSessionController`

### Services

Les services suivent la convention :
- `<BusinessObject>Service`

Exemples :
- `GameService`
- `PlayerService`
- `GameSessionService`

### Repositories

Les repositories suivent la convention :
- `<BusinessObject>Repository`

Exemples :
- `GameRepository`
- `PlayerRepository`
- `GameSessionRepository`
- `SessionPlayerResultRepository`

### Entities

Les entites de persistance suivent la convention :
- `<BusinessObject>Entity`

Exemples :
- `GameEntity`
- `PlayerEntity`
- `GameSessionEntity`
- `SessionPlayerResultEntity`

### DTO de requete

Les DTO d'entree suivent la convention :
- `Create<BusinessObject>Request`

Exemples :
- `CreateGameRequest`
- `CreatePlayerRequest`
- `CreateGameSessionRequest`

Pour des objets imbriques dans une requete :
- `SessionPlayerResultRequest`

### DTO de reponse

Les DTO de sortie suivent la convention :
- `<BusinessObject>Response`

Exemples :
- `GameResponse`
- `PlayerResponse`
- `GameSessionResponse`
- `SessionPlayerResultResponse`

### Mappers

Les mappers suivent la convention :
- `<BusinessObject>Mapper`

Exemples :
- `GameMapper`
- `PlayerMapper`
- `GameSessionMapper`

## Exemple autour de Game

Pour l'objet metier `Game`, la structure cible serait :

- `controller/GameController`
- `service/GameService`
- `repository/GameRepository`
- `entity/GameEntity`
- `dto/CreateGameRequest`
- `dto/GameResponse`
- `mapper/GameMapper`

Le meme schema s'applique a `Player` et `GameSession`.

## Application a la V1

Pour la V1, les classes les plus probables sont :

### controller

- `GameController`
- `PlayerController`
- `GameSessionController`

### service

- `GameService`
- `PlayerService`
- `GameSessionService`

### repository

- `GameRepository`
- `PlayerRepository`
- `GameSessionRepository`
- `SessionPlayerResultRepository`

### mapper

- `GameMapper`
- `PlayerMapper`
- `GameSessionMapper`

### entity

- `GameEntity`
- `PlayerEntity`
- `GameSessionEntity`
- `SessionPlayerResultEntity`

### dto

- `CreateGameRequest`
- `GameResponse`
- `CreatePlayerRequest`
- `PlayerResponse`
- `CreateGameSessionRequest`
- `GameSessionResponse`
- `SessionPlayerResultRequest`
- `SessionPlayerResultResponse`

### exception

Exemples probables :
- `ApiExceptionHandler`
- `ResourceNotFoundException`
- `DuplicateNameException`
- `DuplicatePlayerInSessionException`

## Choix volontaires pour la V1

- pas de decoupage par feature
- pas de package `validation` pour l'instant
- pas de package `domain` separe
- pas de package `stats` en V1

Ces choix servent a garder un backend simple et conventionnel.

## Evolutions probables

Si le projet grossit, les evolutions naturelles pourront etre :

- introduire un package ou un module `stats`
- introduire un package `validation` si les regles se multiplient
- reorganiser le projet par feature si la base de code grossit fortement
