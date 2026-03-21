using System.ComponentModel.DataAnnotations.Schema;

namespace scorpanion_backend.Context.Entities;

[Table("game_results")]
public class GameResult :BaseEntity
{
    public required Game Game { get; set; }
}