using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt; 
using System.Security.Claims;
using System.Text;
using TravelMgmtApi.Data;
using TravelMgmtApi.DTOs;
using TravelMgmtApi.Helpers;
using TravelMgmtApi.Interfaces;
using TravelMgmtApi.Models;

namespace TravelMgmtApi.Services
{
    public class AuthService : IAuthService
    {
        private readonly IAuthRepository _authRepository;
        private readonly IConfiguration _configuration;

        public AuthService(IAuthRepository authRepository, IConfiguration configuration)
        {
            _authRepository = authRepository;
            _configuration = configuration;
        }

        //Register
        public async Task<string> RegisterAsync(RegisterDto registerDto)
        {
            var existingUser =
                await _authRepository.GetUserByEmailAsync(registerDto.Email);

            if (existingUser != null)
            {
                return "Email already exists";
            }

            int? managerId = null;

            // For Employee, PM, Manager roles, Department is required
            if(registerDto.RoleId == 2 || registerDto.RoleId == 3 || registerDto.RoleId == 5)  
            {
                if(!registerDto.DepartmentId.HasValue)
                {
                    return "Department required";
                }

                var department =
                    await _authRepository.GetDepartmentAsync(
                        registerDto.DepartmentId.Value
                    );

                if(department == null)
                {
                    return "Department not found";
                }

                // ONLY Employee + PM
                if(registerDto.RoleId == 2 ||
                registerDto.RoleId == 5)
                {
                    managerId = department.ManagerId;
                }
            }
            var user = new User
            {
                UserName = registerDto.UserName,
                Email = registerDto.Email,
                PasswordHash =
                    PasswordHelper.HashPassword(registerDto.Password),

                RoleId = registerDto.RoleId,

                DepartmentId = registerDto.DepartmentId,

                ManagerId = managerId
            };

            await _authRepository.AddUserAsync(user);

            return "User registered successfully";
        }

        //Login
        public async Task<AuthResponseDto?> LoginAsync(LoginDto loginDto)
        {
            var hashedPassword = PasswordHelper.HashPassword(loginDto.Password);

            var user = await _authRepository
                .LoginUserAsync(
                    loginDto.Email,
                    hashedPassword
                );
            if(user == null)
            {
                return null;
            }

            // NEW
            if(!user.IsActive)
            {
                throw new Exception(
                    "Your account is inactive. Please contact administrator."
                );
            }

            var token = GenerateJwtToken(user);

            return new AuthResponseDto
            {
                Token = token,
                Email = user.Email,
                Role = user.Role?.Name ?? "",
                UserName = user.UserName
            };
        }

        //All User 
        public async Task<List<UserResponseDto>> GetAllUsersAsync()
        {
            return await _authRepository.GetAllUsersAsync();
        }

        //Generate JWT token
        private string GenerateJwtToken(User user)
        {
            var claims = new[]
            {
                new Claim(ClaimTypes.NameIdentifier, user.UserId.ToString()),
                new Claim(ClaimTypes.Name, user.UserName),
                new Claim(ClaimTypes.Email, user.Email),
                new Claim(ClaimTypes.Role, user.Role?.Name ?? "")
            };

            var key = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(
                    _configuration["Jwt:Key"]!
                )
            );

            var creds = new SigningCredentials(
                key,
                SecurityAlgorithms.HmacSha256
            );

            var token = new JwtSecurityToken(
                issuer: _configuration["Jwt:Issuer"],
                audience: _configuration["Jwt:Audience"],
                claims: claims,
                expires: DateTime.Now.AddMinutes(
                    Convert.ToDouble(_configuration["Jwt:DurationInMinutes"]
                )
            ),
            signingCredentials: creds
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }

        // Change Password
        public async Task<string> ChangePasswordAsync(int userId, ChangePasswordDto changePasswordDto)
        {
            var user = await _authRepository.GetUserByIdAsync(userId);
            if (user == null)
            {
                return "User not found";
            }

            var currentHashedPassword = PasswordHelper.HashPassword(changePasswordDto.CurrentPassword);
            if (user.PasswordHash != currentHashedPassword)
            {
                return "Current password is incorrect";
            }

            user.PasswordHash = PasswordHelper.HashPassword(changePasswordDto.NewPassword);
            await _authRepository.UpdateUserAsync(user);

            return "Password changed successfully";
        }

        public async Task<string> AdminUpdateUserAsync(int userId, AdminUpdateUserDto dto)
        {
            var user = await _authRepository.GetUserByIdAsync(userId);

            if(user == null)
            {
                return "User not found";
            }

            user.UserName = dto.UserName;
            user.Email = dto.Email;
            user.RoleId = dto.RoleId;
            user.DepartmentId = dto.DepartmentId;

            // Change password only if admin entered one
            if(!string.IsNullOrWhiteSpace(dto.Password))
            {
                user.PasswordHash = PasswordHelper.HashPassword(dto.Password);
            }

            // Employee + PM auto manager mapping
            if(dto.RoleId == 2 || dto.RoleId == 5)
            {
                if(dto.DepartmentId.HasValue)
                {
                    var department =
                        await _authRepository.GetDepartmentAsync(
                            dto.DepartmentId.Value
                        );

                    user.ManagerId = department?.ManagerId;
                }
            }
            else
            {
                // Manager / Finance / Admin
                user.ManagerId = null;
            }

            await _authRepository.SaveChangesAsync();

            return "User updated successfully";
        }
    }
}