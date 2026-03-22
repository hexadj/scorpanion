using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Scorpanion.DAL.Context.Entities;

[Table("users")]
public class User : BaseEntity
{
    [MaxLength(50)]
    public required string Username { get; set; }
    
    /// <summary>
    /// ASP.NET Core Identity password hash (<c>IPasswordHasher&lt;User&gt;</c>).
    /// Set with <c>HashPassword</c> on registration or password change; verify with <c>VerifyHashedPassword</c> on login.
    /// </summary>
    [MaxLength(256)]
    public required string PasswordHash { get; set; }
    
}