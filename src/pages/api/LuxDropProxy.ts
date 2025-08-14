import { DateTime } from 'luxon';
import axios from 'axios';
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Enhanced logging for debugging
  const logDebug = (message: string, data?: any) => {
    console.log(`[LuxDropProxy DEBUG] ${message}`, data ? JSON.stringify(data, null, 2) : '');
  };

  const logError = (message: string, data?: any) => {
    console.error(`[LuxDropProxy ERROR] ${message}`, data ? JSON.stringify(data, null, 2) : '');
  };

  logDebug('API request started', { 
    method: req.method, 
    timestamp: new Date().toISOString(),
    userAgent: req.headers['user-agent'],
    ip: req.headers['x-forwarded-for'] || req.socket.remoteAddress
  });

  try {
    const API_URL = process.env.BASE_LUXDROP_API_URL as string;
    const PRIVATE_KEY = process.env.PRIVATE_KEY_LUXDROP as string;

    // Enhanced environment variable validation
    logDebug('Environment variable validation', {
      API_URL_exists: !!API_URL,
      API_URL_length: API_URL?.length || 0,
      PRIVATE_KEY_exists: !!PRIVATE_KEY,
      PRIVATE_KEY_length: PRIVATE_KEY?.length || 0,
      NODE_ENV: process.env.NODE_ENV
    });

    if (!API_URL || !PRIVATE_KEY) {
      logError('Missing required environment variables', {
        API_URL_missing: !API_URL,
        PRIVATE_KEY_missing: !PRIVATE_KEY,
        available_env_vars: Object.keys(process.env).filter(key => key.includes('LUXDROP'))
      });
      return res.status(500).json({ error: "Missing BASE_LUXDROP_API_URL or PRIVATE_KEY_LUXDROP in environment variables" });
    }

    // Fixed date range: 28/07 to 31/08 (July 28th to August 31st)
    const afterDate = "2025-07-28";
    const beforeDate = "2025-08-31";

    const afterTimestamp = Math.floor(DateTime.fromISO(afterDate, { zone: 'Europe/Amsterdam' }).toSeconds());
    const beforeTimestamp = Math.floor(DateTime.fromISO(beforeDate, { zone: 'Europe/Amsterdam' }).toSeconds());

    logDebug('Date range configuration', {
      afterDate,
      beforeDate,
      afterTimestamp,
      beforeTimestamp,
      timezone: 'Europe/Amsterdam',
      current_time: DateTime.now().setZone('Europe/Amsterdam').toISO()
    });

    // Use query parameters for GET request
    const urlWithParams = `${API_URL}?start_timestamp=${afterTimestamp}&end_timestamp=${beforeTimestamp}`;
    const config = {
      method: 'get',
      url: urlWithParams,
      headers: {
        'Content-Type': 'application/json',
        'X-Private-Key': PRIVATE_KEY,
      },
      maxBodyLength: Infinity,
    };

    // Enhanced request logging (excluding sensitive data)
    logDebug('Request configuration', {
      method: config.method,
      url: urlWithParams,
      headers: {
        'Content-Type': config.headers['Content-Type'],
        'X-Private-Key': PRIVATE_KEY ? `${PRIVATE_KEY.substring(0, 8)}...` : 'missing',
      },
      maxBodyLength: config.maxBodyLength,
      full_url_length: urlWithParams.length
    });

    // TODO: Add high wagering check bypass flag here when needed
    // const bypassHighWageringCheck = process.env.BYPASS_HIGH_WAGERING_CHECK === 'true';
    // logDebug('High wagering check bypass', { enabled: bypassHighWageringCheck });

    logDebug('Making API request...');
    const response = await axios(config);

    // Enhanced response logging
    logDebug('API response received', {
      status: response.status,
      statusText: response.statusText,
      headers: {
        'content-type': response.headers['content-type'],
        'content-length': response.headers['content-length'],
        'cache-control': response.headers['cache-control'],
        'last-modified': response.headers['last-modified']
      },
      data_type: typeof response.data,
      data_size: JSON.stringify(response.data).length,
      has_data: !!response.data
    });

    // API response structure analysis
    const result = response.data;
    logDebug('API response structure analysis', {
      result_type: typeof result,
      result_keys: result && typeof result === 'object' ? Object.keys(result) : null,
      is_array: Array.isArray(result),
      array_length: Array.isArray(result) ? result.length : null,
      sample_data: result && typeof result === 'object' ? 
        (Array.isArray(result) ? result.slice(0, 2) : 
         Object.fromEntries(Object.entries(result).slice(0, 3))) : result
    });

    result.dates = { afterDate, beforeDate };

    logDebug('Response processing completed', {
      final_result_keys: Object.keys(result),
      dates_added: true
    });

    res.setHeader('Cache-Control', 'public, max-age=600, s-maxage=600');
    res.setHeader('Last-Modified', new Date().toUTCString());

    logDebug('Sending successful response', {
      cache_control: 'public, max-age=600, s-maxage=600',
      response_status: 200
    });

    return res.status(200).json(result);

  } catch (error: any) {
    // Comprehensive error logging
    logError('API request failed', {
      error_name: error.name,
      error_message: error.message,
      error_stack: error.stack,
      error_code: error.code,
      timestamp: new Date().toISOString()
    });

    // HTTP response error details
    if (error.response) {
      logError('HTTP Response Error Details', {
        status: error.response.status,
        statusText: error.response.statusText,
        headers: error.response.headers,
        data: error.response.data,
        config: {
          url: error.response.config?.url,
          method: error.response.config?.method,
          headers: error.response.config?.headers ? {
            ...error.response.config.headers,
            'X-Private-Key': error.response.config.headers['X-Private-Key'] ? 
              `${error.response.config.headers['X-Private-Key'].substring(0, 8)}...` : 'missing'
          } : null,
          timeout: error.response.config?.timeout,
          baseURL: error.response.config?.baseURL
        }
      });
    } else if (error.request) {
      logError('Request Error Details (no response received)', {
        request: {
          method: error.request.method,
          path: error.request.path,
          host: error.request.host,
          headers: error.request._headers ? {
            ...error.request._headers,
            'x-private-key': error.request._headers['x-private-key'] ? 
              `${error.request._headers['x-private-key'].substring(0, 8)}...` : 'missing'
          } : null
        },
        timeout: error.timeout,
        errno: error.errno,
        syscall: error.syscall,
        address: error.address,
        port: error.port
      });
    }

    // Request configuration error details  
    if (error.config) {
      logError('Request Configuration Details', {
        url: error.config.url,
        method: error.config.method,
        headers: error.config.headers ? {
          ...error.config.headers,
          'X-Private-Key': error.config.headers['X-Private-Key'] ? 
            `${error.config.headers['X-Private-Key'].substring(0, 8)}...` : 'missing'
        } : null,
        timeout: error.config.timeout,
        maxBodyLength: error.config.maxBodyLength,
        maxContentLength: error.config.maxContentLength
      });
    }

    // Environment and context logging for debugging
    logError('Environment and Context', {
      NODE_ENV: process.env.NODE_ENV,
      API_URL_exists: !!process.env.BASE_LUXDROP_API_URL,
      API_URL_first_chars: process.env.BASE_LUXDROP_API_URL?.substring(0, 20) + '...',
      PRIVATE_KEY_exists: !!process.env.PRIVATE_KEY_LUXDROP,
      PRIVATE_KEY_length: process.env.PRIVATE_KEY_LUXDROP?.length,
      available_luxdrop_env_vars: Object.keys(process.env).filter(key => 
        key.toUpperCase().includes('LUXDROP')
      ),
      memory_usage: process.memoryUsage(),
      uptime: process.uptime()
    });

    // Log full error object for debugging (truncated for large objects)
    const errorString = JSON.stringify(error, Object.getOwnPropertyNames(error));
    logError('Full Error Object', {
      full_error: errorString.length > 2000 ? 
        errorString.substring(0, 2000) + '... (truncated)' : errorString,
      error_object_size: errorString.length
    });

    console.error("LuxDrop Proxy Error:", error?.response?.data || error.message);
    return res.status(500).json({ 
      error: "Failed to fetch API data", 
      details: error?.response?.data || error.message,
      timestamp: new Date().toISOString(),
      debug_id: `luxdrop_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    });
  }
}
