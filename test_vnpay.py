import os
import sys

# Change cwd to src/backend to load env properly if needed
sys.path.append(os.path.join(os.getcwd(), 'src', 'backend'))
from app.utils.vnpay import VnPay
import uuid

vnp = VnPay(
    tmn_code="Q5oxY6rQ6Y",  # Using a placeholder matching the screenshot
    secret_key="A_FAKE_SECRET_KEY_FOR_TESTING_PURPOSES",
    return_url="https://speakcv.example.com/upgrade/success",
    vnpay_payment_url="https://sandbox.vnpayment.vn/paymentv2/vpcpay.html"
)

url = vnp.get_payment_url(
    order_id=str(uuid.uuid4()).replace("-", ""),
    amount=99000,
    order_desc="Thanh toan nang cap tai khoan SpeakCV cho aaa@bbb.com",
    ip_address="14.248.82.128" # A valid public IP
)

print(url)
