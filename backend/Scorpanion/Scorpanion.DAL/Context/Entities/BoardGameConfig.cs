using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Scorpanion.DAL.Context.Entities;

[Table("board_game_configs")]
public class BoardGameConfig : BaseEntity
{
    [MaxLength(100)]
    public string? Name { get; set; }

    public int? PlayerCount { get; set; }

    public int? RoundCount { get; set; }

    public WinType WinType { get; set; }

    public bool IsTemporary { get; set; }

    public required BoardGame BoardGame { get; set; }
}
