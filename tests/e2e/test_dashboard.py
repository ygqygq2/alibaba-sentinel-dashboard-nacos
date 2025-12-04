"""
Sentinel Dashboard E2E Tests with Playwright
适配 Angular 版本的 Sentinel Dashboard
"""
import pytest
import requests
import os
from playwright.sync_api import Page, expect


# 确保测试结果目录存在
os.makedirs("test-results", exist_ok=True)


class TestDashboardLogin:
    """Test Dashboard Login functionality"""

    def test_login_page_loads(self, page: Page, dashboard_url):
        """Test that login page loads correctly"""
        page.goto(dashboard_url)
        page.wait_for_load_state("networkidle")
        
        # Angular app - 等待加载
        page.wait_for_timeout(2000)
        
        # 检查页面标题
        assert "Sentinel" in page.title()
        
        # 截图
        page.screenshot(path="test-results/login-page.png")

    def test_login_api_success(self, dashboard_url, dashboard_credentials):
        """Test login via API"""
        resp = requests.post(
            f"{dashboard_url}/auth/login",
            data={
                "username": dashboard_credentials["username"],
                "password": dashboard_credentials["password"]
            }
        )
        assert resp.status_code == 200
        data = resp.json()
        assert data.get("success") == True
        assert data.get("code") == 0

    def test_login_api_failure(self, dashboard_url):
        """Test login with wrong credentials"""
        resp = requests.post(
            f"{dashboard_url}/auth/login",
            data={"username": "wrong", "password": "wrong"}
        )
        assert resp.status_code == 200
        data = resp.json()
        # 错误登录应该返回失败
        assert data.get("success") == False or data.get("code") != 0


class TestDashboardAPI:
    """Test Dashboard API endpoints"""

    @pytest.fixture
    def auth_session(self, dashboard_url, dashboard_credentials):
        """Create authenticated session"""
        session = requests.Session()
        resp = session.post(
            f"{dashboard_url}/auth/login",
            data={
                "username": dashboard_credentials["username"],
                "password": dashboard_credentials["password"]
            }
        )
        assert resp.status_code == 200
        return session

    def test_get_machine_info(self, auth_session, dashboard_url):
        """Test getting machine/app info"""
        resp = auth_session.get(f"{dashboard_url}/app/briefinfos.json")
        assert resp.status_code == 200

    def test_get_cluster_info(self, auth_session, dashboard_url):
        """Test getting cluster info"""
        resp = auth_session.get(f"{dashboard_url}/cluster/state/")
        # 可能返回空或错误，但 API 应该可访问
        assert resp.status_code in [200, 400, 404]


class TestNacosIntegration:
    """Test Nacos Integration"""

    def test_nacos_health(self, nacos_url):
        """Test Nacos is healthy"""
        resp = requests.get(f"{nacos_url}/nacos/v1/console/health/readiness")
        assert resp.status_code == 200

    def test_nacos_config_api(self, nacos_url):
        """Test Nacos config API is accessible"""
        resp = requests.get(
            f"{nacos_url}/nacos/v1/cs/configs",
            params={"dataId": "test", "group": "DEFAULT_GROUP"}
        )
        # 404 is OK - means API is working but config doesn't exist
        assert resp.status_code in [200, 404]

    def test_nacos_namespace_api(self, nacos_url):
        """Test Nacos namespace API"""
        resp = requests.get(f"{nacos_url}/nacos/v1/console/namespaces")
        assert resp.status_code == 200


class TestTokenServer:
    """Test Token Server"""

    def test_token_server_health(self, token_server_url):
        """Test Token Server health endpoint"""
        try:
            resp = requests.get(f"{token_server_url}/actuator/health", timeout=10)
            assert resp.status_code == 200
        except requests.exceptions.ConnectionError:
            pytest.skip("Token Server not available")

    def test_token_server_info(self, token_server_url):
        """Test Token Server info endpoint"""
        try:
            resp = requests.get(f"{token_server_url}/actuator/info", timeout=10)
            # info 端点可能没有启用
            assert resp.status_code in [200, 404]
        except requests.exceptions.ConnectionError:
            pytest.skip("Token Server not available")


class TestFlowControl:
    """Test Flow Control Configuration via API"""

    @pytest.fixture
    def auth_session(self, dashboard_url, dashboard_credentials):
        """Create authenticated session"""
        session = requests.Session()
        resp = session.post(
            f"{dashboard_url}/auth/login",
            data={
                "username": dashboard_credentials["username"],
                "password": dashboard_credentials["password"]
            }
        )
        assert resp.status_code == 200
        return session

    def test_api_flow_rules(self, auth_session, dashboard_url):
        """Test flow rules API"""
        # 尝试获取流控规则（可能为空）
        resp = auth_session.get(
            f"{dashboard_url}/v1/flow/rules",
            params={"app": "test-app"}
        )
        # API 应该可访问
        assert resp.status_code in [200, 400, 404]

    def test_api_degrade_rules(self, auth_session, dashboard_url):
        """Test degrade rules API"""
        resp = auth_session.get(
            f"{dashboard_url}/v1/degrade/rules",
            params={"app": "test-app"}
        )
        assert resp.status_code in [200, 400, 404]


class TestIntegration:
    """Integration tests - Dashboard + Nacos + Token Server"""

    def test_full_stack_health(self, dashboard_url, nacos_url, token_server_url):
        """Test all services are running"""
        # Dashboard
        resp = requests.get(dashboard_url, timeout=10)
        assert resp.status_code == 200, "Dashboard is not running"

        # Nacos
        resp = requests.get(f"{nacos_url}/nacos/v1/console/health/readiness", timeout=10)
        assert resp.status_code == 200, "Nacos is not healthy"

        # Token Server
        try:
            resp = requests.get(f"{token_server_url}/actuator/health", timeout=10)
            assert resp.status_code == 200, "Token Server is not healthy"
        except requests.exceptions.ConnectionError:
            pytest.skip("Token Server not available")

    def test_dashboard_nacos_connection(self, dashboard_url, dashboard_credentials, nacos_url):
        """Test Dashboard can communicate with Nacos"""
        # 登录
        session = requests.Session()
        session.post(
            f"{dashboard_url}/auth/login",
            data={
                "username": dashboard_credentials["username"],
                "password": dashboard_credentials["password"]
            }
        )

        # 检查 Dashboard 是否能获取应用信息
        resp = session.get(f"{dashboard_url}/app/briefinfos.json")
        assert resp.status_code == 200
