using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Scorpanion.DAL.Migrations
{
    /// <inheritdoc />
    public partial class AddPlayerResult : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "player_results",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false, defaultValue: Guid.NewGuid()),
                    GameResultId = table.Column<Guid>(type: "uuid", nullable: false),
                    PlayerId = table.Column<Guid>(type: "uuid", nullable: false),
                    FinalScore = table.Column<int>(type: "integer", nullable: false),
                    HasWon = table.Column<bool>(type: "boolean", nullable: false),
                    Rank = table.Column<int>(type: "integer", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValue: DateTime.UtcNow),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_player_results", x => x.Id);
                    table.ForeignKey(
                        name: "FK_player_results_game_results_GameResultId",
                        column: x => x.GameResultId,
                        principalTable: "game_results",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_player_results_players_PlayerId",
                        column: x => x.PlayerId,
                        principalTable: "players",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_player_results_GameResultId",
                table: "player_results",
                column: "GameResultId");

            migrationBuilder.CreateIndex(
                name: "IX_player_results_PlayerId",
                table: "player_results",
                column: "PlayerId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "player_results");
        }
    }
}
