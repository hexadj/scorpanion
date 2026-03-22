using Microsoft.AspNetCore.Mvc;
using Scorpanion.DAL.Context.Services.Interfaces;
using Scorpanion.DAL.Exceptions;
using Scorpanion.DAL.ExchangeModels;

namespace Scorpanion.API.Controllers;

[ApiController]
[Route("user/")]
public class UserController(IUserService userService) : Controller
{
    // POST
    [HttpPost("create/")]
    public IActionResult Create(UserCredentialsModel model)
    {
        try
        {
            var createdId = userService.CreateUser(model);
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
        var summary = userService.Login(model);
        if (summary is null)
            return Unauthorized();

        return Ok(summary);
    }
}
