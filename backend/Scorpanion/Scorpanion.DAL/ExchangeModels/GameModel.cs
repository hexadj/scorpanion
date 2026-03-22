namespace Scorpanion.DAL.ExchangeModels;

public class GameModel : ExchangeModel
{
    public Guid BoardGameId { get; set; }
    public string? BoardGameName { get; set; }
    public Guid? ScoreboardId { get; set; }
    public required ICollection<PlayerModel> Players { get; set; }
    //public ICollection<RoundModel> Rounds { get; set; }>
}