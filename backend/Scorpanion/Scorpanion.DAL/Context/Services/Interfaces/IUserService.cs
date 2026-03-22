using Scorpanion.DAL.ExchangeModels;

namespace Scorpanion.DAL.Context.Services.Interfaces;

public interface IUserService
{
    Guid CreateUser(UserCredentialsModel model);

    ICollection<UserModel> GetAllUsers();

    bool UserExists(Guid id);

    UserModel? Login(UserCredentialsModel model);
}
