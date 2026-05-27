using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using TravelMgmtApi.DTOs;
using TravelMgmtApi.Interfaces;

namespace TravelMgmtApi.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly IAuthService _authService;

        public AuthController(IAuthService authService)
        {
            _authService = authService;
        }

        //Register Api
        [HttpPost("register")]
        public async Task<IActionResult>Register(RegisterDto registerDto)
        {
            var result = await _authService.RegisterAsync(registerDto);
            return Ok(new
            {
                message = result
            });
        }

        //Login Api
        [HttpPost("login")]
        public async Task<IActionResult> Login(LoginDto dto)
        {
            try
            {
                var result = await _authService.LoginAsync(dto);

                if(result == null)
                {
                    return BadRequest(
                        new {
                            message="Invalid email or password"
                        });
                }
                return Ok(result);
            }

            catch(Exception ex)
            {
                return BadRequest(
                    new {
                        message=ex.Message
                    });
            }
        }

        [Authorize(Roles="Admin")]
        [HttpGet("users")]
        public async Task<IActionResult> GetUsers()
        {
            var result = await _authService.GetAllUsersAsync();
            return Ok(result);
        }

        //Change Password Api
        [Authorize]
        [HttpPost("change-password")]
        public async Task<IActionResult> ChangePassword(ChangePasswordDto changePasswordDto)
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            if (userIdClaim == null)
            {
                return Unauthorized(new { message = "Invalid token" });
            }

            var userId = int.Parse(userIdClaim.Value);
            var result = await _authService.ChangePasswordAsync(userId, changePasswordDto);

            if (result == "Current password is incorrect")
            {
                return BadRequest(new { message = result });
            }

            if (result == "User not found")
            {
                return NotFound(new { message = result });
            }

            return Ok(new { message = result });
        }

        [Authorize(Roles ="Admin")]
        [HttpPut("admin/update/{id}")]
        public async Task<IActionResult> UpdateUser(int id,AdminUpdateUserDto dto)
        {
            var result = await _authService.AdminUpdateUserAsync(id,dto);
            return Ok(new {message=result});
        }

        [Authorize(Roles ="Admin")]
        [HttpPost("policy")]
        public async Task<IActionResult>
        AddPolicy(CreatePolicyDto dto)
        {
            var result = await _authService.AddPolicyAsync(dto);

            return Ok(
                new { message=result }
            );
        }

        [Authorize(Roles="Admin")]
        [HttpGet("policy")]
        public async Task<IActionResult>GetPolicies()
        {
            return Ok(
                await _authService
                .GetAllPoliciesAsync()
            );
        }

        [Authorize(Roles="Admin")]
        [HttpPut("policy/{id}")]
        public async Task<IActionResult>UpdatePolicy(int id, UpdatePolicyDto dto)
        {
            var result =await _authService.UpdatePolicyAsync(id, dto);

            return Ok(
                new {message=result}
            );
        }
    }
}