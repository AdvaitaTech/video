import { describe, test, expect } from "vitest";
import { Position } from "./Position";
import { render } from "@testing-library/react";

describe("Position", () => {
  test("should render position if in bounds", () => {
    let position = { left: 50, top: 50, width: 100, height: 100 };
    let screen = { left: 0, top: 0, width: 1000, height: 1000 };
    const { container } = render(<Position screen={screen} {...position} />);
    expect(container.firstChild).toHaveStyle("left: 50px");
  });

  test("should not render position if out of bounds", () => {
    let position = { left: -20, top: -20, width: 10, height: 10 };
    let screen = { left: 0, top: 0, width: 1000, height: 1000 };
    const { container } = render(<Position screen={screen} {...position} />);
    expect(container.firstChild).toBeFalsy();
  });
});
