using Scorpanion.Contracts.Models;

namespace Scorpanion.BLL.Managers.Interfaces;

public interface IHistoryManager
{
    IReadOnlyList<PlayerResultModel>? GetHistory(Guid userId);
}
