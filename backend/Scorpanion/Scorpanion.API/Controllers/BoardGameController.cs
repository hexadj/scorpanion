using Microsoft.AspNetCore.Mvc;
using Scorpanion.DAL.Context.Services.Interfaces;
using Scorpanion.DAL.ExchangeModels;

namespace Scorpanion.API.Controllers;

[ApiController]
[Route("boardGame/")]
public class BoardGameController(IBoardGameService boardGameService) : Controller
{
    // POST
    [HttpPost("create/")]
    public IActionResult Create(BoardGameModel model)
    {
        var createdId = boardGameService.CreateBoardGame(model);
        return Created($"boardGame/{createdId}", createdId);
    }
}