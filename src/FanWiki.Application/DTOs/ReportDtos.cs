using FanWiki.Domain.Entities;

namespace FanWiki.Application.DTOs;

public class CreateReportDto
{
    public required string Reason { get; set; }
    public required string TargetUrl { get; set; }
}

public class UpdateReportStatusDto
{
    public ReportStatus Status { get; set; }
}