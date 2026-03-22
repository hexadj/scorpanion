using Microsoft.EntityFrameworkCore;
using Scorpanion.DAL.Context.Entities;
using Scorpanion.DAL.Context.Services.Interfaces;
using Scorpanion.DAL.ExchangeModels;

namespace Scorpanion.DAL.Context.Services;

public class GameService(IPlayerService playerService, ScorpanionDbContext context) : IGameService
{
    public Guid StartGame(GameModel game)
    {
        // Vérifier l'existence du boardgame
        var boardGame = context.BoardGames.FirstOrDefault(bg => bg.Id == game.BoardGameId);
        if (boardGame is null)
            throw new KeyNotFoundException("Board game not found");
        // Récupération du scoreboard
        var scoreboard = context.Scoreboards.FirstOrDefault(sb => sb.Id == game.ScoreboardId);

        // Créer l'entité de partie avant de générer la collection de joueurs
        var gameEntity = context.Games.Add(new Game
        {
            Id = Guid.Empty,
            CreatedAt = DateTime.UtcNow,
            BoardGame = boardGame,
            Scoreboard = scoreboard
        }).Entity;
        
        context.SaveChanges();
        
         // Création des entités de joueur
         playerService.CreatePlayers(gameEntity.Id ,game.Players);
         
         return gameEntity.Id;
    }
}