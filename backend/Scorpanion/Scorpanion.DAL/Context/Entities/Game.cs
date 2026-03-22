using System.ComponentModel.DataAnnotations.Schema;

namespace Scorpanion.DAL.Context.Entities;

[Table("games")]
public class Game : BaseEntity
{
    public required BoardGame BoardGame { get; set; }
    public Scoreboard? Scoreboard { get; set; }
    public ICollection<Player> Players { get; init; } = new List<Player>();
    public ICollection<Round> Rounds { get; init; } = new List<Round>();
}