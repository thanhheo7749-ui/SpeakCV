# Copyright (c) 2026 SpeakCV Team
# This project is licensed under the MIT License.
# See the LICENSE file in the project root for more information.

import urllib.parse
import hashlib
import hmac
from datetime import datetime

class VnPay:
    def __init__(self, tmn_code, secret_key, return_url, vnpay_payment_url):
        self.tmn_code = tmn_code
        self.secret_key = secret_key
        self.return_url = return_url
        self.vnpay_payment_url = vnpay_payment_url

    def get_payment_url(self, order_id: str, amount: int, order_desc: str, ip_address: str) -> str:
        vnp_Params = {
            "vnp_Version": "2.1.0",
            "vnp_Command": "pay",
            "vnp_TmnCode": self.tmn_code,
            "vnp_Amount": str(int(amount) * 100),
            "vnp_CurrCode": "VND",
            "vnp_TxnRef": str(order_id),
            "vnp_OrderInfo": order_desc,
            "vnp_OrderType": "other",
            "vnp_Locale": "vn",
            "vnp_ReturnUrl": self.return_url,
            "vnp_IpAddr": ip_address if ip_address else "127.0.0.1",
            "vnp_CreateDate": datetime.now().strftime("%Y%m%d%H%M%S"),
        }

        vnp_Params = {k: v for k, v in vnp_Params.items() if v != "" and v is not None}

        # Sort alphabetically
        inputData = sorted(vnp_Params.items())
        
        hasData = ''
        seq = 0
        for key, val in inputData:
            if seq == 1:
                hasData = hasData + "&" + str(key) + '=' + urllib.parse.quote_plus(str(val))
            else:
                seq = 1
                hasData = str(key) + '=' + urllib.parse.quote_plus(str(val))

        hashValue = hmac.new(self.secret_key.encode('utf-8'), hasData.encode('utf-8'), hashlib.sha512).hexdigest()

        # Build the final URL
        return self.vnpay_payment_url + "?" + hasData + "&vnp_SecureHash=" + hashValue

    def validate_response(self, vnp_Params: dict) -> bool:
        vnp_SecureHash = vnp_Params.pop("vnp_SecureHash", None)
        vnp_Params.pop("vnp_SecureHashType", None)

        if not vnp_SecureHash:
            return False

        # Sort
        inputData = sorted(vnp_Params.items())
        
        # Build hash data
        hasData = ''
        seq = 0
        for key, val in inputData:
            if seq == 1:
                hasData = hasData + "&" + str(key) + '=' + urllib.parse.quote_plus(str(val))
            else:
                seq = 1
                hasData = str(key) + '=' + urllib.parse.quote_plus(str(val))
        
        # Check signature matches
        hashValue = hmac.new(self.secret_key.encode('utf-8'), hasData.encode('utf-8'), hashlib.sha512).hexdigest()
        
        return hashValue == vnp_SecureHash
