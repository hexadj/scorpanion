namespace Scorpanion.DAL.ExchangeModels;

public class GameResultModel : ExchangeModel
{
    public Guid GameId { get; set; }

    public required ICollection<PlayerResultModel> PlayerResults { get; set; }
}
