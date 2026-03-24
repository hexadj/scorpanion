using Scorpanion.Contracts.Models;

namespace Scorpanion.BLL.Ports;

public interface IGameDataPort
{
    Guid CreateGame(GameModel game);

    GameModel GetGame(Guid id);

    GameModel UpdateRound(RoundModel round);

    void SaveGameResult(GameResultModel gameResult);
}
