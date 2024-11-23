import uuid

from fastapi.testclient import TestClient
from fastapi.utils import generate_unique_id

from database.db import test_user_uuid
from main import app
from routers.req.courses_req import UpdateCourseReq, CreateCourseReq
from routers.routes.courses import course_router_endpoint

client = TestClient(app)

email = "test"
course_id = '5eed0a1e-c280-42c1-8251-dd72027d2ccc'
test_user_uuid = test_user_uuid


def test_insert_course():
    headers = {"X-User-ID": test_user_uuid}
    test_course = {
        "id": course_id,
        "c_group": "test_group",
        "code": "test_code",
        "section": "test_term",
    }
    response = client.post(course_router_endpoint, json=test_course, headers=headers)
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
    headers = {"X-User-ID": test_user_uuid}
    response = client.get(course_router_endpoint, headers=headers)
    data = response.json().get("data")
    assert isinstance(data, list)
    assert len(data) == 1
    assert data[0].get("id") == course_id
    assert response.status_code == 200


def test_get_course_by_id():
    headers = {"X-User-ID": test_user_uuid}
    response = client.get(
        course_router_endpoint + "/" + str(course_id), headers=headers
    )
    data = response.json().get("data")
    assert isinstance(data, list)
    assert len(data) == 1
    assert data[0].get("id") == course_id
    assert response.status_code == 200


def test_get_course_by_id_not_found():
    headers = {"X-User-ID": test_user_uuid}
    response = client.get(course_router_endpoint + "/" + str(uuid.uuid4()), headers=headers)
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
    headers = {"X-User-ID": test_user_uuid}
    response = client.put(course_router_endpoint, json=update_req, headers=headers)
    assert response.status_code == 200


def test_delete_course_by_id():
    headers = {"X-User-ID": test_user_uuid}
    response = client.delete(
        course_router_endpoint + "/" + str(course_id), headers=headers
    )
    assert response.status_code == 200
