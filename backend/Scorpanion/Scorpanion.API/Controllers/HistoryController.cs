using Microsoft.AspNetCore.Mvc;
using Scorpanion.DAL.Context.Services.Interfaces;

namespace Scorpanion.API.Controllers;

[ApiController]
[Route("history")]
public class HistoryController(IUserService userService, IPlayerResultService playerResultService) : Controller
{
    [HttpGet("user/{userId:guid}")]
    public IActionResult GetHistory(Guid userId)
    {
        if (!userService.UserExists(userId))
            return NotFound();

        return Ok(playerResultService.GetPlayerResultsByUserId(userId));
    }
}
