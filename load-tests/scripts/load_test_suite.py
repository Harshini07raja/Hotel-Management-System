#!/usr/bin/env python3
"""
Comprehensive Automated Performance & Load Testing Suite
Scalable Hotel Management System - Academic Demonstration
"""

import urllib.request
import urllib.parse
import json
import time
import concurrent.futures
import statistics
import os
import sys

BASE_URL = os.environ.get("BASE_URL", "http://localhost:8088")
RESULTS_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "experiments", "raw-results"))
PROCESSED_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "experiments", "processed-results"))

os.makedirs(RESULTS_DIR, exist_ok=True)
os.makedirs(PROCESSED_DIR, exist_ok=True)

def http_request(method, path, data=None, headers=None, timeout=10):
    url = BASE_URL + path
    req_headers = {"Content-Type": "application/json"}
    if headers:
        req_headers.update(headers)
    
    encoded_data = json.dumps(data).encode("utf-8") if data else None
    req = urllib.request.Request(url, data=encoded_data, headers=req_headers, method=method)
    
    start_time = time.perf_counter()
    try:
        with urllib.request.urlopen(req, timeout=timeout) as response:
            latency_ms = (time.perf_counter() - start_time) * 1000.0
            resp_body = response.read().decode("utf-8")
            return response.status, latency_ms, resp_body
    except urllib.error.HTTPError as e:
        latency_ms = (time.perf_counter() - start_time) * 1000.0
        try:
            resp_body = e.read().decode("utf-8")
        except:
            resp_body = ""
        return e.code, latency_ms, resp_body
    except Exception as e:
        latency_ms = (time.perf_counter() - start_time) * 1000.0
        return 0, latency_ms, str(e)

def login_guest(email, password):
    status, _, body = http_request("POST", "/api/v1/auth/login", {"email": email, "password": password})
    if status == 200:
        res = json.loads(body)
        return res.get("token")
    return None

def run_workload_simulation(name, vus, duration_seconds=15):
    print(f"\n=======================================================")
    print(f" Starting Benchmark Workload: {name} ({vus} Virtual Users)")
    print(f"=======================================================")
    
    token = login_guest("guest@hotel.com", "Password123!")
    auth_header = {"Authorization": f"Bearer {token}"} if token else {}
    
    endpoints = [
        ("GET", "/api/v1/hotels", None, {}),
        ("GET", "/api/v1/search/autocomplete?q=gra&limit=5", None, {}),
        ("GET", "/api/v1/search/hotels?city=Paris", None, {}),
        ("GET", "/api/v1/availability?hotelId=HTL-101&checkInDate=2026-11-10&checkOutDate=2026-11-14&guests=2", None, {}),
        ("GET", "/api/v1/hotels/HTL-101", None, {}),
        ("GET", "/api/v1/admin/cache/stats", None, {}),
        ("GET", "/api/v1/admin/rate-limiter/stats", None, {})
    ]
    
    latencies = []
    status_codes = {}
    total_requests = 0
    end_time = time.time() + duration_seconds
    start_perf = time.perf_counter()
    
    def worker():
        nonlocal total_requests
        ep_index = 0
        while time.time() < end_time:
            method, path, data, headers = endpoints[ep_index % len(endpoints)]
            ep_index += 1
            h = dict(headers)
            if token and "auth" not in path:
                h.update(auth_header)
                
            code, lat, _ = http_request(method, path, data, h)
            latencies.append(lat)
            status_codes[code] = status_codes.get(code, 0) + 1
            total_requests += 1
            time.sleep(0.01) # 10ms pacing
            
    with concurrent.futures.ThreadPoolExecutor(max_workers=vus) as executor:
        futures = [executor.submit(worker) for _ in range(vus)]
        concurrent.futures.wait(futures)
        
    total_time = time.perf_counter() - start_perf
    
    latencies.sort()
    avg_latency = statistics.mean(latencies) if latencies else 0.0
    p50 = latencies[int(len(latencies) * 0.50)] if latencies else 0.0
    p95 = latencies[int(len(latencies) * 0.95)] if latencies else 0.0
    p99 = latencies[int(len(latencies) * 0.99)] if latencies else 0.0
    rps = total_requests / total_time if total_time > 0 else 0.0
    
    successful = sum(count for code, count in status_codes.items() if 200 <= code < 400)
    failed = sum(count for code, count in status_codes.items() if code >= 500 or code == 0)
    rate_limited = status_codes.get(429, 0)
    error_rate = (failed * 100.0 / total_requests) if total_requests > 0 else 0.0
    
    result = {
        "workload": name,
        "virtualUsers": vus,
        "durationSeconds": round(total_time, 2),
        "totalRequests": total_requests,
        "successfulRequests": successful,
        "failedRequests": failed,
        "http429RateLimited": rate_limited,
        "throughputRps": round(rps, 2),
        "avgResponseTimeMs": round(avg_latency, 2),
        "p50Ms": round(p50, 2),
        "p95Ms": round(p95, 2),
        "p99Ms": round(p99, 2),
        "errorRatePercentage": round(error_rate, 2),
        "statusCodes": status_codes
    }
    
    out_file = os.path.join(RESULTS_DIR, f"workload_{name.lower().replace(' ', '_')}_{vus}vu.json")
    with open(out_file, "w", encoding="utf-8") as f:
        json.dump(result, f, indent=2)
        
    print(f"Completed {total_requests} requests in {total_time:.2f}s")
    print(f"Throughput: {rps:.2f} RPS | Avg: {avg_latency:.2f}ms | p95: {p95:.2f}ms | Errors: {error_rate:.2f}%")
    print(f"Results written to: {out_file}")
    return result

def run_all_benchmarks():
    print("Testing backend connectivity at:", BASE_URL)
    status, _, body = http_request("GET", "/api/v1/hotels")
    if status != 200:
        print("Backend is not running at", BASE_URL, "- aborting live test.")
        return
        
    print("Backend is HEALTHY! Authenticating Admin...")
    admin_token = login_guest("admin@hotel.com", "Password123!")
    admin_headers = {"Authorization": f"Bearer {admin_token}"} if admin_token else {}

    print("Seeding initial demonstration dataset...")
    http_request("POST", "/api/v1/admin/seed-data", headers=admin_headers)
    time.sleep(1)
    
    low = run_workload_simulation("LOW", 10, duration_seconds=10)
    med = run_workload_simulation("MEDIUM", 50, duration_seconds=10)
    high = run_workload_simulation("HIGH", 100, duration_seconds=10)
    
    # Run Consistent Hashing Benchmark
    print("\nRunning Experiment D: Consistent Hashing vs Modulo Hashing...")
    status, _, ch_body = http_request("GET", "/api/v1/admin/consistent-hashing/benchmark?sampleKeyCount=10000", headers=admin_headers)
    if status == 200:
        with open(os.path.join(RESULTS_DIR, "experiment_d_consistent_hashing.json"), "w", encoding="utf-8") as f:
            f.write(ch_body)
            
    # Run Snowflake ID Benchmark
    print("Running Snowflake ID Generator Parallel Collision Test...")
    status, _, sf_body = http_request("GET", "/api/v1/admin/snowflake/benchmark?totalIds=50000&threads=16", headers=admin_headers)
    if status == 200:
        with open(os.path.join(RESULTS_DIR, "snowflake_collision_benchmark.json"), "w", encoding="utf-8") as f:
            f.write(sf_body)
            
    # Write summary CSV
    summary_csv = os.path.join(PROCESSED_DIR, "performance_summary.csv")
    with open(summary_csv, "w", encoding="utf-8") as f:
        f.write("Workload,VirtualUsers,DurationSec,TotalRequests,Successful,RateLimited429,ThroughputRPS,AvgLatencyMs,p50Ms,p95Ms,p99Ms,ErrorRatePct\n")
        for res in [low, med, high]:
            f.write(f"{res['workload']},{res['virtualUsers']},{res['durationSeconds']},{res['totalRequests']},{res['successfulRequests']},{res['http429RateLimited']},{res['throughputRps']},{res['avgResponseTimeMs']},{res['p50Ms']},{res['p95Ms']},{res['p99Ms']},{res['errorRatePercentage']}\n")
    print(f"\nBenchmark Summary written to: {summary_csv}")

if __name__ == "__main__":
    run_all_benchmarks()
