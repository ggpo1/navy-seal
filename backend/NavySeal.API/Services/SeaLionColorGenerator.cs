namespace NavySeal.API.Services;

public static class SeaLionColorGenerator
{
    public record Palette(string Body, string Belly, string Nose, string Background);

    public static Palette Generate(Random rng)
    {
        var bodyHue = NextDouble(rng, 0, 360);
        var body = ToHex(bodyHue, NextDouble(rng, 0.15, 0.75), NextDouble(rng, 0.28, 0.62));

        var belly = ToHex(
            bodyHue + NextDouble(rng, -12, 12),
            NextDouble(rng, 0.08, 0.45),
            NextDouble(rng, 0.72, 0.93));

        var nose = ToHex(
            bodyHue + NextDouble(rng, -8, 8),
            NextDouble(rng, 0.25, 0.85),
            NextDouble(rng, 0.08, 0.22));

        var background = ToHex(
            NextDouble(rng, 0, 360),
            NextDouble(rng, 0.12, 0.78),
            NextDouble(rng, 0.48, 0.88));

        return new Palette(body, belly, nose, background);
    }

    private static double NextDouble(Random rng, double min, double max) =>
        min + rng.NextDouble() * (max - min);

    private static string ToHex(double hue, double saturation, double lightness)
    {
        var (r, g, b) = HslToRgb(NormalizeHue(hue), Clamp(saturation), Clamp(lightness));
        return $"#{r:X2}{g:X2}{b:X2}";
    }

    private static double NormalizeHue(double hue)
    {
        var normalized = hue % 360;
        return normalized < 0 ? normalized + 360 : normalized;
    }

    private static double Clamp(double value) => Math.Clamp(value, 0, 1);

    private static (int R, int G, int B) HslToRgb(double h, double s, double l)
    {
        if (s <= 0)
        {
            var gray = (int)Math.Round(l * 255);
            return (gray, gray, gray);
        }

        var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        var p = 2 * l - q;
        var r = HueToRgb(p, q, h / 360 + 1.0 / 3);
        var g = HueToRgb(p, q, h / 360);
        var b = HueToRgb(p, q, h / 360 - 1.0 / 3);

        return (
            (int)Math.Round(Clamp(r) * 255),
            (int)Math.Round(Clamp(g) * 255),
            (int)Math.Round(Clamp(b) * 255));
    }

    private static double HueToRgb(double p, double q, double t)
    {
        if (t < 0) t += 1;
        if (t > 1) t -= 1;
        if (t < 1.0 / 6) return p + (q - p) * 6 * t;
        if (t < 1.0 / 2) return q;
        if (t < 2.0 / 3) return p + (q - p) * (2.0 / 3 - t) * 6;
        return p;
    }
}
