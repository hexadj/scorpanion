using Scorpanion.DAL.ExchangeModels;

namespace Scorpanion.DAL.Context.Services.Interfaces;

public interface IGameService
{
    void StartGame(GameModel game);
}