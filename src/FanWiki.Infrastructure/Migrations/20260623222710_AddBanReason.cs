using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace FanWiki.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddBanReason : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "BanReason",
                table: "AspNetUsers",
                type: "text",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "BanReason",
                table: "AspNetUsers");
        }
    }
}
