using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;
using NavySeal.API.Configuration;
using NavySeal.API.Data;
using NavySeal.API.DTOs;
using NavySeal.API.Models;

namespace NavySeal.API.Services;

public interface IAuthService
{
    Task<AuthResponse> RegisterAsync(RegisterRequest request, CancellationToken ct);
    Task<AuthResponse?> LoginAsync(LoginRequest request, CancellationToken ct);
    Task<UserDto?> GetUserAsync(Guid userId, CancellationToken ct);
}

public class AuthService(AppDbContext db, IOptions<JwtSettings> jwtOptions) : IAuthService
{
    private readonly JwtSettings _jwt = jwtOptions.Value;

    public async Task<AuthResponse> RegisterAsync(RegisterRequest request, CancellationToken ct)
    {
        var username = request.Username.Trim();
        var email = request.Email.Trim().ToLowerInvariant();

        if (string.IsNullOrWhiteSpace(username) || string.IsNullOrWhiteSpace(email) || string.IsNullOrWhiteSpace(request.Password))
            throw new InvalidOperationException("Все поля обязательны.");

        if (request.Password.Length < 6)
            throw new InvalidOperationException("Пароль должен быть не короче 6 символов.");

        if (await db.Users.AnyAsync(u => u.Username == username, ct))
            throw new InvalidOperationException("Имя пользователя уже занято.");

        if (await db.Users.AnyAsync(u => u.Email == email, ct))
            throw new InvalidOperationException("Email уже зарегистрирован.");

        var user = new User
        {
            Id = Guid.NewGuid(),
            Username = username,
            Email = email,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password)
        };

        db.Users.Add(user);
        await db.SaveChangesAsync(ct);

        return CreateAuthResponse(user);
    }

    public async Task<AuthResponse?> LoginAsync(LoginRequest request, CancellationToken ct)
    {
        var username = request.Username.Trim();
        var user = await db.Users.FirstOrDefaultAsync(u => u.Username == username, ct);

        if (user is null || !BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash))
            return null;

        return CreateAuthResponse(user);
    }

    public async Task<UserDto?> GetUserAsync(Guid userId, CancellationToken ct)
    {
        var user = await db.Users.AsNoTracking().FirstOrDefaultAsync(u => u.Id == userId, ct);
        return user is null ? null : MapUser(user);
    }

    private AuthResponse CreateAuthResponse(User user)
    {
        var token = GenerateToken(user);
        return new AuthResponse(token, MapUser(user));
    }

    private string GenerateToken(User user)
    {
        var claims = new[]
        {
            new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
            new Claim(ClaimTypes.Name, user.Username),
            new Claim(ClaimTypes.Email, user.Email)
        };

        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_jwt.Key));
        var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);
        var expires = DateTime.UtcNow.AddMinutes(_jwt.ExpiresMinutes);

        var token = new JwtSecurityToken(
            issuer: _jwt.Issuer,
            audience: _jwt.Audience,
            claims: claims,
            expires: expires,
            signingCredentials: credentials);

        return new JwtSecurityTokenHandler().WriteToken(token);
    }

    private static UserDto MapUser(User user) =>
        new(user.Id, user.Username, user.Email, user.CreatedAt);
}
