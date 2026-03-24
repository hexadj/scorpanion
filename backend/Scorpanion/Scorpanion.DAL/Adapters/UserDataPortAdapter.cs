using Scorpanion.BLL.Ports;
using Scorpanion.Contracts.Exceptions;
using Scorpanion.Contracts.Models;
using Scorpanion.DAL.Context.Services.Interfaces;

namespace Scorpanion.DAL.Adapters;

public class UserDataPortAdapter(IUserService userService) : IUserDataPort
{
    public Guid CreateUser(UserCredentialsModel model)
    {
        try
        {
            return userService.CreateUser(model);
        }
        catch (DuplicateUsernameException)
        {
            throw;
        }
    }

    public ICollection<UserModel> GetAllUsers() => userService.GetAllUsers();

    public bool UserExists(Guid id) => userService.UserExists(id);

    public UserModel? Login(UserCredentialsModel model) => userService.Login(model);
}
