using Microsoft.AspNetCore.Mvc;
using NavySeal.API.DTOs;
using NavySeal.API.Services;

namespace NavySeal.API.Controllers;

[ApiController]
[Route("api/users")]
public class UsersController(IUserService userService) : ControllerBase
{
    [HttpGet("search")]
    [ProducesResponseType(typeof(UserSearchResponse), StatusCodes.Status200OK)]
    public async Task<IActionResult> Search([FromQuery] string q, [FromQuery] int limit = 8, CancellationToken ct = default)
    {
        var items = await userService.SearchAsync(q, limit, ct);
        return Ok(new UserSearchResponse(items));
    }

    [HttpGet("{username}")]
    [ProducesResponseType(typeof(PublicUserProfileDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetProfile(
        string username,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = Pagination.DefaultPageSize,
        CancellationToken ct = default)
    {
        var profile = await userService.GetPublicProfileAsync(username, page, pageSize, ct);
        return profile is null ? NotFound() : Ok(profile);
    }
}
