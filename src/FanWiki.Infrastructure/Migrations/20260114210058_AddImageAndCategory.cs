using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace FanWiki.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddImageAndCategory : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "Category",
                table: "Articles",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<string>(
                name: "ImageUrl",
                table: "Articles",
                type: "text",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Category",
                table: "Articles");

            migrationBuilder.DropColumn(
                name: "ImageUrl",
                table: "Articles");
        }
    }
}
