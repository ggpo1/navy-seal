namespace NavySeal.API.DTOs;

public record CommentDto(
    Guid Id,
    Guid SeaLionId,
    Guid UserId,
    string Username,
    string Text,
    DateTime CreatedAt,
    DateTime? UpdatedAt);

public record CommentListResponse(IReadOnlyList<CommentDto> Items);

public record CreateCommentRequest(string Text);

public record UpdateCommentRequest(string Text);
