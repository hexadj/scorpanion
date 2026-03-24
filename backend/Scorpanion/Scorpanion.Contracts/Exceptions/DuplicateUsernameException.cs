namespace Scorpanion.Contracts.Exceptions;

public sealed class DuplicateUsernameException : Exception
{
    public DuplicateUsernameException()
        : base("Ce nom d'utilisateur est déjà utilisé.")
    {
    }
}
