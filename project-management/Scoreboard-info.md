### Format des données d'un scoreboard

Ces données sont sérialisées et échangées au format **JSON** (corps de requête/réponse, messages temps réel, etc.).

#### Exemple
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
