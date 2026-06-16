using System.Net;
using System.Text;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;
using NavySeal.API.Configuration;
using NavySeal.API.Services;

namespace NavySeal.API.Controllers;

[Controller]
[Route("share")]
public class ShareController(
    ISeaLionService seaLionService,
    IOptions<AppSettings> appSettings,
    IConfiguration configuration) : Controller
{
    [HttpGet("sealions/{id:guid}")]
    [ResponseCache(Duration = 300, Location = ResponseCacheLocation.Any)]
    public async Task<IActionResult> SeaLion(Guid id, CancellationToken ct)
    {
        var seaLion = await seaLionService.GetByIdAsync(id, null, ct);
        if (seaLion is null)
            return NotFound();

        var app = appSettings.Value;
        var apiBase = configuration["App:PublicApiUrl"]?.TrimEnd('/')
            ?? $"{Request.Scheme}://{Request.Host}";
        var frontendBase = app.PublicFrontendUrl.TrimEnd('/');
        var shareUrl = $"{apiBase}/share/sealions/{id}";
        var pageUrl = $"{frontendBase}/sealions/{id}";
        var imageUrl = $"{apiBase}/api/sealions/{id}/og-image";
        var title = $"{seaLion.Metadata.Name} — Navy Seal";
        var description = BuildDescription(seaLion.Metadata.Quality, seaLion.AverageRating, seaLion.RatingCount);

        var html = $"""
            <!DOCTYPE html>
            <html lang="ru">
            <head>
              <meta charset="utf-8" />
              <title>{WebUtility.HtmlEncode(title)}</title>
              <meta name="description" content="{WebUtility.HtmlEncode(description)}" />
              <meta property="og:type" content="website" />
              <meta property="og:site_name" content="Navy Seal" />
              <meta property="og:title" content="{WebUtility.HtmlEncode(seaLion.Metadata.Name)}" />
              <meta property="og:description" content="{WebUtility.HtmlEncode(description)}" />
              <meta property="og:image" content="{WebUtility.HtmlEncode(imageUrl)}" />
              <meta property="og:image:width" content="1200" />
              <meta property="og:image:height" content="630" />
              <meta property="og:url" content="{WebUtility.HtmlEncode(shareUrl)}" />
              <meta name="twitter:card" content="summary_large_image" />
              <meta name="twitter:title" content="{WebUtility.HtmlEncode(seaLion.Metadata.Name)}" />
              <meta name="twitter:description" content="{WebUtility.HtmlEncode(description)}" />
              <meta name="twitter:image" content="{WebUtility.HtmlEncode(imageUrl)}" />
              <meta http-equiv="refresh" content="0;url={WebUtility.HtmlEncode(pageUrl)}" />
            </head>
            <body>
              <p><a href="{WebUtility.HtmlEncode(pageUrl)}">{WebUtility.HtmlEncode(seaLion.Metadata.Name)}</a></p>
            </body>
            </html>
            """;

        return Content(html, "text/html; charset=utf-8", Encoding.UTF8);
    }

    private static string BuildDescription(string quality, double? averageRating, int ratingCount)
    {
        var qualityLabel = quality.ToLowerInvariant() switch
        {
            "uncommon" => "необычный",
            "rare" => "редкий",
            "epic" => "эпический",
            "legendary" => "легендарный",
            _ => "обычный",
        };

        if (ratingCount > 0 && averageRating is not null)
        {
            return $"Морской котик ({qualityLabel}) — рейтинг {averageRating.Value:0.0} из 5 ({ratingCount} оценок). Navy Seal.";
        }

        return $"Морской котик ({qualityLabel}). Сгенерирован в Navy Seal.";
    }
}
