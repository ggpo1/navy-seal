namespace NavySeal.API.Models;

public class User
{
    public Guid Id { get; set; }
    public required string Username { get; set; }
    public required string Email { get; set; }
    public required string PasswordHash { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public ICollection<SeaLion> SeaLions { get; set; } = [];
    public ICollection<Comment> Comments { get; set; } = [];
    public ICollection<Rating> Ratings { get; set; } = [];
    public ICollection<ContestVote> ContestVotes { get; set; } = [];
}
