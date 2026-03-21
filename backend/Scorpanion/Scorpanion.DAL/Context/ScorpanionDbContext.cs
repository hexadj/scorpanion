using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Query.Internal;
using Scorpanion.DAL.Context.Entities;

namespace Scorpanion.DAL.Context;

/// <summary>
/// Contexte de données de l'application (ORM)
/// </summary>
public class ScorpanionDbContext : DbContext
{
    public ScorpanionDbContext(DbContextOptions<ScorpanionDbContext> options) : base(options)
    {
        
    }
    
    public DbSet<User> Users { get; set; } 
    public DbSet<BoardGame> BoardGames { get; set; }
    public DbSet<Scoreboard> Scoreboards { get; set; }
    public DbSet<Game> Games { get; set; }
    public DbSet<Player> Players { get; set; }
    public DbSet<GameResult> GameResults { get; set; }
    
}