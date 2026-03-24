using Microsoft.AspNetCore.Mvc;
using Scorpanion.Contracts.Models;
using Scorpanion.BLL.Managers.Interfaces;

namespace Scorpanion.API.Controllers;

[ApiController]
[Route("game/")]
public class GameController(IGameManager manager) : Controller
{
    // POST
    /// <summary>
    /// Commencer une nouvelle partie
    /// </summary>
    /// <returns></returns>
    [HttpPost("create")]
    public IActionResult CreateGame(GameModel model)
    {
        var gameId = manager.CreateGame(model);
        return Created("start/" + gameId.ToString(), gameId);
    }

    [HttpPost("update")]
    public IActionResult UpdateRound(RoundModel round)
    {
        var updatedGame = manager.UpdateRound(round);
        return Ok(updatedGame);
    }

    [HttpPost("end")]
    public IActionResult EndGame(RoundModel finalRound)
    {
        var result = manager.EndGame(finalRound);
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
        var game = manager.GetGame(gameId);   
        return Ok(game);
    }
    
    
}