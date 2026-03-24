using Scorpanion.Contracts.Models;
using Scorpanion.BLL.Ports;

namespace Scorpanion.BLL.Managers;

public class GameManager(IGameDataPort gameDataPort)
{
    public GameResultModel EndGame(RoundModel finalRound)
    {
        var game = gameDataPort.GetGame(finalRound.GameId);
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
            .GroupBy(score => score.PlayerId)
            .ToDictionary(group => group.Key, group => group.Sum(score => score.Score));

        var rows = game.Players
            .Select(player => (PlayerId: player.Id, FinalScore: scoreByPlayer.GetValueOrDefault(player.Id, 0)))
            .ToList();

        var ordered = rows
            .OrderByDescending(row => row.FinalScore)
            .ThenBy(row => row.PlayerId)
            .ToList();

        var winningScore = rows.Max(row => row.FinalScore);
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
                GameName = game.BoardGameName ?? string.Empty,
                FinalScore = ordered[i].FinalScore,
                HasWon = ordered[i].FinalScore == winningScore,
                Rank = rank,
                PlayedAt = DateTime.UtcNow,
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
