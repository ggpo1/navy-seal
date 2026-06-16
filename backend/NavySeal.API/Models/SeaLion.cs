namespace NavySeal.API.Models;

public class SeaLion
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public User User { get; set; } = null!;
    public required SeaLionMetadata Metadata { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
