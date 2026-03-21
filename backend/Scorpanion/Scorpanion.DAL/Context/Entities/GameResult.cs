using System.ComponentModel.DataAnnotations.Schema;

namespace Scorpanion.DAL.Context.Entities;

[Table("game_results")]
public class GameResult :BaseEntity
{
    public required Game Game { get; set; }
}