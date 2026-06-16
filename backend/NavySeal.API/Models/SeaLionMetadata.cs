namespace NavySeal.API.Models;

public class SeaLionMetadata
{
    public int Seed { get; set; }
    public string BodyColor { get; set; } = "#8B7355";
    public string BellyColor { get; set; } = "#D4C4A8";
    public string NoseColor { get; set; } = "#2C1810";
    public double Size { get; set; } = 1.0;
    public double BodyScaleX { get; set; } = 1.0;
    public double BodyScaleY { get; set; } = 1.0;
    public double HeadScale { get; set; } = 1.0;
    public double SnoutLength { get; set; } = 1.0;
    public double TailLength { get; set; } = 1.0;
    public double FlipperLength { get; set; } = 0.7;
    public double FlipperSpread { get; set; } = 1.0;
    public double EyeSize { get; set; } = 1.0;
    public double EyeSpacing { get; set; } = 1.0;
    public string EyeStyle { get; set; } = "round";
    public string Expression { get; set; } = "happy";
    public string Pose { get; set; } = "upright";
    public string Pattern { get; set; } = "solid";
    public double PatternOpacity { get; set; } = 0.12;
    public int StripeCount { get; set; } = 7;
    public double StripeWidth { get; set; } = 1.0;
    public List<PatternMark> PatternMarks { get; set; } = [];
    public string? Hat { get; set; }
    public string? Accessory { get; set; }
    public bool Whiskers { get; set; } = true;
    public double Rotation { get; set; }
    public string BackgroundColor { get; set; } = "#87CEEB";
    public string? BackgroundColorSecondary { get; set; }
    public string? BackgroundAccentColor { get; set; }
    public string BackgroundStyle { get; set; } = "waves";
    public double WaveIntensity { get; set; } = 1.0;
    public List<BackgroundMark> BackgroundMarks { get; set; } = [];
    public string Name { get; set; } = "Sea Lion";
    public string Quality { get; set; } = "common";
    public int Age { get; set; }
}
