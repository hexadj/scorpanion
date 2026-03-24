using Scorpanion.BLL.Ports;
using Scorpanion.Contracts.Models;
using Scorpanion.DAL.Context.Services.Interfaces;

namespace Scorpanion.DAL.Adapters;

public class GameDataPortAdapter(IGameService gameService) : IGameDataPort
{
    public Guid CreateGame(GameModel game) => gameService.CreateGame(game);

    public GameModel GetGame(Guid id) => gameService.GetGame(id);

    public GameModel UpdateRound(RoundModel round) => gameService.UpdateRound(round);

    public void SaveGameResult(GameResultModel gameResult) => gameService.SaveGameResult(gameResult);
}
