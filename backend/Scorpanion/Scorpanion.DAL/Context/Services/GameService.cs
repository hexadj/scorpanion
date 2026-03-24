using Microsoft.EntityFrameworkCore;
using Scorpanion.Contracts.Models;
using Scorpanion.DAL.Context.Entities;
using Scorpanion.DAL.Context.Services.Interfaces;

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
        playerService.CreatePlayers(gameEntity.Id, game.Players);

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
            Rounds = game.Rounds
                .GroupBy(r => r.Number)
                .OrderBy(group => group.Key)
                .Select(group => new RoundModel
                {
                    GameId = game.Id,
                    Number = group.First().Number,
                    PlayersScores = group.Select(score => new RoundScoreModel
                    {
                        PlayerId = score.Player.Id,
                        Score = score.Score
                    }).ToList()
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

    public GameModel UpdateRound(RoundModel round)
    {
        // Récupération de la game
        var game = context.Games.FirstOrDefault(g => g.Id == round.GameId);
        if (game is null)
            throw new KeyNotFoundException("Game not found");

        // Vérification de l'existence du round (pour voir si création ou modification)
        var roundScores = context.Rounds.Include(r => r.Game)
            .Include(r => r.Player)
            .Where(r => r.Game.Id == round.GameId && r.Number == round.Number).ToList();
        // Modification
        if (roundScores.Any())
        {
            foreach (var score in roundScores)
            {
                score.Score = round.PlayersScores.First(s => s.PlayerId == score.Player.Id).Score;
                score.UpdatedAt = DateTime.UtcNow;
            }
        }
        // Création
        else
        {
            foreach (var score in round.PlayersScores)
            {
                // Recherche du joueur correspondant
                var player = context.Players.FirstOrDefault(p => p.Id == score.PlayerId);
                if (player is null)
                    throw new KeyNotFoundException("Player not found");
                context.Rounds.Add(new Round()
                {
                    Id = Guid.NewGuid(),
                    Player = player,
                    Number = round.Number,
                    CreatedAt = DateTime.UtcNow,
                    Game = game,
                    Score = score.Score,
                });
            }
        }
            
        context.SaveChanges();
        return GetGame(round.GameId);
    }
}