import { loadStripe } from '@stripe/stripe-js'

export const stripePromise = loadStripe('pk_test_51TAqZiIdtfJIyMom0L2WvV6i310dcMavdoggmKbJPMzBt7tsozMyD43RwR1ihbFbFz2fo9kl6KBCC8guFYOOtqU90073rSwbUm')

export const PRICE_IDS = {
  beta:  'price_1TAqldIdtfJIyMomcqmyD7FD',
  mid:   'price_1TAqmeIdtfJIyMomfT31qLGj',
  pro:   'price_1TAqnEIdtfJIyMomBm6uO4jO',
}
