using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Scorpanion.DAL.Migrations
{
    /// <inheritdoc />
    public partial class AddRound : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "rounds",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false, defaultValue: Guid.NewGuid()),
                    Number = table.Column<int>(type: "integer", nullable: false),
                    PlayerId = table.Column<Guid>(type: "uuid", nullable: false),
                    Score = table.Column<int>(type: "integer", nullable: false),
                    GameId = table.Column<Guid>(type: "uuid", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValue: DateTime.UtcNow),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_rounds", x => x.Id);
                    table.ForeignKey(
                        name: "FK_rounds_games_GameId",
                        column: x => x.GameId,
                        principalTable: "games",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_rounds_players_PlayerId",
                        column: x => x.PlayerId,
                        principalTable: "players",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_rounds_GameId",
                table: "rounds",
                column: "GameId");

            migrationBuilder.CreateIndex(
                name: "IX_rounds_PlayerId",
                table: "rounds",
                column: "PlayerId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "rounds");
        }
    }
}
