using Microsoft.EntityFrameworkCore;
using NavySeal.API.Data;
using NavySeal.API.DTOs;
using NavySeal.API.Models;

namespace NavySeal.API.Services;

public interface IContestService
{
    Task<DailyContestDto> GetDailyContestAsync(Guid? viewerUserId, CancellationToken ct);
    Task<CastContestVoteResponse> VoteAsync(Guid userId, Guid seaLionId, CancellationToken ct);
}

public class ContestService(AppDbContext db, IBadgeService badgeService) : IContestService
{
    private const int CandidateLimit = 48;

    public async Task<DailyContestDto> GetDailyContestAsync(Guid? viewerUserId, CancellationToken ct)
    {
        await FinalizeExpiredContestsAsync(ct);
        var contest = await EnsureCurrentContestAsync(ct);
        return await BuildContestDtoAsync(contest, viewerUserId, ct);
    }

    public async Task<CastContestVoteResponse> VoteAsync(Guid userId, Guid seaLionId, CancellationToken ct)
    {
        await FinalizeExpiredContestsAsync(ct);
        var contest = await EnsureCurrentContestAsync(ct);

        if (contest.FinalizedAt is not null)
            throw new InvalidOperationException("Голосование за этот период уже завершено.");

        var utcNow = DateTime.UtcNow;
        var eligibleSince = utcNow.AddHours(-24);

        var seaLion = await db.SeaLions
            .AsNoTracking()
            .FirstOrDefaultAsync(s => s.Id == seaLionId, ct);

        if (seaLion is null)
            throw new InvalidOperationException("Морской котик не найден.");

        if (seaLion.CreatedAt < eligibleSince)
            throw new ArgumentException("Можно голосовать только за котиков, созданных за последние 24 часа.");

        var vote = await db.ContestVotes
            .FirstOrDefaultAsync(v => v.ContestId == contest.Id && v.UserId == userId, ct);

        if (vote is null)
        {
            vote = new ContestVote
            {
                Id = Guid.NewGuid(),
                ContestId = contest.Id,
                UserId = userId,
                SeaLionId = seaLionId,
            };
            db.ContestVotes.Add(vote);
        }
        else
        {
            vote.SeaLionId = seaLionId;
            vote.UpdatedAt = utcNow;
        }

        await db.SaveChangesAsync(ct);

        var voteCount = await db.ContestVotes
            .AsNoTracking()
            .CountAsync(v => v.ContestId == contest.Id && v.SeaLionId == seaLionId, ct);

        var contestDto = await BuildContestDtoAsync(contest, userId, ct);
        return new CastContestVoteResponse(seaLionId, voteCount, contestDto);
    }

    private async Task FinalizeExpiredContestsAsync(CancellationToken ct)
    {
        var utcNow = DateTime.UtcNow;
        var expired = await db.DailyContests
            .Where(c => c.FinalizedAt == null && c.PeriodEndUtc <= utcNow)
            .OrderBy(c => c.PeriodEndUtc)
            .ToListAsync(ct);

        foreach (var contest in expired)
            await FinalizeContestAsync(contest, ct);
    }

    private async Task FinalizeContestAsync(DailyContest contest, CancellationToken ct)
    {
        if (contest.FinalizedAt is not null)
            return;

        var winnerGroup = await db.ContestVotes
            .AsNoTracking()
            .Where(v => v.ContestId == contest.Id)
            .GroupBy(v => v.SeaLionId)
            .Select(g => new
            {
                SeaLionId = g.Key,
                VoteCount = g.Count(),
                LatestVoteAt = g.Max(v => v.UpdatedAt),
            })
            .OrderByDescending(x => x.VoteCount)
            .ThenByDescending(x => x.LatestVoteAt)
            .ThenBy(x => x.SeaLionId)
            .FirstOrDefaultAsync(ct);

        if (winnerGroup is not null)
        {
            var winner = await db.SeaLions.FirstAsync(s => s.Id == winnerGroup.SeaLionId, ct);
            winner.Metadata.Awards.Add(new SeaLionAward
            {
                Nomination = contest.Nomination,
                WonAt = contest.PeriodEndUtc,
                PeriodStartUtc = contest.PeriodStartUtc,
                PeriodEndUtc = contest.PeriodEndUtc,
            });
            contest.WinnerSeaLionId = winnerGroup.SeaLionId;
        }

        contest.FinalizedAt = DateTime.UtcNow;
        await db.SaveChangesAsync(ct);
    }

    private async Task<DailyContest> EnsureCurrentContestAsync(CancellationToken ct)
    {
        var utcNow = DateTime.UtcNow;
        var periodStart = utcNow.Date;
        var periodEnd = periodStart.AddHours(24);

        var current = await db.DailyContests
            .FirstOrDefaultAsync(
                c => c.PeriodStartUtc == periodStart && c.FinalizedAt == null,
                ct);

        if (current is not null)
            return current;

        current = new DailyContest
        {
            Id = Guid.NewGuid(),
            PeriodStartUtc = periodStart,
            PeriodEndUtc = periodEnd,
            Nomination = ContestNominations.DailyBest,
        };

        db.DailyContests.Add(current);
        await db.SaveChangesAsync(ct);
        return current;
    }

    private async Task<DailyContestDto> BuildContestDtoAsync(
        DailyContest contest,
        Guid? viewerUserId,
        CancellationToken ct)
    {
        var utcNow = DateTime.UtcNow;
        var eligibleSince = utcNow.AddHours(-24);

        var sealRows = await db.SeaLions
            .AsNoTracking()
            .Where(s => s.CreatedAt >= eligibleSince)
            .OrderByDescending(s => s.CreatedAt)
            .Take(CandidateLimit)
            .Select(s => new SeaLionListRow(
                s.Id,
                s.UserId,
                s.User.Username,
                s.Metadata,
                s.CreatedAt,
                s.Ratings.Count,
                s.Comments.Count,
                s.Ratings.Count == 0
                    ? 0.0
                    : s.Ratings.Average(r => (double)r.Value)))
            .ToListAsync(ct);

        var voteCounts = await db.ContestVotes
            .AsNoTracking()
            .Where(v => v.ContestId == contest.Id)
            .GroupBy(v => v.SeaLionId)
            .Select(g => new { SeaLionId = g.Key, Count = g.Count() })
            .ToDictionaryAsync(x => x.SeaLionId, x => x.Count, ct);

        var sealDtos = sealRows
            .Select(s => new SeaLionDto(
                s.Id,
                s.UserId,
                s.Username,
                s.Metadata,
                s.CreatedAt,
                Math.Round(s.AverageRating, 2),
                s.RatingCount,
                s.CommentCount))
            .ToList();

        sealDtos = (await badgeService.ApplySealBadgesAsync(sealDtos, ct)).ToList();

        var candidates = sealDtos
            .Select(seal => new ContestCandidateDto(seal, voteCounts.GetValueOrDefault(seal.Id)))
            .OrderByDescending(c => c.VoteCount)
            .ThenByDescending(c => c.Seal.CreatedAt)
            .ToList();

        Guid? userVoteSeaLionId = null;
        if (viewerUserId is not null)
        {
            userVoteSeaLionId = await db.ContestVotes
                .AsNoTracking()
                .Where(v => v.ContestId == contest.Id && v.UserId == viewerUserId.Value)
                .Select(v => (Guid?)v.SeaLionId)
                .FirstOrDefaultAsync(ct);
        }

        var previousContest = await db.DailyContests
            .AsNoTracking()
            .Where(c => c.FinalizedAt != null && c.WinnerSeaLionId != null)
            .OrderByDescending(c => c.PeriodEndUtc)
            .FirstOrDefaultAsync(ct);

        SeaLionDto? previousWinner = null;
        DateTime? previousWinnerPeriodEnd = null;

        if (previousContest?.WinnerSeaLionId is Guid winnerId)
        {
            previousWinner = await MapSeaLionDtoAsync(winnerId, ct);
            previousWinnerPeriodEnd = previousContest.PeriodEndUtc;
        }

        return new DailyContestDto(
            contest.Id,
            contest.Nomination,
            contest.PeriodStartUtc,
            contest.PeriodEndUtc,
            previousWinner,
            previousWinnerPeriodEnd,
            candidates,
            userVoteSeaLionId);
    }

    private async Task<SeaLionDto?> MapSeaLionDtoAsync(Guid seaLionId, CancellationToken ct)
    {
        var row = await db.SeaLions
            .AsNoTracking()
            .Where(s => s.Id == seaLionId)
            .Select(s => new SeaLionListRow(
                s.Id,
                s.UserId,
                s.User.Username,
                s.Metadata,
                s.CreatedAt,
                s.Ratings.Count,
                s.Comments.Count,
                s.Ratings.Count == 0
                    ? 0.0
                    : s.Ratings.Average(r => (double)r.Value)))
            .FirstOrDefaultAsync(ct);

        if (row is null)
            return null;

        var dto = new SeaLionDto(
            row.Id,
            row.UserId,
            row.Username,
            row.Metadata,
            row.CreatedAt,
            Math.Round(row.AverageRating, 2),
            row.RatingCount,
            row.CommentCount);

        var enriched = await badgeService.ApplySealBadgesAsync([dto], ct);
        return enriched[0];
    }

    private sealed record SeaLionListRow(
        Guid Id,
        Guid UserId,
        string Username,
        SeaLionMetadata Metadata,
        DateTime CreatedAt,
        int RatingCount,
        int CommentCount,
        double AverageRating);
}
