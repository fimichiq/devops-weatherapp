import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi, beforeEach } from "vitest";

import Home from "./home";
import { getWeatherForCity } from "../../features/weather/api";

vi.mock("../../features/weather/api", () => {
  return {
    getWeatherForCity: vi.fn(),
  };
});

const mockedGetWeatherForCity = vi.mocked(getWeatherForCity);

describe("Home", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("shows validation error when city is empty", async () => {
    render(<Home />);

    const submitButton = screen.getByRole("button", { name: "Get Weather" });
    await userEvent.click(submitButton);

    expect(screen.getByText("Please enter a city name.")).toBeInTheDocument();
    expect(mockedGetWeatherForCity).not.toHaveBeenCalled();
  });

  it("fetches and renders weather data on success", async () => {
    mockedGetWeatherForCity.mockResolvedValue({
      city: "Berlin",
      temperature: 20,
      summary: "Sunny",
    });

    render(<Home />);

    await userEvent.type(screen.getByLabelText("City"), "Berlin");
    await userEvent.click(screen.getByRole("button", { name: "Get Weather" }));

    await waitFor(() => {
      expect(mockedGetWeatherForCity).toHaveBeenCalledWith("Berlin");
    });

    expect(screen.getByRole("heading", { name: "Berlin" })).toBeInTheDocument();
    expect(screen.getByText("Temperature: 20°C")).toBeInTheDocument();
    expect(screen.getByText("Summary: Sunny")).toBeInTheDocument();
  });

  it("shows fetch error when request fails", async () => {
    mockedGetWeatherForCity.mockRejectedValue(new Error("boom"));

    render(<Home />);

    await userEvent.type(screen.getByLabelText("City"), "Berlin");
    await userEvent.click(screen.getByRole("button", { name: "Get Weather" }));

    expect(
      await screen.findByText("Could not fetch weather for that city. Please try again.")
    ).toBeInTheDocument();
  });
});
