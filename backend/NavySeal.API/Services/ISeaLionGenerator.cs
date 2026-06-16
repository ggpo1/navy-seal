using NavySeal.API.Models;

namespace NavySeal.API.Services;

public interface ISeaLionGenerator
{
    SeaLionMetadata Generate();
}
