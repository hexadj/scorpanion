using Microsoft.EntityFrameworkCore;
using Scorpanion.API;
using Scorpanion.DAL.Context;
using Scorpanion.DAL.Extensions;

var builder = WebApplication.CreateBuilder(args);

// Ajout des services DAL 
builder.Services.AddDataAccessLayer(builder.Configuration);

// Add services to the container.
// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services.AddControllers();

var app = builder.Build();

app.Services.GetService<ScorpanionDbContext>()?.Database.Migrate();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();
app.MapControllers();

app.Run();