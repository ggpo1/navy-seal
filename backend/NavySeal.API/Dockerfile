FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

COPY backend/NavySeal.API/NavySeal.API.csproj backend/NavySeal.API/
RUN dotnet restore backend/NavySeal.API/NavySeal.API.csproj

COPY backend/NavySeal.API/ backend/NavySeal.API/
RUN dotnet publish backend/NavySeal.API/NavySeal.API.csproj -c Release -o /app/publish /p:UseAppHost=false

FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS final
WORKDIR /app

ENV ASPNETCORE_URLS=http://+:8080
EXPOSE 8080

COPY --from=build /app/publish .
ENTRYPOINT ["dotnet", "NavySeal.API.dll"]
