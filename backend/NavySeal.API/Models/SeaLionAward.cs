namespace NavySeal.API.Models;

public class SeaLionAward
{
    public string Nomination { get; set; } = ContestNominations.DailyBest;

    public DateTime WonAt { get; set; }

    public DateTime PeriodStartUtc { get; set; }

    public DateTime PeriodEndUtc { get; set; }
}
