using Scorpanion.BLL.Models;

namespace Scorpanion.BLL.Ports;

public interface IBoardGameDataPort
{
    Guid CreateBoardGame(BoardGameModel model);

    ICollection<BoardGameModel> GetAllBoardGames();
}
