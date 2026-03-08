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

    def get_payment_url(self, order_id: str, amount: int, order_desc: str, ip_address: str) -> str:
        inputData = {
            "vnp_Version": "2.1.0",
            "vnp_Command": "pay",
            "vnp_TmnCode": self.tmn_code,
            "vnp_Amount": str(int(amount) * 100),
            "vnp_CurrCode": "VND",
            "vnp_TxnRef": str(order_id),
            "vnp_OrderInfo": "ThanhToanGoiPro", # TUYỆT ĐỐI KHÔNG CÓ DẤU CÁCH
            "vnp_OrderType": "other",
            "vnp_Locale": "vn",
            "vnp_CreateDate": datetime.now().strftime('%Y%m%d%H%M%S'),
            "vnp_IpAddr": "127.0.0.1", # FIX CỨNG IP ĐỂ TRÁNH LỖI IPV6 CỦA NGINX
            "vnp_ReturnUrl": self.return_url
        }

        # Sắp xếp theo alphabet (Bắt buộc)
        inputData = dict(sorted(inputData.items()))
        hasData = ''
        seq = 0
        for key, val in inputData.items():
            if seq == 1:
                hasData = hasData + "&" + str(key) + "=" + urllib.parse.quote_plus(str(val))
            else:
                seq = 1
                hasData = str(key) + "=" + urllib.parse.quote_plus(str(val))

        # Mã hóa SHA512
        hashValue = hmac.new(bytes(self.secret_key, 'utf-8'), bytes(hasData, 'utf-8'), hashlib.sha512).hexdigest()
        
        # Trả về URL cuối cùng
        final_url = f"{self.vnpay_payment_url}?{hasData}&vnp_SecureHash={hashValue}"
        return final_url

    def validate_response(self, vnp_Params: dict) -> bool:
        # Clone to avoid mutating original dictionary if used later
        params = vnp_Params.copy()
        
        vnp_SecureHash = params.pop("vnp_SecureHash", None)
        params.pop("vnp_SecureHashType", None)

        if not vnp_SecureHash:
            return False

        # Sort
        inputData = dict(sorted(params.items()))
        
        hasData = ''
        seq = 0
        for key, val in inputData.items():
            if seq == 1:
                hasData = hasData + "&" + str(key) + "=" + urllib.parse.quote_plus(str(val))
            else:
                seq = 1
                hasData = str(key) + "=" + urllib.parse.quote_plus(str(val))
        
        # Check signature matches
        hashValue = hmac.new(bytes(self.secret_key, 'utf-8'), bytes(hasData, 'utf-8'), hashlib.sha512).hexdigest()
        
        return hashValue == vnp_SecureHash
