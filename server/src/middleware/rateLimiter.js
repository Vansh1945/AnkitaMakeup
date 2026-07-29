/**
 * Lightweight in-memory rate limiter middleware
 * Protects endpoints without requiring external third-party dependencies.
 */
const createRateLimiter = ({ windowMs = 15 * 60 * 1000, max = 100, message = 'Too many requests, please try again later.' }) => {
  const requests = new Map();

  // Periodic cleanup of expired rate limit entries every 5 minutes
  setInterval(() => {
    const now = Date.now();
    for (const [ip, data] of requests.entries()) {
      if (now - data.startTime > windowMs) {
        requests.delete(ip);
      }
    }
  }, 5 * 60 * 1000).unref(); // unref prevents timer from blocking Node process exit

  return (req, res, next) => {
    const ip = req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown';
    const now = Date.now();

    let record = requests.get(ip);

    if (!record || (now - record.startTime > windowMs)) {
      record = { count: 1, startTime: now };
      requests.set(ip, record);
      return next();
    }

    record.count += 1;

    if (record.count > max) {
      res.status(429);
      return next(new Error(message));
    }

    next();
  };
};

// General API rate limiter (300 requests per 15 minutes)
const generalLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 300,
  message: 'Too many requests from this IP, please try again after 15 minutes.'
});

// Strict rate limiter for sensitive write operations (login, contact, booking, reviews)
const sensitiveLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: 'Too many submission attempts from this IP. Please wait 15 minutes before trying again.'
});

module.exports = {
  generalLimiter,
  sensitiveLimiter,
  createRateLimiter,
};
