using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using ElectionVotingSystem.Models;
using ElectionVotingSystem.Services;
using ElectionVotingSystem.Hubs;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.OpenApi.Models;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.AspNetCore.RateLimiting;
using System.Threading.RateLimiting;
using Microsoft.AspNetCore.Builder;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowReactApp", policy =>
    {
        policy.WithOrigins("http://localhost:3000")
              .AllowAnyMethod()
              .AllowAnyHeader()
              .AllowCredentials();
    });
});

builder.Services.AddDbContext<ElectionContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection"))
           .EnableSensitiveDataLogging(builder.Environment.IsDevelopment()));

builder.Services.AddIdentity<IdentityUser, IdentityRole>(options =>
{
    options.Password.RequireDigit = true;
    options.Password.RequiredLength = 8;
    options.Password.RequireNonAlphanumeric = true;
    options.SignIn.RequireConfirmedEmail = true;
}).AddEntityFrameworkStores<ElectionContext>()
  .AddDefaultTokenProviders();

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
}).AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer = builder.Configuration["Jwt:Issuer"],
        ValidAudience = builder.Configuration["Jwt:Audience"],
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(builder.Configuration["Jwt:Key"]))
    };
    options.Events = new JwtBearerEvents
    {
        OnAuthenticationFailed = context =>
        {
            var logger = context.HttpContext.RequestServices.GetRequiredService<ILogger<Program>>();
            logger.LogError("Authentication failed: {Error}", context.Exception.Message);
            return Task.CompletedTask;
        }
    };
});

builder.Services.AddSignalR();
builder.Services.AddControllers();
builder.Services.AddScoped<IAuthService>(provider =>
    new AuthService(
        provider.GetRequiredService<UserManager<IdentityUser>>(),
        provider.GetRequiredService<RoleManager<IdentityRole>>(),
        provider.GetRequiredService<IConfiguration>(),
        provider.GetRequiredService<ElectionContext>(),
        provider.GetRequiredService<ILogger<AuthService>>()
    ));

builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo { Title = "Election Voting System API", Version = "v1" });
    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Name = "Authorization",
        Type = SecuritySchemeType.Http,
        Scheme = "Bearer",
        BearerFormat = "JWT",
        In = ParameterLocation.Header,
        Description = "JWT Authorization header using the Bearer scheme. Example: \"Bearer {token}\""
    });
    c.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference { Type = ReferenceType.SecurityScheme, Id = "Bearer" }
            },
            Array.Empty<string>()
        }
    });
});

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddLogging(logging => logging.AddConsole());
builder.Services.AddRateLimiter(_ => _
    .AddFixedWindowLimiter(policyName: "fixed", options =>
    {
        options.PermitLimit = 100;
        options.Window = TimeSpan.FromMinutes(1);
        options.QueueProcessingOrder = QueueProcessingOrder.OldestFirst;
        options.QueueLimit = 10;
    }));

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(c => c.SwaggerEndpoint("/swagger/v1/swagger.json", "Election Voting System API V1"));
}
else
{
    app.UseHsts();
}

app.UseHttpsRedirection();
app.UseCors("AllowReactApp");
app.UseAuthentication();
app.UseAuthorization();
app.UseRateLimiter();
app.MapControllers();
app.MapHub<ElectionHub>("/electionHub");

using var scope = app.Services.CreateScope();
var services = scope.ServiceProvider;
try
{
    var logger = services.GetRequiredService<ILogger<Program>>();
    var roleManager = services.GetRequiredService<RoleManager<IdentityRole>>();
    var userManager = services.GetRequiredService<UserManager<IdentityUser>>();
    var context = services.GetRequiredService<ElectionContext>();

    await context.Database.MigrateAsync();
    logger.LogInformation("Database migrations applied successfully.");

    var roles = new[] { "Admin", "Official", "Voter" };
    foreach (var role in roles)
    {
        if (!await roleManager.RoleExistsAsync(role))
        {
            logger.LogInformation("Creating role: {Role}", role);
            var result = await roleManager.CreateAsync(new IdentityRole(role));
            if (!result.Succeeded)
                logger.LogError("Failed to create role {Role}: {Errors}", role, string.Join(", ", result.Errors));
        }
    }

    var adminEmail = builder.Configuration["Admin:Email"] ?? "admin@electionvoting.com";
    var adminPassword = builder.Configuration["Admin:Password"] ?? "Admin123!";
    var adminUser = await userManager.FindByEmailAsync(adminEmail);
    if (adminUser == null)
    {
        logger.LogInformation("Creating admin user: {Email}", adminEmail);
        adminUser = new IdentityUser { UserName = "admin", Email = adminEmail, EmailConfirmed = true };
        var result = await userManager.CreateAsync(adminUser, adminPassword);
        if (result.Succeeded)
        {
            await userManager.AddToRoleAsync(adminUser, "Admin");
            logger.LogInformation("Admin user created successfully: {Email}", adminEmail);
        }
        else
        {
            logger.LogError("Failed to create admin user: {Errors}", string.Join(", ", result.Errors));
        }
    }

    int retryCount = 0;
    const int maxRetries = 3;
    while (retryCount < maxRetries)
    {
        try
        {
            if (!await context.PoliticalParties.AnyAsync())
            {
                context.PoliticalParties.Add(new PoliticalParty
                {
                    PartyID = 1,
                    PartyName = "Default Party",
                    PartyLogo = "default_logo.png",
                    Description = "A default political party for testing purposes.",
                    ValidFrom = DateTime.Now,
                    ValidUntil = DateTime.MaxValue
                });
                await context.SaveChangesAsync();
                logger.LogInformation("Seeded default political party with logo and description.");
            }

            if (!await context.Elections.AnyAsync())
            {
                context.Elections.Add(new Election
                {
                    ElectionID = 1,
                    Name = "2025 General Election",
                    Description = "A general election for 2025.",
                    VotingStartTime = DateTime.Now.AddDays(-1), // Start in past
                    VotingEndTime = DateTime.Now.AddDays(7),   // End in future
                    Status = "Active",                         // Set to Active
                    ValidFrom = DateTime.Now,
                    ValidUntil = DateTime.MaxValue
                });
                await context.SaveChangesAsync();
                logger.LogInformation("Seeded default active election.");
            }

            if (!await context.Candidates.AnyAsync())
            {
                context.Candidates.Add(new Candidate
                {
                    CandidateID = 1,
                    FirstName = "John",
                    LastName = "Doe",
                    PartyID = 1,        // Matches seeded party
                    ElectionID = 1,     // Matches seeded election
                    ValidFrom = DateTime.Now,
                    ValidUntil = DateTime.MaxValue
                });
                await context.SaveChangesAsync();
                logger.LogInformation("Seeded default candidate.");
            }

            break;
        }
        catch (Exception ex)
        {
            retryCount++;
            logger.LogWarning(ex, "Seeding attempt {RetryCount} of {MaxRetries} failed. Details: {Message}", retryCount, maxRetries, ex.Message);
            if (retryCount == maxRetries)
            {
                logger.LogError(ex, "Failed to seed database after {MaxRetries} attempts. Details: {Message}", maxRetries, ex.Message);
                throw; // Re-throw to stop application if seeding fails after retries
            }
            await Task.Delay(1000);
        }
    }
}
catch (Exception ex)
{
    var logger = services.GetRequiredService<ILogger<Program>>();
    logger.LogError(ex, "An error occurred during seeding. Details: {Message}", ex.Message);
}

app.Run();