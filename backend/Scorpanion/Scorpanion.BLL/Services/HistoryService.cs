using Scorpanion.Contracts.Models;
using Scorpanion.BLL.Ports;
using Scorpanion.BLL.Services.Interfaces;

namespace Scorpanion.BLL.Services;

public class HistoryService(IUserDataPort userDataPort, IHistoryDataPort historyDataPort) : IHistoryService
{
    public IReadOnlyList<PlayerResultModel>? GetHistory(Guid userId)
    {
        if (!userDataPort.UserExists(userId))
        {
            return null;
        }

        return historyDataPort.GetPlayerResultsByUserId(userId);
    }
}
