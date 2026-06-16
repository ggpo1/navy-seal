using NavySeal.API.Models;

namespace NavySeal.API.Services;

public class SeaLionGenerator : ISeaLionGenerator
{
    private static readonly string[] EyeStyles = ["round", "sleepy", "wink"];
    private static readonly string[] Expressions = ["happy", "curious", "chill", "surprised"];
    private static readonly string[] Poses =
    [
        "upright", "lying", "sitting", "barking", "swimming", "stretching", "bellyUp"
    ];
    private static readonly string[] Patterns = ["solid", "spots", "stripes", "speckles", "patchy"];
    private static readonly string?[] Hats = [null, "captain", "party", "sailor", "crown"];
    private static readonly string?[] Accessories = [null, "ball", "fish", "anchor", "starfish"];
    private static readonly string[] BackgroundStyles = ["waves", "gradient", "plain"];

    public SeaLionMetadata Generate()
    {
        var seed = Random.Shared.Next();
        var rng = new Random(seed);

        var colors = SeaLionColorGenerator.Generate(rng);
        var pattern = Pick(rng, Patterns);

        return new SeaLionMetadata
        {
            Seed = seed,
            BodyColor = colors.Body,
            BellyColor = colors.Belly,
            NoseColor = colors.Nose,
            Size = Round(rng, 0.65, 1.15),
            BodyScaleX = Round(rng, 0.82, 1.18),
            BodyScaleY = Round(rng, 0.82, 1.18),
            HeadScale = Round(rng, 0.78, 1.22),
            SnoutLength = Round(rng, 0.75, 1.35),
            TailLength = Round(rng, 0.7, 1.35),
            FlipperLength = Round(rng, 0.45, 0.95),
            FlipperSpread = Round(rng, 0.8, 1.25),
            EyeSize = Round(rng, 0.75, 1.3),
            EyeSpacing = Round(rng, 0.85, 1.2),
            EyeStyle = Pick(rng, EyeStyles),
            Expression = Pick(rng, Expressions),
            Pose = Pick(rng, Poses),
            Pattern = pattern,
            PatternOpacity = Round(rng, 0.06, 0.22),
            StripeCount = rng.Next(4, 12),
            StripeWidth = Round(rng, 0.6, 1.5),
            PatternMarks = SeaLionPatternGenerator.Generate(rng, pattern),
            Hat = Pick(rng, Hats),
            Accessory = Pick(rng, Accessories),
            Whiskers = rng.NextDouble() > 0.12,
            Rotation = Round(rng, -20, 20),
            BackgroundColor = colors.Background,
            BackgroundStyle = Pick(rng, BackgroundStyles),
            WaveIntensity = Round(rng, 0.5, 1.6),
            Name = SeaLionNameGenerator.Generate(rng)
        };
    }

    private static T Pick<T>(Random rng, T[] items) => items[rng.Next(items.Length)];

    private static double Round(Random rng, double min, double max) =>
        Math.Round(min + rng.NextDouble() * (max - min), 2);
}
