namespace NavySeal.API.Models;

public class Comment
{
    public Guid Id { get; set; }
    public Guid SeaLionId { get; set; }
    public SeaLion SeaLion { get; set; } = null!;
    public Guid UserId { get; set; }
    public User User { get; set; } = null!;
    public required string Text { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }
}
