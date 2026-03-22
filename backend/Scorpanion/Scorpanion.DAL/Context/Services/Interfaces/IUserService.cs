using Scorpanion.DAL.ExchangeModels;

namespace Scorpanion.DAL.Context.Services.Interfaces;

public interface IUserService
{
    Guid CreateUser(UserCredentialsModel model);

    UserModel? Login(UserCredentialsModel model);
}
