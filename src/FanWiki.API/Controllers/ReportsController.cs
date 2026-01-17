using System.Security.Claims;
using FanWiki.Application.DTOs;
using FanWiki.Infrastructure.Data; 
using FanWiki.Domain.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace FanWiki.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ReportsController(AppDbContext context) : ControllerBase
{
    [HttpPost]
    [Authorize]
    public async Task<IActionResult> Create(CreateReportDto dto)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        
        var report = new Report
        {
            Reason = dto.Reason,
            TargetUrl = dto.TargetUrl,
            SenderId = userId!,
            Status = ReportStatus.Pending,
            CreatedAt = DateTime.UtcNow
        };

        context.Reports.Add(report);
        await context.SaveChangesAsync();

        return Ok(new { message = "Report sent successfully" });
    }

    [HttpGet]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> GetAll()
    {
        var reports = await context.Reports
            .Include(r => r.Sender) 
            .OrderByDescending(r => r.CreatedAt)
            .Select(r => new 
            {
                r.Id,
                r.Reason,
                r.TargetUrl,
                r.Status,
                r.CreatedAt,
                SenderName = r.Sender != null ? r.Sender.UserName : "Unknown"
            })
            .ToListAsync();

        return Ok(reports);
    }

    [HttpPut("{id}/status")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> UpdateStatus(int id, [FromBody] UpdateReportStatusDto dto)
    {
        var report = await context.Reports.FindAsync(id);
        if (report == null) return NotFound();

        report.Status = dto.Status;
        await context.SaveChangesAsync();

        return Ok(new { message = "Status updated" });
    }

    [HttpGet("pending-count")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> GetPendingCount()
    {
        var count = await context.Reports.CountAsync(r => r.Status == ReportStatus.Pending);
        return Ok(count);
    }
}