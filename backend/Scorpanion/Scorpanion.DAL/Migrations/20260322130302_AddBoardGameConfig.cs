using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Scorpanion.DAL.Migrations
{
    /// <inheritdoc />
    public partial class AddBoardGameConfig : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "board_game_configs",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false, defaultValue: Guid.NewGuid()),
                    Name = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    PlayerCount = table.Column<int>(type: "integer", nullable: false),
                    RoundCount = table.Column<int>(type: "integer", nullable: true),
                    WinType = table.Column<string>(type: "text", nullable: false),
                    IsTemporary = table.Column<bool>(type: "boolean", nullable: false),
                    BoardGameId = table.Column<Guid>(type: "uuid", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValue: DateTime.UtcNow),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_board_game_configs", x => x.Id);
                    table.ForeignKey(
                        name: "FK_board_game_configs_boardgames_BoardGameId",
                        column: x => x.BoardGameId,
                        principalTable: "boardgames",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_board_game_configs_BoardGameId",
                table: "board_game_configs",
                column: "BoardGameId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "board_game_configs");
        }
    }
}
