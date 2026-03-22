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
    [HttpPost("start")]
    public IActionResult StartGame(GameModel model)
    {
        var gameId = service.StartGame(model);
        return Created("start/" + gameId.ToString(), gameId);
    }
}