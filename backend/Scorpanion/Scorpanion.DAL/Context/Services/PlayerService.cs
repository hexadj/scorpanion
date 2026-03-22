using Scorpanion.DAL.Context.Entities;
using Scorpanion.DAL.Context.Services.Interfaces;
using Scorpanion.DAL.ExchangeModels;

namespace Scorpanion.DAL.Context.Services;

internal class PlayerService(IUserService userService) : IPlayerService
{
    /// <summary>
    /// Création des entités de joueur pour uen partie
    /// </summary>
    /// <param name="players"></param>
    /// <exception cref="NotImplementedException"></exception>
    public void CreatePlayers(Guid gameId, ICollection<PlayerModel> players)
    {
        
        throw new NotImplementedException();
    }

    public ICollection<Player> GetGamePlayers(Guid gameId)
    {
        throw new NotImplementedException();
    }
}