using System.Text.RegularExpressions;

namespace NavySeal.API.Services;

public static partial class UsernameValidator
{
    public const int MinLength = 3;
    public const int MaxLength = 32;

    [GeneratedRegex(@"^[a-zA-Z0-9][a-zA-Z0-9_]*$")]
    private static partial Regex UsernamePattern();

    public static string Normalize(string username)
    {
        var value = username.Trim();
        while (value.StartsWith('@'))
            value = value[1..];
        return value;
    }

    public static void Validate(string username)
    {
        var value = Normalize(username);

        if (string.IsNullOrEmpty(value))
            throw new InvalidOperationException("Имя пользователя обязательно.");

        if (value.Length < MinLength)
            throw new InvalidOperationException($"Имя пользователя должно быть не короче {MinLength} символов.");

        if (value.Length > MaxLength)
            throw new InvalidOperationException($"Имя пользователя должно быть не длиннее {MaxLength} символов.");

        if (!UsernamePattern().IsMatch(value))
            throw new InvalidOperationException(
                "Имя пользователя может содержать только латинские буквы, цифры и символ подчёркивания.");
    }
}
