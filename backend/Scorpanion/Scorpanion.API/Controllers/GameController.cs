using Microsoft.AspNetCore.Mvc;
using Scorpanion.DAL.Context.Services.Interfaces;
using Scorpanion.DAL.ExchangeModels;

namespace Scorpanion.API.Controllers;

[ApiController]
[Route("game/")]
public class GameController(IGameService service) : Controller
{
    // POST
    /// <summary>
    /// Commencer une nouvelle partie
    /// </summary>
    /// <returns></returns>
    [HttpPost("create")]
    public IActionResult CreateGame(GameModel model)
    {
        var gameId = service.CreateGame(model);
        return Created("start/" + gameId.ToString(), gameId);
    }

    [HttpPost("update")]
    public IActionResult UpdateGame(Guid gameId, RoundModel round)
    {
        var updatedGame = service.UpdateGame(gameId, round);
        return Ok(updatedGame);
    }
    
    // GET
    /// <summary>
    /// Récupérer une partie
    /// </summary>
    /// <returns></returns>
    [HttpGet("get")]
    public IActionResult GetGame(Guid gameId)
    {
        var game = service.GetGame(gameId);   
        return Ok(game);
    }
    
    
}