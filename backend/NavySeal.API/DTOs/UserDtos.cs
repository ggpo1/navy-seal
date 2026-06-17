namespace NavySeal.API.DTOs;

public record UserSearchResultDto(
    Guid Id,
    string Username,
    int SealCount);

public record UserSearchResponse(IReadOnlyList<UserSearchResultDto> Items);

public record PublicUserProfileDto(
    Guid Id,
    string Username,
    DateTime CreatedAt,
    int SealCount,
    IReadOnlyList<string> Badges,
    IReadOnlyList<SeaLionDto> Seals,
    int Page = 1,
    int PageSize = Pagination.DefaultPageSize);
