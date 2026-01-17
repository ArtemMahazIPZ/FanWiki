using System.ComponentModel.DataAnnotations;

namespace FanWiki.Domain.Entities;

public enum ReportStatus
{
    Pending = 0, 
    Approved = 1, 
    Rejected = 2  
}

public class Report
{
    public int Id { get; set; }

    [Required]
    public string Reason { get; set; } = string.Empty; 

    public string? TargetUrl { get; set; } 

    public ReportStatus Status { get; set; } = ReportStatus.Pending;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    
    public string SenderId { get; set; } = string.Empty;
    public ApplicationUser? Sender { get; set; }
}