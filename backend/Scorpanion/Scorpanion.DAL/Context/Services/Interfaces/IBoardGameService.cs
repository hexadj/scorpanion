using Scorpanion.Contracts.Models;

namespace Scorpanion.DAL.Context.Services.Interfaces;

public interface IBoardGameService
{
    #region Commands

    Guid CreateBoardGame(BoardGameModel model);

        #endregion

    #region Queries

    ICollection<BoardGameModel> GetAllBoardGames();
    #endregion
}