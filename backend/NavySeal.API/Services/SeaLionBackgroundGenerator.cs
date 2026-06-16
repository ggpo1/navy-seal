using NavySeal.API.Models;

namespace NavySeal.API.Services;

public static class SeaLionBackgroundGenerator
{
    public record GeneratedBackground(
        string Style,
        string PrimaryColor,
        string? SecondaryColor,
        string? AccentColor,
        double WaveIntensity,
        List<BackgroundMark> Marks);

    private static readonly (string Style, int Weight)[] CommonStyles =
    [
        ("waves", 32),
        ("gradient", 24),
        ("plain", 14),
        ("beach", 12),
        ("bubbles", 10),
        ("sunset", 8)
    ];

    public static GeneratedBackground Generate(Random rng, string quality)
    {
        var style = PickStyle(rng, quality);

        return style switch
        {
            "gradient" => GenerateGradient(rng),
            "plain" => GeneratePlain(rng),
            "beach" => GenerateBeach(rng),
            "bubbles" => GenerateBubbles(rng),
            "sunset" => GenerateSunset(rng),
            "coral" => GenerateCoral(rng),
            "deepSea" => GenerateDeepSea(rng),
            "aurora" => GenerateAurora(rng),
            "starry" => GenerateStarry(rng),
            _ => GenerateWaves(rng, quality)
        };
    }

    private static string PickStyle(Random rng, string quality)
    {
        var pool = new List<(string Style, int Weight)>(CommonStyles);

        if (quality is "rare" or "epic" or "legendary")
            pool.Add(("coral", 7));

        if (quality is "epic" or "legendary")
        {
            pool.Add(("deepSea", 6));
            pool.Add(("aurora", 5));
        }

        if (quality == "legendary")
            pool.Add(("starry", 6));

        return WeightedPick(rng, pool);
    }

    private static GeneratedBackground GenerateWaves(Random rng, string quality)
    {
        var hue = NextDouble(rng, 185, 215);
        var primary = SeaLionColorGenerator.FromHsl(hue, NextDouble(rng, 0.35, 0.72), NextDouble(rng, 0.52, 0.78));
        var secondary = SeaLionColorGenerator.FromHsl(hue + 8, NextDouble(rng, 0.4, 0.8), NextDouble(rng, 0.35, 0.55));
        var accent = SeaLionColorGenerator.FromHsl(hue - 5, 0.25, 0.92);
        var intensity = Round(NextDouble(rng, 0.55, 1.55));

        if (quality is "legendary" or "epic")
            intensity = Round(Math.Max(intensity, 1.05));

        return new GeneratedBackground("waves", primary, secondary, accent, intensity, []);
    }

    private static GeneratedBackground GenerateGradient(Random rng)
    {
        var hue = NextDouble(rng, 0, 360);
        var primary = SeaLionColorGenerator.FromHsl(hue, NextDouble(rng, 0.3, 0.75), NextDouble(rng, 0.58, 0.82));
        var secondary = SeaLionColorGenerator.FromHsl(hue + NextDouble(rng, 18, 48), NextDouble(rng, 0.2, 0.65), NextDouble(rng, 0.78, 0.95));

        return new GeneratedBackground(
            "gradient",
            primary,
            secondary,
            SeaLionColorGenerator.FromHsl(hue + 12, 0.15, 0.98),
            Round(NextDouble(rng, 0.4, 1.0)),
            []);
    }

    private static GeneratedBackground GeneratePlain(Random rng)
    {
        var hue = NextDouble(rng, 0, 360);
        var primary = SeaLionColorGenerator.FromHsl(hue, NextDouble(rng, 0.08, 0.35), NextDouble(rng, 0.82, 0.94));

        return new GeneratedBackground("plain", primary, null, null, Round(NextDouble(rng, 0.3, 0.7)), []);
    }

    private static GeneratedBackground GenerateBeach(Random rng)
    {
        var skyHue = NextDouble(rng, 195, 220);
        var primary = SeaLionColorGenerator.FromHsl(skyHue, NextDouble(rng, 0.35, 0.7), NextDouble(rng, 0.62, 0.82));
        var secondary = SeaLionColorGenerator.FromHsl(NextDouble(rng, 38, 52), NextDouble(rng, 0.35, 0.65), NextDouble(rng, 0.72, 0.88));
        var accent = SeaLionColorGenerator.FromHsl(NextDouble(rng, 42, 52), 0.85, 0.62);
        var marks = new List<BackgroundMark>
        {
            Mark("sun", NextDouble(rng, 0.68, 0.88), NextDouble(rng, 0.1, 0.28), NextDouble(rng, 0.08, 0.16), NextDouble(rng, 0.35, 0.55))
        };

        if (rng.NextDouble() > 0.45)
            marks.Add(Mark("cloud", NextDouble(rng, 0.12, 0.42), NextDouble(rng, 0.12, 0.32), NextDouble(rng, 0.12, 0.22), NextDouble(rng, 0.25, 0.45)));

        return new GeneratedBackground("beach", primary, secondary, accent, Round(NextDouble(rng, 0.45, 0.9)), marks);
    }

    private static GeneratedBackground GenerateBubbles(Random rng)
    {
        var hue = NextDouble(rng, 185, 225);
        var primary = SeaLionColorGenerator.FromHsl(hue, NextDouble(rng, 0.45, 0.8), NextDouble(rng, 0.42, 0.62));
        var secondary = SeaLionColorGenerator.FromHsl(hue + 12, NextDouble(rng, 0.35, 0.7), NextDouble(rng, 0.22, 0.38));
        var accent = SeaLionColorGenerator.FromHsl(hue - 10, 0.2, 0.95);
        var count = rng.Next(8, 18);
        var marks = Enumerable.Range(0, count)
            .Select(_ => Mark(
                "bubble",
                NextDouble(rng, 0.04, 0.96),
                NextDouble(rng, 0.08, 0.95),
                NextDouble(rng, 0.02, 0.09),
                NextDouble(rng, 0.12, 0.42),
                NextDouble(rng, 0, 360)))
            .ToList();

        return new GeneratedBackground("bubbles", primary, secondary, accent, Round(NextDouble(rng, 0.5, 1.1)), marks);
    }

    private static GeneratedBackground GenerateSunset(Random rng)
    {
        var primary = SeaLionColorGenerator.FromHsl(NextDouble(rng, 8, 28), NextDouble(rng, 0.7, 0.95), NextDouble(rng, 0.48, 0.62));
        var secondary = SeaLionColorGenerator.FromHsl(NextDouble(rng, 280, 320), NextDouble(rng, 0.45, 0.75), NextDouble(rng, 0.55, 0.72));
        var accent = SeaLionColorGenerator.FromHsl(NextDouble(rng, 38, 52), 0.9, 0.58);
        var marks = new List<BackgroundMark>
        {
            Mark("sun", NextDouble(rng, 0.35, 0.65), NextDouble(rng, 0.52, 0.72), NextDouble(rng, 0.1, 0.18), NextDouble(rng, 0.45, 0.7)),
            Mark("ray", 0.5, 0.62, NextDouble(rng, 0.35, 0.55), NextDouble(rng, 0.08, 0.18))
        };

        return new GeneratedBackground("sunset", primary, secondary, accent, Round(NextDouble(rng, 0.35, 0.75)), marks);
    }

    private static GeneratedBackground GenerateCoral(Random rng)
    {
        var primary = SeaLionColorGenerator.FromHsl(NextDouble(rng, 175, 205), NextDouble(rng, 0.4, 0.75), NextDouble(rng, 0.38, 0.55));
        var secondary = SeaLionColorGenerator.FromHsl(NextDouble(rng, 330, 355), NextDouble(rng, 0.45, 0.8), NextDouble(rng, 0.45, 0.62));
        var accent = SeaLionColorGenerator.FromHsl(NextDouble(rng, 15, 35), NextDouble(rng, 0.55, 0.85), NextDouble(rng, 0.55, 0.7));
        var count = rng.Next(4, 9);
        var marks = Enumerable.Range(0, count)
            .Select(_ => Mark(
                "coral",
                NextDouble(rng, 0.05, 0.95),
                NextDouble(rng, 0.55, 0.98),
                NextDouble(rng, 0.04, 0.14),
                NextDouble(rng, 0.2, 0.5),
                NextDouble(rng, -25, 25)))
            .ToList();

        return new GeneratedBackground("coral", primary, secondary, accent, Round(NextDouble(rng, 0.4, 0.85)), marks);
    }

    private static GeneratedBackground GenerateDeepSea(Random rng)
    {
        var hue = NextDouble(rng, 215, 245);
        var primary = SeaLionColorGenerator.FromHsl(hue, NextDouble(rng, 0.55, 0.85), NextDouble(rng, 0.12, 0.28));
        var secondary = SeaLionColorGenerator.FromHsl(hue + 8, NextDouble(rng, 0.45, 0.75), NextDouble(rng, 0.28, 0.42));
        var accent = SeaLionColorGenerator.FromHsl(NextDouble(rng, 45, 65), 0.75, 0.62);
        var rayCount = rng.Next(3, 6);
        var marks = Enumerable.Range(0, rayCount)
            .Select(i => Mark(
                "ray",
                NextDouble(rng, 0.08, 0.92),
                NextDouble(rng, 0.02, 0.2),
                NextDouble(rng, 0.18, 0.38),
                NextDouble(rng, 0.06, 0.16),
                i * (180.0 / rayCount) + NextDouble(rng, -12, 12)))
            .ToList();

        return new GeneratedBackground("deepSea", primary, secondary, accent, Round(NextDouble(rng, 0.35, 0.7)), marks);
    }

    private static GeneratedBackground GenerateAurora(Random rng)
    {
        var primary = SeaLionColorGenerator.FromHsl(NextDouble(rng, 220, 250), NextDouble(rng, 0.45, 0.75), NextDouble(rng, 0.12, 0.25));
        var secondary = SeaLionColorGenerator.FromHsl(NextDouble(rng, 125, 165), NextDouble(rng, 0.55, 0.85), NextDouble(rng, 0.42, 0.58));
        var accent = SeaLionColorGenerator.FromHsl(NextDouble(rng, 285, 315), NextDouble(rng, 0.5, 0.8), NextDouble(rng, 0.48, 0.62));
        var bandCount = rng.Next(3, 6);
        var marks = Enumerable.Range(0, bandCount)
            .Select(i => Mark(
                "aurora",
                0.5,
                NextDouble(rng, 0.12 + i * 0.08, 0.22 + i * 0.1),
                NextDouble(rng, 0.55, 0.95),
                NextDouble(rng, 0.18, 0.38),
                NextDouble(rng, -8, 8)))
            .ToList();

        return new GeneratedBackground("aurora", primary, secondary, accent, Round(NextDouble(rng, 0.5, 1.2)), marks);
    }

    private static GeneratedBackground GenerateStarry(Random rng)
    {
        var primary = SeaLionColorGenerator.FromHsl(NextDouble(rng, 225, 265), NextDouble(rng, 0.45, 0.8), NextDouble(rng, 0.1, 0.22));
        var secondary = SeaLionColorGenerator.FromHsl(NextDouble(rng, 265, 295), NextDouble(rng, 0.35, 0.65), NextDouble(rng, 0.18, 0.32));
        var accent = SeaLionColorGenerator.FromHsl(48, 0.25, 0.95);
        var count = rng.Next(18, 36);
        var marks = Enumerable.Range(0, count)
            .Select(_ =>
            {
                var kind = rng.NextDouble() > 0.82 ? "sparkle" : "star";
                return Mark(
                    kind,
                    NextDouble(rng, 0.02, 0.98),
                    NextDouble(rng, 0.02, 0.88),
                    NextDouble(rng, 0.008, kind == "sparkle" ? 0.035 : 0.055),
                    NextDouble(rng, 0.35, 0.95),
                    NextDouble(rng, 0, 360));
            })
            .ToList();

        return new GeneratedBackground("starry", primary, secondary, accent, Round(NextDouble(rng, 0.25, 0.55)), marks);
    }

    private static BackgroundMark Mark(
        string kind,
        double x,
        double y,
        double size,
        double opacity,
        double rotation = 0) =>
        new()
        {
            Kind = kind,
            X = Round(x),
            Y = Round(y),
            Size = Round(size),
            Opacity = Round(opacity),
            Rotation = Round(rotation)
        };

    private static string WeightedPick(Random rng, IReadOnlyList<(string Style, int Weight)> pool)
    {
        var total = pool.Sum(item => item.Weight);
        var roll = rng.Next(total);
        var cursor = 0;

        foreach (var (style, weight) in pool)
        {
            cursor += weight;
            if (roll < cursor)
                return style;
        }

        return pool[0].Style;
    }

    private static double NextDouble(Random rng, double min, double max) =>
        min + rng.NextDouble() * (max - min);

    private static double Round(double value) => Math.Round(value, 3);
}
