namespace Scorpanion.DAL.Models;

public class RoundScoreModel
{
    public required Guid PlayerId { get; set; }
    public required int Score { get; set; }
}