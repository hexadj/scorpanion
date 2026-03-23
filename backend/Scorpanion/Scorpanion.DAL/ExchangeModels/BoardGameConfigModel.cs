using Scorpanion.DAL.Context.Entities;

namespace Scorpanion.DAL.ExchangeModels;

public class BoardGameConfigModel : ExchangeModel
{
    public string? Name { get; set; }

    public int? PlayerCount { get; set; }

    public int? RoundCount { get; set; }

    public WinType WinType { get; set; }

    public bool IsTemporary { get; set; }

    public Guid BoardGameId { get; set; }
}
