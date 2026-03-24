using Microsoft.AspNetCore.Mvc;
using Scorpanion.Contracts.Exceptions;
using Scorpanion.Contracts.Models;
using Scorpanion.BLL.Managers.Interfaces;

namespace Scorpanion.API.Controllers;

[ApiController]
[Route("user/")]
public class UserController(IUserManager userManager) : Controller
{
    // GET
    [HttpGet("getAll")]
    public IActionResult GetAll()
    {
        var users = userManager.GetAllUsers();
        return Ok(users);
    }

    // POST
    [HttpPost("create/")]
    public IActionResult Create(UserCredentialsModel model)
    {
        try
        {
            var createdId = userManager.CreateUser(model);
            return Created($"user/{createdId}", createdId);
        }
        catch (DuplicateUsernameException e)
        {
            return Conflict(e.Message);
        }
    }

    // POST
    [HttpPost("login/")]
    public IActionResult Login(UserCredentialsModel model)
    {
        var summary = userManager.Login(model);
        if (summary is null)
            return Unauthorized();

        return Ok(summary);
    }
}
