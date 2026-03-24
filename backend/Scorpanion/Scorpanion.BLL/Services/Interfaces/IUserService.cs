using Scorpanion.BLL.Models;

namespace Scorpanion.BLL.Services.Interfaces;

public interface IUserService
{
    Guid CreateUser(UserCredentialsModel model);

    ICollection<UserModel> GetAllUsers();

    UserModel? Login(UserCredentialsModel model);
}
