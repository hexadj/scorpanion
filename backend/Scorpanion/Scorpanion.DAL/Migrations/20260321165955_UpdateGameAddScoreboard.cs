using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Scorpanion.DAL.Migrations
{
    /// <inheritdoc />
    public partial class UpdateGameAddScoreboard : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<Guid>(
                name: "ScoreboardId",
                table: "games",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.CreateIndex(
                name: "IX_games_ScoreboardId",
                table: "games",
                column: "ScoreboardId");

            migrationBuilder.AddForeignKey(
                name: "FK_games_scoreboards_ScoreboardId",
                table: "games",
                column: "ScoreboardId",
                principalTable: "scoreboards",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_games_scoreboards_ScoreboardId",
                table: "games");

            migrationBuilder.DropIndex(
                name: "IX_games_ScoreboardId",
                table: "games");

            migrationBuilder.DropColumn(
                name: "ScoreboardId",
                table: "games");
        }
    }
}
