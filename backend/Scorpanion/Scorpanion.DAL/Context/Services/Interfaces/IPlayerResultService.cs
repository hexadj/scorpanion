using Scorpanion.DAL.ExchangeModels;

namespace Scorpanion.DAL.Context.Services.Interfaces;

public interface IPlayerResultService
{
    IReadOnlyList<PlayerResultModel> GetPlayerResultsByUserId(Guid userId);
}
