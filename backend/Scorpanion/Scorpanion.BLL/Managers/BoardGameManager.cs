using Scorpanion.BLL.Managers.Interfaces;
using Scorpanion.Contracts.Models;
using Scorpanion.Contracts.Ports;

namespace Scorpanion.BLL.Managers;

public class BoardGameManager(IBoardGameDataPort boardGameDataPort) : IBoardGameManager
{
    public Guid CreateBoardGame(BoardGameModel model) => boardGameDataPort.CreateBoardGame(model);

    public ICollection<BoardGameModel> GetAllBoardGames() => boardGameDataPort.GetAllBoardGames();
}
