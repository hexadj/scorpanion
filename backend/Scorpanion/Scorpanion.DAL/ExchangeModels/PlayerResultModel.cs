namespace Scorpanion.DAL.ExchangeModels;

public class PlayerResultModel : ExchangeModel
{
    public Guid GameResultId { get; set; }

    public Guid PlayerId { get; set; }

    public int FinalScore { get; set; }

    public bool HasWon { get; set; }

    public int Rank { get; set; }
}
