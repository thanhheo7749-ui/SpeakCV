# Copyright (c) 2026 SpeakCV Team
# This project is licensed under the MIT License.
# See the LICENSE file in the project root for more information.

import os
from dotenv import load_dotenv

load_dotenv()

class Settings:
    # JWT
    SECRET_KEY = os.getenv("SECRET_KEY", "CHANGE-ME-IN-PRODUCTION")
    JWT_ALGORITHM = os.getenv("JWT_ALGORITHM", "HS256")
    ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "3000"))

    # VNPAY
    VNPAY_TMN_CODE = os.getenv("VNPAY_TMN_CODE", "")
    VNPAY_HASH_SECRET = os.getenv("VNPAY_HASH_SECRET", "")
    VNPAY_PAYMENT_URL = os.getenv("VNPAY_PAYMENT_URL", "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html")
    VNPAY_RETURN_URL = os.getenv("VNPAY_RETURN_URL", "http://localhost:3000/upgrade/success")

settings = Settings()
