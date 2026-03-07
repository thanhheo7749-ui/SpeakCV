# Copyright (c) 2026 SpeakCV Team
# This project is licensed under the MIT License.
# See the LICENSE file in the project root for more information.

import urllib.parse
import hashlib
import hmac
import unicodedata
import re
from datetime import datetime, timezone, timedelta

class VnPay:
    def __init__(self, tmn_code, secret_key, return_url, vnpay_payment_url):
        self.tmn_code = tmn_code.strip() if tmn_code else ""
        self.secret_key = secret_key.strip() if secret_key else ""
        
        ret_url = return_url.strip() if return_url else ""
        if ret_url and not ret_url.startswith("http"):
            ret_url = "https://" + ret_url
        self.return_url = ret_url
        
        self.vnpay_payment_url = vnpay_payment_url.strip() if vnpay_payment_url else ""

    def _remove_accents(self, input_str: str) -> str:
        s1 = unicodedata.normalize('NFKD', input_str).encode('ascii', 'ignore').decode('utf-8')
        # Only keep alphanumeric characters (no spaces, no special chars)
        # This prevents urllib.parse.quote_plus from turning spaces into '+' which VNPAY might reject
        return re.sub(r'[^a-zA-Z0-9]', '', s1).strip()

    def get_payment_url(self, order_id: str, amount: int, order_desc: str, ip_address: str) -> str:
        # Prevent accents and spaces in order desc
        clean_order_desc = self._remove_accents(order_desc)
        if not clean_order_desc:
            clean_order_desc = "Thanhtoandonhang"
            
        tz_vn = timezone(timedelta(hours=7))
        
        # Ensure IP is an IPv4 string without extra routing info
        clean_ip = str(ip_address).strip()
        if not clean_ip or len(clean_ip) > 15 or ":" in clean_ip:
            clean_ip = "127.0.0.1"
            
        vnp_Params = {
            "vnp_Version": "2.1.0",
            "vnp_Command": "pay",
            "vnp_TmnCode": self.tmn_code,
            "vnp_Amount": str(int(amount) * 100),
            "vnp_CurrCode": "VND",
            "vnp_TxnRef": str(order_id).replace('-', '')[:100],
            "vnp_OrderInfo": clean_order_desc,
            "vnp_OrderType": "other",
            "vnp_Locale": "vn",
            "vnp_ReturnUrl": self.return_url,
            "vnp_IpAddr": clean_ip,
            "vnp_CreateDate": datetime.now(tz_vn).strftime("%Y%m%d%H%M%S"),
        }

        vnp_Params = {k: v for k, v in vnp_Params.items() if v is not None and str(v).strip() != ""}

        # Sort alphabetically
        inputData = sorted(vnp_Params.items())
        
        # Build hash data
        hasData = "&".join([f"{key}={urllib.parse.quote_plus(str(val))}" for key, val in inputData])

        hashValue = hmac.new(
            self.secret_key.encode('utf-8'),
            hasData.encode('utf-8'),
            hashlib.sha512
        ).hexdigest()

        # Build the final URL
        return self.vnpay_payment_url + "?" + hasData + "&vnp_SecureHash=" + hashValue

    def validate_response(self, vnp_Params: dict) -> bool:
        # Clone to avoid mutating original dictionary if used later
        params = vnp_Params.copy()
        
        vnp_SecureHash = params.pop("vnp_SecureHash", None)
        params.pop("vnp_SecureHashType", None)

        if not vnp_SecureHash:
            return False

        # Filter empty
        params = {k: v for k, v in params.items() if v is not None and str(v).strip() != ""}

        # Sort
        inputData = sorted(params.items())
        
        # Build hash data
        hasData = "&".join([f"{key}={urllib.parse.quote_plus(str(val))}" for key, val in inputData])
        
        # Check signature matches
        hashValue = hmac.new(
            self.secret_key.encode('utf-8'),
            hasData.encode('utf-8'),
            hashlib.sha512
        ).hexdigest()
        
        return hashValue == vnp_SecureHash
