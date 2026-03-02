
import { useEffect } from "react"
import { useCredits } from "../context/CreditContext"

const PLANS = [
  { name: "Basic", price: "10", credits: 100 },
  { name: "Advanced", price: "50", credits: 500 },
  { name: "Business", price: "250", credits: 5000 },
]

export default function BillingPage() {

  const { addCredits } = useCredits()

  useEffect(() => {
    if (window.google) renderButtons()
  }, [])

  const baseRequest = {
    apiVersion: 2,
    apiVersionMinor: 0
  }

  const allowedCardNetworks = ["MASTERCARD","VISA"]
  const allowedCardAuthMethods = ["PAN_ONLY","CRYPTOGRAM_3DS"]

  const tokenizationSpecification = {
    type: "PAYMENT_GATEWAY",
    parameters: {
      gateway: "example",
      gatewayMerchantId: "exampleGatewayMerchantId"
    }
  }

  const baseCardPaymentMethod = {
    type: "CARD",
    parameters: {
      allowedAuthMethods: allowedCardAuthMethods,
      allowedCardNetworks: allowedCardNetworks
    }
  }

  const cardPaymentMethod = {
    ...baseCardPaymentMethod,
    tokenizationSpecification
  }

  let paymentsClient = null

  function getGooglePaymentsClient() {
    if (!paymentsClient) {
      paymentsClient = new window.google.payments.api.PaymentsClient({
        environment: "TEST"
      })
    }
    return paymentsClient
  }

  function getPaymentRequest(price) {

    return {
      ...baseRequest,
      allowedPaymentMethods: [cardPaymentMethod],
      transactionInfo: {
        totalPriceStatus: "FINAL",
        totalPrice: price,
        currencyCode: "INR",
        countryCode: "IN"
      },
      merchantInfo: {
        merchantName: "ContractScan"
      }
    }
  }

  function renderButtons() {

    const client = getGooglePaymentsClient()

    PLANS.forEach(plan => {

      const container = document.getElementById(`gpay-${plan.name}`)

      if (!container) return

      const button = client.createButton({
        onClick: () => pay(plan)
      })

      container.innerHTML = ""
      container.appendChild(button)
    })
  }

  function pay(plan) {

    const client = getGooglePaymentsClient()

    client.loadPaymentData(getPaymentRequest(plan.price))
      .then(res => {

        console.log(res)

        addCredits(plan.credits)

        alert(`Payment successful. ${plan.credits} credits added.`)

      })
      .catch(err => console.error(err))
  }

  return (

    <div className="min-h-screen flex flex-col items-center pt-14 p-10">

      <h1 className="text-3xl font-bold mb-2">
        Unlock Your Creative Potential
      </h1>

      <p className="text-gray-500 mb-10">
        Flexible AI plans tailored for creators, developers, and teams
      </p>

      <div className="grid md:grid-cols-3 gap-6 w-full max-w-5xl">

        {PLANS.map(plan => (

          <div
            key={plan.name}
            className="bg-white rounded-xl shadow-lg p-6 border hover:shadow-xl transition"
          >

            <h3 className="text-xl font-bold mb-2">
              {plan.name}
            </h3>

            <p className="text-gray-500 mb-6">
              ₹{plan.price} / {plan.credits} credits
            </p>

            <div id={`gpay-${plan.name}`} />

          </div>

        ))}

      </div>

    </div>
  )
}