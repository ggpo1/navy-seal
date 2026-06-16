using Microsoft.EntityFrameworkCore;
using NavySeal.API.Data;
using NavySeal.API.DTOs;
using NavySeal.API.Models;

namespace NavySeal.API.Services;

public interface ISeaLionService
{
    Task<SeaLionDto> GenerateAsync(Guid userId, CancellationToken ct);
    Task<IReadOnlyList<SeaLionDto>> GetRecentAsync(int limit, CancellationToken ct);
    Task<IReadOnlyList<SeaLionDto>> GetByUserAsync(Guid userId, CancellationToken ct);
}

public class SeaLionService(AppDbContext db, ISeaLionGenerator generator) : ISeaLionService
{
    public async Task<SeaLionDto> GenerateAsync(Guid userId, CancellationToken ct)
    {
        var userExists = await db.Users.AnyAsync(u => u.Id == userId, ct);
        if (!userExists)
            throw new InvalidOperationException("Пользователь не найден.");

        var seaLion = new SeaLion
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            Metadata = generator.Generate()
        };

        db.SeaLions.Add(seaLion);
        await db.SaveChangesAsync(ct);

        var user = await db.Users.AsNoTracking().FirstAsync(u => u.Id == userId, ct);
        return Map(seaLion, user.Username);
    }

    public async Task<IReadOnlyList<SeaLionDto>> GetRecentAsync(int limit, CancellationToken ct)
    {
        var clampedLimit = Math.Clamp(limit, 1, 50);

        return await db.SeaLions
            .AsNoTracking()
            .Include(s => s.User)
            .OrderByDescending(s => s.CreatedAt)
            .Take(clampedLimit)
            .Select(s => Map(s, s.User.Username))
            .ToListAsync(ct);
    }

    public async Task<IReadOnlyList<SeaLionDto>> GetByUserAsync(Guid userId, CancellationToken ct)
    {
        return await db.SeaLions
            .AsNoTracking()
            .Include(s => s.User)
            .Where(s => s.UserId == userId)
            .OrderByDescending(s => s.CreatedAt)
            .Select(s => Map(s, s.User.Username))
            .ToListAsync(ct);
    }

    private static SeaLionDto Map(SeaLion seaLion, string username) =>
        new(seaLion.Id, seaLion.UserId, username, seaLion.Metadata, seaLion.CreatedAt);
}
