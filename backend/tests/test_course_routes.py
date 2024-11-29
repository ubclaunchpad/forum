import uuid

from fastapi.testclient import TestClient

from database.db import test_user_uuid
from main import app


client = TestClient(app)
course_router_endpoint = "courses"
email = "test"
course_id = "daeed462-ed57-48f7-91d8-d669c406b606"


def test_insert_course():
    test_course = {
        "id": course_id,
        "c_group": "test_group",
        "code": "test_code",
        "section": "test_term",
    }
    response = client.post(course_router_endpoint, json=test_course)
    assert response.status_code == 200


def test_insert_duplicate_course():
    test_course = {
        "id": course_id,
        "c_group": "test_group",
        "code": "test_code",
        "section": "test_term",
    }
    response = client.post(course_router_endpoint, json=test_course)
    assert response.status_code == 404
    assert response.json() == {"detail": "Failed to create course."}


def test_get_all_courses():
    response = client.get(course_router_endpoint)
    data = response.json().get("data")
    assert isinstance(data, list)
    assert len(data) == 1
    assert data[0].get("id") == course_id
    assert response.status_code == 200


def test_get_course_by_id():
    response = client.get(course_router_endpoint + "/" + str(course_id))
    data = response.json().get("data")
    assert isinstance(data, list)
    assert len(data) == 1
    assert data[0].get("id") == course_id
    assert response.status_code == 200


def test_get_course_by_id_not_found():
    headers = {"X-User-ID": test_user_uuid}
    response = client.get(
        course_router_endpoint + "/" + str(uuid.uuid4()), headers=headers
    )
    assert response.status_code == 404
    assert response.json() == {"detail": "User is not enrolled in this course"}


def test_update_course_by_id():
    update_req = {
        "c_id": course_id,
        "name": "Applied Machine Learning",
        "c_group": "CPSC",
        "code": "330",
        "end_date": "2024-12-20",
    }
    response = client.put(course_router_endpoint, json=update_req)
    assert response.status_code == 200


def test_delete_course_by_id():
    response = client.delete(
        course_router_endpoint + "/" + str(course_id),
    )
    assert response.status_code == 200
