using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using TravelMgmtApi.DTOs;
using TravelMgmtApi.Interfaces;
using System.Security.Claims;
using TravelMgmtApi.Models;

namespace TravelMgmtApi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class ReimbursementController : ControllerBase
    {
        private readonly IReimbursementService _service;
        public ReimbursementController(IReimbursementService service)
        {
            _service = service;
        }

        [HttpPost("submit")]
        public async Task<IActionResult> Submit([FromBody] SubmitReimbursementDto dto)
        {
            var employeeId = int .Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
            var result = await _service.SubmitAsync(employeeId, dto);
            return Ok(result);
        }

        [Authorize(Roles = "Finance")]
        [HttpGet("finance")]
        public async Task<IActionResult>GetFinanceRequests()
        {
            return Ok(
                await _service.GetFinanceRequestsAsync()
            );
        }

        [HttpGet("my")]
        public async Task<IActionResult>GetMine()
        {
            var employeeId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

            return Ok(await _service.GetMyReimbursementsAsync(employeeId));
        }

        [Authorize(Roles = "Finance")]
        [HttpPost("approve")]
        public async Task<IActionResult>Approve([FromBody] ReimbursementActionDto dto)
        {
            return Ok(await _service.ApproveAsync(dto));
        }

        [Authorize(Roles = "Finance")]
        [HttpPost("reject")]
        public async Task<IActionResult>Reject([FromBody] ReimbursementActionDto dto)
        {
            return Ok(await _service.RejectAsync(dto));
        }
    }
}