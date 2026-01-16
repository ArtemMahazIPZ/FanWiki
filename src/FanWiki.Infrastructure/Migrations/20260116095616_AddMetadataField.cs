using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace FanWiki.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddMetadataField : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Metadata",
                table: "Articles",
                type: "text",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Metadata",
                table: "Articles");
        }
    }
}
