# API

## Objectif

Ce document decrit le contrat d'API de Scorpanion pour la V1.

Il formalise :
- les endpoints exposes par le backend
- les payloads attendus
- les reponses principales
- les validations d'entree
- les erreurs HTTP principales

Ce document reste au niveau de la conception. Il ne decrit pas encore la stack ni l'implementation detaillee.

## Principes generaux

- L'API suit un style `REST JSON`.
- La V1 couvre uniquement les besoins de creation et de lecture simple des referentiels.
- Les donnees persistees sont immuables apres creation.
- Le frontend calcule la premiere proposition de resultat d'une `GameSession`.
- L'API recoit uniquement le resultat final valide par l'utilisateur.
- L'API ne recalcule pas le resultat final en V1.
- L'API valide la structure des requetes et delegue la validation metier a la couche `Business`.

## Conventions

### Format des identifiants

- Tous les identifiants sont des `UUID`.

### Format des dates

- `playedAt` utilise un format datetime ISO 8601.

Exemple :

```json
"2026-04-12T20:30:00Z"
```

### Format des erreurs

Les erreurs suivent une structure simple et standard.

Exemple :

```json
{
  "error": {
    "code": "PLAYER_NAME_ALREADY_EXISTS",
    "message": "A player with this name already exists."
  }
}
```

## Endpoints V1

### GET /games

Retourne la liste plate des `Game`.

Reponse `200 OK` :

```json
[
  {
    "id": "6ecb38a6-57bf-4f3f-9f9d-9b8f0ff9ec2d",
    "name": "Azul",
    "resultType": "HIGHEST_SCORE"
  },
  {
    "id": "11bbec5a-4c9b-49b1-8c72-a8399d963c8c",
    "name": "Hanabi",
    "resultType": "NO_SCORE"
  }
]
```

Notes :
- la liste est simple et sans pagination en V1
- la liste est triee par `name`

### POST /games

Cree un nouveau `Game`.

Requete :

```json
{
  "name": "Azul",
  "resultType": "HIGHEST_SCORE"
}
```

Reponse `201 Created` :

```json
{
  "id": "6ecb38a6-57bf-4f3f-9f9d-9b8f0ff9ec2d",
  "name": "Azul",
  "resultType": "HIGHEST_SCORE"
}
```

Validations :
- `name` est obligatoire
- `name` est trimme avant validation et persistance
- `name` doit etre unique de facon insensible a la casse
- les espaces en debut et fin sont ignores pour l'unicite
- `resultType` est obligatoire
- `resultType` doit etre l'une des valeurs autorisees

Erreurs principales :
- `400 Bad Request` si le payload est invalide
- `409 Conflict` si un `Game` avec le meme nom existe deja

### GET /players

Retourne la liste plate des `Player`.

Reponse `200 OK` :

```json
[
  {
    "id": "c17e04f3-5f9d-43d4-9067-8ae8f30f4e14",
    "name": "Alice"
  },
  {
    "id": "24d4a8f8-7718-4c68-a292-0aee5c0c9d96",
    "name": "Bob"
  }
]
```

Notes :
- la liste est simple et sans pagination en V1
- la liste est triee par `name`

### POST /players

Cree un nouveau `Player`.

Requete :

```json
{
  "name": "Alice"
}
```

Reponse `201 Created` :

```json
{
  "id": "c17e04f3-5f9d-43d4-9067-8ae8f30f4e14",
  "name": "Alice"
}
```

Validations :
- `name` est obligatoire
- `name` est trimme avant validation et persistance
- `name` doit etre unique de facon insensible a la casse
- les espaces en debut et fin sont ignores pour l'unicite

Erreurs principales :
- `400 Bad Request` si le payload est invalide
- `409 Conflict` si un `Player` avec le meme nom existe deja

### POST /game-sessions

Cree une nouvelle `GameSession` avec ses `SessionPlayerResult`.

La requete contient le resultat final valide par l'utilisateur.

Requete :

```json
{
  "gameId": "6ecb38a6-57bf-4f3f-9f9d-9b8f0ff9ec2d",
  "playedAt": "2026-04-12T20:30:00Z",
  "playerResults": [
    {
      "playerId": "c17e04f3-5f9d-43d4-9067-8ae8f30f4e14",
      "score": 42,
      "rank": 1,
      "isWinner": true
    },
    {
      "playerId": "24d4a8f8-7718-4c68-a292-0aee5c0c9d96",
      "score": 38,
      "rank": 2,
      "isWinner": false
    }
  ]
}
```

Exemple `NO_SCORE` avec classement manuel optionnel :

```json
{
  "gameId": "11bbec5a-4c9b-49b1-8c72-a8399d963c8c",
  "playedAt": "2026-04-12T21:00:00Z",
  "playerResults": [
    {
      "playerId": "c17e04f3-5f9d-43d4-9067-8ae8f30f4e14",
      "rank": 1,
      "isWinner": false
    },
    {
      "playerId": "24d4a8f8-7718-4c68-a292-0aee5c0c9d96",
      "isWinner": false
    }
  ]
}
```

Reponse `201 Created` :

```json
{
  "id": "4a1a1f28-4ea6-42b6-a9d1-dc282f41eb32",
  "gameId": "6ecb38a6-57bf-4f3f-9f9d-9b8f0ff9ec2d",
  "playedAt": "2026-04-12T20:30:00Z",
  "playerResults": [
    {
      "id": "85a2c6d0-b6dd-44cb-9fc8-47c521f34eb6",
      "playerId": "c17e04f3-5f9d-43d4-9067-8ae8f30f4e14",
      "score": 42,
      "rank": 1,
      "isWinner": true
    },
    {
      "id": "1a61f1fa-b737-4c6f-bbb8-1c9630edab89",
      "playerId": "24d4a8f8-7718-4c68-a292-0aee5c0c9d96",
      "score": 38,
      "rank": 2,
      "isWinner": false
    }
  ]
}
```

Validations d'entree :
- `gameId` est obligatoire
- `playedAt` est obligatoire
- `playerResults` est obligatoire
- `playerResults` doit contenir au moins une entree
- chaque entree doit contenir `playerId`
- chaque entree doit contenir `isWinner`

Validations metier minimales :
- le `Game` reference doit exister
- chaque `Player` reference doit exister
- un meme `Player` ne peut apparaitre qu'une seule fois dans la meme `GameSession`
- la coherence minimale du payload est verifiee selon le `ResultType` du `Game`
- pour les jeux `NO_SCORE`, `score` ne doit pas etre fourni

Persistance :
- `GameSession` et `SessionPlayerResult` sont enregistres dans une transaction unique
- si une validation echoue, rien n'est enregistre

Erreurs principales :
- `400 Bad Request` si le payload est invalide
- `404 Not Found` si le `Game` ou un `Player` reference n'existe pas
- `409 Conflict` si un `Player` apparait plusieurs fois dans la meme session

## Enumerations

### ResultType

Valeurs autorisees :
- `NO_SCORE`
- `HIGHEST_SCORE`
- `LOWEST_SCORE`

## Repartition des responsabilites

### Frontend

Le frontend :
- calcule la premiere proposition de resultat
- affiche le recapitulatif editable
- permet l'ajustement manuel
- envoie a l'API uniquement le resultat final valide

### API backend

L'API backend :
- valide la structure des requetes
- delegue a `Business` la verification des invariants metier minimaux
- persiste le resultat final sans le recalculer

## Hors perimetre pour l'instant

Ce document ne couvre pas encore :
- les endpoints d'historique detaille
- les endpoints de statistiques
- la modification des donnees
- la suppression des donnees
- les choix de stack
- l'authentification
