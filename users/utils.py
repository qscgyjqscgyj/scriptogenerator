from payment.models import LocalPayment
from payment.tasks import recount_balance
from users.models import CustomUser


def set_users_balances_to_zero(user_id=None):
    users = CustomUser.objects.all() if not user_id else CustomUser.objects.filter(pk=user_id)
    for user_number, user in enumerate(users):
        if user.balance_total < 0:
            balance_total = user.balance_total
            print('User number: %s' % str(user_number))
            print('User: %s' % user.username)
            print('Old balance: %s' % str(balance_total))
            payments = user.local_payments().order_by('pk')
            for payment in payments:
                if balance_total < 0:
                    balance_total += payment.sum
                    payment.delete()
            print('New balance: %s' % str(balance_total))
            print('---------------------------')
        recount_balance(user.pk)
