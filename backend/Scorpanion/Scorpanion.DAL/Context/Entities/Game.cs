using System.ComponentModel.DataAnnotations.Schema;

namespace Scorpanion.DAL.Context.Entities;

[Table("games")]
public class Game : BaseEntity
{
    public required BoardGame BoardGame { get; set; }
    public required ICollection<Player> Players { get; set; }
}