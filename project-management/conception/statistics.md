# Statistics

## Objectif

Ce document decrit la conception du module `Statistics` de Scorpanion.

Il formalise :

- les objectifs produit de la feature
- le perimetre fonctionnel cible
- l'approche API modulaire retenue
- les metriques disponibles et leur definition
- les regles de filtrage et de tri

## Vision produit

Le module `Statistics` doit permettre de visualiser les parties de facon tres visuelle et exploratoire :

- evolution temporelle
- repartitions
- classements
- filtres multiples

Le module doit rester extensible pour ajouter de nouveaux graphiques sans devoir ajouter un endpoint backend pour chaque nouveau besoin.

## Principes directeurs

- Les stats sont en lecture seule.
- Les stats sont derivees des donnees finales validees (`GameSession`, `SessionPlayerResult`).
- Les stats n'essaient pas de recalculer la verite metier d'une partie.
- Les stats exposent des datasets modulaires, puis le frontend construit les graphiques.
- Les filtres restent communs entre les vues pour garder une UX coherente.

## Perimetre fonctionnel

### Portee initiale

Graphiques initiaux cibles :

- activite globale par semaine ou mois
- jeux les plus joues
- repartition des jeux d'un joueur
- evolution des scores d'un joueur sur un jeu
- evolution du nombre de parties jouees (global, joueur, jeu)
- classement des joueurs au meilleur winRate
- classement des joueurs avec le plus de victoires

Note :

- cette liste n'est pas exhaustive et peut evoluer en fonction des besoins produits.
- l'approche `dataset-first` est retenue justement pour permettre l'ajout de nouveaux graphiques sans refonte majeure du backend.

## Approche backend retenue : dataset-first

Le backend expose des endpoints de datasets generiques.
Le frontend choisit ensuite la visualisation (line chart, bar chart, donut, table).

Benefices :

- moins de couplage entre backend et chaque composant graphique
- ajout de nouveaux graphiques principalement cote frontend
- extension des metriques sans casser le contrat existant

## Endpoints stats cibles

### GET /stats/catalog

But :

- exposer les capacites du module stats au frontend.

Contenu :

- metriques disponibles
- description de chaque metrique
- filtres supportes
- granularites temporelles supportees
- contraintes de compatibilite des metriques

### GET /stats/timeseries

But :

- fournir des series temporelles reutilisables par plusieurs graphiques.

Usage typique :

- activite globale
- evolution du nombre de parties
- evolution des scores d'un joueur sur un jeu

### GET /stats/rankings/players

But :

- fournir les classements de joueurs selon une metrique.

Usage typique :

- classement winrate
- classement nombre de victoires

### GET /stats/distributions/games

But :

- fournir la distribution des jeux sur un perimetre (`scope`).

Usage typique :

- jeux les plus joues globalement
- repartition des jeux d'un joueur

### GET /stats/distributions/scores

But :

- fournir la distribution des scores sur un perimetre donne.

Usage typique :

- histogramme des scores d'un jeu
- histogramme des scores d'un joueur sur un jeu

### GET /stats/distributions/wins

But :

- fournir la distribution du nombre de victoires par joueur sur un perimetre donne.

Usage typique :

- repartition des victoires des joueurs (global)
- repartition des victoires des joueurs sur un jeu

### GET /stats/distributions/participations

But :

- fournir la distribution du nombre de participations par joueur sur un perimetre donne.

Usage typique :

- repartition des participations des joueurs (global)
- repartition des participations des joueurs sur un jeu

## Contrat API detaille (draft)

### GET /stats/catalog

Query params :

- aucun

Reponse `200` :

- `supportedIntervals` (`week`, `month`)
- `supportedScopes` (`global`, `player`, `game`)
- `metrics` : liste des metriques avec :
  - `id`
  - `label`
  - `description`
  - `supportedDatasets` (`timeseries`, `rankings`, `distributions`)
  - `constraints` (ex: "NO_SCORE_UNSUPPORTED")

Exemple reponse :

```json
{
  "supportedIntervals": ["week", "month"],
  "supportedScopes": ["global", "player", "game"],
  "metrics": [
    {
      "id": "sessionCount",
      "label": "Parties jouees",
      "description": "Nombre total de parties dans le perimetre filtre.",
      "supportedDatasets": ["timeseries", "distributions"],
      "constraints": []
    },
    {
      "id": "winRate",
      "label": "Winrate",
      "description": "Taux de victoire d'un joueur (winCount / participationCount).",
      "supportedDatasets": ["rankings"],
      "constraints": []
    },
    {
      "id": "averageScore",
      "label": "Score moyen",
      "description": "Moyenne des scores renseignes.",
      "supportedDatasets": ["timeseries", "rankings"],
      "constraints": ["NO_SCORE_UNSUPPORTED", "REQUIRES_GAME_CONTEXT"]
    }
  ]
}
```

### GET /stats/timeseries

Query params :

- `metric` (obligatoire)
- `scope` (obligatoire) : `global` | `player` | `game`
- `interval` (obligatoire) : `week` | `month`
- `from` (optionnel)
- `to` (optionnel)
- `playerId` (obligatoire si `scope=player`)
- `gameId` (obligatoire si `scope=game`)

Regles supplementaires :

- pour les metriques de score (`averageScore`, `minScore`, `maxScore`), `gameId` est obligatoire.
- si la metrique n'est pas compatible avec le contexte, retour `400`.

Reponse `200` :

- `metric`
- `scope`
- `interval`
- `filters`
- `series` : liste ordonnee de points (`bucketStart`, `value`, `sampleSize`)
- `generatedAt`

Exemple reponse :

```json
{
  "metric": "sessionCount",
  "scope": "global",
  "interval": "week",
  "filters": {
    "from": "2026-01-01T00:00:00Z",
    "to": "2026-04-01T00:00:00Z",
    "playerId": null,
    "gameId": null
  },
  "series": [
    {
      "bucketStart": "2026-03-02T00:00:00Z",
      "value": 3,
      "sampleSize": 3
    },
    {
      "bucketStart": "2026-03-09T00:00:00Z",
      "value": 0,
      "sampleSize": 0
    },
    {
      "bucketStart": "2026-03-16T00:00:00Z",
      "value": 1,
      "sampleSize": 1
    }
  ],
  "generatedAt": "2026-04-27T10:12:00Z"
}
```

### GET /stats/rankings/players

Query params :

- `metric` (obligatoire) : `winRate`, `winCount`, `participationCount`, `averageScore`, `averageRank`
- `from` (optionnel)
- `to` (optionnel)
- `gameId` (optionnel)
- `limit` (optionnel, defaut `20`, max `100`)
- `offset` (optionnel, defaut `0`)

Regles :

- l'ordre est determine cote backend (pas de tri arbitraire du client).
- en classement `winRate`, le volume (`participationCount`) est toujours retourne.
- `rows[].rank` correspond au rang de leaderboard calcule pour la reponse de stats (distinct du `rank` de `SessionPlayerResult` en base).
- convention de rang : `competition ranking` (ex aequo : `1, 1, 3`) appliquee uniquement aux lignes avec `hasValue=true`.
- si `hasValue=false` (`value=null`), alors `rank=null`.
- ordre total stable pour la pagination : apres les tie-breaks metier, tri final sur `player.id` ascendant pour garantir un ordre deterministe.

Reponse `200` :

- `metric`
- `filters`
- `paging` (`limit`, `offset`, `total`)
- `rows` : liste ordonnee avec :
  - `rank`
  - `player` (`id`, `name`)
  - `value`
  - `hasValue` (`true` si `value` est calculee, `false` si `value=null`)
  - `winCount`
  - `participationCount`

Exemple reponse :

```json
{
  "metric": "winRate",
  "filters": {
    "from": null,
    "to": null,
    "gameId": null
  },
  "paging": {
    "limit": 20,
    "offset": 0,
    "total": 3
  },
  "rows": [
    {
      "rank": 1,
      "player": {
        "id": "c17e04f3-5f9d-43d4-9067-8ae8f30f4e14",
        "name": "Alice"
      },
      "value": 75,
      "hasValue": true,
      "winCount": 9,
      "participationCount": 12
    },
    {
      "rank": 2,
      "player": {
        "id": "24d4a8f8-7718-4c68-a292-0aee5c0c9d96",
        "name": "Bob"
      },
      "value": 50,
      "hasValue": true,
      "winCount": 6,
      "participationCount": 12
    },
    {
      "rank": null,
      "player": {
        "id": "f5cc5290-b05b-4f9f-9f4a-3d8d3ec7c0ca",
        "name": "Charlie"
      },
      "value": null,
      "hasValue": false,
      "winCount": 0,
      "participationCount": 0
    }
  ]
}
```

### GET /stats/distributions/games

Query params :

- `scope` (obligatoire) : `global` | `player`
- `playerId` (obligatoire si `scope=player`)
- `from` (optionnel)
- `to` (optionnel)
- `limit` (optionnel, defaut `20`, max `100`)
- `includeOthers` (optionnel, defaut `true`) : ajoute une ligne `others` agregeant les categories hors `limit`

Regles :

- ordre de tri contractuel : `sessionCount` descendant, puis `game.name` ascendant, puis `game.id` ascendant.
- si `includeOthers=true`, la ligne `others` est toujours placee en derniere position.

Reponse `200` :

- `scope`
- `filters`
- `totalSessionCount`
- `rows` : liste avec :
  - `game` (`id`, `name`, `resultType`) ou `null` pour la ligne `others`
  - `isOthers` (`true` uniquement pour la ligne de regroupement)
  - `sessionCount`
  - `share`

Exemple reponse :

```json
{
  "scope": "player",
  "filters": {
    "playerId": "c17e04f3-5f9d-43d4-9067-8ae8f30f4e14",
    "from": null,
    "to": null
  },
  "totalSessionCount": 12,
  "rows": [
    {
      "game": {
        "id": "6ecb38a6-57bf-4f3f-9f9d-9b8f0ff9ec2d",
        "name": "Azul",
        "resultType": "HIGHEST_SCORE"
      },
      "isOthers": false,
      "sessionCount": 5,
      "share": 42
    },
    {
      "game": {
        "id": "11bbec5a-4c9b-49b1-8c72-a8399d963c8c",
        "name": "Hanabi",
        "resultType": "NO_SCORE"
      },
      "isOthers": false,
      "sessionCount": 3,
      "share": 25
    },
    {
      "game": null,
      "isOthers": true,
      "sessionCount": 4,
      "share": 33
    }
  ]
}
```

### GET /stats/distributions/scores

Query params :

- `scope` (obligatoire) : `global` | `player` | `game`
- `playerId` (obligatoire si `scope=player`)
- `gameId` (obligatoire)
- `from` (optionnel)
- `to` (optionnel)
- `limit` (optionnel, defaut `30`, max `100`)
- `includeOthers` (optionnel, defaut `true`) : ajoute une ligne `others` agregeant les buckets hors `limit`

Regles :

- incompatible avec les jeux `NO_SCORE`.
- le bucketing des scores est determine automatiquement cote backend.
- ordre de tri contractuel : `bucket.lowerInclusive` ascendant.
- si `includeOthers=true`, la ligne `others` est toujours placee en derniere position.

Reponse `200` :

- `scope`
- `filters`
- `totalSampleSize`
- `rows` : liste ordonnee avec :
  - `bucket` (`lowerInclusive`, `upperExclusive`, `label`) ou `null` pour la ligne `others`
  - `isOthers` (`true` uniquement pour la ligne de regroupement)
  - `count`
  - `share`

Exemple reponse :

```json
{
  "scope": "game",
  "filters": {
    "playerId": null,
    "gameId": "6ecb38a6-57bf-4f3f-9f9d-9b8f0ff9ec2d",
    "from": null,
    "to": null
  },
  "totalSampleSize": 18,
  "rows": [
    {
      "bucket": {
        "lowerInclusive": 50,
        "upperExclusive": 60,
        "label": "50-59"
      },
      "isOthers": false,
      "count": 4,
      "share": 22
    },
    {
      "bucket": {
        "lowerInclusive": 60,
        "upperExclusive": 70,
        "label": "60-69"
      },
      "isOthers": false,
      "count": 7,
      "share": 39
    },
    {
      "bucket": null,
      "isOthers": true,
      "count": 7,
      "share": 39
    }
  ]
}
```

Exemple de reponse (empty state) :

```json
{
  "scope": "game",
  "filters": {
    "playerId": null,
    "gameId": "6ecb38a6-57bf-4f3f-9f9d-9b8f0ff9ec2d",
    "from": "2026-01-01T00:00:00Z",
    "to": "2026-02-01T00:00:00Z"
  },
  "totalSampleSize": 0,
  "rows": []
}
```

### GET /stats/distributions/wins

Query params :

- `scope` (obligatoire) : `global` | `game`
- `gameId` (obligatoire si `scope=game`)
- `from` (optionnel)
- `to` (optionnel)
- `limit` (non supporte sur cet endpoint)
- `includeOthers` (non supporte sur cet endpoint)

Regles :

- le bucket represente le nombre de victoires (`winCount`) sur le perimetre filtre.
- le bucketing est determine automatiquement cote backend avec classes fixes : `0`, `1`, `2`, `3+`.
- aucune ligne `others` n'est retournee sur cet endpoint.
- `totalPlayerCount` compte les joueurs actifs du perimetre filtre (au moins une participation sur l'intervalle et le scope demandes).
- ordre de tri contractuel des buckets : `0`, `1`, `2`, `3+`.

Reponse `200` :

- `scope`
- `filters`
- `totalPlayerCount`
- `rows` : liste ordonnee avec :
  - `bucket` (`id`, `label`)
  - `count`
  - `share`

Exemple reponse :

```json
{
  "scope": "global",
  "filters": {
    "gameId": null,
    "from": null,
    "to": null
  },
  "totalPlayerCount": 8,
  "rows": [
    {
      "bucket": {
        "id": "0",
        "label": "0 victoire"
      },
      "count": 2,
      "share": 25
    },
    {
      "bucket": {
        "id": "1",
        "label": "1 victoire"
      },
      "count": 1,
      "share": 13
    },
    {
      "bucket": {
        "id": "2",
        "label": "2 victoires"
      },
      "count": 2,
      "share": 25
    },
    {
      "bucket": {
        "id": "3_PLUS",
        "label": "3+ victoires"
      },
      "count": 3,
      "share": 37
    }
  ]
}
```

### GET /stats/distributions/participations

Query params :

- `scope` (obligatoire) : `global` | `game`
- `gameId` (obligatoire si `scope=game`)
- `from` (optionnel)
- `to` (optionnel)
- `limit` (non supporte sur cet endpoint)
- `includeOthers` (non supporte sur cet endpoint)

Regles :

- le bucket represente le nombre de participations (`participationCount`) sur le perimetre filtre.
- le bucketing est determine automatiquement cote backend avec classes fixes : `1`, `2-3`, `4-6`, `7+`.
- aucune ligne `others` n'est retournee sur cet endpoint.
- `totalPlayerCount` compte les joueurs actifs du perimetre filtre (au moins une participation sur l'intervalle et le scope demandes).
- ordre de tri contractuel des buckets : `1`, `2-3`, `4-6`, `7+`.

Reponse `200` :

- `scope`
- `filters`
- `totalPlayerCount`
- `rows` : liste ordonnee avec :
  - `bucket` (`id`, `label`)
  - `count`
  - `share`

Exemple reponse :

```json
{
  "scope": "game",
  "filters": {
    "gameId": "6ecb38a6-57bf-4f3f-9f9d-9b8f0ff9ec2d",
    "from": null,
    "to": null
  },
  "totalPlayerCount": 10,
  "rows": [
    {
      "bucket": {
        "id": "1",
        "label": "1 participation"
      },
      "count": 2,
      "share": 20
    },
    {
      "bucket": {
        "id": "2_3",
        "label": "2-3 participations"
      },
      "count": 3,
      "share": 30
    },
    {
      "bucket": {
        "id": "4_6",
        "label": "4-6 participations"
      },
      "count": 3,
      "share": 30
    },
    {
      "bucket": {
        "id": "7_PLUS",
        "label": "7+ participations"
      },
      "count": 2,
      "share": 20
    }
  ]
}
```

## Filtres et dimensions (communs)

Filtres standards :

- `from` (optionnel)
- `to` (optionnel)
- `playerId` (optionnel selon endpoint)
- `gameId` (optionnel selon endpoint)

Regle de resolution des identifiants :

- si un `playerId` fourni ne correspond a aucun joueur, retour `404` (`RESOURCE_NOT_FOUND`).
- si un `gameId` fourni ne correspond a aucun jeu, retour `404` (`RESOURCE_NOT_FOUND`).

Regle de proportion (`share`) :

- `share` est toujours calculee sur le total complet du perimetre filtre (avant pagination / `limit`).
- `includeOthers` est supporte uniquement sur `GET /stats/distributions/games` et `GET /stats/distributions/scores`.
- le calcul de `share` utilise la methode de Hamilton (plus grands restes) pour garantir une somme egale a `100` quand toutes les categories du perimetre sont presentes.
- quand `limit` est applique et `includeOthers=true`, une ligne de regroupement `others` est ajoutee : la somme des `share` retournes reste `100`.
- quand `limit` est applique et `includeOthers=false`, la somme des `share` retournes peut etre strictement inferieure a `100`.
- si le total de reference vaut `0` (`totalSessionCount=0`, `totalSampleSize=0` ou `totalPlayerCount=0`), la reponse retourne `rows=[]`, sans ligne `others`, et sans calcul de `share`.
- quand presente, la ligne `others` est toujours retournee en derniere position de `rows`.
- formules appliquees selon endpoint :
  - `GET /stats/distributions/games` : base reelle `rawShare = (sessionCount / totalSessionCount) * 100`
  - `GET /stats/distributions/scores` : base reelle `rawShare = (count / totalSampleSize) * 100`
  - `GET /stats/distributions/wins` : base reelle `rawShare = (count / totalPlayerCount) * 100`
  - `GET /stats/distributions/participations` : base reelle `rawShare = (count / totalPlayerCount) * 100`
- application Hamilton (par reponse) :
  1. calculer tous les `rawShare` sur les lignes retournees ;
  2. prendre la partie entiere (`floor`) de chaque `rawShare` ;
  3. distribuer les points restants jusqu'a `100` aux lignes avec les plus grands restes decimaux ;
  4. en cas d'egalite de reste decimal, appliquer l'ordre de tri contractuel de l'endpoint comme tie-break.
- avec `includeOthers=true`, la ligne `others` est incluse dans l'application Hamilton au meme titre que les autres lignes.
- en cas d'egalite stricte incluant `others`, `others` est priorisee en dernier au tie-break.
- Hamilton s'applique uniquement si le total de reference est strictement positif.

Regle d'arrondi :

- toutes les valeurs numeriques calculees exposees par l'API stats sont arrondies a l'entier le plus proche.
- `share` et `winRate` sont exposes en pourcentage entier (`0..100`).
- exception : `share` utilise la methode de Hamilton (et non un `round` independant ligne par ligne).
- cette regle s'applique notamment a `value` (timeseries/rankings), `share`, `winRate`, `averageScore` et `averageRank`.

Regle de bucketing :

- les distributions utilisent un bucketing determine automatiquement cote backend.
- aucun parametre de bucketing n'est expose au client.
- les classes de buckets sont contractuelles et stables.

Granularite temporelle :

- `week`
- `month`

Scope :

- `global`
- `player`
- `game`

## Regles temporelles

- timezone de reference : UTC.
- format attendu pour `from` / `to` : ISO-8601 (ex: `2026-04-01T00:00:00Z`).
- bornes temporelles : intervalle semi-ouvert `[from, to)` :
  - `from` inclusif
  - `to` exclusif
- validation : `from` doit etre strictement inferieur a `to`.
- valeurs par defaut :
  - si `to` est absent, `to = now()` (UTC)
  - si `from` est absent, `from = to - 12 mois`
  - si `from` et `to` sont absents, fenetre glissante des 12 derniers mois
- alignement des buckets :
  - `week` : semaine ISO (lundi 00:00:00 UTC)
  - `month` : premier jour du mois a 00:00:00 UTC
- en timeseries, les buckets sans donnee sont toujours retournes avec `sampleSize=0`.
- pour les metriques de comptage (`sessionCount`, `participationCount`, `winCount`, `playedGameCount`, `activePlayerCount`), un bucket sans donnee retourne `value=0`.
- pour les metriques calculees (`winRate`, `averageScore`, `minScore`, `maxScore`, `averageRank`), un bucket sans donnee retourne `value=null`.
- limites de plage :
  - maximum 120 buckets pour `month`
  - maximum 260 buckets pour `week`

## Matrice de compatibilite

Convention :

- `R` = requis
- `O` = optionnel
- `-` = non applicable

### Timeseries (`GET /stats/timeseries`)


| metric               | scope=global                  | scope=player                  | scope=game                    | Regles specifiques                          |
| -------------------- | ----------------------------- | ----------------------------- | ----------------------------- | ------------------------------------------- |
| `sessionCount`       | OK (`playerId:-`, `gameId:-`) | OK (`playerId:R`, `gameId:O`) | OK (`playerId:-`, `gameId:R`) | metrique de volume de parties               |
| `participationCount` | NON                           | OK (`playerId:R`, `gameId:O`) | NON                           | metrique centree joueur                     |
| `winCount`           | NON                           | OK (`playerId:R`, `gameId:O`) | NON                           | metrique centree joueur                     |
| `winRate`            | NON                           | OK (`playerId:R`, `gameId:O`) | NON                           | calcule via `winCount / participationCount` |
| `averageScore`       | NON                           | OK (`playerId:R`, `gameId:R`) | OK (`playerId:O`, `gameId:R`) | incompatible jeu `NO_SCORE`                 |
| `minScore`           | NON                           | OK (`playerId:R`, `gameId:R`) | OK (`playerId:O`, `gameId:R`) | incompatible jeu `NO_SCORE`                 |
| `maxScore`           | NON                           | OK (`playerId:R`, `gameId:R`) | OK (`playerId:O`, `gameId:R`) | incompatible jeu `NO_SCORE`                 |
| `averageRank`        | NON                           | OK (`playerId:R`, `gameId:O`) | NON                           | calcule sur lignes avec `rank` renseigne    |
| `playedGameCount`    | OK (`playerId:-`, `gameId:-`) | OK (`playerId:R`, `gameId:-`) | NON                           | nombre de jeux distincts joues              |
| `activePlayerCount`  | OK (`playerId:-`, `gameId:O`) | NON                           | OK (`playerId:-`, `gameId:R`) | nombre de joueurs distincts actifs          |


### Rankings (`GET /stats/rankings/players`)


| metric               | Supporte | `gameId` | Regles specifiques                       |
| -------------------- | -------- | -------- | ---------------------------------------- |
| `winRate`            | OUI      | O        | `participationCount` toujours retourne   |
| `winCount`           | OUI      | O        | classement par victoires                 |
| `participationCount` | OUI      | O        | classement par participations            |
| `averageScore`       | OUI      | R        | incompatible jeu `NO_SCORE`              |
| `averageRank`        | OUI      | O        | calcule sur lignes avec `rank` renseigne |
| `minScore`           | NON      | -        | hors perimetre rankings                  |
| `maxScore`           | NON      | -        | hors perimetre rankings                  |
| `sessionCount`       | NON      | -        | hors perimetre endpoint ranking joueurs  |
| `playedGameCount`    | NON      | -        | hors perimetre endpoint ranking joueurs  |
| `activePlayerCount`  | NON      | -        | hors perimetre endpoint ranking joueurs  |


### Distributions

#### `GET /stats/distributions/games`


| metric implicite     | scope=global       | scope=player       | scope=game | Regles specifiques                 |
| -------------------- | ------------------ | ------------------ | ---------- | ---------------------------------- |
| `sessionCountByGame` | OUI (`playerId:-`) | OUI (`playerId:R`) | NON        | distribution des jeux du perimetre |


#### `GET /stats/distributions/scores`


| metric implicite | scope=global                   | scope=player                   | scope=game                     | Regles specifiques          |
| ---------------- | ------------------------------ | ------------------------------ | ------------------------------ | --------------------------- |
| `scoreHistogram` | OUI (`gameId:R`, `playerId:-`) | OUI (`gameId:R`, `playerId:R`) | OUI (`gameId:R`, `playerId:O`) | incompatible jeu `NO_SCORE` |


#### `GET /stats/distributions/wins`


| metric implicite         | scope=global     | scope=player | scope=game       | Regles specifiques                     |
| ------------------------ | ---------------- | ------------ | ---------------- | -------------------------------------- |
| `winCountByPlayerBucket` | OUI (`gameId:-`) | NON          | OUI (`gameId:R`) | bucketing auto backend fixe (`0`, `1`, `2`, `3+`) |


#### `GET /stats/distributions/participations`


| metric implicite                   | scope=global     | scope=player | scope=game       | Regles specifiques                         |
| ---------------------------------- | ---------------- | ------------ | ---------------- | ------------------------------------------ |
| `participationCountByPlayerBucket` | OUI (`gameId:-`) | NON          | OUI (`gameId:R`) | bucketing auto backend fixe (`1`, `2-3`, `4-6`, `7+`) |


### Erreurs associees

- combinaison `metric` / `scope` non supportee -> `400` (`UNSUPPORTED_METRIC_SCOPE_COMBINATION`)
- filtre requis manquant -> `400` (`MISSING_REQUIRED_FILTER`)
- metrique score sur jeu `NO_SCORE` -> `400` (`NO_SCORE_UNSUPPORTED`)
- plage temporelle invalide (`from >= to`) -> `400` (`INVALID_TIME_RANGE`)
- plage temporelle trop large pour l'intervalle demande -> `400` (`TIME_RANGE_TOO_LARGE`)
- `limit` invalide (<=0 ou > max endpoint) -> `400` (`INVALID_LIMIT`)
- `offset` invalide (<0) -> `400` (`INVALID_OFFSET`)
- parametre non supporte pour l'endpoint (ex: `includeOthers` sur `wins`/`participations`) -> `400` (`UNSUPPORTED_PARAMETER`)
- ressource cible introuvable (`playerId` ou `gameId`) -> `404` (`RESOURCE_NOT_FOUND`)

### Contrat d'erreur API

Format de reponse commun pour les erreurs `4xx` :

- `code` : code stable lisible par le frontend (ex: `MISSING_REQUIRED_FILTER`)
- `message` : message humain court (non contractuel)
- `details` : liste optionnelle de details par champ/parametre invalide
- `traceId` : identifiant de correlation pour diagnostic
- `timestamp` : horodatage UTC de la reponse

Exemple :

```json
{
  "code": "MISSING_REQUIRED_FILTER",
  "message": "Le filtre requis 'playerId' est absent pour scope=player.",
  "details": [
    {
      "field": "playerId",
      "reason": "required_when_scope_player"
    }
  ],
  "traceId": "6f6f4e1f0f4d4adbb4f1ce2e31c8c7a1",
  "timestamp": "2026-04-27T18:31:00Z"
}
```

Notes :

- le frontend se base sur `code` pour la logique de gestion, pas sur `message`.
- `message` peut evoluer sans casser le contrat.

## Metriques Stats

### sessionCount

Description :

- nombre total de parties (`GameSession`) dans le perimetre filtre.

### participationCount

Description :

- nombre de participations d'un joueur (parties ou il apparait).
- `rank` peut etre `null` sans exclure la participation : la ligne est quand meme comptee.

### winCount

Description :

- nombre de parties ou le joueur est marque gagnant (`isWinner=true`).

### winRate

Description :

- taux de victoire d'un joueur en pourcentage entier (`round((winCount / participationCount) * 100)`).

### averageScore

Description :

- moyenne des scores renseignes (`score != null`) dans le perimetre.

### minScore

Description :

- score minimum observe sur les entrees avec score.

### maxScore

Description :

- score maximum observe sur les entrees avec score.

### averageRank

Description :

- rang moyen calcule uniquement sur les entrees avec `rank` renseigne.
- une entree avec `rank=null` reste comptee pour les metriques de volume (`participationCount`, `sessionCount`) mais est ignoree pour `averageRank`.

### playedGameCount

Description :

- nombre de jeux distincts joues dans le perimetre.

### activePlayerCount

Description :

- nombre de joueurs distincts ayant participe dans le perimetre.

## Contraintes metriques

- `averageScore`, `minScore`, `maxScore` ne sont pas exploitables pour les jeux `NO_SCORE`.
- `averageRank` est calcule uniquement sur les lignes ou `rank` est renseigne.
- un `rank=null` n'exclut jamais le joueur des metriques de participation ou de volume ; il exclut uniquement la ligne des calculs bases sur le rang.
- regle generale : si une statistique n'a aucun echantillon sur le perimetre filtre, sa valeur retournee est `null`.
- pour les metriques de ratio (ex: `winRate`), si le denominateur est nul (`participationCount=0`), la valeur retournee est `null`.
- dans les rankings, les lignes avec `value=null` sont toujours triees en fin de resultat (`NULLS LAST`), quel que soit le sens du tri de la metrique.
- les classements winrate n'appliquent pas de seuil minimum (usage prive).
- les classements winrate affichent toujours aussi le volume (`participationCount`).
- la distribution des scores est uniquement disponible si `gameId` est fourni et si le jeu supporte les scores.
- les distributions de victoires et participations utilisent un bucketing automatique backend fixe (`0`, `1`, `2`, `3+` pour wins ; `1`, `2-3`, `4-6`, `7+` pour participations).

## Regles de tri

Regle transversale (rankings de joueurs) :

- `NULLS LAST` pour `value` sur toutes les metriques de ranking.
- apres application de `NULLS LAST`, les tie-breaks metier et techniques ci-dessous s'appliquent.

Classement winrate :

- tri principal : `winRate` descendant
- tie-break 1 : `winCount` descendant
- tie-break 2 : `participationCount` descendant
- tie-break 3 : `playerName` ascendant
- tie-break final technique : `playerId` ascendant (stabilite pagination)

Classement victoires :

- tri principal : `winCount` descendant
- tie-break 1 : `winRate` descendant
- tie-break 2 : `participationCount` descendant
- tie-break 3 : `playerName` ascendant
- tie-break final technique : `playerId` ascendant (stabilite pagination)

Classement participations :

- tri principal : `participationCount` descendant
- tie-break 1 : `winCount` descendant
- tie-break 2 : `winRate` descendant
- tie-break 3 : `playerName` ascendant
- tie-break final technique : `playerId` ascendant (stabilite pagination)

Classement score moyen :

- tri principal : `averageScore` descendant
- tie-break 1 : `participationCount` descendant
- tie-break 2 : `winRate` descendant
- tie-break 3 : `playerName` ascendant
- tie-break final technique : `playerId` ascendant (stabilite pagination)

Classement rang moyen :

- tri principal : `averageRank` ascendant
- tie-break 1 : `participationCount` descendant
- tie-break 2 : `winRate` descendant
- tie-break 3 : `playerName` ascendant
- tie-break final technique : `playerId` ascendant (stabilite pagination)

## Mapping graphique -> endpoint

- activite globale semaine/mois
  - `/stats/timeseries` avec `metric=sessionCount`, `scope=global`
- jeux les plus joues
  - `/stats/distributions/games` avec `scope=global`
- repartition des jeux d'un joueur
  - `/stats/distributions/games` avec `scope=player`, `playerId`
- distribution des scores d'un jeu
  - `/stats/distributions/scores` avec `scope=game`, `gameId`
- distribution des scores d'un joueur sur un jeu
  - `/stats/distributions/scores` avec `scope=player`, `playerId`, `gameId`
- distribution des victoires des joueurs
  - `/stats/distributions/wins` avec `scope=global` (ou `scope=game`, `gameId`)
- distribution des participations des joueurs
  - `/stats/distributions/participations` avec `scope=global` (ou `scope=game`, `gameId`)
- evolution des scores d'un joueur sur un jeu
  - `/stats/timeseries` avec `metric=averageScore`, `scope=player`, `playerId`, `gameId`
- evolution nombre de parties (global/joueur/jeu)
  - `/stats/timeseries` avec `metric=sessionCount`, `scope` adapte
- joueurs avec le meilleur winRate
  - `/stats/rankings/players` avec `metric=winRate`
- joueurs avec le plus de victoires
  - `/stats/rankings/players` avec `metric=winCount`

## Hors perimetre a ce stade

- recommandations automatiques
- modele de rating type Elo/Glicko
- dashboards temps reel
- systeme de permissions fin sur les stats

