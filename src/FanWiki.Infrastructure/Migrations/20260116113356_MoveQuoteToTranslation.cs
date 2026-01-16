using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace FanWiki.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class MoveQuoteToTranslation : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Quote",
                table: "ArticleTranslations",
                type: "text",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Quote",
                table: "ArticleTranslations");
        }
    }
}
