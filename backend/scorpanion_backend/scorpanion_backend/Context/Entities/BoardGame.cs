using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace scorpanion_backend.Context.Entities;

[Table("boardgames")]
public class BoardGame : BaseEntity
{
    [MaxLength(100)]
    public required string Name { get; set; } 
}