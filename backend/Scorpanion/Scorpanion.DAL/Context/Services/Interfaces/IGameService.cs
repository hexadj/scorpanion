using Scorpanion.Contracts.Models;

namespace Scorpanion.DAL.Context.Services.Interfaces;

public interface IGameService
{
    Guid CreateGame(GameModel game);
    
    GameModel GetGame(Guid id);

    IReadOnlyList<GameModel> GetGamesForUser(Guid userId);

    void SaveGameResult(GameResultModel gameResult);

    GameModel UpdateRound(RoundModel round);
}