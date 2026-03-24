using Microsoft.EntityFrameworkCore;
using Scorpanion.BLL.Extensions;
using Scorpanion.DAL.Context;
using Scorpanion.DAL.Extensions;

const string corsPolicyName = "ScorpanionCors";

var builder = WebApplication.CreateBuilder(args);

// Ajout des services DAL 
builder.Services.AddDataAccessLayer(builder.Configuration);
builder.Services.AddBusinessLayer();

var corsOrigins = builder.Configuration.GetSection("Cors:AllowedOrigins").Get<string[]>() ?? Array.Empty<string>();
builder.Services.AddCors(options =>
{
    options.AddPolicy(corsPolicyName, policy =>
    {
        if (corsOrigins.Length > 0)
            policy.WithOrigins(corsOrigins).AllowAnyHeader().AllowAnyMethod();
        else
            policy.AllowAnyOrigin().AllowAnyHeader().AllowAnyMethod();
    });
});

// Add services to the container.
// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services.AddControllers();

var app = builder.Build();

// Migration automatique de la base de données
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetService<ScorpanionDbContext>()?.Database;
    db?.Migrate();
    Console.WriteLine("Vérification des migrations effectuées");
}

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();
app.UseCors(corsPolicyName);
app.MapControllers();

app.Run();