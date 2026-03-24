using Scorpanion.BLL.Managers.Interfaces;
using Scorpanion.Contracts.Models;
using Scorpanion.Contracts.Ports;

namespace Scorpanion.BLL.Managers;

public class HistoryManager(IUserDataPort userDataPort, IHistoryDataPort historyDataPort) : IHistoryManager
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
