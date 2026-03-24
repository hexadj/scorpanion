namespace Scorpanion.Contracts.Models;

public class GameResultModel : ExchangeModel
{
    public Guid GameId { get; set; }

    public required ICollection<PlayerResultModel> PlayerResults { get; set; }
}
