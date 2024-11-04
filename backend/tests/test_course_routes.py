from fastapi.testclient import TestClient

from backend.routers.routes.courses import course_router

client = TestClient(course_router)

email = "test"
course_id = "test"


def test_get_courses():
    response = client.get(f"/courses/me")
    assert response.status_code == 200

def test_get_courses_by_id():
    response = client.get(f"/courses/me")
    assert response.status_code == 200

def test_get_courses_not_found():
    header = {}
    response = client.get(f"/courses/me")
    assert response.status_code == 404
    assert response.json() == {"detail": "Course not found."}

def test_get_courses_invalid_creds():
    invalid_header = {}
    response = client.get(f"/courses/me")
    assert response.status_code == 403
    assert response.json() == {
        "detail": "You do not have permission to access this course."
    }

def test_update_course():
    response = client.post(f"/courses/me")
    assert response.status_code == 200

def test_update_course_not_found():
    header = {}
    response = client.post(f"/courses/me")
    assert response.status_code == 404
    assert response.json() == {"detail": "Course not found."}

def test_update_course_invalid_creds():
    invalid_header = {}
    response = client.post(f"/courses/me")
    assert response.status_code == 403
    assert response.json() == {
        "detail": "You do not have permission to access this course."
    }

def test_delete_course():
    response = client.delete(f"/courses/me")
    assert response.status_code == 200

def test_delete_course_not_found():
    header = {}
    response = client.delete(f"/courses/me")
    assert response.status_code == 404
    assert response.json() == {"detail": "Course not found."}

def test_delete_course_invalid_creds():
    invalid_header = {}
    response = client.delete(f"/courses/me")
    assert response.status_code == 403
    assert response.json() == {
        "detail": "You do not have permission to access this course."
    }

def test_get_all_courses():
    response = client.get("/courses")
    assert response.status_code == 200

def test_get_all_courses_invalid_cred():
    response = client.get("/courses")
    assert response.status_code == 403
    assert response.json() == {
        "detail": "You do not have permission to perform this action."
    }

def test_get_course_by_id():
    response = client.get(f"/courses/{course_id}")
    assert response.status_code == 200

def test_get_course_by_id_not_found():
    response = client.get(f"/courses/{course_id}")
    assert response.status_code == 404
    assert response.json() == {"detail": "Course not found."}

def test_get_course_by_id_invalid_creds():
    response = client.get(f"/courses/{course_id}")
    assert response.status_code == 403
    assert response.json() == {
        "detail": "You do not have permission to perform this action."
    }

def test_update_course_by_id():
    response = client.post(f"/courses/{course_id}")
    assert response.status_code == 200

def test_update_course_by_id_not_found():
    response = client.post(f"/courses/{course_id}")
    assert response.status_code == 404
    assert response.json() == {"detail": "Course not found."}

def test_update_course_by_id_invalid_creds():
    response = client.post(f"/courses/{course_id}")
    assert response.status_code == 403
    assert response.json() == {
        "detail": "You do not have permission to perform this action."
    }

def test_delete_course_by_id():
    response = client.delete(f"/courses/{course_id}")
    assert response.status_code == 200

def test_delete_course_by_id_not_found():
    response = client.delete(f"/courses/{course_id}")
    assert response.status_code == 404
    assert response.json() == {"detail": "Course not found."}

def test_delete_course_by_id_invalid_creds():
    response = client.delete(f"/courses/{course_id}")
    assert response.status_code == 403
    assert response.json() == {
        "detail": "You do not have permission to perform this action."
    }