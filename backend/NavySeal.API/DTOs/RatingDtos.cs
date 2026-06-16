namespace NavySeal.API.DTOs;

public record RatingSummaryDto(double Average, int Count, int? UserRating);

public record UpsertRatingRequest(int Value);
