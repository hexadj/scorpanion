using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.DependencyInjection.Extensions;
using Scorpanion.DAL.Context;
using Scorpanion.DAL.Context.Entities;
using Scorpanion.DAL.Context.Services;
using Scorpanion.DAL.Context.Services.Interfaces;

namespace Scorpanion.DAL.Extensions;

public static class ServicesExtensions
{
    /// <summary>
    /// Connection à la base de données
    /// <br/> Initialisation des services 
    /// </summary>
    /// <param name="services"></param>
    /// <param name="configuration"></param>
    /// <returns></returns>
    /// <exception cref="ApplicationException"></exception>
    public static IServiceCollection AddDataAccessLayer(this IServiceCollection services, IConfiguration configuration)
    {
        string? connectionString = configuration.GetConnectionString("ScorpanionDbContext");

        if (string.IsNullOrWhiteSpace(connectionString))
            throw new ApplicationException("Connection à la base de données impossible : ConnectionString non trouvée dans la configuration.");
        
        services.AddDbContext<ScorpanionDbContext>(options => options.UseNpgsql(connectionString));
        services.TryAddTransient<IBoardGameService, BoardGameService>();
        services.TryAddTransient<IUserService, UserService>();
        services.TryAddTransient<IPlayerService, PlayerService>();
        services.TryAddTransient<IGameService, GameService>();
        // Registration/login: inject IPasswordHasher<User> — HashPassword on sign-up/change; VerifyHashedPassword on login.
        services.TryAddTransient<IPasswordHasher<User>, PasswordHasher<User>>();
        return services;
    }
}