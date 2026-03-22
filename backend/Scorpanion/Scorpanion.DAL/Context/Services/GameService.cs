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
        var game = GamesWithDetails()
            .FirstOrDefault(g => g.Id == id);
        if (game is null)
            throw new KeyNotFoundException("Game not found");

        return MapToModel(game);
    }

    public IReadOnlyList<GameModel> GetGamesForUser(Guid userId)
    {
        return GamesWithDetails()
            .Where(g => g.Players.Any(p => p.User != null && p.User.Id == userId))
            .OrderByDescending(g => g.CreatedAt)
            .ToList()
            .Select(MapToModel)
            .ToList();
    }

    private IQueryable<Game> GamesWithDetails() =>
        context.Games
            .Include(g => g.BoardGame)
            .Include(g => g.Scoreboard)
            .Include(g => g.Players).ThenInclude(p => p.User)
            .Include(g => g.Rounds).ThenInclude(r => r.Player);

    private static GameModel MapToModel(Game game) =>
        new()
        {
            Id = game.Id,
            BoardGameId = game.BoardGame.Id,
            BoardGameName = game.BoardGame.Name,
            ScoreboardId = game.Scoreboard?.Id,
            BoardGameConfigId = game.BoardGameConfigId ?? Guid.Empty,
            Players = game.Players.Select(player => new PlayerModel
                {
                    Id = player.Id, UserId = player.User?.Id, PlayerName = player.User?.Username ?? player.GuestName
                })
                .ToList(),
            Rounds = game.Rounds.Select(r => new RoundModel
            {
                Id = r.Id,
                Number = r.Number,
                PlayerId = r.Player.Id,
                Score = r.Score
            }).ToList()
        };

    public void SaveGameResult(GameResultModel model)
    {
        var game = context.Games.FirstOrDefault(g => g.Id == model.GameId)
            ?? throw new KeyNotFoundException("Game not found");

        var playerIds = model.PlayerResults.Select(p => p.PlayerId).ToHashSet();
        var playersById = context.Players
            .Where(p => p.Game.Id == model.GameId && playerIds.Contains(p.Id))
            .ToDictionary(p => p.Id);

        if (playersById.Count != model.PlayerResults.Count)
        {
            throw new ArgumentException("One or more players are not part of this game.");
        }

        var gameResult = new GameResult
        {
            Id = model.Id,
            CreatedAt = DateTime.UtcNow,
            Game = game,
            PlayerResults = new List<PlayerResult>(),
        };

        foreach (var pr in model.PlayerResults)
        {
            gameResult.PlayerResults.Add(new PlayerResult
            {
                Id = pr.Id,
                CreatedAt = DateTime.UtcNow,
                GameResult = gameResult,
                Player = playersById[pr.PlayerId],
                FinalScore = pr.FinalScore,
                HasWon = pr.HasWon,
                Rank = pr.Rank,
            });
        }

        context.GameResults.Add(gameResult);
        context.SaveChanges();
    }
}