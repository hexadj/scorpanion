using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Scorpanion.DAL.Context.Entities;

[Table("boardgames")]
public class BoardGame : BaseEntity
{
    [MaxLength(100)]
    public required string Name { get; set; }

    public ICollection<BoardGameConfig> BoardGameConfigs { get; set; } = [];
}