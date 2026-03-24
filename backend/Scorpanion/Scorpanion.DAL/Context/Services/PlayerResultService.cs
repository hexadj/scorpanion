using Scorpanion.Contracts.Models;
using Scorpanion.DAL.Context.Services.Interfaces;

namespace Scorpanion.DAL.Context.Services;

public class PlayerResultService(ScorpanionDbContext context) : IPlayerResultService
{
    public IReadOnlyList<PlayerResultModel> GetPlayerResultsByUserId(Guid userId)
    {
        return context.PlayerResults
            .Where(pr => pr.Player.User != null && pr.Player.User.Id == userId)
            .OrderByDescending(pr => pr.CreatedAt)
            .Select(pr => new PlayerResultModel
            {
                Id = pr.Id,
                GameResultId = pr.GameResult.Id,
                PlayerId = pr.Player.Id,
                GameName = pr.GameResult.Game.BoardGame.Name,
                FinalScore = pr.FinalScore,
                HasWon = pr.HasWon,
                Rank = pr.Rank,
                PlayedAt = pr.GameResult.CreatedAt,
            })
            .ToList();
    }
}
