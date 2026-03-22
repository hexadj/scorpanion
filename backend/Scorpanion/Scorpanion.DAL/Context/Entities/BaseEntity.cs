using System.ComponentModel.DataAnnotations;

namespace Scorpanion.DAL.Context.Entities;

/// <summary>
/// Modèle de base pour les entités (metadata classique)
/// </summary>
public abstract class BaseEntity
{
    [Key] 
    public required Guid Id { get; set; } = Guid.NewGuid();
    public required DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }
}