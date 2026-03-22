using Microsoft.EntityFrameworkCore;
using Scorpanion.DAL.Context.Entities;
using Scorpanion.DAL.Context.Services.Interfaces;
using Scorpanion.DAL.ExchangeModels;

namespace Scorpanion.DAL.Context.Services;

public class GameService(IPlayerService playerService, ScorpanionDbContext context) : IGameService
{
    public Guid CreateGame(GameModel game)
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

    public GameModel GetGame(Guid id)
    {
        var game = context.Games.Include(g => g.BoardGame)
            .Include(g => g.Scoreboard)
            .Include(g => g.Players).ThenInclude(p => p.User)
            .Include(g => g.Rounds)
            .FirstOrDefault(g => g.Id == id);
        if (game is null)
            throw new KeyNotFoundException("Game not found");

        return new GameModel
        {
            Id = game.Id,
            BoardGameId = game.BoardGame.Id,
            BoardGameName = game.BoardGame.Name,
            ScoreboardId = game.Scoreboard?.Id,
            Players = game.Players.Select(player => new PlayerModel
                {
                    Id = player.Id, UserId = player.User?.Id
                })
                .ToList(),
            //Round = 
        };
    }
}