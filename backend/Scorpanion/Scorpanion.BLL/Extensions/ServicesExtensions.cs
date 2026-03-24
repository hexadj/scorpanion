using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.DependencyInjection.Extensions;
using Scorpanion.BLL.Managers;
using Scorpanion.BLL.Managers.Interfaces;

namespace Scorpanion.BLL.Extensions;

public static class ServicesExtensions
{
    public static IServiceCollection AddBusinessLayer(this IServiceCollection services)
    {
        services.TryAddTransient<IGameManager, GameManager>();
        services.TryAddTransient<IHistoryManager, HistoryManager>();
        services.TryAddTransient<IUserManager, UserManager>();
        services.TryAddTransient<IBoardGameManager, BoardGameManager>();
        return services;
    }
}
