using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using NavySeal.API.DTOs;
using NavySeal.API.Services;

namespace NavySeal.API.Controllers;

[ApiController]
[Route("api/contests")]
public class ContestsController(IContestService contestService) : ControllerBase
{
    [HttpGet("daily")]
    [ProducesResponseType(typeof(DailyContestDto), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetDaily(CancellationToken ct)
    {
        var contest = await contestService.GetDailyContestAsync(GetUserId(), ct);
        return Ok(contest);
    }

    [Authorize]
    [HttpPost("daily/vote")]
    [ProducesResponseType(typeof(CastContestVoteResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> Vote([FromBody] CastContestVoteRequest request, CancellationToken ct)
    {
        var userId = GetUserId();
        if (userId is null)
            return Unauthorized();

        try
        {
            var response = await contestService.VoteAsync(userId.Value, request.SeaLionId, ct);
            return Ok(response);
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    private Guid? GetUserId()
    {
        var claim = User.FindFirstValue(ClaimTypes.NameIdentifier);
        return Guid.TryParse(claim, out var id) ? id : null;
    }
}
