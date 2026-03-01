export async function getForecast(payments: { amount: number; paidAt: string }[]) {
    const response = await fetch("/api/python/forecast", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            payments: payments.map((p) => ({
                amount: p.amount,
                paid_at: p.paidAt,
            })),
        }),
    });

    if (!response.ok) {
        throw new Error("Failed to fetch forecast");
    }

    return response.json();
}

export async function queryWolfram(query: string) {
    const response = await fetch("/api/python/wolfram", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ query }),
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || "Failed to query Wolfram");
    }

    return response.json();
}
