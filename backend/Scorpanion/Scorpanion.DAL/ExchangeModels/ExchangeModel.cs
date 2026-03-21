namespace Scorpanion.DAL.ExchangeModels;

/// <summary>
/// Classe de base pour un modèle d'échange
/// </summary>
public abstract class ExchangeModel
{
    /// <summary>
    /// Id de l'entité
    /// </summary>
    public Guid Id { get; set; }
}