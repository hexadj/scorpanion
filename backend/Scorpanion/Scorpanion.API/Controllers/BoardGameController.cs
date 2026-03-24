using Microsoft.AspNetCore.Mvc;
using Scorpanion.Contracts.Models;
using Scorpanion.BLL.Managers.Interfaces;

namespace Scorpanion.API.Controllers;

[ApiController]
[Route("boardGame/")]
public class BoardGameController(IBoardGameManager boardGameManager) : Controller
{
    // GET
    [HttpGet("getAll")]
    public IActionResult GetAll()
    {
        var boardGames = boardGameManager.GetAllBoardGames();
        return Ok(boardGames);
    }
    
    
    // POST
    [HttpPost("create/")]
    public IActionResult Create(BoardGameModel model)
    {
        var createdId = boardGameManager.CreateBoardGame(model);
        return Created($"boardGame/{createdId}", createdId);
    }

}