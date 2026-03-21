using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace scorpanion_backend.Context.Entities;

[Table("players")]
public class Player : BaseEntity
{
    [MaxLength(50)]
    public string? GuestName { get; set; }
    
    public required BoardGame BoardGame { get; set; }
    
    public User? User { get; set; } 
}