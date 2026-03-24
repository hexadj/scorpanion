using Scorpanion.Contracts.Models;

namespace Scorpanion.BLL.Services.Interfaces;

public interface IBoardGameService
{
    Guid CreateBoardGame(BoardGameModel model);

    ICollection<BoardGameModel> GetAllBoardGames();
}
