using Scorpanion.DAL.Context.Entities;
using Scorpanion.DAL.Context.Services.Interfaces;
using Scorpanion.DAL.ExchangeModels;

namespace Scorpanion.API.Logic;

public class GameLogic(IBoardGameConfigService boardGameConfigService, IGameService gameService)
{
    public GameResultModel EndGame(RoundModel finalRound)
    {
        var game = gameService.GetGame(finalRound.GameId);

        // TODO: Implement game config
        var gameConfig = new BoardGameConfigModel
        {
            Id = game.BoardGameConfigId,
            WinType = WinType.HIGHER_SCORE,
            IsTemporary = true,
        };

        var gameResultId = Guid.NewGuid();

        if (game.Players.Count == 0)
        {
            return new GameResultModel
            {
                Id = gameResultId,
                GameId = game.Id,
                PlayerResults = [],
            };
        }

        var scoreByPlayer = game.Rounds.SelectMany(r => r.PlayersScores)
            .Concat(finalRound.PlayersScores)
            .GroupBy(r => r.PlayerId)
            .ToDictionary(g => g.Key, g => g.Sum(r => r.Score));

        var rows = game.Players
            .Select(p => (PlayerId: p.Id, FinalScore: scoreByPlayer.GetValueOrDefault(p.Id, 0)))
            .ToList();

        var ordered = gameConfig.WinType == WinType.HIGHER_SCORE
            ? rows.OrderByDescending(x => x.FinalScore).ThenBy(x => x.PlayerId).ToList()
            : rows.OrderBy(x => x.FinalScore).ThenBy(x => x.PlayerId).ToList();

        var winningScore = gameConfig.WinType == WinType.HIGHER_SCORE
            ? rows.Max(x => x.FinalScore)
            : rows.Min(x => x.FinalScore);

        var results = new List<PlayerResultModel>(ordered.Count);
        var rank = 1;
        for (var i = 0; i < ordered.Count; i++)
        {
            if (i > 0 && ordered[i].FinalScore != ordered[i - 1].FinalScore)
            {
                rank = i + 1;
            }

            results.Add(new PlayerResultModel
            {
                Id = Guid.NewGuid(),
                GameResultId = gameResultId,
                PlayerId = ordered[i].PlayerId,
                FinalScore = ordered[i].FinalScore,
                HasWon = ordered[i].FinalScore == winningScore,
                Rank = rank,
            });
        }

        return new GameResultModel
        {
            Id = gameResultId,
            GameId = game.Id,
            PlayerResults = results,
        };
    }
}