using Scorpanion.DAL.ExchangeModels;

namespace Scorpanion.DAL.Context.Services.Interfaces;

public interface IGameService
{
    Guid StartGame(GameModel game);

    void SaveGameResult(GameResultModel gameResult);
}