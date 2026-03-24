namespace Scorpanion.Contracts.Models;

public class RoundModel
{
    public Guid GameId { get; set; }

    public int Number { get; set; }

    public ICollection<RoundScoreModel> PlayersScores { get; set; } = new List<RoundScoreModel>();
}
