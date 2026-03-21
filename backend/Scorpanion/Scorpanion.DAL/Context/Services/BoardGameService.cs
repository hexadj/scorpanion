using Microsoft.EntityFrameworkCore;
using Scorpanion.DAL.Context.Entities;
using Scorpanion.DAL.Context.Services.Interfaces;
using Scorpanion.DAL.ExchangeModels;

namespace Scorpanion.DAL.Context.Services;

public class BoardGameService : IBoardGameService
{
    private readonly ScorpanionDbContext _context;
    public BoardGameService(ScorpanionDbContext context)
    {
        _context = context;
    }
    
    
    #region Commands

    public Guid CreateBoardGame(BoardGameModel boardGame)
    {
        // Vérification avant insertion
        if (string.IsNullOrWhiteSpace(boardGame.Name))
            throw new ArgumentNullException(nameof(boardGame.Name));
        if (boardGame.Name.Length > 100)
            throw new ArgumentOutOfRangeException(nameof(boardGame.Name));
        
        var entity = _context.BoardGames.Add(new BoardGame
        {
            Name = boardGame.Name,
            CreatedAt = DateTime.UtcNow,
            Id = Guid.Empty,
        }).Entity;
        
        _context.SaveChanges();
        
        return entity.Id;
    }
    #endregion
    
    #region Queries
    //
    #endregion
}