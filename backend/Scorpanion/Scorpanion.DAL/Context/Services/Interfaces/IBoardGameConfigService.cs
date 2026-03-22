using Scorpanion.DAL.ExchangeModels;

namespace Scorpanion.DAL.Context.Services.Interfaces;

public interface IBoardGameConfigService
{
    #region Commands

    void DeleteBoardGameConfig(Guid id);

    #endregion

    #region Queries

    BoardGameConfigModel? GetBoardGameConfig(Guid id);

    #endregion
}
