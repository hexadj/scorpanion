using Scorpanion.BLL.Managers.Interfaces;
using Scorpanion.Contracts.Models;
using Scorpanion.Contracts.Ports;

namespace Scorpanion.BLL.Managers;

public class UserManager(IUserDataPort userDataPort) : IUserManager
{
    public Guid CreateUser(UserCredentialsModel model) => userDataPort.CreateUser(model);

    public ICollection<UserModel> GetAllUsers() => userDataPort.GetAllUsers();

    public UserModel? Login(UserCredentialsModel model) => userDataPort.Login(model);
}
