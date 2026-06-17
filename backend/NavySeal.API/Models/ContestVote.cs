namespace NavySeal.API.Models;

public class ContestVote
{
    public Guid Id { get; set; }

    public Guid ContestId { get; set; }

    public DailyContest Contest { get; set; } = null!;

    public Guid UserId { get; set; }

    public User User { get; set; } = null!;

    public Guid SeaLionId { get; set; }

    public SeaLion SeaLion { get; set; } = null!;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}
