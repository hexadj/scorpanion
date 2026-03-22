namespace Scorpanion.DAL.ExchangeModels;

public class RoundModel : ExchangeModel
{
    public int Number { get; set; }

    public Guid PlayerId { get; set; }

    public int Score { get; set; }
}
