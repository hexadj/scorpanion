namespace Scorpanion.DAL.ExchangeModels;

public class GameModel : ExchangeModel
{
    public Guid BoardGameId { get; set; }
    public Guid? GameId {get; set;}
    public required ICollection<PlayerModel> Players { get; set; }
}