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
        public async Task<IActionResult> Submit(
            [FromForm] SubmitReimbursementDto dto
        )
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if(userId == null)
            {
                return Unauthorized();
            }
            var result = await _service.SubmitAsync(
                Convert.ToInt32(userId),
                dto
            );
            return Ok(new
            {
                message = result
            });
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
        public async Task<IActionResult> Approve(ReimbursementActionDto dto)
        {
            var result = await _service.ApproveAsync(dto);

            return Ok(new
            {
                message = result
            });
        }

        [Authorize(Roles = "Finance")]
        [HttpPost("reject")]
        public async Task<IActionResult> Reject(ReimbursementActionDto dto)
        {
            var result = await _service.RejectAsync(dto);
            return Ok(new
            {
                message = result
            });
        }
    }
}