using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Scorpanion.DAL.Migrations
{
    /// <inheritdoc />
    public partial class AddBaseEntitiesDefaultValues : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<DateTime>(
                name: "CreatedAt",
                table: "users",
                defaultValue: DateTime.UtcNow);

            migrationBuilder.AlterColumn<DateTime>(
                name: "CreatedAt",
                table: "scoreboards",
                defaultValue: DateTime.UtcNow);

            migrationBuilder.AlterColumn<DateTime>(
                name: "CreatedAt",
                table: "players",
                defaultValue: DateTime.UtcNow);

            migrationBuilder.AlterColumn<DateTime>(
                name: "CreatedAt",
                table: "games",
                defaultValue: DateTime.UtcNow);

            migrationBuilder.AlterColumn<DateTime>(
                name: "CreatedAt",
                table: "game_results",
                defaultValue: DateTime.UtcNow);

            migrationBuilder.AlterColumn<DateTime>(
                name: "CreatedAt",
                table: "boardgames",
                defaultValue: DateTime.UtcNow);
            
            
            migrationBuilder.AlterColumn<Guid>(
                name: "Id",
                table: "users",
                defaultValue: Guid.NewGuid());

            migrationBuilder.AlterColumn<Guid>(
                name: "Id",
                table: "scoreboards",
                defaultValue: Guid.NewGuid());

            migrationBuilder.AlterColumn<Guid>(
                name: "Id",
                table: "players",
                defaultValue: Guid.NewGuid());

            migrationBuilder.AlterColumn<Guid>(
                name: "Id",
                table: "games",
                defaultValue: Guid.NewGuid());

            migrationBuilder.AlterColumn<Guid>(
                name: "Id",
                table: "game_results",
                defaultValue: Guid.NewGuid());

            migrationBuilder.AlterColumn<Guid>(
                name: "Id",
                table: "boardgames",
                defaultValue: Guid.NewGuid());
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
    
            migrationBuilder.AlterColumn<DateTime>(
                name: "CreatedAt",
                table: "users",
                defaultValue: null);

            migrationBuilder.AlterColumn<DateTime>(
                name: "CreatedAt",
                table: "scoreboards",
                defaultValue: null);

            migrationBuilder.AlterColumn<DateTime>(
                name: "CreatedAt",
                table: "players",
                defaultValue: null);

            migrationBuilder.AlterColumn<DateTime>(
                name: "CreatedAt",
                table: "games",
                defaultValue: null);

            migrationBuilder.AlterColumn<DateTime>(
                name: "CreatedAt",
                table: "game_results",
                defaultValue: null);

            migrationBuilder.AlterColumn<DateTime>(
                name: "CreatedAt",
                table: "boardgames",
                defaultValue: null);
            migrationBuilder.AlterColumn<Guid>(
                name: "Id",
                table: "users",
                defaultValue: null);

            migrationBuilder.AlterColumn<Guid>(
                name: "Id",
                table: "scoreboards",
                defaultValue: null);

            migrationBuilder.AlterColumn<Guid>(
                name: "Id",
                table: "players",
                defaultValue: null);

            migrationBuilder.AlterColumn<Guid>(
                name: "Id",
                table: "games",
                defaultValue: null);

            migrationBuilder.AlterColumn<Guid>(
                name: "Id",
                table: "game_results",
                defaultValueSql: "");

            migrationBuilder.AlterColumn<Guid>(
                name: "Id",
                table: "boardgames",
                defaultValue: null);
        }
    }
}
