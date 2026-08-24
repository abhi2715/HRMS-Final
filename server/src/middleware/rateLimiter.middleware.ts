import rateLimit from 'express-rate-limit';

const isTest = process.env.NODE_ENV === 'test' || process.env.NODE_ENV === 'development';

// Global API Limiter: 100 requests per 15 minutes per IP
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: isTest ? 0 : 100, // Disable in tests (0 means unlimited if a bypass function isn't used, but actually we should just set skip)
  skip: () => isTest,
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again after 15 minutes',
  },
});

// Auth API Limiter: 100 requests per 15 minutes per IP (Brute-force protection)
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: isTest ? 0 : 100, // Limit each IP to 100 requests per `window`
  skip: () => isTest,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many login attempts from this IP, please try again after 15 minutes',
  },
});
