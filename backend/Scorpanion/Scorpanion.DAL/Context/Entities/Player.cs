using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Scorpanion.DAL.Context.Entities;

[Table("players")]
public class Player : BaseEntity
{
    [MaxLength(50)]
    public string? GuestName { get; set; }
    
    public User? User { get; set; } 
    
    public required Game Game { get; set; }
}