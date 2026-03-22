using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Scorpanion.DAL.Migrations
{
    /// <inheritdoc />
    public partial class ChangeGame_NullableScoreboard : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_games_scoreboards_ScoreboardId",
                table: "games");

            migrationBuilder.AlterColumn<Guid>(
                name: "ScoreboardId",
                table: "games",
                type: "uuid",
                nullable: true,
                oldClrType: typeof(Guid),
                oldType: "uuid");

            migrationBuilder.AddForeignKey(
                name: "FK_games_scoreboards_ScoreboardId",
                table: "games",
                column: "ScoreboardId",
                principalTable: "scoreboards",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_games_scoreboards_ScoreboardId",
                table: "games");

            migrationBuilder.AlterColumn<Guid>(
                name: "ScoreboardId",
                table: "games",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"),
                oldClrType: typeof(Guid),
                oldType: "uuid",
                oldNullable: true);

            migrationBuilder.AddForeignKey(
                name: "FK_games_scoreboards_ScoreboardId",
                table: "games",
                column: "ScoreboardId",
                principalTable: "scoreboards",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
