using Scorpanion.Contracts.Models;

namespace Scorpanion.BLL.Managers.Interfaces;

public interface IUserManager
{
    Guid CreateUser(UserCredentialsModel model);

    ICollection<UserModel> GetAllUsers();

    UserModel? Login(UserCredentialsModel model);
}
