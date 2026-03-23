using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Npgsql;
using Scorpanion.DAL.Context.Entities;
using Scorpanion.DAL.Context.Services.Interfaces;
using Scorpanion.DAL.Exceptions;
using Scorpanion.DAL.ExchangeModels;

namespace Scorpanion.DAL.Context.Services;

public class UserService : IUserService
{
    private const int UsernameMaxLength = 50;
    private const int PasswordMaxLength = 256;

    private readonly ScorpanionDbContext _context;
    private readonly IPasswordHasher<User> _passwordHasher;

    public UserService(ScorpanionDbContext context, IPasswordHasher<User> passwordHasher)
    {
        _context = context;
        _passwordHasher = passwordHasher;
    }

    public Guid CreateUser(UserCredentialsModel model)
    {
        if (string.IsNullOrWhiteSpace(model.Username))
            throw new ArgumentNullException(nameof(model.Username));
        if (model.Username.Length > UsernameMaxLength)
            throw new ArgumentOutOfRangeException(nameof(model.Username));
        if (string.IsNullOrWhiteSpace(model.Password))
            throw new ArgumentNullException(nameof(model.Password));
        if (model.Password.Length > PasswordMaxLength)
            throw new ArgumentOutOfRangeException(nameof(model.Password));

        var username = model.Username.Trim();
        if (_context.Users.Any(u => u.Username == username))
            throw new DuplicateUsernameException();

        var now = DateTime.UtcNow;
        var entity = new User
        {
            Id = Guid.Empty,
            Username = username,
            PasswordHash = string.Empty,
            CreatedAt = now,
            UpdatedAt = now,
        };
        entity.PasswordHash = _passwordHasher.HashPassword(entity, model.Password);

        _context.Users.Add(entity);
        try
        {
            _context.SaveChanges();
        }
        catch (DbUpdateException ex) when (ex.InnerException is PostgresException { SqlState: PostgresErrorCodes.UniqueViolation })
        {
            throw new DuplicateUsernameException();
        }

        return entity.Id;
    }

    public ICollection<UserModel> GetAllUsers()
    {
        return _context.Users.Select(u => new UserModel
        {
            Id = u.Id,
            Username = u.Username,
        }).ToList();
    }

    public bool UserExists(Guid id) => _context.Users.Any(u => u.Id == id);

    public UserModel? Login(UserCredentialsModel model)
    {
        if (string.IsNullOrWhiteSpace(model.Username) || string.IsNullOrWhiteSpace(model.Password))
            return null;

        var username = model.Username.Trim();
        var user = _context.Users.FirstOrDefault(u => u.Username == username);
        if (user is null)
            return null;

        var verification = _passwordHasher.VerifyHashedPassword(user, user.PasswordHash, model.Password);
        if (verification == PasswordVerificationResult.Failed)
            return null;

        return new UserModel
        {
            Id = user.Id,
            Username = user.Username,
        };
    }
}
