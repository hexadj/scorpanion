using Scorpanion.BLL.Models;

namespace Scorpanion.BLL.Services.Interfaces;

public interface IGameService
{
    Guid CreateGame(GameModel game);

    GameModel UpdateRound(RoundModel round);

    GameResultModel EndGame(RoundModel finalRound);

    GameModel GetGame(Guid gameId);
}
