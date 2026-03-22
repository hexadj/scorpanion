using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Scorpanion.DAL.Migrations
{
    /// <inheritdoc />
    public partial class AddGameBoardGameConfigFk : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<Guid>(
                name: "BoardGameConfigId",
                table: "games",
                type: "uuid",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_games_BoardGameConfigId",
                table: "games",
                column: "BoardGameConfigId");

            migrationBuilder.AddForeignKey(
                name: "FK_games_board_game_configs_BoardGameConfigId",
                table: "games",
                column: "BoardGameConfigId",
                principalTable: "board_game_configs",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_games_board_game_configs_BoardGameConfigId",
                table: "games");

            migrationBuilder.DropIndex(
                name: "IX_games_BoardGameConfigId",
                table: "games");

            migrationBuilder.DropColumn(
                name: "BoardGameConfigId",
                table: "games");
        }
    }
}
