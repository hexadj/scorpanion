using System.ComponentModel.DataAnnotations.Schema;

namespace Scorpanion.DAL.Context.Entities;

[Table("player_results")]
public class PlayerResult : BaseEntity
{
    public required GameResult GameResult { get; set; }
    public required Player Player { get; set; }
    public required int FinalScore { get; set; }
    public bool HasWon { get; set; }
    public int Rank { get; set; }
}
