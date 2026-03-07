# Copyright (c) 2026 SpeakCV Team
# This project is licensed under the MIT License.
# See the LICENSE file in the project root for more information.

import os
from dotenv import load_dotenv

load_dotenv()

class Settings:
    VNPAY_TMN_CODE = os.getenv("VNPAY_TMN_CODE", "")
    VNPAY_HASH_SECRET = os.getenv("VNPAY_HASH_SECRET", "")
    VNPAY_PAYMENT_URL = os.getenv("VNPAY_PAYMENT_URL", "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html")
    VNPAY_RETURN_URL = os.getenv("VNPAY_RETURN_URL", "http://localhost:3000/upgrade/success")

settings = Settings()
