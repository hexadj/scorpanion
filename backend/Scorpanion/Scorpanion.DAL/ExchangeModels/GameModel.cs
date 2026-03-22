namespace Scorpanion.DAL.ExchangeModels;

public class GameModel : ExchangeModel
{
    public Guid BoardGameId { get; set; }
    public Guid ScoreboardId { get; set; }
    public required ICollection<PlayerModel> Players { get; set; }
}