using Scorpanion.DAL.Context.Entities;
using Scorpanion.DAL.Context.Services.Interfaces;
using Scorpanion.DAL.ExchangeModels;

namespace Scorpanion.DAL.Context.Services;

public class PlayerService(ScorpanionDbContext context, IUserService userService) : IPlayerService
{
    /// <summary>
    /// Création des entités de joueur pour uen partie
    /// </summary>
    /// <param name="players"></param>
    /// <exception cref="NotImplementedException"></exception>
    public void CreatePlayers(Guid gameId, ICollection<PlayerModel> players)
    {
        // Récupération de l'entité de jeu
        var game = context.Games.FirstOrDefault(x => x.Id == gameId);
        if (game is null)
            throw new KeyNotFoundException("Game not found");
        
        List<Player> playerEntities = new List<Player>();
        
        foreach (var player in players)
        {
            var user = context.Users.FirstOrDefault(user => user.Id == player.UserId);
            string playerName = user?.Username ?? player.PlayerName ?? string.Empty;
            
            if (string.IsNullOrWhiteSpace(playerName))
                throw new ArgumentException("Player name is empty, and no user has been provided");
            
            playerEntities.Add(new Player
            {
                Id = Guid.NewGuid(),
                CreatedAt = DateTime.UtcNow,
                GuestName = user is null ? playerName : null,
                User = user,
                Game = game
            });
        }

        context.AddRange(playerEntities);
        context.SaveChanges();
    }

    public ICollection<Player> GetGamePlayers(Guid gameId)
    {
        throw new NotImplementedException();
    }
}