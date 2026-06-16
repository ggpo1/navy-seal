using System.Globalization;
using NavySeal.API.Models;
using SixLabors.Fonts;
using SixLabors.ImageSharp;
using SixLabors.ImageSharp.Drawing;
using SixLabors.ImageSharp.Drawing.Processing;
using SixLabors.ImageSharp.PixelFormats;
using SixLabors.ImageSharp.Processing;

namespace NavySeal.API.Services;

public static class SeaLionOgImageGenerator
{
    private const int Width = 1200;
    private const int Height = 630;

    public static byte[] Generate(SeaLionMetadata metadata, double? averageRating, int ratingCount)
    {
        using var image = new Image<Rgba32>(Width, Height);

        var bgPrimary = ParseColor(metadata.BackgroundColor);
        var bgSecondary = ParseColor(
            metadata.BackgroundColorSecondary
            ?? metadata.BackgroundAccentColor
            ?? metadata.BackgroundColor);
        var bodyColor = ParseColor(metadata.BodyColor);
        var bellyColor = ParseColor(metadata.BellyColor);

        image.Mutate(ctx =>
        {
            var gradient = new LinearGradientBrush(
                new PointF(0, 0),
                new PointF(Width, Height),
                GradientRepetitionMode.None,
                new ColorStop(0f, bgPrimary),
                new ColorStop(1f, bgSecondary));

            ctx.Fill(gradient, new RectangleF(0, 0, Width, Height));
            DrawSealPreview(ctx, bodyColor, bellyColor);
            DrawFooter(ctx, metadata.Name, metadata.Quality, averageRating, ratingCount);
            DrawBranding(ctx);
        });

        using var stream = new MemoryStream();
        image.SaveAsPng(stream);
        return stream.ToArray();
    }

    private static void DrawSealPreview(IImageProcessingContext ctx, Color bodyColor, Color bellyColor)
    {
        var centerX = Width * 0.38f;
        var centerY = Height * 0.46f;

        ctx.Fill(bodyColor, new EllipsePolygon(centerX - 90, centerY + 10, 170, 95));
        ctx.Fill(bellyColor, new EllipsePolygon(centerX - 35, centerY + 25, 95, 70));
        ctx.Fill(bodyColor, new EllipsePolygon(centerX + 55, centerY - 55, 78, 72));
        ctx.Fill(bellyColor, new EllipsePolygon(centerX + 88, centerY - 35, 42, 34));
        ctx.Fill(Color.FromRgba(44, 24, 16, 255), new EllipsePolygon(centerX + 108, centerY - 38, 12, 9));
        ctx.Fill(Color.White, new EllipsePolygon(centerX + 72, centerY - 62, 10, 10));
        ctx.Fill(Color.White, new EllipsePolygon(centerX + 98, centerY - 60, 10, 10));
        ctx.Fill(Color.FromRgba(26, 26, 26, 255), new EllipsePolygon(centerX + 74, centerY - 60, 5, 5));
        ctx.Fill(Color.FromRgba(26, 26, 26, 255), new EllipsePolygon(centerX + 100, centerY - 58, 5, 5));
    }

    private static void DrawFooter(
        IImageProcessingContext ctx,
        string name,
        string quality,
        double? averageRating,
        int ratingCount)
    {
        var overlay = Color.FromRgba(26, 58, 74, 210);
        ctx.Fill(overlay, new RectangleF(0, Height - 170, Width, 170));

        var titleFont = ResolveFont(64, FontStyle.Bold);
        var subtitleFont = ResolveFont(30, FontStyle.Regular);
        var brandFont = ResolveFont(24, FontStyle.Bold);

        var titleOptions = new RichTextOptions(titleFont)
        {
            Origin = new PointF(48, Height - 138),
            HorizontalAlignment = HorizontalAlignment.Left,
            WrappingLength = Width - 96,
        };

        ctx.DrawText(titleOptions, name, Color.White);

        var qualityLabel = FormatQuality(quality);
        var ratingLabel = ratingCount > 0 && averageRating is not null
            ? $"★ {averageRating.Value.ToString("0.0", CultureInfo.InvariantCulture)} ({ratingCount})"
            : "★ —";

        var subtitleOptions = new RichTextOptions(subtitleFont)
        {
            Origin = new PointF(48, Height - 62),
            HorizontalAlignment = HorizontalAlignment.Left,
        };

        ctx.DrawText(subtitleOptions, $"{qualityLabel} · {ratingLabel}", Color.FromRgba(220, 235, 245, 255));

        var brandOptions = new RichTextOptions(brandFont)
        {
            Origin = new PointF(Width - 48, Height - 52),
            HorizontalAlignment = HorizontalAlignment.Right,
        };

        ctx.DrawText(brandOptions, "Navy Seal", Color.FromRgba(78, 205, 196, 255));
    }

    private static void DrawBranding(IImageProcessingContext ctx)
    {
        var badgeFont = ResolveFont(22, FontStyle.Bold);
        var badgeOptions = new RichTextOptions(badgeFont)
        {
            Origin = new PointF(48, 36),
            HorizontalAlignment = HorizontalAlignment.Left,
        };

        ctx.Fill(
            Color.FromRgba(26, 58, 74, 180),
            new RectangleF(36, 24, 170, 42));
        ctx.DrawText(badgeOptions, "🦭 Navy Seal", Color.White);
    }

    private static Font ResolveFont(float size, FontStyle style)
    {
        foreach (var familyName in new[] { "Arial", "Helvetica Neue", "Helvetica", "DejaVu Sans", "Liberation Sans" })
        {
            if (SystemFonts.TryGet(familyName, out var family))
                return family.CreateFont(size, style);
        }

        return SystemFonts.Families.First().CreateFont(size, style);
    }

    private static string FormatQuality(string quality) =>
        quality.ToLowerInvariant() switch
        {
            "uncommon" => "Uncommon",
            "rare" => "Rare",
            "epic" => "Epic",
            "legendary" => "Legendary",
            _ => "Common",
        };

    private static Color ParseColor(string hex)
    {
        if (string.IsNullOrWhiteSpace(hex))
            return Color.FromRgba(135, 206, 235, 255);

        var normalized = hex.TrimStart('#');
        if (normalized.Length != 6)
            return Color.FromRgba(135, 206, 235, 255);

        if (!byte.TryParse(normalized[..2], NumberStyles.HexNumber, CultureInfo.InvariantCulture, out var r)
            || !byte.TryParse(normalized[2..4], NumberStyles.HexNumber, CultureInfo.InvariantCulture, out var g)
            || !byte.TryParse(normalized[4..6], NumberStyles.HexNumber, CultureInfo.InvariantCulture, out var b))
        {
            return Color.FromRgba(135, 206, 235, 255);
        }

        return Color.FromRgba(r, g, b, 255);
    }
}
