using NavySeal.API.Models;

namespace NavySeal.API.DTOs;

public record SeaLionDto(
    Guid Id,
    Guid UserId,
    string Username,
    SeaLionMetadata Metadata,
    DateTime CreatedAt,
    double AverageRating = 0,
    int RatingCount = 0,
    int CommentCount = 0);

public record SeaLionListResponse(IReadOnlyList<SeaLionDto> Items);

public record SeaLionDetailDto(
    Guid Id,
    Guid UserId,
    string Username,
    Models.SeaLionMetadata Metadata,
    DateTime CreatedAt,
    double AverageRating,
    int RatingCount,
    int? UserRating,
    int CommentCount);

public record GenerateSeaLionRequest(string? Quality = null, int? Age = null);

public static class SeaLionTopPeriods
{
    public const string Week = "week";
    public const string All = "all";

    public static bool IsValid(string? period) =>
        string.Equals(period, Week, StringComparison.OrdinalIgnoreCase) ||
        string.Equals(period, All, StringComparison.OrdinalIgnoreCase);
}
