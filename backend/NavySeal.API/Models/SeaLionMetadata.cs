namespace NavySeal.API.Models;

public class SeaLionMetadata
{
    public string BodyColor { get; set; } = "#8B7355";
    public string BellyColor { get; set; } = "#D4C4A8";
    public string NoseColor { get; set; } = "#2C1810";
    public double Size { get; set; } = 1.0;
    public double FlipperLength { get; set; } = 0.7;
    public string EyeStyle { get; set; } = "round";
    public string Expression { get; set; } = "happy";
    public string Pattern { get; set; } = "solid";
    public string? Hat { get; set; }
    public string? Accessory { get; set; }
    public bool Whiskers { get; set; } = true;
    public double Rotation { get; set; }
    public string BackgroundColor { get; set; } = "#87CEEB";
    public string Name { get; set; } = "Морской котик";
}
