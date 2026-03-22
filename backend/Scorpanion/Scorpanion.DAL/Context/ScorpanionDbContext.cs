using Microsoft.EntityFrameworkCore;
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
    public DbSet<PlayerResult> PlayerResults { get; set; }
    public DbSet<Round> Rounds { get; set; }
    public DbSet<BoardGameConfig> BoardGameConfigs { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<BoardGameConfig>()
            .Property(e => e.WinType)
            .HasConversion<string>();
    }
}