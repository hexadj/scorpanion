using Scorpanion.Contracts.Models;

namespace Scorpanion.Contracts.Ports;

public interface IUserDataPort
{
    Guid CreateUser(UserCredentialsModel model);

    ICollection<UserModel> GetAllUsers();

    bool UserExists(Guid id);

    UserModel? Login(UserCredentialsModel model);
}
