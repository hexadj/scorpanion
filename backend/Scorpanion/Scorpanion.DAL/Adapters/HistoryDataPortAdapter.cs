using Scorpanion.BLL.Ports;
using Scorpanion.Contracts.Models;
using Scorpanion.DAL.Context.Services.Interfaces;

namespace Scorpanion.DAL.Adapters;

public class HistoryDataPortAdapter(IPlayerResultService playerResultService) : IHistoryDataPort
{
    public IReadOnlyList<PlayerResultModel> GetPlayerResultsByUserId(Guid userId) =>
        playerResultService.GetPlayerResultsByUserId(userId);
}
