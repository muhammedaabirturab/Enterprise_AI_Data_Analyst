"""End-to-end smoke test for Veridian — exercises upload, profiling, cleaning,
every chart type, every ML task type, AI insights/chat, and every export format
across 12 diverse datasets (small/large, missing data, duplicates, time series,
all-numeric, all-categorical, binary/multiclass targets, outliers, special
column names). Run against a live backend:

    cd backend
    .venv/Scripts/python.exe scripts/e2e_smoke_test.py

Requires the API to be reachable at http://127.0.0.1:8000 (see BASE below).
Registers/logs in as tester@veridian.ai and uploads its own throwaway datasets,
so it's safe to run repeatedly without touching real user data.
"""
import io
import random
import sys
from datetime import datetime, timedelta

import requests

BASE = "http://127.0.0.1:8000/api"
random.seed(42)

PASS = []
FAIL = []


def check(label, condition, detail=""):
    if condition:
        PASS.append(label)
        print(f"  [PASS] {label}")
    else:
        FAIL.append((label, detail))
        print(f"  [FAIL] {label} -- {detail}")


def auth_headers(token):
    return {"Authorization": f"Bearer {token}"}


def register_or_login():
    email = "tester@veridian.ai"
    password = "TestPass123!"
    r = requests.post(f"{BASE}/auth/register", json={"email": email, "password": password, "full_name": "Test Suite"})
    if r.status_code == 201 or r.status_code == 200:
        return r.json()["access_token"]
    r = requests.post(f"{BASE}/auth/login", json={"email": email, "password": password})
    r.raise_for_status()
    return r.json()["access_token"]


def upload_csv(token, filename, csv_bytes):
    files = {"file": (filename, io.BytesIO(csv_bytes), "text/csv")}
    r = requests.post(f"{BASE}/datasets/upload", headers=auth_headers(token), files=files)
    return r


def gen_csv(rows: list[dict]) -> bytes:
    if not rows:
        return b""
    cols = list(rows[0].keys())
    lines = [",".join(cols)]
    for row in rows:
        lines.append(",".join(str(row[c]) for c in cols))
    return ("\n".join(lines) + "\n").encode("utf-8")


# ---------------------------------------------------------------------------
# Dataset generators — 12 distinct cases
# ---------------------------------------------------------------------------

def case_1_small_mixed():
    rows = []
    regions = ["North", "South", "East", "West"]
    cats = ["Electronics", "Clothing", "Groceries"]
    for i in range(15):
        rows.append({
            "date": f"2024-01-{i+1:02d}",
            "region": random.choice(regions),
            "category": random.choice(cats),
            "units_sold": random.randint(1, 30),
            "revenue": round(random.uniform(50, 2000), 2),
            "rating": round(random.uniform(3, 5), 1),
        })
    return "case1_small_mixed.csv", gen_csv(rows)


def case_2_missing_values():
    rows = []
    for i in range(50):
        rows.append({
            "id": i,
            "age": "" if i % 7 == 0 else random.randint(18, 65),
            "income": "" if i % 11 == 0 else round(random.uniform(20000, 150000), 2),
            "city": random.choice(["NYC", "LA", "Chicago", ""]),
        })
    return "case2_missing_values.csv", gen_csv(rows)


def case_3_duplicates():
    base_rows = []
    for i in range(20):
        base_rows.append({"id": i, "product": f"Product{i%5}", "price": round(random.uniform(10, 500), 2)})
    # duplicate every 3rd row
    rows = base_rows + [base_rows[i] for i in range(0, len(base_rows), 3)]
    return "case3_duplicates.csv", gen_csv(rows)


def case_4_time_series():
    rows = []
    start = datetime(2023, 1, 1)
    value = 1000.0
    for i in range(180):
        value += random.uniform(-20, 30)
        rows.append({"date": (start + timedelta(days=i)).strftime("%Y-%m-%d"), "metric": round(value, 2)})
    return "case4_time_series.csv", gen_csv(rows)


def case_5_all_numeric():
    rows = []
    for i in range(100):
        x1 = random.uniform(0, 100)
        x2 = x1 * 2 + random.uniform(-10, 10)
        x3 = random.uniform(-50, 50)
        target = x1 * 1.5 + x2 * 0.5 - x3 * 0.2 + random.uniform(-5, 5)
        rows.append({"feature1": round(x1, 2), "feature2": round(x2, 2), "feature3": round(x3, 2), "target": round(target, 2)})
    return "case5_all_numeric.csv", gen_csv(rows)


def case_6_all_categorical():
    rows = []
    colors = ["Red", "Blue", "Green", "Yellow"]
    sizes = ["Small", "Medium", "Large"]
    brands = ["BrandA", "BrandB", "BrandC"]
    for i in range(60):
        rows.append({"color": random.choice(colors), "size": random.choice(sizes), "brand": random.choice(brands)})
    return "case6_all_categorical.csv", gen_csv(rows)


def case_7_large_dataset():
    rows = []
    for i in range(2000):
        rows.append({
            "id": i,
            "value_a": round(random.uniform(0, 1000), 2),
            "value_b": round(random.gauss(50, 15), 2),
            "group": random.choice(["A", "B", "C", "D", "E"]),
        })
    return "case7_large.csv", gen_csv(rows)


def case_8_binary_classification():
    rows = []
    for i in range(120):
        score = random.uniform(0, 100)
        passed = "yes" if score > 55 + random.uniform(-10, 10) else "no"
        rows.append({"hours_studied": round(random.uniform(0, 10), 1), "score": round(score, 1), "passed": passed})
    return "case8_binary.csv", gen_csv(rows)


def case_9_multiclass():
    rows = []
    species = ["setosa", "versicolor", "virginica"]
    for i in range(90):
        s = species[i % 3]
        base = {"setosa": 5.0, "versicolor": 6.0, "virginica": 6.8}[s]
        rows.append({
            "sepal_length": round(base + random.uniform(-0.5, 0.5), 2),
            "sepal_width": round(random.uniform(2.5, 4.0), 2),
            "petal_length": round(base * 0.6 + random.uniform(-0.3, 0.3), 2),
            "species": s,
        })
    random.shuffle(rows)
    return "case9_multiclass.csv", gen_csv(rows)


def case_10_outliers_constant():
    rows = []
    for i in range(80):
        val = random.uniform(40, 60)
        if i % 15 == 0:
            val = random.choice([500, -300, 800])
        rows.append({"id": i, "measurement": round(val, 2), "constant_col": "same_value"})
    return "case10_outliers.csv", gen_csv(rows)


def case_11_excel_like_headers():
    # column names with spaces/special chars to stress sanitize_column_name
    rows = []
    for i in range(25):
        rows.append({
            "Customer Name": f"Customer {i}",
            "Total $ Spent": round(random.uniform(10, 900), 2),
            "% Discount": round(random.uniform(0, 30), 1),
        })
    return "case11_special_headers.csv", gen_csv(rows)


def case_12_anomaly_ready():
    rows = []
    for i in range(150):
        x = random.gauss(0, 1)
        y = random.gauss(0, 1)
        if i % 20 == 0:
            x, y = x + 10, y + 10  # inject anomalies
        rows.append({"x": round(x, 3), "y": round(y, 3), "z": round(random.gauss(0, 1), 3)})
    return "case12_anomaly.csv", gen_csv(rows)


CASES = [
    case_1_small_mixed,
    case_2_missing_values,
    case_3_duplicates,
    case_4_time_series,
    case_5_all_numeric,
    case_6_all_categorical,
    case_7_large_dataset,
    case_8_binary_classification,
    case_9_multiclass,
    case_10_outliers_constant,
    case_11_excel_like_headers,
    case_12_anomaly_ready,
]


def run_case(token, case_fn, case_num):
    name, csv_bytes = case_fn()
    print(f"\n=== Case {case_num}: {name} ===")

    r = upload_csv(token, name, csv_bytes)
    check(f"[{name}] upload succeeds", r.status_code == 201, f"status={r.status_code} body={r.text[:200]}")
    if r.status_code != 201:
        return
    dataset = r.json()
    ds_id = dataset["id"]

    # Profile
    r = requests.get(f"{BASE}/datasets/{ds_id}/profile", headers=auth_headers(token))
    check(f"[{name}] profile endpoint", r.status_code == 200, r.text[:200])
    profile = r.json() if r.status_code == 200 else {}
    numeric_cols = [c["name"] for c in profile.get("columns", []) if c["inferred_type"] == "numeric"]
    cat_cols = [c["name"] for c in profile.get("columns", []) if c["inferred_type"] in ("categorical", "text")]

    # Correlation + null heatmap
    r = requests.get(f"{BASE}/datasets/{ds_id}/correlation", headers=auth_headers(token))
    check(f"[{name}] correlation endpoint", r.status_code == 200, r.text[:200])
    r = requests.get(f"{BASE}/datasets/{ds_id}/null-heatmap", headers=auth_headers(token))
    check(f"[{name}] null-heatmap endpoint", r.status_code == 200, r.text[:200])

    # Preview with search/sort
    r = requests.get(f"{BASE}/datasets/{ds_id}/preview", params={"page": 1, "page_size": 5}, headers=auth_headers(token))
    check(f"[{name}] preview endpoint", r.status_code == 200 and len(r.json().get("rows", [])) > 0, r.text[:200])

    # Charts — exercise every chart type this dataset supports
    chart_results = {}
    if numeric_cols:
        col = numeric_cols[0]
        for chart_type, params in [
            ("histogram", {"x": col, "bins": 15}),
            ("boxplot", {"x": col}),
            ("distribution", {"x": col}),
        ]:
            payload = {"chart_type": chart_type, **params}
            r = requests.post(f"{BASE}/datasets/{ds_id}/charts", json=payload, headers=auth_headers(token))
            ok = r.status_code == 200 and "data" in r.json()
            chart_results[chart_type] = ok
            check(f"[{name}] chart:{chart_type}", ok, r.text[:200])

    if len(numeric_cols) >= 2:
        payload = {"chart_type": "scatter", "x": numeric_cols[0], "y": numeric_cols[1]}
        r = requests.post(f"{BASE}/datasets/{ds_id}/charts", json=payload, headers=auth_headers(token))
        ok = r.status_code == 200 and len(r.json().get("data", [])) >= 0
        check(f"[{name}] chart:scatter", ok, r.text[:200])

    if cat_cols:
        payload = {"chart_type": "pie", "category": cat_cols[0]}
        r = requests.post(f"{BASE}/datasets/{ds_id}/charts", json=payload, headers=auth_headers(token))
        check(f"[{name}] chart:pie", r.status_code == 200, r.text[:200])

        payload = {"chart_type": "bar", "category": cat_cols[0], "y": numeric_cols[0] if numeric_cols else None}
        r = requests.post(f"{BASE}/datasets/{ds_id}/charts", json=payload, headers=auth_headers(token))
        check(f"[{name}] chart:bar", r.status_code == 200, r.text[:200])

    date_like = None
    for c in profile.get("columns", []):
        if "date" in c["name"].lower():
            date_like = c["name"]
            break
    if date_like and numeric_cols:
        for chart_type in ("line", "area"):
            payload = {"chart_type": chart_type, "x": date_like, "y": numeric_cols[0]}
            r = requests.post(f"{BASE}/datasets/{ds_id}/charts", json=payload, headers=auth_headers(token))
            check(f"[{name}] chart:{chart_type}", r.status_code == 200, r.text[:200])

    # Regression test: requesting a numeric-only chart type on a non-numeric column must
    # return a clean 400 (not a 200 with null stats that crashes the frontend, and not a 500).
    if cat_cols:
        for chart_type in ("histogram", "boxplot", "distribution"):
            payload = {"chart_type": chart_type, "x": cat_cols[0]}
            r = requests.post(f"{BASE}/datasets/{ds_id}/charts", json=payload, headers=auth_headers(token))
            check(
                f"[{name}] chart:{chart_type} on non-numeric column rejected cleanly",
                r.status_code == 400,
                f"status={r.status_code} body={r.text[:200]}",
            )

    # Cleaning: fill missing / drop duplicates / drop rows with missing (whichever applies) + undo
    if profile.get("missing_cells", 0) > 0 and numeric_cols:
        r = requests.post(
            f"{BASE}/datasets/{ds_id}/cleaning/apply",
            json={"operation": "fill_median", "params": {"columns": numeric_cols}},
            headers=auth_headers(token),
        )
        check(f"[{name}] cleaning:fill_median", r.status_code == 200, r.text[:200])
        r = requests.post(f"{BASE}/datasets/{ds_id}/cleaning/undo", headers=auth_headers(token))
        check(f"[{name}] cleaning:undo", r.status_code == 200, r.text[:200])

    if profile.get("duplicate_rows", 0) > 0:
        r = requests.post(
            f"{BASE}/datasets/{ds_id}/cleaning/apply",
            json={"operation": "drop_duplicates", "params": {}},
            headers=auth_headers(token),
        )
        check(f"[{name}] cleaning:drop_duplicates", r.status_code == 200, r.text[:200])

    # ML recommendations + train top pick
    r = requests.get(f"{BASE}/datasets/{ds_id}/ml/recommendations", headers=auth_headers(token))
    check(f"[{name}] ml recommendations", r.status_code == 200, r.text[:200])
    if r.status_code == 200 and r.json():
        rec = r.json()[0]
        train_payload = {
            "task_type": rec["task_type"],
            "algorithm": rec["algorithm"],
            "target_column": rec.get("target_column"),
            "feature_columns": [],
        }
        if rec["task_type"] == "time_series":
            train_payload["date_column"] = date_like
            train_payload["forecast_periods"] = 6
        r = requests.post(f"{BASE}/datasets/{ds_id}/ml/train", json=train_payload, headers=auth_headers(token))
        check(f"[{name}] ml train ({rec['task_type']}/{rec['algorithm']})", r.status_code == 200, r.text[:300])

    # AI insights + chat
    r = requests.get(f"{BASE}/datasets/{ds_id}/ai/insights", headers=auth_headers(token))
    check(f"[{name}] ai insights", r.status_code == 200, r.text[:200])

    r = requests.post(f"{BASE}/datasets/{ds_id}/ai/chat", json={"message": "What does this dataset show?"}, headers=auth_headers(token))
    check(f"[{name}] ai chat", r.status_code == 200 and len(r.json().get("reply", {}).get("content", "")) > 0, r.text[:200])

    # Exports — rotate through formats across cases to cover all of them at least once
    export_format = ["pdf", "csv", "json", "excel"][case_num % 4]
    r = requests.get(f"{BASE}/datasets/{ds_id}/export/{export_format}", headers=auth_headers(token))
    check(f"[{name}] export:{export_format}", r.status_code == 200 and len(r.content) > 0, f"status={r.status_code}")


def main():
    print("Logging in test user...")
    token = register_or_login()
    print("Logged in.\n")

    for i, case_fn in enumerate(CASES, start=1):
        try:
            run_case(token, case_fn, i)
        except Exception as exc:  # noqa: BLE001
            FAIL.append((f"case_{i}_exception", str(exc)))
            print(f"  [EXCEPTION] case {i}: {exc}")

    print("\n" + "=" * 60)
    print(f"TOTAL: {len(PASS)} passed, {len(FAIL)} failed")
    print("=" * 60)
    if FAIL:
        print("\nFAILURES:")
        for label, detail in FAIL:
            print(f"  - {label}: {detail}")
        sys.exit(1)
    else:
        print("\nAll checks passed.")


if __name__ == "__main__":
    main()
