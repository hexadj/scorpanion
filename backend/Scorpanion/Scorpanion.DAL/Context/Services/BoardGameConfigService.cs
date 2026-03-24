using Scorpanion.Contracts.Models;
using Scorpanion.DAL.Context.Services.Interfaces;

namespace Scorpanion.DAL.Context.Services;

public class BoardGameConfigService(ScorpanionDbContext context) : IBoardGameConfigService
{
    #region Commands

    public void DeleteBoardGameConfig(Guid id)
    {
        var entity = context.BoardGameConfigs.FirstOrDefault(bgc => bgc.Id == id);
        if (entity is null)
            throw new KeyNotFoundException("Board game config not found");

        context.BoardGameConfigs.Remove(entity);
        context.SaveChanges();
    }

    #endregion

    #region Queries

    public BoardGameConfigModel? GetBoardGameConfig(Guid id)
    {
        return context.BoardGameConfigs
            .Where(bgc => bgc.Id == id)
            .Select(bgc => new BoardGameConfigModel
            {
                Id = bgc.Id,
                Name = bgc.Name,
                PlayerCount = bgc.PlayerCount,
                RoundCount = bgc.RoundCount,
                WinType = bgc.WinType,
                IsTemporary = bgc.IsTemporary,
                BoardGameId = bgc.BoardGame.Id,
            })
            .FirstOrDefault();
    }

    #endregion
}
