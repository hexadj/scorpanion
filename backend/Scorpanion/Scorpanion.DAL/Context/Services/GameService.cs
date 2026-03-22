using Scorpanion.DAL.Context.Services.Interfaces;
using Scorpanion.DAL.ExchangeModels;

namespace Scorpanion.DAL.Context.Services;

public class GameService(IPlayerService playerService) : IGameService
{
    public void StartGame(GameModel game)
    {
        // Créer l'entité de partie avant de générer la collection de joueurs
        
       
        // // Création des entités de joueur
        // playerService.CreatePlayers(game.GameId ,game.Players);
        //
        
        throw new NotImplementedException();
    }
}