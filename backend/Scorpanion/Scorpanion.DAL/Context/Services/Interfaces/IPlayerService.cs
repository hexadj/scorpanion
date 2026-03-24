using Scorpanion.DAL.Context.Entities;
using Scorpanion.Contracts.Models;

namespace Scorpanion.DAL.Context.Services.Interfaces;

public interface IPlayerService
{
    void CreatePlayers(Guid gameId, ICollection<PlayerModel> players);
    ICollection<Player> GetGamePlayers(Guid gameId);
}