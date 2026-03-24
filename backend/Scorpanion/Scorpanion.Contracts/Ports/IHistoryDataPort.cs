using Scorpanion.Contracts.Models;

namespace Scorpanion.Contracts.Ports;

public interface IHistoryDataPort
{
    IReadOnlyList<PlayerResultModel> GetPlayerResultsByUserId(Guid userId);
}
