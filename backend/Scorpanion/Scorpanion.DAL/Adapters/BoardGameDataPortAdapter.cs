using Scorpanion.BLL.Ports;
using Scorpanion.Contracts.Models;
using Scorpanion.DAL.Context.Services.Interfaces;

namespace Scorpanion.DAL.Adapters;

public class BoardGameDataPortAdapter(IBoardGameService boardGameService) : IBoardGameDataPort
{
    public Guid CreateBoardGame(BoardGameModel model) => boardGameService.CreateBoardGame(model);

    public ICollection<BoardGameModel> GetAllBoardGames() => boardGameService.GetAllBoardGames();
}
