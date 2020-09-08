import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from "vitest";
import App from "../App";

describe("example test", () => {
  it("should pass", () => {
    expect(true).toBe(true);
  });
});

describe("app test", () => {
  it("captures the button and clicks it", async () => {
    render(<App />);
    const button = screen.getByText("count is 0");
    expect(button).toBeInTheDocument();
    await fireEvent.click(button);  // You will find await useful when you trigger events
    expect(button).toHaveTextContent("count is 1");
  });

  it("captures the logos and renders them", () => {
    render(<App />);
    expect(screen.getByText('Vite + React')).toBeInTheDocument();
  });
});
