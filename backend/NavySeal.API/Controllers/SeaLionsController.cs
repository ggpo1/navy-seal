using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using NavySeal.API.DTOs;
using NavySeal.API.Models;
using NavySeal.API.Services;

namespace NavySeal.API.Controllers;

[ApiController]
[Route("api/sealions")]
public class SeaLionsController(ISeaLionService seaLionService) : ControllerBase
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
    public async Task<IActionResult> GetRecent([FromQuery] int limit = 12, CancellationToken ct = default)
    {
        var items = await seaLionService.GetRecentAsync(limit, ct);
        return Ok(new SeaLionListResponse(items));
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

    private Guid? GetUserId()
    {
        var claim = User.FindFirstValue(ClaimTypes.NameIdentifier);
        return Guid.TryParse(claim, out var id) ? id : null;
    }
}
