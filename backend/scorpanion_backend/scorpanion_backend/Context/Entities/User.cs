using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace scorpanion_backend.Context.Entities;

[Table("users")]
public class User : BaseEntity
{
    [MaxLength(50)]
    public required string Username { get; set; }
    
    [MaxLength(50)]
    public required string Password { get; set; }
    
}