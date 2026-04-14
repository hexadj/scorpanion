# Frontend Structure

## Objectif

Ce document decrit la structure cible du frontend de Scorpanion pour la V1.

Il formalise :
- l'organisation generale du code frontend
- les dossiers principaux
- les conventions de nommage
- les responsabilites de chaque couche
- les regles de dependance et d'ecriture
- les choix techniques retenus pour la gestion d'etat, le routing, les formulaires, le styling et les tests

Ce document reste au niveau de la conception. Il sert a guider l'implementation du frontend React sans sur-architecturer le projet.

## Principes generaux

- Le frontend est une SPA React en TypeScript, buildee avec Vite.
- Le gestionnaire de paquets du projet frontend est `pnpm`.
- La structure est organisee par type en V1.
- Le projet reste leger et n'est pas decoupe par feature a ce stade.
- Les responsabilites sont separees par couche :
  - `pages` pour les vues principales
  - `components` pour les composants reutilisables
  - `hooks` pour les custom hooks partages
  - `store` pour la gestion d'etat Redux
  - `services` pour les definitions d'API RTK Query
  - `types` pour les types du domaine partages
  - `utils` pour les fonctions utilitaires
  - `theme` pour la configuration du theme MUI
  - `router` pour la configuration du routing
- Les composants ne portent pas de logique d'acces a l'API.
- Les types du domaine sont centralises. Les types UI specifiques sont co-localises avec leurs fichiers.

## Structure recommandee

```text
src/
  assets/
  components/
  hooks/
  pages/
  router/
  services/
  store/
  theme/
  types/
  utils/
  App.tsx
  main.tsx
```

## Role des dossiers

### assets

Contient les fichiers statiques du projet.

Exemples :
- images
- icones
- fonts

### components

Contient les composants React reutilisables et generiques.

Responsabilites :
- fournir des briques UI reutilisables dans plusieurs pages
- encapsuler la logique d'affichage locale
- ne pas contenir de logique d'acces a l'API ni de logique metier

Exemples :
- un composant de dialogue de confirmation
- un composant de champ de recherche reutilisable
- un composant de layout ou de navigation

### hooks

Contient les custom hooks partages entre plusieurs pages ou composants.

Responsabilites :
- encapsuler une logique reutilisable a travers le projet
- ne pas contenir de logique d'affichage

Exemples :
- un hook de debounce
- un hook de gestion du focus

### pages

Contient les vues principales de l'application, correspondant aux routes.

Responsabilites :
- assembler les composants pour constituer une page complete
- appeler les hooks et les services necessaires
- orchestrer l'affichage d'une vue

Exemples :
- la page de liste des jeux
- la page de saisie d'une partie
- la page de liste des joueurs

### router

Contient la configuration du routing de l'application.

Responsabilites :
- definir les routes de l'application
- associer chaque route a sa page
- centraliser la configuration de React Router

### services

Contient les definitions d'API RTK Query.

Responsabilites :
- definir les endpoints de l'API backend
- configurer les requetes et mutations
- centraliser la communication avec le backend
- configurer le client axios partage

Ce dossier est le seul point d'acces a l'API backend.

### store

Contient la configuration du store Redux et les slices d'etat.

Responsabilites :
- configurer le store Redux Toolkit
- integrer les API RTK Query dans le store
- definir les slices d'etat client si necessaire
- centraliser la gestion d'etat globale de l'application

### theme

Contient la configuration du theme MUI.

Responsabilites :
- definir la palette de couleurs principales
- centraliser la personnalisation du theme
- exposer le theme pour le `ThemeProvider`


### types

Contient les types et constantes du domaine partages a travers le projet.

Responsabilites :
- definir les types correspondant aux entites de l'API
- definir les constantes du domaine
- garantir un contrat type unique pour les donnees partagees

Les types specifiques a un seul composant ou une seule page restent co-localises avec leur fichier.

### utils

Contient les fonctions utilitaires pures partagees.

Responsabilites :
- fournir des fonctions de transformation ou de formatage
- ne pas contenir de logique d'affichage ni d'acces a l'API

Exemples :
- formatage de dates
- logique de tri ou de calcul de classement

## Regles de dependance

La structure suit les dependances suivantes :

- `pages` depend de `components`, `hooks`, `services` et `store`
- `components` depend de `hooks`, `types` et `utils`
- `hooks` depend de `types` et `utils`
- `services` depend de `types`
- `store` depend de `services` et `types`
- `router` depend de `pages`
- `theme` est autonome
- `types` est autonome
- `utils` est autonome

Regles importantes :
- `components` n'appelle pas directement les services API
- `utils` ne depend d'aucun autre dossier du projet
- `types` ne depend d'aucun autre dossier du projet
- `services` ne depend pas de `components` ni de `pages`
- `theme` ne depend pas de `components` ni de `pages`

## Conventions de nommage

### Fichiers de composants

Les fichiers de composants React utilisent le PascalCase :
- `<NomComposant>.tsx`

Exemples :
- `GameList.tsx`
- `PlayerForm.tsx`
- `SessionRecap.tsx`
- `ConfirmDialog.tsx`

### Fichiers de hooks

Les fichiers de hooks utilisent le camelCase et le prefixe `use` :
- `use<NomHook>.ts`

Exemples :
- `useDebounce.ts`
- `useFocusTrap.ts`

### Fichiers de services

Les fichiers de services RTK Query utilisent le camelCase :
- `<domaine>.api.ts`

Exemples :
- `game.api.ts`
- `player.api.ts`
- `gameSession.api.ts`

### Fichiers de store

Les fichiers de store et slices utilisent le camelCase :
- `store.ts` pour la configuration du store
- `<domaine>Slice.ts` pour les slices d'etat client

Exemples :
- `store.ts`

### Fichiers de types

Les fichiers de types partages utilisent le camelCase :
- `<domaine>.types.ts`

Exemples :
- `game.types.ts`
- `player.types.ts`
- `gameSession.types.ts`

### Fichiers utilitaires

Les fichiers utilitaires utilisent le camelCase :
- `<fonction>.utils.ts`

Exemples :
- `dateFormat.utils.ts`
- `ranking.utils.ts`

### Fichiers de pages

Les fichiers de pages utilisent le PascalCase :
- `<NomPage>.tsx`

Exemples :
- `GameListPage.tsx`
- `PlayerListPage.tsx`
- `NewSessionPage.tsx`

### Fichiers de theme

- `theme.ts`

### Fichiers de router

- `router.tsx`

## Conventions d'ecriture

### Exports

Tous les fichiers utilisent des named exports.

```typescript
export const GameList = () => { ... };
```

Les default exports ne sont pas utilises dans le projet.

### Enumerations et constantes du domaine

Les enumerations du domaine utilisent des union types avec un objet `as const`.

```typescript
export const RESULT_TYPES = {
  NO_SCORE: 'NO_SCORE',
  HIGHEST_SCORE: 'HIGHEST_SCORE',
  LOWEST_SCORE: 'LOWEST_SCORE',
} as const;

export type ResultType = (typeof RESULT_TYPES)[keyof typeof RESULT_TYPES];
```

Les enums TypeScript natifs ne sont pas utilises dans le projet.

### Types du domaine

Les types correspondant aux entites de l'API sont centralises dans `src/types/`.

```typescript
export type Game = {
  id: string;
  name: string;
  resultType: ResultType;
};
```

Les types specifiques a un seul composant (props, etat local) sont definis dans le meme fichier que le composant.

### Co-location des fichiers

Les fichiers sont plats et cote a cote dans le meme dossier parent. Pas de sous-dossier par composant en V1.

```text
components/
  GameList.tsx
  PlayerList.tsx
  ConfirmDialog.tsx
```

### Fichiers barrel

Un fichier `index.ts` est present uniquement a la racine de chaque dossier principal pour re-exporter l'API publique du module.

```text
components/index.ts
hooks/index.ts
services/index.ts
store/index.ts
types/index.ts
utils/index.ts
```

Les fichiers barrel ne sont pas utilises a l'interieur des sous-dossiers.

## Gestion d'etat

### Redux Toolkit

Le store Redux Toolkit est le point central de la gestion d'etat globale.

Responsabilites :
- gerer l'etat serveur via RTK Query
- gerer l'etat client global si necessaire

En V1, la majorite de l'etat provient du serveur et est geree par RTK Query. Les slices d'etat client sont ajoutes uniquement si un besoin concret emerge.

### RTK Query

RTK Query est utilise pour toute communication avec le backend.

Responsabilites :
- definir les endpoints correspondant a l'API REST
- gerer le cache, le loading, les erreurs et les mutations
- invalider et rafraichir les donnees automatiquement apres une mutation

Les definitions d'API sont centralisees dans `src/services/`.

### Axios

Axios est utilise comme client HTTP pour les requetes RTK Query.

Responsabilites :
- configurer une instance partagee avec la base URL `/api`
- centraliser la gestion des erreurs HTTP

La configuration d'axios est definie dans `src/services/`.

## Routing

### React Router v7

React Router v7 est utilise pour le routing de l'application.

La configuration des routes est centralisee dans `src/router/router.tsx`.

En V1, le routing reste simple et plat. Les routes sont declaratives et associees aux pages correspondantes.

## Formulaires

### React Hook Form

React Hook Form est utilise pour la gestion des formulaires.

Responsabilites :
- gerer l'etat des champs de formulaire
- minimiser les re-renders
- supporter les formulaires dynamiques

React Hook Form est particulierement adapte a la saisie d'une `GameSession` ou le nombre de joueurs et de champs est variable.

### Zod

Zod est utilise pour la validation des formulaires.

Responsabilites :
- definir les schemas de validation des donnees d'entree
- inferer les types TypeScript depuis les schemas
- s'integrer avec React Hook Form via `@hookform/resolvers`

Les schemas Zod sont definis a cote des formulaires qui les utilisent ou dans `src/types/` s'ils sont partages.

## Styling

### MUI

MUI est la bibliotheque de composants de l'application.

Responsabilites :
- fournir les composants UI de base
- garantir un design coherent sans effort de design custom
- fournir le systeme de theming

En V1, les composants MUI sont utilises tels quels. Le theme est personnalise uniquement au niveau des couleurs `primary` et `secondary` dans `src/theme/theme.ts`.

Le `ThemeProvider` est place dans `App.tsx` ou `main.tsx`.

## Accessibilite

### Approche minimale en V1

L'accessibilite repose sur les principes suivants :
- utilisation du HTML semantique correct
- labels associes a tous les champs de formulaire
- contraste de couleurs suffisant via le theme MUI
- utilisation des composants MUI qui integrent les attributs d'accessibilite de base

MUI fournit nativement un bon niveau d'accessibilite sur ses composants. Le projet s'appuie sur cette base sans ajout supplementaire en V1.

## Tests

### Vitest + Testing Library

Vitest est utilise comme framework de tests, avec Testing Library pour les tests de composants React.

Principes retenus :
- les tests sont co-localises avec les fichiers testes
- un fichier `GameList.tsx` a son test dans `GameList.test.tsx` dans le meme dossier
- les tests de composants sont orientes comportement utilisateur
- les fonctions utilitaires pures sont testees unitairement

## Application a la V1

Pour la V1, les fichiers les plus probables sont :

### pages

- `GameListPage.tsx`
- `PlayerListPage.tsx`
- `NewSessionPage.tsx`

### components

- `GameList.tsx`
- `GameForm.tsx`
- `PlayerList.tsx`
- `PlayerForm.tsx`
- `SessionForm.tsx`
- `SessionRecap.tsx`
- `ConfirmDialog.tsx`

### services

- `gameApi.ts`
- `playerApi.ts`
- `gameSessionApi.ts`
- `axiosBaseQuery.ts`

### store

- `store.ts`

### types

- `game.ts`
- `player.ts`
- `gameSession.ts`

### hooks

A definir selon les besoins concrets.

### utils

- `dateFormat.ts`
- `rankingUtils.ts`

### theme

- `theme.ts`

### router

- `router.tsx`

## Choix volontaires pour la V1

- pas de decoupage par feature
- pas de dark mode
- pas de personnalisation avancee du theme MUI
- pas de state client global complexe
- pas d'internationalisation
- pas de tests end-to-end
- accessibilite limitee au HTML semantique et aux bases MUI

Ces choix servent a garder un frontend simple et fonctionnel.

## Evolutions probables

Si le projet grossit, les evolutions naturelles pourront etre :

- reorganiser le projet par feature si la base de code grossit fortement
- personnaliser le theme MUI de facon plus poussee
- ajouter un dark mode
- introduire des tests end-to-end avec Playwright ou Cypress
- ajouter l'internationalisation
- renforcer l'accessibilite avec des audits WCAG
- ajouter un module de statistiques cote frontend
