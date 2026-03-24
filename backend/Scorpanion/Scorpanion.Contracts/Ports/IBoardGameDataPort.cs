using Scorpanion.Contracts.Models;

namespace Scorpanion.Contracts.Ports;

public interface IBoardGameDataPort
{
    Guid CreateBoardGame(BoardGameModel model);

    ICollection<BoardGameModel> GetAllBoardGames();
}
