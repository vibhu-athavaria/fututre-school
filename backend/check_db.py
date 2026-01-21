#!/usr/bin/env python3
from app.core.database import engine
from sqlalchemy.orm import Session
from app.models.billing import SubscriptionPlan, Subscription

def check_database():
    with Session(engine) as db:
        # Check subscription plans
        plans = db.query(SubscriptionPlan).all()
        print(f'Found {len(plans)} subscription plans:')
        for plan in plans:
            print(f'- {plan.name}: ${plan.base_price} ({plan.plan_type}) - Active: {plan.is_active}')

        # Check subscriptions
        subscriptions = db.query(Subscription).all()
        print(f'\nFound {len(subscriptions)} subscriptions:')
        for sub in subscriptions:
            print(f'- ID {sub.id}: Student {sub.student_id}, Status: {sub.status}, Price: ${sub.price}')

if __name__ == "__main__":
    check_database()