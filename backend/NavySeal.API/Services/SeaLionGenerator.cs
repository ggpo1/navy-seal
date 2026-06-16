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
    private static readonly string[] Qualities = ["common", "uncommon", "rare", "epic", "legendary"];
    private static readonly (string Quality, int Weight)[] QualityWeights =
    [
        ("common", 50),
        ("uncommon", 25),
        ("rare", 15),
        ("epic", 8),
        ("legendary", 2)
    ];

    public static bool IsValidQuality(string? quality) =>
        !string.IsNullOrWhiteSpace(quality) &&
        Qualities.Contains(quality.Trim(), StringComparer.OrdinalIgnoreCase);

    public SeaLionMetadata Generate(SeaLionGenerationOptions? options = null)
    {
        var seed = Random.Shared.Next();
        var rng = new Random(seed);

        var quality = ResolveQuality(options, rng);
        var age = ResolveAge(options, rng);
        var colors = SeaLionColorGenerator.Generate(rng);
        var pattern = PickPattern(rng, quality);

        var metadata = new SeaLionMetadata
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
            Hat = PickHat(rng, quality),
            Accessory = PickAccessory(rng, quality),
            Whiskers = rng.NextDouble() > 0.12,
            Rotation = Round(rng, -20, 20),
            BackgroundColor = colors.Background,
            BackgroundStyle = Pick(rng, BackgroundStyles),
            WaveIntensity = Round(rng, 0.5, 1.6),
            Name = SeaLionNameGenerator.Generate(rng),
            Quality = quality,
            Age = age
        };

        ApplyAgeModifiers(metadata, age);
        ApplyQualityModifiers(metadata, quality);

        return metadata;
    }

    private static string ResolveQuality(SeaLionGenerationOptions? options, Random rng)
    {
        if (!string.IsNullOrWhiteSpace(options?.Quality))
            return options.Quality.Trim().ToLowerInvariant();

        return PickWeightedQuality(rng);
    }

    private static int ResolveAge(SeaLionGenerationOptions? options, Random rng) =>
        options?.Age ?? rng.Next(0, 21);

    private static string PickWeightedQuality(Random rng)
    {
        var total = QualityWeights.Sum(w => w.Weight);
        var roll = rng.Next(total);
        var cursor = 0;

        foreach (var (quality, weight) in QualityWeights)
        {
            cursor += weight;
            if (roll < cursor)
                return quality;
        }

        return "common";
    }

    private static string PickPattern(Random rng, string quality)
    {
        var solidChance = quality switch
        {
            "legendary" => 0.05,
            "epic" => 0.12,
            "rare" => 0.2,
            "uncommon" => 0.3,
            _ => 0.45
        };

        if (rng.NextDouble() < solidChance)
            return "solid";

        var fancyPatterns = Patterns.Where(p => p != "solid").ToArray();
        return Pick(rng, fancyPatterns);
    }

    private static string? PickHat(Random rng, string quality)
    {
        var chance = quality switch
        {
            "legendary" => 0.9,
            "epic" => 0.7,
            "rare" => 0.45,
            "uncommon" => 0.25,
            _ => 0.1
        };

        if (rng.NextDouble() > chance)
            return null;

        if (quality is "legendary" or "epic" && rng.NextDouble() > 0.35)
            return "crown";

        var hats = Hats.Where(h => h is not null).Cast<string>().ToArray();
        return Pick(rng, hats);
    }

    private static string? PickAccessory(Random rng, string quality)
    {
        var chance = quality switch
        {
            "legendary" => 0.95,
            "epic" => 0.75,
            "rare" => 0.5,
            "uncommon" => 0.3,
            _ => 0.12
        };

        if (rng.NextDouble() > chance)
            return null;

        var accessories = Accessories.Where(a => a is not null).Cast<string>().ToArray();
        return Pick(rng, accessories);
    }

    private static void ApplyAgeModifiers(SeaLionMetadata metadata, int age)
    {
        switch (age)
        {
            case <= 1:
                metadata.HeadScale = Round(metadata.HeadScale * 1.15);
                metadata.Size = Round(Math.Clamp(metadata.Size * 0.85, 0.55, 1.0));
                metadata.EyeSize = Round(metadata.EyeSize * 1.12);
                break;
            case <= 4:
                metadata.HeadScale = Round(metadata.HeadScale * 1.08);
                metadata.Size = Round(metadata.Size * 0.92);
                break;
            case >= 16:
                metadata.HeadScale = Round(metadata.HeadScale * 0.92);
                metadata.BodyScaleX = Round(metadata.BodyScaleX * 1.05);
                metadata.BodyScaleY = Round(metadata.BodyScaleY * 1.05);
                metadata.EyeSize = Round(metadata.EyeSize * 0.9);
                break;
        }
    }

    private static void ApplyQualityModifiers(SeaLionMetadata metadata, string quality)
    {
        metadata.PatternOpacity = quality switch
        {
            "legendary" => Round(Math.Max(metadata.PatternOpacity, 0.16)),
            "epic" => Round(Math.Max(metadata.PatternOpacity, 0.14)),
            "rare" => Round(Math.Max(metadata.PatternOpacity, 0.12)),
            _ => metadata.PatternOpacity
        };

        if (quality is "legendary" or "epic")
            metadata.WaveIntensity = Round(Math.Max(metadata.WaveIntensity, 1.1));
    }

    private static T Pick<T>(Random rng, T[] items) => items[rng.Next(items.Length)];

    private static double Round(double value) => Math.Round(value, 2);

    private static double Round(Random rng, double min, double max) =>
        Math.Round(min + rng.NextDouble() * (max - min), 2);
}
