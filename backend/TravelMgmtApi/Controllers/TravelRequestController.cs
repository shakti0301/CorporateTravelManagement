using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TravelMgmtApi.DTOs;
using TravelMgmtApi.Interfaces;

namespace TravelMgmtApi.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class TravelRequestController : ControllerBase
    {
        private readonly ITravelRequestService _travelService;

        public TravelRequestController(ITravelRequestService travelService)
        {
            _travelService = travelService;
        }

        //Create Travel Request
        [HttpPost]
        public async Task<IActionResult> CreateRequest(CreateTravelRequestDto dto)
        {
            //Get user id from token
            var userId = User.FindFirst(
                ClaimTypes.NameIdentifier
                )?.Value;
            if (userId == null)           
            {
                return Unauthorized();
            }

            var result = await _travelService.CreateRequestAsync(Convert.ToInt32(userId), dto);
            return Ok(new
            {
                message = result
            });
        }

        //My Requests
        [HttpGet("my")]
        public async Task<IActionResult> GetMyRequests()
        {
            //Get user id from token
            var userId = User.FindFirst(
                ClaimTypes.NameIdentifier
                )?.Value;
            if (userId == null)
            {
                return Unauthorized();
            }

            var result = await _travelService.GetMyRequestsAsync(Convert.ToInt32(userId));
            return Ok(result);
        }

        //Pending Manager Requests
        [HttpGet("pending/manager")]
        public async Task<IActionResult> GetPendingManagerRequests()
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (userId == null)            
            {
                return Unauthorized();
            }
            var result = await _travelService.GetPendingManagerRequestsAsync(Convert.ToInt32(userId));
            return Ok(result);
        }

    
        // Pending Finance Requests

        [HttpGet("pending/finance")]
        public async Task<IActionResult> GetPendingFinanceRequests()
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            if(userId==null)
            {
                return Unauthorized();
            }

            var result=
                await _travelService
                .GetPendingFinanceRequestsAsync(
                    Convert.ToInt32(userId)
                );

            return Ok(result);
        }

        //Approve or Reject Request
        [HttpPost("approve")]
        public async Task<IActionResult> ApproveOrReject(ApprovalActionDto dto)
        {
            var userId = User.FindFirst(
                ClaimTypes.NameIdentifier
                )?.Value;
            
            if (userId == null)
            {
                return Unauthorized();
            }

            var result = await _travelService.ApproveOrRejectAsync(Convert.ToInt32(userId), dto);
            return Ok(new
            {
                message = result
            });
        }
    }
}