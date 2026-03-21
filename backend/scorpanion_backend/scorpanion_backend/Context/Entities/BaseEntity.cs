using System.ComponentModel.DataAnnotations;

namespace scorpanion_backend.Context.Entities;

/// <summary>
/// Modèle de base pour les entités (metadata classique)
/// </summary>
public abstract class BaseEntity
{
    [Key]
    public required Guid Id { get; set; }
    public required DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}