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

        [HttpPut("draft/{id}")]
       public async Task <IActionResult> UpdateDraft(int id, CreateTravelRequestDto dto)
        {
            var result = await _travelService.UpdateDraftAsync(id, dto);
            return Ok(new
            {
                message = result
            });
        } 

        [HttpPost("submit/{id}")]
        public async Task<IActionResult> SubmitDraft(int id)
        {
            var result = await _travelService.SubmitDraftAsync(id);
            return Ok(new
            {
                message = result
            });
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteRequest(int id)
        {
            var result = await _travelService.DeleteRequestAsync(id);
            return Ok(new
            {
                message = result
            });
        }

        [HttpPut("cancel/{id}")]
        public async Task<IActionResult> CancelRequest(int id)
        {
            var result = await _travelService.CancelRequestAsync(id);
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

        //Draft Requests
        [HttpGet("drafts")]
        public async Task<IActionResult> GetDrafts()
        {
            var userId = User.FindFirst(
                ClaimTypes.NameIdentifier
            )?.Value;

            if(userId==null)
            {
                return Unauthorized();
            }

            var result =
                await _travelService
                .GetDraftRequestsAsync(
                    Convert.ToInt32(userId)
                );

            return Ok(result);
        }

        //Get by id
        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var request = await _travelService.GetByIdAsync(id);
            if(request == null)
            {
                return NotFound();
            }
            return Ok(request);
        }

        //All PM Requests
        [HttpGet("all/pm")]
        public async Task<IActionResult>GetPMRequests()
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            var result = await _travelService.GetPMRequestsAsync(Convert.ToInt32(userId));
            return Ok(result);
        }

        //Pending PM Requests
        [HttpGet("pending/pm")]
        public async Task<IActionResult> GetPendingPMRequests()
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (userId == null)
            {
                return Unauthorized();
            }
            var result = await _travelService.GetPendingPMRequestsAsync(Convert.ToInt32(userId));
            return Ok(result);
        }

        //All Manager Requests
        [HttpGet("all/manager")]
        public async Task<IActionResult>GetManagerRequests()
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            var result = await _travelService.GetManagerRequestsAsync(Convert.ToInt32(userId));
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

        //All Finance Requests
        [HttpGet("all/finance")]
        public async Task<IActionResult>GetFinanceRequests()
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            if(userId==null)
            {
                return Unauthorized();
            }

            var result = await _travelService.GetFinanceRequestsAsync(Convert.ToInt32(userId));
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

        [HttpPost("itinerary")]
        public async Task<IActionResult> SaveItinerary(CreateItineraryDto dto)
        {
            var result = await _travelService.SaveItineraryAsync(dto);
            return Ok(new
            {
                message = result
            });
        }
    }
}