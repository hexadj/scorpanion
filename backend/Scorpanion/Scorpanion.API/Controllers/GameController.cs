using Microsoft.AspNetCore.Mvc;
using Scorpanion.Contracts.Models;
using Scorpanion.BLL.Services.Interfaces;

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
    public IActionResult UpdateRound(RoundModel round)
    {
        var updatedGame = service.UpdateRound(round);
        return Ok(updatedGame);
    }

    [HttpPost("end")]
    public IActionResult EndGame(RoundModel finalRound)
    {
        var result = service.EndGame(finalRound);
        return Ok(result);
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