from fastapi.testclient import TestClient
from routers.routes.user_routes import user_router

client = TestClient(user_router)

email = ""
user_id = ""


def test_get_profile():
    response = client.get(f"/users/me")
    assert response.status_code == 200


def test_update_profile():
    response = client.post(f"/users/me")
    assert response.status_code == 200


def test_delete_profile():
    response = client.delete(f"/users/me")
    assert response.status_code == 200


def test_get_all_users():
    response = client.get("/users")
    assert response.status_code == 200


def test_get_user_by_id():
    response = client.get(f"/users/{user_id}")
    assert response.status_code == 200


def test_update_user_by_id():
    response = client.post(f"/users/{user_id}")
    assert response.status_code == 200


def test_delete_user_by_id():
    response = client.delete(f"/users/{user_id}")
    assert response.status_code == 200


def test_get_user_by_email():
    response = client.get(f"/users/{email}")
    assert response.status_code == 200


def test_update_user_by_email():
    response = client.post(f"/users/{email}")
    assert response.status_code == 200


def test_delete_user_by_email():
    response = client.post(f"/users/{email}")
    assert response.status_code == 200
