using Scorpanion.BLL.Models;

namespace Scorpanion.BLL.Ports;

public interface IUserDataPort
{
    Guid CreateUser(UserCredentialsModel model);

    ICollection<UserModel> GetAllUsers();

    bool UserExists(Guid id);

    UserModel? Login(UserCredentialsModel model);
}
