using Microsoft.AspNetCore.Mvc;
using Scorpanion.BLL.Managers.Interfaces;

namespace Scorpanion.API.Controllers;

[ApiController]
[Route("history")]
public class HistoryController(IHistoryManager historyManager) : Controller
{
    [HttpGet("user/{userId:guid}")]
    public IActionResult GetHistory(Guid userId)
    {
        var history = historyManager.GetHistory(userId);
        if (history is null)
        {
            return NotFound();
        }

        return Ok(history);
    }
}
