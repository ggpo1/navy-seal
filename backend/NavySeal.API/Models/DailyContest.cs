namespace NavySeal.API.Models;

public class DailyContest
{
    public Guid Id { get; set; }

    public DateTime PeriodStartUtc { get; set; }

    public DateTime PeriodEndUtc { get; set; }

    public string Nomination { get; set; } = ContestNominations.DailyBest;

    public Guid? WinnerSeaLionId { get; set; }

    public SeaLion? WinnerSeaLion { get; set; }

    public DateTime? FinalizedAt { get; set; }

    public ICollection<ContestVote> Votes { get; set; } = [];
}
