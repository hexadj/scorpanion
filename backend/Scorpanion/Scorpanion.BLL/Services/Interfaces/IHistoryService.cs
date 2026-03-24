using Scorpanion.Contracts.Models;

namespace Scorpanion.BLL.Services.Interfaces;

public interface IHistoryService
{
    IReadOnlyList<PlayerResultModel>? GetHistory(Guid userId);
}
