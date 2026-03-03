/**
 * 基于 Secret 的字典参数签名验证器
 *
 * 使用 HMAC-SHA256 算法确保参数完整性和真实性
 * 与官方 demo 的 TypeScript 版本逻辑完全一致
 */

import crypto from 'crypto';

export class SignatureValidator {
  /**
   * 初始化验证器
   * @param {string} secret - 密钥字符串
   */
  constructor(secret) {
    if (!secret || secret.trim() === '') {
      throw new Error('Secret 不能为空!');
    }
    this.secret = secret;
  }

  /**
   * 生成签名
   * @param {Object} params - 需要签名的参数对象
   * @param {number|null} timestamp - 时间戳(可选)
   * @param {Set<string>|null} excludeKeys - 需要排除的键集合
   * @returns {string} 签名字符串(十六进制)
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
   * 验证签名是否合法
   * @param {Object} params - 请求参数对象
   * @param {string} signature - 待验证的签名
   * @param {number|null} timestampTolerance - 时间戳容差(秒)
   * @returns {boolean} true: 签名合法, false: 签名非法
   */
  validate(params, signature, timestampTolerance = null) {
    if (timestampTolerance !== null && params.timestamp) {
      if (!this._checkTimestamp(params.timestamp, timestampTolerance)) {
        return false;
      }
    }

    const expectedSign = this.generateSignature(params);

    try {
      // 使用 timingSafeEqual 防止时序攻击
      return crypto.timingSafeEqual(
        Buffer.from(expectedSign),
        Buffer.from(signature)
      );
    } catch (error) {
      console.error('[SignatureValidator] validate error', error);
      return false;
    }
  }

  /**
   * 判断值是否有效(不为空)
   * @private
   */
  _isValidValue(value) {
    if (value === null || value === undefined) return false;
    if (value === '') return false;
    if (typeof value === 'object' && !Array.isArray(value) && Object.keys(value).length === 0) return false;
    if (Array.isArray(value) && value.length === 0) return false;
    return true;
  }

  /**
   * 统一值的字符串表示
   * @private
   */
  _normalizeValue(value) {
    if (typeof value === 'object' && value !== null) {
      return JSON.stringify(this._sortObjectKeys(value));
    }
    return String(value);
  }

  /**
   * 递归排序对象的所有键
   * @private
   */
  _sortObjectKeys(obj) {
    if (typeof obj !== 'object' || obj === null) return obj;
    if (Array.isArray(obj)) {
      return obj.map((item) => this._sortObjectKeys(item));
    }
    return Object.keys(obj)
      .sort()
      .reduce((result, key) => {
        result[key] = this._sortObjectKeys(obj[key]);
        return result;
      }, {});
  }

  /**
   * 构建待签名字符串
   * @private
   */
  _buildSignString(params) {
    const sortedKeys = Object.keys(params).sort();

    const parts = sortedKeys.map((key) => {
      const value = this._normalizeValue(params[key]);
      const encodedKey = encodeURIComponent(key);
      const encodedValue = encodeURIComponent(value);
      return `${encodedKey}=${encodedValue}`;
    });

    return parts.join('&');
  }

  /**
   * 检查时间戳是否在容差范围内
   * @private
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
