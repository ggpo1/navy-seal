using Microsoft.EntityFrameworkCore;
using NavySeal.API.Data;
using NavySeal.API.DTOs;
using NavySeal.API.Models;

namespace NavySeal.API.Services;

public interface ICommentService
{
    Task<IReadOnlyList<CommentDto>> GetBySeaLionAsync(Guid seaLionId, CancellationToken ct);
    Task<CommentDto> CreateAsync(Guid userId, Guid seaLionId, string text, CancellationToken ct);
    Task<CommentDto?> UpdateAsync(Guid userId, Guid commentId, string text, CancellationToken ct);
    Task<bool> DeleteAsync(Guid userId, Guid commentId, CancellationToken ct);
}

public class CommentService(AppDbContext db) : ICommentService
{
    public async Task<IReadOnlyList<CommentDto>> GetBySeaLionAsync(Guid seaLionId, CancellationToken ct)
    {
        return await db.Comments
            .AsNoTracking()
            .Include(c => c.User)
            .Where(c => c.SeaLionId == seaLionId)
            .OrderByDescending(c => c.CreatedAt)
            .Select(c => Map(c, c.User.Username))
            .ToListAsync(ct);
    }

    public async Task<CommentDto> CreateAsync(Guid userId, Guid seaLionId, string text, CancellationToken ct)
    {
        var normalized = NormalizeText(text);

        var seaLionExists = await db.SeaLions.AnyAsync(s => s.Id == seaLionId, ct);
        if (!seaLionExists)
            throw new InvalidOperationException("Морской котик не найден.");

        var comment = new Comment
        {
            Id = Guid.NewGuid(),
            SeaLionId = seaLionId,
            UserId = userId,
            Text = normalized
        };

        db.Comments.Add(comment);
        await db.SaveChangesAsync(ct);

        var username = await db.Users.AsNoTracking()
            .Where(u => u.Id == userId)
            .Select(u => u.Username)
            .FirstAsync(ct);

        return Map(comment, username);
    }

    public async Task<CommentDto?> UpdateAsync(Guid userId, Guid commentId, string text, CancellationToken ct)
    {
        var comment = await db.Comments
            .Include(c => c.User)
            .FirstOrDefaultAsync(c => c.Id == commentId, ct);

        if (comment is null)
            return null;

        if (comment.UserId != userId)
            throw new UnauthorizedAccessException("Нельзя редактировать чужой комментарий.");

        comment.Text = NormalizeText(text);
        comment.UpdatedAt = DateTime.UtcNow;
        await db.SaveChangesAsync(ct);

        return Map(comment, comment.User.Username);
    }

    public async Task<bool> DeleteAsync(Guid userId, Guid commentId, CancellationToken ct)
    {
        var comment = await db.Comments.FirstOrDefaultAsync(c => c.Id == commentId, ct);
        if (comment is null)
            return false;

        if (comment.UserId != userId)
            throw new UnauthorizedAccessException("Нельзя удалить чужой комментарий.");

        db.Comments.Remove(comment);
        await db.SaveChangesAsync(ct);
        return true;
    }

    private static string NormalizeText(string text)
    {
        var normalized = text.Trim();
        if (normalized.Length == 0)
            throw new ArgumentException("Комментарий не может быть пустым.");
        if (normalized.Length > 1000)
            throw new ArgumentException("Комментарий не может быть длиннее 1000 символов.");
        return normalized;
    }

    private static CommentDto Map(Comment comment, string username) =>
        new(comment.Id, comment.SeaLionId, comment.UserId, username, comment.Text, comment.CreatedAt, comment.UpdatedAt);
}
