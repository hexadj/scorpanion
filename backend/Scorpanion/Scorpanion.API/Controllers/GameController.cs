using Microsoft.AspNetCore.Mvc;
using Scorpanion.DAL.ExchangeModels;

namespace Scorpanion.API.Controllers;

[ApiController]
[Route("game/")]
public class GameController : Controller
{
    // POST
    /// <summary>
    /// Commencer une nouvelle partie
    /// </summary>
    /// <returns></returns>
    [HttpPost("start")]
    public IActionResult StartGame(GameModel model)
    {
        
        return View();
    }
}