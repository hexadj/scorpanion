using Microsoft.AspNetCore.Mvc;
using Scorpanion.Contracts.Models;
using Scorpanion.BLL.Services.Interfaces;

namespace Scorpanion.API.Controllers;

[ApiController]
[Route("boardGame/")]
public class BoardGameController(IBoardGameService boardGameService) : Controller
{
    // GET
    [HttpGet("getAll")]
    public IActionResult GetAll()
    {
        var boardGames = boardGameService.GetAllBoardGames();
        return Ok(boardGames);
    }
    
    
    // POST
    [HttpPost("create/")]
    public IActionResult Create(BoardGameModel model)
    {
        var createdId = boardGameService.CreateBoardGame(model);
        return Created($"boardGame/{createdId}", createdId);
    }

}