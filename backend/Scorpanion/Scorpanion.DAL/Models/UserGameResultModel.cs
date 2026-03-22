namespace Scorpanion.DAL.Models;

public class UserGameResultModel
{
    public required bool HasWon { get; set; }
    public required Guid GameId { get; set; }
    public required string BoardGameName { get; set; }
}
