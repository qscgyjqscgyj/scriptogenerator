from payment.models import UserPayment, PaymentLog, LocalPayment


def record_all_payments_to_log():
    for user_payment in UserPayment.objects.filter(payed__isnull=False):
        if user_payment.sum > 0:
            payment_log = PaymentLog()
            payment_log.create_from_user_payment(user_payment)

    for local_payment in LocalPayment.objects.all():
        if local_payment.sum > 0:
            payment_log = PaymentLog()
            payment_log.create_from_local_payment(local_payment)
