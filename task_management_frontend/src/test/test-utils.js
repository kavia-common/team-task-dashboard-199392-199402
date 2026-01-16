import React from "react";
import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

/**
 * Test utilities for rendering components with common app providers.
 *
 * Note: Auth is mocked in individual tests via `jest.mock("../context/AuthContext")`.
 */

// PUBLIC_INTERFACE
export function renderWithProviders(ui, { route = "/tasks" } = {}) {
  /** Render helper that wraps UI in a MemoryRouter with a configurable initial route. */
  return render(<MemoryRouter initialEntries={[route]}>{ui}</MemoryRouter>);
}
