import CheckoutForm from "../components/checkout-form";

const formatNaira = (amount: number) =>
  new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 2,
  }).format(amount);

export default function Home() {
  const amount = 100;

  return (
    <main className="shell">
      <section className="brand-panel" aria-label="Order details">
        <a className="brand" href="#" aria-label="SafeHaven checkout home">
          <span className="brand-mark" aria-hidden="true">S</span>
          <span>SafeHaven Checkout</span>
        </a>

        <div className="order-copy">
          <p className="eyebrow">Payment request</p>
          <h1>Complete your payment</h1>
          <p>Fast, simple bank payments secured by SafeHaven.</p>
        </div>

        <div className="order-card">
          <div>
            <span>Order</span>
            <strong>Checkout payment</strong>
          </div>
          <div className="order-total">
            <span>Amount due</span>
            <strong>{formatNaira(amount)}</strong>
          </div>
        </div>

        <div className="security-note">
          <span className="shield" aria-hidden="true">✓</span>
          <div>
            <strong>Secure payment</strong>
            <p>Your transaction is handled by SafeHaven.</p>
          </div>
        </div>
      </section>

      <section className="checkout-panel">
        <div className="form-wrap">
          <p className="step">PAYMENT DETAILS</p>
          <h2>Who is making this payment?</h2>
          <p className="intro">Enter the contact details you want attached to this transaction.</p>
          <CheckoutForm initialAmount={amount} />
        </div>
      </section>
    </main>
  );
}
