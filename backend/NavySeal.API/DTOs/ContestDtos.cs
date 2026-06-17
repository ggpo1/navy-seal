namespace NavySeal.API.DTOs;

public record ContestCandidateDto(
    SeaLionDto Seal,
    int VoteCount);

public record DailyContestDto(
    Guid ContestId,
    string Nomination,
    DateTime PeriodStartUtc,
    DateTime PeriodEndUtc,
    SeaLionDto? PreviousWinner,
    DateTime? PreviousWinnerPeriodEndUtc,
    IReadOnlyList<ContestCandidateDto> Candidates,
    Guid? UserVoteSeaLionId);

public record CastContestVoteRequest(Guid SeaLionId);

public record CastContestVoteResponse(
    Guid SeaLionId,
    int VoteCount,
    DailyContestDto Contest);
