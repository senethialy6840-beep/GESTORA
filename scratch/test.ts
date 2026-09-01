import { authRateLimit } from "../lib/rateLimit";

try {
  const { isRateLimited } = authRateLimit.check(5, "test@test.com");
  console.log("Success! isRateLimited:", isRateLimited);
} catch (error) {
  console.error("Error in rateLimit:", error);
}
