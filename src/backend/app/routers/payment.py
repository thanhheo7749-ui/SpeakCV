# Copyright (c) 2026 SpeakCV Team
# This project is licensed under the MIT License.
# See the LICENSE file in the project root for more information.

import os
import uuid
from fastapi import APIRouter, Depends, Request
from sqlalchemy.orm import Session
from ..database.database import get_db
from ..database import sql_models
from .profile import get_current_user
from app.core.config import settings
from app.utils.vnpay import VnPay

router = APIRouter(
    prefix="/api/payment",
    tags=["Payment"]
)

@router.post("/instant-upgrade")
def instant_upgrade(db: Session = Depends(get_db), current_user: sql_models.User = Depends(get_current_user)):
    user = db.query(sql_models.User).filter(sql_models.User.id == current_user.id).first()
    if not user:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="User not found")
        
    user.plan = "pro"
    user.credits += 10000
    
    # Log transaction for admin visibility
    txn_log = sql_models.TransactionHistory(
        user_id=user.id,
        amount=10000,
        transaction_type="upgrade_pro",
        note=f"Nâng cấp gói Pro (Instant) cho {user.email}"
    )
    db.add(txn_log)
    db.commit()
    return {"status": "success", "message": "Nâng cấp thành công"}

@router.post("/create-url")
def create_payment_url(request: Request, db: Session = Depends(get_db), current_user: sql_models.User = Depends(get_current_user)):
    # VNPAY requires vnp_TxnRef to only contain alphanumeric characters
    txn_ref = str(uuid.uuid4()).replace("-", "")
    amount = 99000
    
    # 1. Store transaction in DB
    transaction = sql_models.Transaction(
        user_id=current_user.id,
        amount=amount,
        txn_ref=txn_ref,
        status="pending"
    )
    db.add(transaction)
    db.commit()

    # 2. Get client IP
    ip_address = request.client.host if request.client else "127.0.0.1"
    if request.headers.get("x-forwarded-for"):
        ip_address = request.headers.get("x-forwarded-for").split(",")[0]
        
    # 3. Create VNPay URL
    tmn_code = "3E9ZED04"
    hash_secret = "U0J3OO0YZVAXCQ8DWLGM3MJKOZ7LNTQB"
    payment_url = "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html"
    return_url = "https://hoangthanhzzz.id.vn/upgrade/success"

    vnp = VnPay(
        tmn_code=tmn_code,
        secret_key=hash_secret,
        return_url=return_url,
        vnpay_payment_url=payment_url
    )
    
    payment_url = vnp.get_payment_url(
        order_id=txn_ref,
        amount=amount,
        order_desc=f"Thanh toan nang cap tai khoan SpeakCV cho {current_user.email}",
        ip_address=ip_address
    )
    
    return {"url": payment_url}

@router.get("/vnpay-ipn")
def vnpay_ipn(request: Request, db: Session = Depends(get_db)):
    vnp_Params = dict(request.query_params)
    
    tmn_code = "3E9ZED04"
    hash_secret = "U0J3OO0YZVAXCQ8DWLGM3MJKOZ7LNTQB"
    payment_url = "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html"
    return_url = "https://hoangthanhzzz.id.vn/upgrade/success"

    vnp = VnPay(
        tmn_code=tmn_code,
        secret_key=hash_secret,
        return_url=return_url,
        vnpay_payment_url=payment_url
    )
    
    if vnp.validate_response(vnp_Params):
        txn_ref = vnp_Params.get("vnp_TxnRef")
        rsp_code = vnp_Params.get("vnp_ResponseCode")
        
        transaction = db.query(sql_models.Transaction).filter(sql_models.Transaction.txn_ref == txn_ref).first()
        if transaction:
            if rsp_code == "00" and transaction.status == "pending":
                transaction.status = "success"
                
                # Update User
                user = db.query(sql_models.User).filter(sql_models.User.id == transaction.user_id).first()
                if user:
                    user.plan = "pro"
                    user.credits += 10000
                    
                    # Log transaction for admin visibility
                    txn_log = sql_models.TransactionHistory(
                        user_id=user.id,
                        amount=10000,
                        transaction_type="upgrade_pro",
                        note=f"Nâng cấp gói Pro (VNPAY) cho {user.email}"
                    )
                    db.add(txn_log)
                db.commit()
                return {"RspCode": "00", "Message": "Confirm Success"}
            elif rsp_code != "00" and transaction.status == "pending":
                transaction.status = "failed"
                db.commit()
                return {"RspCode": "00", "Message": "Confirm Success (Failed Transaction Logging)"}
            else:
                return {"RspCode": "02", "Message": "Order already confirmed"}
        else:
            return {"RspCode": "01", "Message": "Order not found"}
    else:
        return {"RspCode": "97", "Message": "Invalid signature"}
