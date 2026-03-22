using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Scorpanion.DAL.Migrations
{
    /// <inheritdoc />
    public partial class ChangePlayer_RefGame : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_players_boardgames_BoardGameId",
                table: "players");

            migrationBuilder.DropForeignKey(
                name: "FK_players_games_GameId",
                table: "players");

            migrationBuilder.DropIndex(
                name: "IX_players_BoardGameId",
                table: "players");

            migrationBuilder.DropColumn(
                name: "BoardGameId",
                table: "players");

            migrationBuilder.AlterColumn<Guid>(
                name: "GameId",
                table: "players",
                type: "uuid",
                nullable: false,
                defaultValue: Guid.NewGuid(),
                oldClrType: typeof(Guid),
                oldType: "uuid",
                oldNullable: true);

            migrationBuilder.AddForeignKey(
                name: "FK_players_games_GameId",
                table: "players",
                column: "GameId",
                principalTable: "games",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_players_games_GameId",
                table: "players");

            migrationBuilder.AlterColumn<Guid>(
                name: "GameId",
                table: "players",
                type: "uuid",
                nullable: true,
                oldClrType: typeof(Guid),
                oldType: "uuid");

            migrationBuilder.AddColumn<Guid>(
                name: "BoardGameId",
                table: "players",
                type: "uuid",
                nullable: false,
                defaultValue: Guid.NewGuid());

            migrationBuilder.CreateIndex(
                name: "IX_players_BoardGameId",
                table: "players",
                column: "BoardGameId");

            migrationBuilder.AddForeignKey(
                name: "FK_players_boardgames_BoardGameId",
                table: "players",
                column: "BoardGameId",
                principalTable: "boardgames",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_players_games_GameId",
                table: "players",
                column: "GameId",
                principalTable: "games",
                principalColumn: "Id");
        }
    }
}
