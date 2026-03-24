using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.DependencyInjection.Extensions;
using Scorpanion.BLL.Managers;
using Scorpanion.BLL.Services;
using Scorpanion.BLL.Services.Interfaces;

namespace Scorpanion.BLL.Extensions;

public static class ServicesExtensions
{
    public static IServiceCollection AddBusinessLayer(this IServiceCollection services)
    {
        services.TryAddTransient<GameManager>();
        services.TryAddTransient<IGameService, GameService>();
        services.TryAddTransient<IHistoryService, HistoryService>();
        services.TryAddTransient<IUserService, UserService>();
        services.TryAddTransient<IBoardGameService, BoardGameService>();
        return services;
    }
}
