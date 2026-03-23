using Scorpanion.DAL.Context.Services.Interfaces;
using Scorpanion.DAL.ExchangeModels;

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
                FinalScore = pr.FinalScore,
                HasWon = pr.HasWon,
                Rank = pr.Rank,
            })
            .ToList();
    }
}
