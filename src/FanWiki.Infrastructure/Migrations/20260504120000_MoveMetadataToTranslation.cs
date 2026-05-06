using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace FanWiki.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class MoveMetadataToTranslation : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Metadata",
                table: "ArticleTranslations",
                type: "text",
                nullable: true);

            // Copy existing metadata from Articles to all their translations
            migrationBuilder.Sql(
                """
                UPDATE "ArticleTranslations" AS t
                SET "Metadata" = a."Metadata"
                FROM "Articles" AS a
                WHERE t."ArticleId" = a."Id" AND a."Metadata" IS NOT NULL
                """);

            migrationBuilder.DropColumn(
                name: "Metadata",
                table: "Articles");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Metadata",
                table: "Articles",
                type: "text",
                nullable: true);

            // Copy metadata back from the first translation of each article
            migrationBuilder.Sql(
                """
                UPDATE "Articles" AS a
                SET "Metadata" = t."Metadata"
                FROM (
                    SELECT DISTINCT ON ("ArticleId") "ArticleId", "Metadata"
                    FROM "ArticleTranslations"
                    WHERE "Metadata" IS NOT NULL
                    ORDER BY "ArticleId", "CreatedAt"
                ) AS t
                WHERE a."Id" = t."ArticleId"
                """);

            migrationBuilder.DropColumn(
                name: "Metadata",
                table: "ArticleTranslations");
        }
    }
}
