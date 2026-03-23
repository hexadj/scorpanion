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
    
    public DbSet<User> Users { get; init; } 
    public DbSet<BoardGame> BoardGames { get; init; }
    public DbSet<Scoreboard> Scoreboards { get; init; }
    public DbSet<Game> Games { get; init; }
    public DbSet<Player> Players { get; init; }
    public DbSet<GameResult> GameResults { get; init; }
    public DbSet<PlayerResult> PlayerResults { get; init; }
    public DbSet<Round> Rounds { get; init; }
    public DbSet<BoardGameConfig> BoardGameConfigs { get; init; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<User>()
            .HasIndex(u => u.Username)
            .IsUnique();

        modelBuilder.Entity<BoardGameConfig>()
            .Property(e => e.WinType)
            .HasConversion<string>();

        modelBuilder.Entity<Game>()
            .HasOne(g => g.BoardGameConfig)
            .WithMany()
            .HasForeignKey(g => g.BoardGameConfigId)
            .OnDelete(DeleteBehavior.SetNull);
    }
}
