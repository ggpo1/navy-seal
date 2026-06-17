namespace NavySeal.API.Models;

public class SeaLion
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public User User { get; set; } = null!;
    public required SeaLionMetadata Metadata { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public ICollection<Comment> Comments { get; set; } = [];
    public ICollection<Rating> Ratings { get; set; } = [];
    public ICollection<ContestVote> ContestVotes { get; set; } = [];
}
