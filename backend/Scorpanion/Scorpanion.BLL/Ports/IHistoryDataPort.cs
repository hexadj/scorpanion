using Scorpanion.Contracts.Models;

namespace Scorpanion.BLL.Ports;

public interface IHistoryDataPort
{
    IReadOnlyList<PlayerResultModel> GetPlayerResultsByUserId(Guid userId);
}
