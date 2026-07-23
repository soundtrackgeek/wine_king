import { describe, expect, it, vi } from "vitest";
import { saveThenInstall } from "./updateManager";

describe("update installation safety", () => {
  it("saves the active game before installation starts", async () => {
    const order: string[] = [];
    await saveThenInstall(
      async () => { order.push("save"); },
      async () => { order.push("install"); },
    );
    expect(order).toEqual(["save", "install"]);
  });

  it("does not install when the automatic save fails", async () => {
    const install = vi.fn();
    await expect(
      saveThenInstall(
        async () => { throw new Error("Save failed"); },
        install,
      ),
    ).rejects.toThrow("Save failed");
    expect(install).not.toHaveBeenCalled();
  });
});
