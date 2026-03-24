using Scorpanion.BLL.Models;
using Scorpanion.BLL.Ports;
using Scorpanion.BLL.Services.Interfaces;

namespace Scorpanion.BLL.Services;

public class BoardGameService(IBoardGameDataPort boardGameDataPort) : IBoardGameService
{
    public Guid CreateBoardGame(BoardGameModel model) => boardGameDataPort.CreateBoardGame(model);

    public ICollection<BoardGameModel> GetAllBoardGames() => boardGameDataPort.GetAllBoardGames();
}
