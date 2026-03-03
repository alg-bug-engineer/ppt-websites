/**
 * Dictionary parameter signature validator based on Secret
 *
 * Uses HMAC-SHA256 algorithm to ensure parameter integrity and authenticity
 * Strictly follows the logic of the official demo
 */

import crypto from 'crypto';

export class SignatureValidator {
  /**
   * Initialize validator
   * @param {string} secret - Secret string
   */
  constructor(secret) {
    if (!secret || secret.trim() === '') {
      throw new Error('Secret cannot be empty!');
    }
    this.secret = secret;
  }

  /**
   * Generate signature
   * @param {Object} params - Parameter object to sign
   * @param {number|null} timestamp - Timestamp (optional)
   * @param {Set<string>|null} excludeKeys - Keys to exclude
   * @returns {string} Signature string (hex)
   */
  generateSignature(params, timestamp = null, excludeKeys = null) {
    const finalExcludeKeys = excludeKeys || new Set(['sign', 'signature']);
    const filteredParams = {};

    for (const [key, value] of Object.entries(params)) {
      if (!finalExcludeKeys.has(key) && this._isValidValue(value)) {
        filteredParams[key] = value;
      }
    }

    if (timestamp !== null) {
      filteredParams.timestamp = timestamp;
    }

    const signString = this._buildSignString(filteredParams);

    return crypto
      .createHmac('sha256', this.secret)
      .update(signString)
      .digest('hex');
  }

  /**
   * Validate if signature is legal
   * @param {Object} params - Request parameter object
   * @param {string} signature - Signature to validate
   * @param {number|null} timestampTolerance - Timestamp tolerance (seconds)
   * @returns {boolean} true: valid, false: invalid
   */
  validate(params, signature, timestampTolerance = null) {
    if (timestampTolerance !== null && params.timestamp) {
      if (!this._checkTimestamp(params.timestamp, timestampTolerance)) {
        return false;
      }
    }

    const expectedSign = this.generateSignature(params);

    try {
      // Use timingSafeEqual to prevent timing attacks
      return crypto.timingSafeEqual(
        Buffer.from(expectedSign),
        Buffer.from(signature)
      );
    } catch (error) {
      return false;
    }
  }

  /**
   * Check if value is valid (not empty)
   */
  _isValidValue(value) {
    if (value === null || value === undefined) return false;
    if (value === '') return false;
    if (typeof value === 'object' && !Array.isArray(value) && Object.keys(value).length === 0) return false;
    if (Array.isArray(value) && value.length === 0) return false;
    return true;
  }

  /**
   * Normalize value to string representation
   */
  _normalizeValue(value) {
    if (typeof value === 'object' && value !== null) {
      return JSON.stringify(this._sortObjectKeys(value));
    }
    return String(value);
  }

  /**
   * Recursively sort all keys of an object
   */
  _sortObjectKeys(obj) {
    if (typeof obj !== 'object' || obj === null) return obj;
    if (Array.isArray(obj)) return obj.map((item) => this._sortObjectKeys(item));
    return Object.keys(obj)
      .sort()
      .reduce((result, key) => {
        result[key] = this._sortObjectKeys(obj[key]);
        return result;
      }, {});
  }

  /**
   * Build string to be signed
   */
  _buildSignString(params) {
    const sortedKeys = Object.keys(params).sort();
    const parts = sortedKeys.map((key) => {
      const value = this._normalizeValue(params[key]);
      // Ensure spaces are encoded as '+' to match Python's quote_plus and 302.ai rules
      const encodedKey = encodeURIComponent(key).replace(/%20/g, '+');
      const encodedValue = encodeURIComponent(value).replace(/%20/g, '+');
      return `${encodedKey}=${encodedValue}`;
    });
    return parts.join('&');
  }

  /**
   * Check if timestamp is within tolerance
   */
  _checkTimestamp(timestamp, tolerance) {
    try {
      const ts = typeof timestamp === 'number' ? timestamp : parseInt(String(timestamp), 10);
      if (isNaN(ts)) return false;
      const currentTime = Math.floor(Date.now() / 1000);
      return Math.abs(currentTime - ts) <= tolerance;
    } catch (error) {
      return false;
    }
  }
}
