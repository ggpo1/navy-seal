using Microsoft.EntityFrameworkCore;
using NavySeal.API.Data;
using NavySeal.API.DTOs;

namespace NavySeal.API.Services;

public interface IRatingService
{
    Task<RatingSummaryDto> GetSummaryAsync(Guid seaLionId, Guid? userId, CancellationToken ct);
    Task<RatingSummaryDto> UpsertAsync(Guid userId, Guid seaLionId, int value, CancellationToken ct);
    Task<RatingSummaryDto?> RemoveAsync(Guid userId, Guid seaLionId, CancellationToken ct);
}

public class RatingService(AppDbContext db) : IRatingService
{
    public async Task<RatingSummaryDto> GetSummaryAsync(Guid seaLionId, Guid? userId, CancellationToken ct)
    {
        var ratings = db.Ratings.AsNoTracking().Where(r => r.SeaLionId == seaLionId);

        var count = await ratings.CountAsync(ct);
        double average = 0;
        if (count > 0)
            average = await ratings.AverageAsync(r => r.Value, ct);

        int? userRating = null;
        if (userId is not null)
        {
            userRating = await ratings
                .Where(r => r.UserId == userId.Value)
                .Select(r => (int?)r.Value)
                .FirstOrDefaultAsync(ct);
        }

        return new RatingSummaryDto(Math.Round(average, 2), count, userRating);
    }

    public async Task<RatingSummaryDto> UpsertAsync(Guid userId, Guid seaLionId, int value, CancellationToken ct)
    {
        ValidateValue(value);

        var seaLionExists = await db.SeaLions.AnyAsync(s => s.Id == seaLionId, ct);
        if (!seaLionExists)
            throw new InvalidOperationException("Морской котик не найден.");

        var rating = await db.Ratings
            .FirstOrDefaultAsync(r => r.SeaLionId == seaLionId && r.UserId == userId, ct);

        if (rating is null)
        {
            rating = new Models.Rating
            {
                Id = Guid.NewGuid(),
                SeaLionId = seaLionId,
                UserId = userId,
                Value = (byte)value
            };
            db.Ratings.Add(rating);
        }
        else
        {
            rating.Value = (byte)value;
            rating.UpdatedAt = DateTime.UtcNow;
        }

        await db.SaveChangesAsync(ct);
        return await GetSummaryAsync(seaLionId, userId, ct);
    }

    public async Task<RatingSummaryDto?> RemoveAsync(Guid userId, Guid seaLionId, CancellationToken ct)
    {
        var rating = await db.Ratings
            .FirstOrDefaultAsync(r => r.SeaLionId == seaLionId && r.UserId == userId, ct);

        if (rating is null)
            return null;

        db.Ratings.Remove(rating);
        await db.SaveChangesAsync(ct);
        return await GetSummaryAsync(seaLionId, userId, ct);
    }

    private static void ValidateValue(int value)
    {
        if (value is < 1 or > 5)
            throw new ArgumentException("Оценка должна быть от 1 до 5.");
    }
}
