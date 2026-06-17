using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using NavySeal.API.DTOs;
using NavySeal.API.Models;
using NavySeal.API.Services;

namespace NavySeal.API.Controllers;

[ApiController]
[Route("api/sealions")]
public class SeaLionsController(
    ISeaLionService seaLionService,
    ICommentService commentService,
    IRatingService ratingService) : ControllerBase
{
    [Authorize]
    [HttpPost("generate")]
    [ProducesResponseType(typeof(SeaLionDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> Generate(
        [FromBody] GenerateSeaLionRequest? request,
        CancellationToken ct)
    {
        var userId = GetUserId();
        if (userId is null)
            return Unauthorized();

        if (request?.Quality is not null && !SeaLionGenerator.IsValidQuality(request.Quality))
            return BadRequest(new { message = "Недопустимое качество. Допустимые значения: common, uncommon, rare, epic, legendary." });

        if (request?.Age is int age && (age < 0 || age > 20))
            return BadRequest(new { message = "Возраст должен быть от 0 до 20 лет." });

        var options = request is null
            ? null
            : new SeaLionGenerationOptions(request.Quality, request.Age);

        var seaLion = await seaLionService.GenerateAsync(userId.Value, options, ct);
        return Ok(seaLion);
    }

    [HttpGet("recent")]
    [ProducesResponseType(typeof(SeaLionListResponse), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetRecent(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = Pagination.DefaultPageSize,
        CancellationToken ct = default)
    {
        var result = await seaLionService.GetRecentAsync(page, pageSize, ct);
        return Ok(new SeaLionListResponse(result.Items, result.Total, result.Page, result.PageSize));
    }

    [HttpGet("top")]
    [ProducesResponseType(typeof(SeaLionListResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> GetTop(
        [FromQuery] string period = SeaLionTopPeriods.All,
        [FromQuery] int limit = 12,
        [FromQuery] int minRatings = 1,
        CancellationToken ct = default)
    {
        if (!SeaLionTopPeriods.IsValid(period))
            return BadRequest(new { message = "Период должен быть week или all." });

        try
        {
            var items = await seaLionService.GetTopAsync(period, limit, minRatings, ct);
            return Ok(new SeaLionListResponse(items));
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [Authorize]
    [HttpGet("my")]
    [ProducesResponseType(typeof(SeaLionListResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> GetMy(CancellationToken ct)
    {
        var userId = GetUserId();
        if (userId is null)
            return Unauthorized();

        var items = await seaLionService.GetByUserAsync(userId.Value, ct);
        return Ok(new SeaLionListResponse(items));
    }

    [Authorize]
    [HttpGet("discover")]
    [ProducesResponseType(typeof(SeaLionListResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> GetDiscover(
        [FromQuery] int limit = 20,
        CancellationToken ct = default)
    {
        var userId = GetUserId();
        if (userId is null)
            return Unauthorized();

        var result = await seaLionService.GetDiscoverAsync(userId.Value, limit, ct);
        return Ok(new SeaLionListResponse(result.Items, result.Total, result.Page, result.PageSize));
    }

    [HttpGet("{id:guid}")]
    [ProducesResponseType(typeof(SeaLionDetailDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetById(Guid id, CancellationToken ct)
    {
        var seaLion = await seaLionService.GetByIdAsync(id, GetUserId(), ct);
        return seaLion is null ? NotFound() : Ok(seaLion);
    }

    [HttpGet("{id:guid}/og-image")]
    [ResponseCache(Duration = 3600, Location = ResponseCacheLocation.Any)]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetOgImage(Guid id, CancellationToken ct)
    {
        var seaLion = await seaLionService.GetByIdAsync(id, null, ct);
        if (seaLion is null)
            return NotFound();

        var png = SeaLionOgImageGenerator.Generate(
            seaLion.Metadata,
            seaLion.AverageRating,
            seaLion.RatingCount);

        return File(png, "image/png");
    }

    [HttpGet("{id:guid}/comments")]
    [ProducesResponseType(typeof(CommentListResponse), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetComments(Guid id, CancellationToken ct)
    {
        var items = await commentService.GetBySeaLionAsync(id, ct);
        return Ok(new CommentListResponse(items));
    }

    [Authorize]
    [HttpPost("{id:guid}/comments")]
    [ProducesResponseType(typeof(CommentDto), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> CreateComment(
        Guid id,
        [FromBody] CreateCommentRequest request,
        CancellationToken ct)
    {
        var userId = GetUserId();
        if (userId is null)
            return Unauthorized();

        try
        {
            var comment = await commentService.CreateAsync(userId.Value, id, request.Text, ct);
            return CreatedAtAction(nameof(GetComments), new { id }, comment);
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
        catch (InvalidOperationException ex)
        {
            return NotFound(new { message = ex.Message });
        }
    }

    [Authorize]
    [HttpPut("{id:guid}/rating")]
    [ProducesResponseType(typeof(RatingSummaryDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> UpsertRating(
        Guid id,
        [FromBody] UpsertRatingRequest request,
        CancellationToken ct)
    {
        var userId = GetUserId();
        if (userId is null)
            return Unauthorized();

        try
        {
            var summary = await ratingService.UpsertAsync(userId.Value, id, request.Value, ct);
            return Ok(summary);
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
        catch (InvalidOperationException ex)
        {
            return NotFound(new { message = ex.Message });
        }
    }

    [Authorize]
    [HttpDelete("{id:guid}/rating")]
    [ProducesResponseType(typeof(RatingSummaryDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> RemoveRating(Guid id, CancellationToken ct)
    {
        var userId = GetUserId();
        if (userId is null)
            return Unauthorized();

        var summary = await ratingService.RemoveAsync(userId.Value, id, ct);
        return summary is null ? NotFound() : Ok(summary);
    }

    private Guid? GetUserId()
    {
        var claim = User.FindFirstValue(ClaimTypes.NameIdentifier);
        return Guid.TryParse(claim, out var id) ? id : null;
    }
}
