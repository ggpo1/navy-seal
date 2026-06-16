using NavySeal.API.Models;

namespace NavySeal.API.Services;

public class SeaLionGenerator : ISeaLionGenerator
{
    private static readonly string[] BodyColors =
    [
        "#8B7355", "#6B8E9F", "#A67B5B", "#7A8B6E", "#9B7E6B", "#5D7A8C", "#B8956A"
    ];

    private static readonly string[] BellyColors =
    [
        "#D4C4A8", "#E8DCC8", "#F5E6D3", "#C9B99A", "#EDE0D4"
    ];

    private static readonly string[] EyeStyles = ["round", "sleepy", "wink"];
    private static readonly string[] Expressions = ["happy", "curious", "chill", "surprised"];
    private static readonly string[] Patterns = ["solid", "spots", "stripes"];
    private static readonly string?[] Hats = [null, "captain", "party", "sailor", "crown"];
    private static readonly string?[] Accessories = [null, "ball", "fish", "anchor", "starfish"];
    private static readonly string[] BackgroundColors =
    [
        "#87CEEB", "#B0E0E6", "#ADD8E6", "#7EC8E3", "#A8DADC", "#CAF0F8"
    ];

    public SeaLionMetadata Generate()
    {
        return new SeaLionMetadata
        {
            BodyColor = Pick(BodyColors),
            BellyColor = Pick(BellyColors),
            NoseColor = "#2C1810",
            Size = Round(Random.Shared.NextDouble() * 0.4 + 0.7),
            FlipperLength = Round(Random.Shared.NextDouble() * 0.4 + 0.5),
            EyeStyle = Pick(EyeStyles),
            Expression = Pick(Expressions),
            Pattern = Pick(Patterns),
            Hat = Pick(Hats),
            Accessory = Pick(Accessories),
            Whiskers = Random.Shared.NextDouble() > 0.15,
            Rotation = Round((Random.Shared.NextDouble() - 0.5) * 16),
            BackgroundColor = Pick(BackgroundColors),
            Name = SeaLionNameGenerator.Generate()
        };
    }

    private static T Pick<T>(T[] items) => items[Random.Shared.Next(items.Length)];

    private static double Round(double value) => Math.Round(value, 2);
}
