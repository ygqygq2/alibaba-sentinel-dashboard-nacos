import pytest
import time
import os
import requests
from playwright.sync_api import Page


# 确保测试结果目录存在
os.makedirs("test-results", exist_ok=True)


@pytest.fixture(scope="session")
def dashboard_url():
    """Sentinel Dashboard URL"""
    return os.environ.get("DASHBOARD_URL", "http://localhost:8080")


@pytest.fixture(scope="session")
def nacos_url():
    """Nacos URL"""
    return os.environ.get("NACOS_URL", "http://localhost:8848")


@pytest.fixture(scope="session")
def token_server_url():
    """Token Server URL"""
    return os.environ.get("TOKEN_SERVER_URL", "http://localhost:8081")


@pytest.fixture(scope="session")
def dashboard_credentials():
    """Dashboard login credentials"""
    return {"username": "sentinel", "password": "sentinel"}


@pytest.fixture(scope="session", autouse=True)
def wait_for_services(dashboard_url, nacos_url):
    """Wait for all services to be ready"""
    max_retries = 30
    retry_interval = 5

    # Wait for Nacos
    print("Waiting for Nacos...")
    for i in range(max_retries):
        try:
            resp = requests.get(f"{nacos_url}/nacos/v1/console/health/readiness", timeout=5)
            if resp.status_code == 200:
                print("Nacos is ready!")
                break
        except Exception:
            pass
        time.sleep(retry_interval)
    else:
        pytest.fail("Nacos failed to start")

    # Wait for Sentinel Dashboard
    print("Waiting for Sentinel Dashboard...")
    for i in range(max_retries):
        try:
            resp = requests.get(f"{dashboard_url}/", timeout=5)
            if resp.status_code == 200:
                print("Sentinel Dashboard is ready!")
                break
        except Exception:
            pass
        time.sleep(retry_interval)
    else:
        pytest.fail("Sentinel Dashboard failed to start")
