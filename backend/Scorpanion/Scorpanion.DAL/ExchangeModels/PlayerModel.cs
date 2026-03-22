namespace Scorpanion.DAL.ExchangeModels;

public class PlayerModel : ExchangeModel
{
    public Guid? PlayerId { get; set; }
    public string? PlayerName { get; set; }
    public Guid? UserId { get; set; }
    public Guid? GameId { get; set; }
    public Guid BoardGameId { get; set; }
}