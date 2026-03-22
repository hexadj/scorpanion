using Scorpanion.DAL.ExchangeModels;

namespace Scorpanion.DAL.Context.Services.Interfaces;

public interface IGameService
{
    Guid CreateGame(GameModel game);
    
    GameModel GetGame(Guid id);

    void SaveGameResult(GameResultModel gameResult);
}