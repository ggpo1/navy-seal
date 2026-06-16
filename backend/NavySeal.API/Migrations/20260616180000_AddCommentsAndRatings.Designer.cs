using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;
using NavySeal.API.Data;

#nullable disable

namespace NavySeal.API.Migrations
{
    [DbContext(typeof(AppDbContext))]
    [Migration("20260616180000_AddCommentsAndRatings")]
    partial class AddCommentsAndRatings
    {
    }
}
