using Microsoft.EntityFrameworkCore;
using Scorpanion.DAL.Context.Entities;
using Scorpanion.DAL.Context.Services.Interfaces;
using Scorpanion.DAL.ExchangeModels;

namespace Scorpanion.DAL.Context.Services;

public class BoardGameService(ScorpanionDbContext context) : IBoardGameService
{
    #region Commands

    public Guid CreateBoardGame(BoardGameModel boardGame)
    {
        // Vérification avant insertion
        if (string.IsNullOrWhiteSpace(boardGame.Name))
            throw new ArgumentNullException(nameof(boardGame.Name));
        if (boardGame.Name.Length > 100)
            throw new ArgumentOutOfRangeException(nameof(boardGame.Name));
        
        var entity = context.BoardGames.Add(new BoardGame
        {
            Name = boardGame.Name,
            CreatedAt = DateTime.UtcNow,
            Id = Guid.Empty,
        }).Entity;
        
        context.SaveChanges();
        
        return entity.Id;
    }
    #endregion
    
    #region Queries

    /// <summary>
    /// Récupération de la liste complète des jeux existants
    /// </summary>
    /// <returns></returns>
    public ICollection<BoardGameModel> GetAllBoardGames()
    {
        return context.BoardGames.Select(bg => new BoardGameModel()
        {
            Id = bg.Id,
            Name = bg.Name
        }).ToList();
    }
    
    #endregion
}