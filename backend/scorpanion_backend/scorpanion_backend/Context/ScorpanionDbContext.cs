using Microsoft.EntityFrameworkCore;
using scorpanion_backend.Context.Entities;

namespace scorpanion_backend.Context;

/// <summary>
/// Contexte de données de l'application (ORM)
/// </summary>
public class ScorpanionDbContext : DbContext
{
    public DbSet<User> Users { get; set; } 
    public DbSet<BoardGame> BoardGames { get; set; }
    public DbSet<Scoreboard> Scoreboards { get; set; }
    public DbSet<Game> Games { get; set; }
    public DbSet<Player> Players { get; set; }
    public DbSet<GameResult> GameResults { get; set; }
    
    protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
    {
        optionsBuilder.UseNpgsql("Host=localhost; Port=5432; Database=scorpanion");
    }
}