import axios from "axios";
import { describe, expect, it, vi, beforeEach } from "vitest";

import { getWeatherForCity } from "./index";

vi.mock("axios", () => {
  return {
    default: {
      get: vi.fn(),
    },
  };
});

const mockedAxios = vi.mocked(axios, true);

describe("getWeatherForCity", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("maps backend payload into weather shape", async () => {
    mockedAxios.get.mockResolvedValue({
      data: {
        city: "Berlin",
        temperature: 18.5,
        summary: "Cloudy",
      },
    });

    const weather = await getWeatherForCity("Berlin");

    expect(mockedAxios.get).toHaveBeenCalledWith("http://localhost:8000/api/weather", {
      params: { city: "Berlin" },
    });
    expect(weather).toEqual({
      city: "Berlin",
      temperature: 18.5,
      summary: "Cloudy",
    });
  });

  it("rethrows errors from axios", async () => {
    mockedAxios.get.mockRejectedValue(new Error("network error"));

    await expect(getWeatherForCity("Berlin")).rejects.toThrow("network error");
  });
});
