using Scorpanion.BLL.Managers;
using Scorpanion.Contracts.Models;
using Scorpanion.Contracts.Ports;
using Scorpanion.BLL.Services.Interfaces;

namespace Scorpanion.BLL.Services;

public class GameService(IGameDataPort gameDataPort, GameManager gameManager) : IGameService
{
    public Guid CreateGame(GameModel game) => gameDataPort.CreateGame(game);

    public GameModel UpdateRound(RoundModel round) => gameDataPort.UpdateRound(round);

    public GameResultModel EndGame(RoundModel finalRound)
    {
        var gameResult = gameManager.EndGame(finalRound);
        gameDataPort.SaveGameResult(gameResult);
        return gameResult;
    }

    public GameModel GetGame(Guid gameId) => gameDataPort.GetGame(gameId);
}
