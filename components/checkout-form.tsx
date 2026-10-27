"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";

type CheckoutResponse = Record<string, unknown>;

type SafeHavenOptions = {
  environment: "sandbox" | "production";
  clientId: string;
  referenceCode: string;
  customer: {
    firstName: string;
    lastName: string;
    emailAddress: string;
    phoneNumber: string;
  };
  currency: "NGN";
  amount: number;
  feeBearer: "account" | "customer";
  settlementAccount: { bankCode: string; accountNumber: string };
  webhookUrl?: string;
  onClose: () => void;
  callback: (response: CheckoutResponse) => void;
};

declare global {
  interface Window {
    SafeHavenCheckout?: (options: SafeHavenOptions) => unknown;
  }
}

type Props = { initialAmount: number };

const makeReference = () => {
  const random = crypto.getRandomValues(new Uint32Array(1))[0];
  return String((random % 999_999_999) + 1);
};

const normalizeNigerianPhone = (value: string) => {
  const digits = value.replace(/\D/g, "");

  if (digits.length === 11 && digits.startsWith("0")) {
    return `+234${digits.slice(1)}`;
  }

  if (digits.length === 13 && digits.startsWith("234")) {
    return `+${digits}`;
  }

  if (digits.length === 10) {
    return `+234${digits}`;
  }

  return null;
};

export default function CheckoutForm({ initialAmount }: Props) {
  const [scriptReady, setScriptReady] = useState(false);
  const [status, setStatus] = useState<"idle" | "closed" | "success" | "error">("idle");
  const [message, setMessage] = useState("");
  const [amount, setAmount] = useState(String(initialAmount));

  useEffect(() => {
    if (window.SafeHavenCheckout) {
      setScriptReady(true);
      return;
    }

    const existingScript = document.querySelector<HTMLScriptElement>(
      'script[data-safehaven-checkout="true"]',
    );
    const script = existingScript ?? document.createElement("script");

    const handleLoad = () => {
      if (window.SafeHavenCheckout) {
        setScriptReady(true);
        setMessage("");
      } else {
        setStatus("error");
        setMessage("SafeHaven Checkout loaded without exposing its payment API.");
      }
    };
    const handleError = () => {
      setStatus("error");
      setMessage("SafeHaven Checkout could not be loaded. Refresh the page or check your connection.");
    };

    script.addEventListener("load", handleLoad);
    script.addEventListener("error", handleError);

    if (!existingScript) {
      script.src = "/safehaven-checkout.js";
      script.async = true;
      script.dataset.safehavenCheckout = "true";
      document.head.appendChild(script);
    }

    const readinessCheck = window.setInterval(() => {
      if (window.SafeHavenCheckout) {
        setScriptReady(true);
        setMessage("");
        window.clearInterval(readinessCheck);
      }
    }, 100);

    return () => {
      script.removeEventListener("load", handleLoad);
      script.removeEventListener("error", handleError);
      window.clearInterval(readinessCheck);
    };
  }, []);

  const config = useMemo(
    () => ({
      environment:
        process.env.NEXT_PUBLIC_SAFEHAVEN_ENVIRONMENT === "production"
          ? ("production" as const)
          : ("sandbox" as const),
      clientId: process.env.NEXT_PUBLIC_SAFEHAVEN_CLIENT_ID ?? "",
      bankCode: process.env.NEXT_PUBLIC_SAFEHAVEN_BANK_CODE ?? "",
      accountNumber: process.env.NEXT_PUBLIC_SAFEHAVEN_ACCOUNT_NUMBER ?? "",
      feeBearer:
        process.env.NEXT_PUBLIC_SAFEHAVEN_FEE_BEARER === "account"
          ? ("account" as const)
          : ("customer" as const),
      webhookUrl: process.env.NEXT_PUBLIC_SAFEHAVEN_WEBHOOK_URL,
    }),
    [],
  );

  const pay = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus("idle");
    setMessage("");

    const form = new FormData(event.currentTarget);
    const numericAmount = Number(amount);
    const phoneNumber = normalizeNigerianPhone(String(form.get("phone") ?? ""));

    if (!window.SafeHavenCheckout) {
      setStatus("error");
      setMessage("The payment service is still loading. Please try again.");
      return;
    }

    if (!config.clientId || !config.bankCode || !config.accountNumber) {
      setStatus("error");
      setMessage("SafeHaven merchant configuration is incomplete.");
      return;
    }

    if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
      setStatus("error");
      setMessage("Enter a valid payment amount.");
      return;
    }

    if (!phoneNumber) {
      setStatus("error");
      setMessage("Enter a valid Nigerian phone number, for example 08032273616 or +2348032273616.");
      return;
    }

    const options: SafeHavenOptions = {
      environment: config.environment,
      clientId: config.clientId,
      referenceCode: makeReference(),
      customer: {
        firstName: String(form.get("firstName") ?? "").trim(),
        lastName: String(form.get("lastName") ?? "").trim(),
        emailAddress: String(form.get("email") ?? "").trim(),
        phoneNumber,
      },
      currency: "NGN",
      amount: numericAmount,
      feeBearer: config.feeBearer,
      settlementAccount: {
        bankCode: config.bankCode,
        accountNumber: config.accountNumber,
      },
      onClose: () => {
        setStatus("closed");
        setMessage("Checkout closed. No payment status was confirmed.");
      },
      callback: (response) => {
        console.info("SafeHaven checkout response", response);
        setStatus("success");
        setMessage("SafeHaven returned a payment response. Your merchant server should verify it before fulfilment.");
      },
    };

    if (config.webhookUrl) options.webhookUrl = config.webhookUrl;
    window.SafeHavenCheckout(options);
  };

  return (
    <>
      <form onSubmit={pay} className="checkout-form">
        <div className="field-row">
          <label>
            <span>First name</span>
            <input name="firstName" autoComplete="given-name" placeholder="John" required />
          </label>
          <label>
            <span>Last name</span>
            <input name="lastName" autoComplete="family-name" placeholder="Doe" required />
          </label>
        </div>

        <label>
          <span>Email address or customer reference</span>
          <input name="email" type="text" placeholder="FLEX0001" required />
        </label>

        <label>
          <span>Phone number</span>
          <input
            name="phone"
            type="tel"
            autoComplete="tel"
            inputMode="tel"
            placeholder="+234 803 000 0000"
            aria-describedby="phone-help"
            maxLength={24}
            required
          />
          <small id="phone-help">Use 0803…, 234803…, or +234 803… format.</small>
        </label>

        <label>
          <span>Amount (NGN)</span>
          <div className="amount-input">
            <span>₦</span>
            <input
              name="amount"
              type="number"
              inputMode="decimal"
              min="1"
              step="0.01"
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
              required
            />
          </div>
        </label>

        {message && (
          <p className={`notice ${status}`} role={status === "error" ? "alert" : "status"}>
            {message}
          </p>
        )}

        <button className="pay-button" type="submit" disabled={!scriptReady}>
          {scriptReady ? `Pay ₦${Number(amount || 0).toLocaleString("en-NG")}` : "Loading secure checkout…"}
          <span aria-hidden="true">→</span>
        </button>

        <p className="terms">By continuing, you agree to the merchant&apos;s payment terms.</p>
      </form>
    </>
  );
}
