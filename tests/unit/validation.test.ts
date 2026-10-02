import { describe, it, expect } from "vitest";
import { contactSchema, signupSchema } from "../../src/lib/validation/forms";
import { detailSchema, productSchema } from "../../src/lib/api/mappers";
import { products } from "../../src/data/products";
describe("request and adapter validation", () => {
  const valid = {
    name: "Test Member",
    company: "Test Company",
    email: "test@example.com",
    phone: "9812345678",
    type: "General enquiry",
    location: "Kathmandu",
    message: "Please advise on a treatment system.",
  };
  it("accepts complete enquiries and rejects malformed email, short and oversized messages", () => {
    expect(contactSchema.safeParse(valid).success).toBe(true);
    expect(
      contactSchema.safeParse({ ...valid, email: "invalid" }).success,
    ).toBe(false);
    expect(contactSchema.safeParse({ ...valid, message: "hi" }).success).toBe(
      false,
    );
    expect(
      contactSchema.safeParse({ ...valid, message: "x".repeat(3001) }).success,
    ).toBe(false);
  });
  it("requires terms acceptance and a business identity for signup", () => {
    const account = {
      email: "test@example.com",
      password: "test-password",
      fullName: "Test Person",
      company: "Test Company",
      phone: "9812345678",
      businessType: "Business",
      location: "Kathmandu",
      terms: true,
    };
    expect(signupSchema.safeParse(account).success).toBe(true);
    expect(signupSchema.safeParse({ ...account, terms: false }).success).toBe(
      false,
    );
    expect(signupSchema.safeParse({ ...account, company: "" }).success).toBe(
      false,
    );
  });
  it("validates product contract and rejects missing details and unsafe slugs", () => {
    expect(productSchema.array().parse(products)).toHaveLength(6);
    expect(
      productSchema.safeParse({ ...products[0], slug: "../admin" }).success,
    ).toBe(false);
    expect(
      detailSchema.safeParse({
        description: "Invalid incomplete upstream response",
      }).success,
    ).toBe(false);
  });
});
