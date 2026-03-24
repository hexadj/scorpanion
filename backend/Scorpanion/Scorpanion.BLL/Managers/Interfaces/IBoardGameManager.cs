using Scorpanion.Contracts.Models;

namespace Scorpanion.BLL.Managers.Interfaces;

public interface IBoardGameManager
{
    Guid CreateBoardGame(BoardGameModel model);

    ICollection<BoardGameModel> GetAllBoardGames();
}
