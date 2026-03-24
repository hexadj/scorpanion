using Microsoft.AspNetCore.Mvc;
using Scorpanion.BLL.Services.Interfaces;

namespace Scorpanion.API.Controllers;

[ApiController]
[Route("history")]
public class HistoryController(IHistoryService historyService) : Controller
{
    [HttpGet("user/{userId:guid}")]
    public IActionResult GetHistory(Guid userId)
    {
        var history = historyService.GetHistory(userId);
        if (history is null)
        {
            return NotFound();
        }

        return Ok(history);
    }
}
