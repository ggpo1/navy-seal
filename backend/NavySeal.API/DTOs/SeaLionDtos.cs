using NavySeal.API.Models;

namespace NavySeal.API.DTOs;

public record SeaLionDto(
    Guid Id,
    Guid UserId,
    string Username,
    SeaLionMetadata Metadata,
    DateTime CreatedAt);

public record SeaLionListResponse(IReadOnlyList<SeaLionDto> Items);
