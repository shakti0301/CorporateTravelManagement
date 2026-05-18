using Microsoft.AspNetCore.Mvc;
using TravelMgmtApi.Interfaces;

namespace TravelMgmtApi.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class UserController : ControllerBase
    {
        private readonly IUserService _userService;
        public UserController(IUserService userService)
        {
            _userService = userService;
        }

        [HttpGet("projectmanagers")]
        public async Task<IActionResult> GetProjectManagers()
        {
            var result = await _userService.GetProjectManagerAsync();
            return Ok(result);
        }
    }
}