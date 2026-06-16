namespace NavySeal.API.Models;

public class Rating
{
    public Guid Id { get; set; }
    public Guid SeaLionId { get; set; }
    public SeaLion SeaLion { get; set; } = null!;
    public Guid UserId { get; set; }
    public User User { get; set; } = null!;
    public byte Value { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}
