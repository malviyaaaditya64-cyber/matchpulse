import pytest
from fastapi.testclient import TestClient
from backend.main import app

client = TestClient(app)

def test_get_teams():
    # First register a test user
    client.post("/api/auth/register", json={"username": "testuser", "password": "testpass123"})
    # Then login to get a token
    login_resp = client.post("/api/auth/login", json={"username": "testuser", "password": "testpass123"})
    token = login_resp.json()["access_token"]
    
    # Now test the protected endpoint
    response = client.get(
        "/api/teams",
        headers={"Authorization": f"Bearer {token}"}
    )
    assert response.status_code == 200
    assert isinstance(response.json(), list)

def test_nonexistent_team():
    # Use the same token as above
    login_resp = client.post("/api/auth/login", json={"username": "testuser", "password": "testpass123"})
    token = login_resp.json()["access_token"]
    
    response = client.get(
        "/api/season/NonExistentTeam",
        headers={"Authorization": f"Bearer {token}"}
    )
    # Depending on implementation, might be 404 or empty list
    # Assuming standard behavior
    assert response.status_code in [200, 404]
