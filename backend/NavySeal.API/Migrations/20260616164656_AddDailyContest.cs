using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace NavySeal.API.Migrations
{
    /// <inheritdoc />
    public partial class AddDailyContest : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "DailyContests",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    PeriodStartUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    PeriodEndUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    Nomination = table.Column<string>(type: "character varying(64)", maxLength: 64, nullable: false),
                    WinnerSeaLionId = table.Column<Guid>(type: "uuid", nullable: true),
                    FinalizedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_DailyContests", x => x.Id);
                    table.ForeignKey(
                        name: "FK_DailyContests_SeaLions_WinnerSeaLionId",
                        column: x => x.WinnerSeaLionId,
                        principalTable: "SeaLions",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateTable(
                name: "ContestVotes",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    ContestId = table.Column<Guid>(type: "uuid", nullable: false),
                    UserId = table.Column<Guid>(type: "uuid", nullable: false),
                    SeaLionId = table.Column<Guid>(type: "uuid", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ContestVotes", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ContestVotes_DailyContests_ContestId",
                        column: x => x.ContestId,
                        principalTable: "DailyContests",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_ContestVotes_SeaLions_SeaLionId",
                        column: x => x.SeaLionId,
                        principalTable: "SeaLions",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_ContestVotes_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_ContestVotes_ContestId_UserId",
                table: "ContestVotes",
                columns: new[] { "ContestId", "UserId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_ContestVotes_SeaLionId",
                table: "ContestVotes",
                column: "SeaLionId");

            migrationBuilder.CreateIndex(
                name: "IX_ContestVotes_UserId",
                table: "ContestVotes",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_DailyContests_FinalizedAt_PeriodEndUtc",
                table: "DailyContests",
                columns: new[] { "FinalizedAt", "PeriodEndUtc" });

            migrationBuilder.CreateIndex(
                name: "IX_DailyContests_PeriodStartUtc",
                table: "DailyContests",
                column: "PeriodStartUtc",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_DailyContests_WinnerSeaLionId",
                table: "DailyContests",
                column: "WinnerSeaLionId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(name: "ContestVotes");
            migrationBuilder.DropTable(name: "DailyContests");
        }
    }
}
