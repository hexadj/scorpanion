using Scorpanion.Contracts.Models;

namespace Scorpanion.BLL.Managers.Interfaces;

public interface IGameManager
{
    Guid CreateGame(GameModel game);

    GameModel UpdateRound(RoundModel round);

    GameResultModel EndGame(RoundModel finalRound);

    GameModel GetGame(Guid gameId);
}
