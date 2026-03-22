## Déroulement d'une partie

### Création d'une partie

L'utilisateur connecté choisit un jeu qu'il veut démarrer.
Il configure ensuite les paramètres de sa partie : nombre de joueurs, nombre de manches, scoreboard, pseudos des joueurs, etc ...
Les joueurs peuvent être des joueurs existants ou anonyme.
Ces données sont envoyées au serveur qui renvoie une **Game**.

### Progression d'une partie

L'utilisateur valide chaque fin de manche et saisie les scores de chaque joueur via l'application.
L'utilisateur peut modifier le score d'une manche déjà finie.
A chaque **Round** envoyé au serveur, il renvoit l'état de la **Game** en entier.

#### Format des données d'une **Game**

Ces données sont sérialisées et échangées au format **JSON**.

##### Exemple
```jsonc
{
  // Liste des joueurs
  "players": [
    {
      // UUID du joueur enregistré ; null pour un invité
      "id": "550e8400-e29b-41d4-a716-446655440000",
      // Pseudo affiché (joueur ou invité)
      "name": "PseudoJoueur"
    },
    {
      "id": null,
      "name": "PseudoInvité"
    }
  ],
  // Nombre maximum de manches ; null s'il n'y a pas de limite
  "roundsLimit": 10,
  // Manche en cours (ex. 0 au début)
  "currentRound": 2,
  // Historique : une entrée par manche jouée ; chaque manche liste le nom et le score de chaque joueur pour cette manche
  "roundHistory": [
    [
      { "name": "PseudoJoueur", "score": 12 },
      { "name": "PseudoInvité", "score": 8 }
    ],
    [
      { "name": "PseudoJoueur", "score": 5 },
      { "name": "PseudoInvité", "score": 10 }
    ]
  ]
}
```

### Fin d'un partie

L'utilisateur peut-être fin à la partie via l'application. Les scores sont figés.
Le serveur revoie un **GameResult**.
