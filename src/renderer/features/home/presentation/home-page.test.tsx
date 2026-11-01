import { render, screen } from "@testing-library/react";
import { IntlProvider } from "use-intl";
import { describe, expect, it } from "vitest";
import messages from "../../../messages/en.json";
import { HomePage } from "./home-page";

describe("HomePage", () => {
  it("renders the translated heading", () => {
    render(
      <IntlProvider locale="en" messages={messages}>
        <HomePage />
      </IntlProvider>,
    );
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(messages.Home.title);
  });
});
