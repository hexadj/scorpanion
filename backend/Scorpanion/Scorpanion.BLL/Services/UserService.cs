using Scorpanion.Contracts.Models;
using Scorpanion.Contracts.Ports;
using Scorpanion.BLL.Services.Interfaces;

namespace Scorpanion.BLL.Services;

public class UserService(IUserDataPort userDataPort) : IUserService
{
    public Guid CreateUser(UserCredentialsModel model) => userDataPort.CreateUser(model);

    public ICollection<UserModel> GetAllUsers() => userDataPort.GetAllUsers();

    public UserModel? Login(UserCredentialsModel model) => userDataPort.Login(model);
}
