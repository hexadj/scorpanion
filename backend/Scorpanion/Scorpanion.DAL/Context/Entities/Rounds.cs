using System.ComponentModel.DataAnnotations.Schema;

namespace Scorpanion.DAL.Context.Entities;

[Table("rounds")]
public class Round : BaseEntity
{
    public int Number { get; set; }
    public required Player Player { get; set; }
    public required int Score { get; set; }
}