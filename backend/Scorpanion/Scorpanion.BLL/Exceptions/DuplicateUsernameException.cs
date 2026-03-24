namespace Scorpanion.BLL.Exceptions;

public sealed class DuplicateUsernameException : Exception
{
    public DuplicateUsernameException()
        : base("Ce nom d'utilisateur est déjà utilisé.")
    {
    }
}
