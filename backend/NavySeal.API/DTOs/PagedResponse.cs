namespace NavySeal.API.DTOs;

public record PagedResponse<T>(
    IReadOnlyList<T> Items,
    int Total,
    int Page,
    int PageSize)
{
    public int TotalPages => PageSize > 0 ? (int)Math.Ceiling(Total / (double)PageSize) : 0;

    public bool HasPrevious => Page > 1;

    public bool HasNext => Page < TotalPages;
}

public static class Pagination
{
    public const int DefaultPageSize = 12;
    public const int MaxPageSize = 50;

    public static (int Page, int PageSize, int Skip) Normalize(int page, int pageSize)
    {
        var normalizedPage = Math.Max(1, page);
        var normalizedSize = Math.Clamp(pageSize, 1, MaxPageSize);
        return (normalizedPage, normalizedSize, (normalizedPage - 1) * normalizedSize);
    }
}
