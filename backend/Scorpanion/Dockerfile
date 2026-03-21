FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

COPY ["Scorpanion.sln", "./"]
COPY ["Scorpanion.API/Scorpanion.API.csproj", "Scorpanion.API/"]
COPY ["Scorpanion.DAL/Scorpanion.DAL.csproj", "Scorpanion.DAL/"]
RUN dotnet restore "Scorpanion.sln"

COPY . .
RUN dotnet publish "Scorpanion.API/Scorpanion.API.csproj" -c Release -o /app/publish /p:UseAppHost=false

FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS final
WORKDIR /app

COPY --from=build /app/publish .

ENV ASPNETCORE_URLS=http://+:8080
EXPOSE 8080

ENTRYPOINT ["dotnet", "Scorpanion.API.dll"]
